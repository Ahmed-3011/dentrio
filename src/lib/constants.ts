export const STATUS_STEPS: Record<string, number> = {
  SUBMITTED: 0,
  REVIEW: 1,
  DESIGN: 2,
  PRODUCTION: 3,
  READY: 4,
  SHIPPED: 5,
  CLOSED: 6,
};

export const STATUS_LABEL: Record<string, string> = {
  SUBMITTED: 'Submitted',
  REVIEW: 'In Review',
  DESIGN: 'In Design',
  PRODUCTION: 'In Production',
  READY: 'Ready to Ship',
  SHIPPED: 'Shipped',
  CLOSED: 'Closed',
};

export const PIPELINE = ['SUBMITTED', 'REVIEW', 'DESIGN', 'PRODUCTION', 'READY', 'SHIPPED', 'CLOSED'];
