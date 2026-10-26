import type { StockMovementListQuery } from "@repo/shared";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { ProductApi } from "#/features/products/api";

import { StockMovementApi } from "../api";

export const MOVEMENT_LIST_QUERY_KEY = "stock-movements";

export function useStockMovements(query: StockMovementListQuery) {
  return useQuery({
    queryKey: [MOVEMENT_LIST_QUERY_KEY, query],
    queryFn: () => StockMovementApi.list(query),
    placeholderData: keepPreviousData,
  });
}

// The size a ledger view is filtered to, for its heading.
export function useFilteredVariant(variantId: string | undefined) {
  return useQuery({
    queryKey: ["variant", variantId],
    queryFn: () => ProductApi.getVariant(variantId!),
    enabled: !!variantId,
  });
}
