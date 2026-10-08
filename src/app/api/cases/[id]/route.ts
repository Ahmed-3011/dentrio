import { NextRequest } from 'next/server';
import { get, all } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { STATUS_LABEL } from '@/lib/constants';

function canAccess(userId: number, role: string, row: Record<string, unknown>): boolean {
  if (role === 'DENTIST') return Number(row.dentist_user_id) === userId;
  if (role === 'LAB') return Number(row.lab_user_id) === userId;
  if (role === 'SHIPPING') return true;
  return false;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  if (user instanceof Response) return user;
  const { id } = await params;
  const caseId = Number(id);

  const row = await get(
    `SELECT c.*, d.clinic_name,
       l.lab_name, p.restoration_type, p.tooth_number, p.material, p.shade, p.due_date, p.notes,
       s.tracking_number, s.status as ship_status, s.pickup_address, s.delivery_address
     FROM cases c
     LEFT JOIN dentists d ON d.user_id = c.dentist_user_id
     LEFT JOIN labs l ON l.user_id = c.lab_user_id
     LEFT JOIN prescriptions p ON p.case_id = c.id
     LEFT JOIN shipments s ON s.case_id = c.id
     WHERE c.id = ?`,
    [caseId]
  );

  if (!row) return Response.json({ error: 'Case not found' }, { status: 404 });
  if (!canAccess(user.id, user.role, row)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const isShipping = user.role === 'SHIPPING';
  const status = String(row.status);

  const payload: Record<string, unknown> = {
    id: Number(row.id),
    code: row.code,
    status,
    statusLabel: STATUS_LABEL[status] || status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    myRole: user.role,
  };

  if (isShipping) {
    payload.pickupAddress = row.pickup_address || row.lab_name || '';
    payload.deliveryAddress = row.delivery_address || row.clinic_name || '';
    payload.trackingNumber = row.tracking_number || '';
    payload.shipStatus = row.ship_status || 'PENDING';
    return Response.json(payload);
  }

  const dentistName = (await get('SELECT name FROM users WHERE id = ?', [Number(row.dentist_user_id)]))?.name;
  const labUser = (await get('SELECT name FROM users WHERE id = ?', [Number(row.lab_user_id)]))?.name;

  payload.labName = row.lab_name || labUser;
  payload.labUserId = Number(row.lab_user_id);
  payload.dentistName = row.clinic_name || dentistName;
  payload.dentistUserId = Number(row.dentist_user_id);
  payload.scan = row.scan_path ? { path: row.scan_path, name: row.scan_original_name } : null;
  payload.design = row.design_path ? { path: row.design_path } : null;

  // Retrieve all attached case scans and clinical files
  const caseFiles = await all(
    'SELECT id, file_path, file_name, file_type FROM case_files WHERE case_id = ? ORDER BY id ASC',
    [caseId]
  );
  payload.scans = caseFiles.map((cf) => ({
    id: Number(cf.id),
    path: String(cf.file_path),
    name: String(cf.file_name),
    type: String(cf.file_type || 'scan'),
  }));

  // CAD Design Proposal Information
  const cadProposalName = row.cad_proposal_name ? String(row.cad_proposal_name) : '';
  const cadProposalExt = cadProposalName.split('.').pop()?.toLowerCase() || '';
  payload.cadProposal = row.cad_proposal_path
    ? {
        path: row.cad_proposal_path,
        name: row.cad_proposal_name,
        isHtml: cadProposalExt === 'html' || cadProposalExt === 'htm',
        isStl: cadProposalExt === 'stl' || cadProposalExt === 'ply',
        approvedAt: row.cad_approved_at || null,
        approvedBy: row.cad_approved_by ? Number(row.cad_approved_by) : null,
        revisionNotes: row.cad_revision_notes || null,
      }
    : null;

  // Milling CAM Package Information
  const millingStlFiles = caseFiles
    .filter((cf) => cf.file_type === 'milling_stl')
    .map((cf) => ({ id: Number(cf.id), path: String(cf.file_path), name: String(cf.file_name) }));

  const millingConstFiles = caseFiles
    .filter((cf) => cf.file_type === 'construction_info')
    .map((cf) => ({ id: Number(cf.id), path: String(cf.file_path), name: String(cf.file_name) }));

  payload.millingPackage = row.milling_stl_path
    ? {
        stlPath: row.milling_stl_path,
        stlName: row.milling_stl_name,
        stls: millingStlFiles.length > 0 ? millingStlFiles : [{ id: 0, path: row.milling_stl_path, name: row.milling_stl_name }],
        constructionPath: row.milling_construction_path || null,
        constructionName: row.milling_construction_name || null,
        constructions: millingConstFiles,
        notes: row.milling_notes || null,
        createdAt: row.milling_created_at || null,
      }
    : null;

  payload.prescription = {
    restorationType: row.restoration_type,
    toothNumber: row.tooth_number,
    material: row.material,
    shade: row.shade,
    dueDate: row.due_date,
    notes: row.notes,
  };

  payload.shipping = row.ship_status
    ? { trackingNumber: row.tracking_number, status: row.ship_status }
    : null;

  // Role permissions
  const isCadApproved = !!row.cad_approved_at;
  payload.isCadApproved = isCadApproved;
  payload.canAdvance =
    user.role === 'LAB' && ['REVIEW', 'DESIGN', 'PRODUCTION'].includes(status) && (status !== 'DESIGN' || isCadApproved);
  payload.canMarkReady = user.role === 'LAB' && status === 'PRODUCTION';
  payload.canShip = isShipping && status === 'READY';
  payload.canApproveCad = user.role === 'DENTIST' && !!row.cad_proposal_path && !isCadApproved;
  payload.canUploadCadProposal = user.role === 'LAB';
  payload.canUploadMillingOrder = user.role === 'LAB' && isCadApproved;

  return Response.json(payload);
}
