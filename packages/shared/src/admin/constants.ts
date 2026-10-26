// Also the values of the `admin_status` pgEnum (packages/database).
export const ADMIN_STATUSES = ["active", "blocked"] as const;
export type AdminStatus = (typeof ADMIN_STATUSES)[number];
