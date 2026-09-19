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
  caseCount: number;
  activeCount: number;
};

export type CaseDetail = {
  id: number;
  code: string;
  status: string;
  statusLabel: string;
  myRole: 'DENTIST' | 'LAB' | 'SHIPPING';
  labName?: string | null;
  dentistName?: string | null;
  scan: { path: string; name: string } | null;
  design: { path: string } | null;
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
  canAdvance?: boolean;
  canMarkReady?: boolean;
  canShip?: boolean;
};