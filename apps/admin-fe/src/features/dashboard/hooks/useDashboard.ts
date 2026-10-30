import type { DashboardQuery } from "@repo/shared";

import {
  keepPreviousData,
  queryOptions,
  useQuery,
} from "@tanstack/react-query";

import { DashboardApi } from "../api";

export const DASHBOARD_QUERY_KEY = "dashboard";

export function useDashboard(query: DashboardQuery) {
  return useQuery(
    queryOptions({
      queryKey: [DASHBOARD_QUERY_KEY, query],
      queryFn: () => DashboardApi.get(query),
      placeholderData: keepPreviousData,
    }),
  );
}
