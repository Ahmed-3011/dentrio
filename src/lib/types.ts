export type AnyCase = {
  id: number;
  code: string;
  status: string;
  statusLabel: string;
  createdAt: string;
  updatedAt?: string;
  counterpart: string | null;
  scanOriginalName?: string | null;
};

export type ApiUser = {
  id: number;
  email: string;
  phone: string;
  name: string;
  role: 'DENTIST' | 'LAB' | 'SHIPPING';
  privilege: string;
};

export type ApiProfile = {
  clinic_name?: string | null;
  preferredLabName?: string | null;
  address?: string | null;
  maps_url?: string | null;
  lab_name?: string | null;
  turnaround_days?: number | null;
  specialties?: string | null;
  company_name?: string | null;
};

export type ApiMe = {
  user: ApiUser;
  profile: ApiProfile;
  needsOnboarding?: boolean;
  caseCount: number;
  activeCount: number;
};

export type CaseDetail = {
  id: number;
  code: string;
  status: string;
  statusLabel: string;
  createdAt: string;
  updatedAt?: string;
  myRole: 'DENTIST' | 'LAB' | 'SHIPPING';
  labName?: string | null;
  labUserId?: number;
  dentistName?: string | null;
  dentistUserId?: number;
  scan: { path: string; name: string } | null;
  scans?: Array<{ id: number; path: string; name: string; type: string }>;
  design: { path: string } | null;
  cadProposal: {
    path: string;
    name: string;
    isHtml: boolean;
    isStl: boolean;
    approvedAt: string | null;
    approvedBy: number | null;
    revisionNotes: string | null;
  } | null;
  millingPackage: {
    stlPath: string;
    stlName: string;
    stls?: Array<{ id: number; path: string; name: string }>;
    constructionPath: string | null;
    constructionName: string | null;
    constructions?: Array<{ id: number; path: string; name: string }>;
    notes: string | null;
    createdAt: string | null;
  } | null;
  prescription?: {
    restorationType: string | null;
    toothNumber: string | null;
    material: string | null;
    shade: string | null;
    dueDate: string | null;
    notes: string | null;
  } | null;
  pickupAddress?: string | null;
  deliveryAddress?: string | null;
  trackingNumber?: string | null;
  shipStatus?: string | null;
  isCadApproved?: boolean;
  canAdvance?: boolean;
  canMarkReady?: boolean;
  canShip?: boolean;
  canApproveCad?: boolean;
  canUploadCadProposal?: boolean;
  canUploadMillingOrder?: boolean;
};
