import type { StockBatchListQuery } from "@repo/shared";

import {
  keepPreviousData,
  queryOptions,
  useQuery,
} from "@tanstack/react-query";

import { StockBatchApi } from "../api";

export const BATCH_LIST_QUERY_KEY = "stock-batches";
export const BATCH_DETAIL_QUERY_KEY = "stock-batch";

export function useStockBatches(query: StockBatchListQuery) {
  return useQuery(
    queryOptions({
      queryKey: [BATCH_LIST_QUERY_KEY, query],
      queryFn: () => StockBatchApi.list(query),
      placeholderData: keepPreviousData,
    }),
  );
}

export function useStockBatch(id: string) {
  return useQuery(
    queryOptions({
      queryKey: [BATCH_DETAIL_QUERY_KEY, id],
      queryFn: () => StockBatchApi.get(id),
    }),
  );
}
