import type { StockAdjustmentListQuery } from "@repo/shared";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { StockAdjustmentApi } from "../api";

export const ADJUSTMENT_LIST_QUERY_KEY = "stock-adjustments";

export function useStockAdjustments(query: StockAdjustmentListQuery) {
  return useQuery({
    queryKey: [ADJUSTMENT_LIST_QUERY_KEY, query],
    queryFn: () => StockAdjustmentApi.list(query),
    placeholderData: keepPreviousData,
  });
}
