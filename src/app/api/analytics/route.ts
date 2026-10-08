import { NextRequest } from 'next/server';
import { all, get } from '@/lib/db';
import { requireUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await requireUser();
  if (user instanceof Response) return user;

  const url = new URL(req.url);
  const period = url.searchParams.get('period') || 'month'; // 'today' | 'week' | 'month' | 'last_month' | 'year' | 'all' | 'custom'
  const startDateParam = url.searchParams.get('startDate');
  const endDateParam = url.searchParams.get('endDate');
  const doctorIdParam = url.searchParams.get('doctorId');

  // Compute SQL date boundaries based on period
  let dateCondition = '';
  const queryParams: unknown[] = [];

  const now = new Date();

  if (period === 'today') {
    const todayStr = now.toISOString().split('T')[0];
    dateCondition = `c.created_at >= '${todayStr} 00:00:00'`;
  } else if (period === 'week') {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    dateCondition = `c.created_at >= '${d.toISOString().split('T')[0]} 00:00:00'`;
  } else if (period === 'month') {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    dateCondition = `c.created_at >= '${d.toISOString().split('T')[0]} 00:00:00'`;
  } else if (period === 'last_month') {
    const startLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    dateCondition = `c.created_at >= '${startLastMonth.toISOString()}' AND c.created_at <= '${endLastMonth.toISOString()}'`;
  } else if (period === 'year') {
    const d = new Date(now.getFullYear(), 0, 1);
    dateCondition = `c.created_at >= '${d.toISOString().split('T')[0]} 00:00:00'`;
  } else if (period === 'custom' && startDateParam) {
    const start = startDateParam;
    const end = endDateParam || now.toISOString().split('T')[0];
    dateCondition = `c.created_at >= '${start} 00:00:00' AND c.created_at <= '${end} 23:59:59'`;
  }

  // Base scope query depending on user role
  let roleCondition = '';
  if (user.role === 'DENTIST') {
    roleCondition = `c.dentist_user_id = ${user.id}`;
  } else if (user.role === 'LAB') {
    roleCondition = `c.lab_user_id = ${user.id}`;
  }

  // Doctor filter condition
  let doctorCondition = '';
  if (doctorIdParam && doctorIdParam !== 'all') {
    doctorCondition = `c.dentist_user_id = ${Number(doctorIdParam)}`;
  }

  const whereClauses = [roleCondition, dateCondition, doctorCondition].filter(Boolean);
  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  // 1. Fetch filtered cases with details
  const casesQuery = `
    SELECT c.id, c.code, c.status, c.created_at, c.dentist_user_id, c.lab_user_id,
           u_doc.name as doctor_name, d.clinic_name,
           p.material, p.shade, p.due_date
    FROM cases c
    LEFT JOIN users u_doc ON u_doc.id = c.dentist_user_id
    LEFT JOIN dentists d ON d.user_id = c.dentist_user_id
    LEFT JOIN prescriptions p ON p.case_id = c.id
    ${whereSql}
    ORDER BY c.id DESC
  `;
  const caseRows = await all(casesQuery, queryParams);

  // 2. Compute Summary Metrics
  const totalCases = caseRows.length;
  let inProduction = 0;
  let readyOrShipped = 0;
  let closed = 0;
  let inReviewOrDesign = 0;

  caseRows.forEach((r) => {
    const status = String(r.status);
    if (status === 'PRODUCTION') inProduction++;
    else if (status === 'READY' || status === 'SHIPPED') readyOrShipped++;
    else if (status === 'CLOSED') closed++;
    else inReviewOrDesign++;
  });

  const activeCases = inProduction + inReviewOrDesign + readyOrShipped;

  // 3. Compute Doctor / Clinic Breakdown
  const doctorMap = new Map<
    number,
    {
      doctorId: number;
      doctorName: string;
      clinicName: string;
      totalCases: number;
      activeCases: number;
      completedCases: number;
    }
  >();

  caseRows.forEach((r) => {
    const docId = Number(r.dentist_user_id);
    const docName = String(r.doctor_name || 'Dr. Dentist');
    const clinicName = String(r.clinic_name || docName);
    const status = String(r.status);

    if (!doctorMap.has(docId)) {
      doctorMap.set(docId, {
        doctorId: docId,
        doctorName: docName,
        clinicName: clinicName,
        totalCases: 0,
        activeCases: 0,
        completedCases: 0,
      });
    }

    const entry = doctorMap.get(docId)!;
    entry.totalCases++;
    if (['SUBMITTED', 'REVIEW', 'DESIGN', 'PRODUCTION'].includes(status)) {
      entry.activeCases++;
    } else {
      entry.completedCases++;
    }
  });

  const doctorBreakdown = Array.from(doctorMap.values())
    .map((d) => ({
      ...d,
      percentage: totalCases > 0 ? Math.round((d.totalCases / totalCases) * 100) : 0,
    }))
    .sort((a, b) => b.totalCases - a.totalCases);

  // 4. Compute Material Breakdown
  const materialMap = new Map<string, number>();
  caseRows.forEach((r) => {
    const mat = r.material ? String(r.material).trim() : 'Unspecified Material';
    materialMap.set(mat, (materialMap.get(mat) || 0) + 1);
  });
  const materialBreakdown = Array.from(materialMap.entries())
    .map(([material, count]) => ({
      material,
      count,
      percentage: totalCases > 0 ? Math.round((count / totalCases) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // 5. Compute VITA Shade Breakdown
  const shadeMap = new Map<string, number>();
  caseRows.forEach((r) => {
    const sh = r.shade ? String(r.shade).trim() : 'Unspecified Shade';
    shadeMap.set(sh, (shadeMap.get(sh) || 0) + 1);
  });
  const shadeBreakdown = Array.from(shadeMap.entries())
    .map(([shade, count]) => ({
      shade,
      count,
      percentage: totalCases > 0 ? Math.round((count / totalCases) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // 6. Fetch Doctor Filter List (All dentists linked to this lab or all dentists)
  let docListQuery = '';
  if (user.role === 'LAB') {
    docListQuery = `
      SELECT DISTINCT u.id, u.name, d.clinic_name
      FROM users u
      JOIN cases c ON c.dentist_user_id = u.id
      LEFT JOIN dentists d ON d.user_id = u.id
      WHERE c.lab_user_id = ${user.id}
    `;
  } else {
    docListQuery = `
      SELECT u.id, u.name, d.clinic_name
      FROM users u
      LEFT JOIN dentists d ON d.user_id = u.id
      WHERE u.role = 'DENTIST'
    `;
  }
  const allDocRows = await all(docListQuery);
  const doctorList = allDocRows.map((d) => ({
    id: Number(d.id),
    name: String(d.name),
    clinicName: String(d.clinic_name || d.name),
  }));

  return Response.json({
    period,
    summary: {
      totalCases,
      inProduction,
      readyOrShipped,
      closed,
      activeCases,
    },
    doctorBreakdown,
    materialBreakdown,
    shadeBreakdown,
    doctorList,
  });
}
