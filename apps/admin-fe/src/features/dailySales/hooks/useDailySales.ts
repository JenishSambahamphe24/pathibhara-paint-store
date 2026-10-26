import type { DailySaleListQuery } from "@repo/shared";

import {
  keepPreviousData,
  queryOptions,
  useQuery,
} from "@tanstack/react-query";

import { DailySaleApi } from "../api";

export const DAILY_SALE_LIST_QUERY_KEY = "daily-sales";
export const DAILY_SALE_DETAIL_QUERY_KEY = "daily-sale";

export function useDailySales(query: DailySaleListQuery) {
  return useQuery(
    queryOptions({
      queryKey: [DAILY_SALE_LIST_QUERY_KEY, query],
      queryFn: () => DailySaleApi.list(query),
      placeholderData: keepPreviousData,
    }),
  );
}

export function useDailySale(date: string) {
  return useQuery(
    queryOptions({
      queryKey: [DAILY_SALE_DETAIL_QUERY_KEY, date],
      queryFn: () => DailySaleApi.getByDate(date),
    }),
  );
}
