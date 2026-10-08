import { NextRequest } from 'next/server';
import { all, get, run } from '@/lib/db';
import { requireUser } from '@/lib/auth';

const DEFAULT_TASKS = [
  'nesting_calculated',
  'milling_completed',
  'green_state_finished',
  'sintering_completed',
  'glazing_polished',
  'qc_fit_checked',
];

export async function GET() {
  const user = await requireUser();
  if (user instanceof Response) return user;

  let casesQuery = '';
  let params: unknown[] = [];

  if (user.role === 'DENTIST') {
    casesQuery = `
      SELECT c.*, d.clinic_name, l.lab_name,
             p.tooth_number, p.material, p.shade, p.due_date, p.notes as rx_notes
      FROM cases c
      LEFT JOIN dentists d ON d.user_id = c.dentist_user_id
      LEFT JOIN labs l ON l.user_id = c.lab_user_id
      LEFT JOIN prescriptions p ON p.case_id = c.id
      WHERE c.dentist_user_id = ? AND (c.cad_approved_at IS NOT NULL OR c.status IN ('PRODUCTION','READY','SHIPPED','CLOSED'))
      ORDER BY c.id DESC
    `;
    params = [user.id];
  } else if (user.role === 'LAB') {
    casesQuery = `
      SELECT c.*, d.clinic_name, l.lab_name,
             p.tooth_number, p.material, p.shade, p.due_date, p.notes as rx_notes
      FROM cases c
      LEFT JOIN dentists d ON d.user_id = c.dentist_user_id
      LEFT JOIN labs l ON l.user_id = c.lab_user_id
      LEFT JOIN prescriptions p ON p.case_id = c.id
      WHERE c.lab_user_id = ? AND (c.cad_approved_at IS NOT NULL OR c.status IN ('PRODUCTION','READY','SHIPPED','CLOSED') OR c.milling_stl_path IS NOT NULL)
      ORDER BY c.id DESC
    `;
    params = [user.id];
  } else {
    // Owner / Admin
    casesQuery = `
      SELECT c.*, d.clinic_name, l.lab_name,
             p.tooth_number, p.material, p.shade, p.due_date, p.notes as rx_notes
      FROM cases c
      LEFT JOIN dentists d ON d.user_id = c.dentist_user_id
      LEFT JOIN labs l ON l.user_id = c.lab_user_id
      LEFT JOIN prescriptions p ON p.case_id = c.id
      WHERE c.cad_approved_at IS NOT NULL OR c.status IN ('PRODUCTION','READY','SHIPPED','CLOSED')
      ORDER BY c.id DESC
    `;
    params = [];
  }

  const rows = await all(casesQuery, params);

  const results = [];
  for (const r of rows) {
    const caseId = Number(r.id);

    // Query milling files
    const caseFiles = await all(
      'SELECT id, file_path, file_name, file_type FROM case_files WHERE case_id = ?',
      [caseId]
    );

    const stls = caseFiles
      .filter((f) => f.file_type === 'milling_stl')
      .map((f) => ({ id: Number(f.id), path: String(f.file_path), name: String(f.file_name) }));

    if (stls.length === 0 && r.milling_stl_path) {
      stls.push({ id: 0, path: String(r.milling_stl_path), name: String(r.milling_stl_name || 'milled_restoration.stl') });
    }

    const constructions = caseFiles
      .filter((f) => f.file_type === 'construction_info')
      .map((f) => ({ id: Number(f.id), path: String(f.file_path), name: String(f.file_name) }));

    if (constructions.length === 0 && r.milling_construction_path) {
      constructions.push({ id: 0, path: String(r.milling_construction_path), name: String(r.milling_construction_name || 'constructionInfo') });
    }

    // Query task follow-up checklist
    const taskRows = await all('SELECT task_key, completed FROM milling_tasks WHERE case_id = ?', [caseId]);
    const tasksMap: Record<string, boolean> = {};
    DEFAULT_TASKS.forEach((k) => {
      tasksMap[k] = false;
    });
    taskRows.forEach((tr) => {
      tasksMap[String(tr.task_key)] = Number(tr.completed) === 1;
    });

    results.push({
      id: caseId,
      code: String(r.code),
      status: String(r.status),
      createdAt: String(r.created_at),
      clinicName: String(r.clinic_name || 'Dental Practice'),
      labName: String(r.lab_name || 'Dental Lab'),
      toothNumber: r.tooth_number ? String(r.tooth_number) : null,
      material: r.material ? String(r.material) : null,
      shade: r.shade ? String(r.shade) : null,
      dueDate: r.due_date ? String(r.due_date) : null,
      notes: r.rx_notes ? String(r.rx_notes) : null,
      millingNotes: r.milling_notes ? String(r.milling_notes) : null,
      isCadApproved: !!r.cad_approved_at,
      cadApprovedAt: r.cad_approved_at ? String(r.cad_approved_at) : null,
      stls,
      constructions,
      tasks: tasksMap,
    });
  }

  return Response.json(results);
}

export async function POST(req: NextRequest) {
  const user = await requireUser();
  if (user instanceof Response) return user;

  const body = await req.json();
  const { action, caseId, taskKey, completed } = body as {
    action?: 'TOGGLE_TASK' | 'MARK_READY';
    caseId?: number;
    taskKey?: string;
    completed?: boolean;
  };

  if (!caseId) {
    return Response.json({ error: 'Case ID is required' }, { status: 400 });
  }

  const caseRow = await get('SELECT id, lab_user_id, dentist_user_id, status FROM cases WHERE id = ?', [caseId]);
  if (!caseRow) return Response.json({ error: 'Case not found' }, { status: 404 });

  // Only lab or dentist can interact with the case
  if (user.role === 'LAB' && Number(caseRow.lab_user_id) !== user.id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (user.role === 'DENTIST' && Number(caseRow.dentist_user_id) !== user.id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (action === 'TOGGLE_TASK' && taskKey) {
    const val = completed ? 1 : 0;
    await run(
      `INSERT INTO milling_tasks (case_id, task_key, completed, updated_at)
       VALUES (?, ?, ?, datetime('now'))
       ON CONFLICT(case_id, task_key) DO UPDATE SET completed = excluded.completed, updated_at = datetime('now')`,
      [caseId, taskKey, val]
    );

    return Response.json({ ok: true, taskKey, completed });
  } else if (action === 'MARK_READY') {
    if (user.role !== 'LAB') {
      return Response.json({ error: 'Only dental laboratories can mark cases ready for shipping' }, { status: 403 });
    }

    await run("UPDATE cases SET status = 'READY', updated_at = datetime('now') WHERE id = ?", [caseId]);

    await run(
      `INSERT INTO messages (case_id, sender_user_id, body, is_image)
       VALUES (?, ?, ?, 0)`,
      [caseId, user.id, '📦 [Milling Production Complete]: All manufacturing and quality control tasks finished. Case is marked READY for shipping pickup.']
    );

    return Response.json({ ok: true, status: 'READY' });
  }

  return Response.json({ error: 'Invalid action' }, { status: 400 });
}
