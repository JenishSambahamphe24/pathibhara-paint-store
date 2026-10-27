import { z } from "zod";

export const DASHBOARD_RANGES = ["7d", "30d", "90d"] as const;
export type DashboardRange = (typeof DASHBOARD_RANGES)[number];

export const DASHBOARD_RANGE_DAYS: Record<DashboardRange, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

export const dashboardQuerySchema = z.object({
  range: z.enum(DASHBOARD_RANGES).default("30d"),
});
export type DashboardQuery = z.output<typeof dashboardQuerySchema>;
