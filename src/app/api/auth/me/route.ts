import { get } from '@/lib/db';
import { requireUser } from '@/lib/auth';

export async function GET() {
  const user = await requireUser();
  let profile: Record<string, unknown> | null = null;

  if (user.role === 'DENTIST') {
    profile = (await get(
      'SELECT clinic_name, specialty, address, preferred_lab_id FROM dentists WHERE user_id = ?',
      [user.id]
    )) ?? null;
    if (profile && profile.preferred_lab_id != null) {
      const lab = await get('SELECT lab_name FROM labs WHERE id = ?', [profile.preferred_lab_id]);
      profile = { ...profile, preferredLabName: lab?.lab_name || null };
    }
  } else if (user.role === 'LAB') {
    profile = (await get(
      'SELECT lab_name, description, specialties, materials, turnaround_days, address FROM labs WHERE user_id = ?',
      [user.id]
    )) ?? null;
  } else if (user.role === 'SHIPPING') {
    profile = (await get('SELECT company_name FROM shipping_companies WHERE user_id = ?', [user.id])) ?? null;
  }

  let caseCount = 0;
  let activeCount = 0;
  if (user.role === 'DENTIST') {
    caseCount = Number((await get('SELECT COUNT(*) as c FROM cases WHERE dentist_user_id = ?', [user.id]))?.c || 0);
    activeCount = Number((await get("SELECT COUNT(*) as c FROM cases WHERE dentist_user_id = ? AND status NOT IN ('CLOSED')", [user.id]))?.c || 0);
  } else if (user.role === 'LAB') {
    caseCount = Number((await get('SELECT COUNT(*) as c FROM cases WHERE lab_user_id = ?', [user.id]))?.c || 0);
    activeCount = Number((await get("SELECT COUNT(*) as c FROM cases WHERE lab_user_id = ? AND status NOT IN ('CLOSED')", [user.id]))?.c || 0);
  } else {
    caseCount = Number((await get("SELECT COUNT(*) as c FROM cases WHERE status IN ('READY','SHIPPED')"))?.c || 0);
    activeCount = Number((await get("SELECT COUNT(*) as c FROM cases WHERE status = 'READY'"))?.c || 0);
  }

  return Response.json({ user, profile, caseCount, activeCount });
}
