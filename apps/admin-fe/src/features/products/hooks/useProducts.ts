import type { ProductListQuery } from "@repo/shared";

import {
  keepPreviousData,
  queryOptions,
  useQuery,
} from "@tanstack/react-query";

import { ProductApi } from "../api";

export const PRODUCT_LIST_QUERY_KEY = "products";
export const PRODUCT_DETAIL_QUERY_KEY = "product";

export function useProducts(query: ProductListQuery) {
  return useQuery(
    queryOptions({
      queryKey: [PRODUCT_LIST_QUERY_KEY, query],
      queryFn: () => ProductApi.list(query),
      placeholderData: keepPreviousData,
    }),
  );
}

export function productQueryOptions(id: string) {
  return queryOptions({
    queryKey: [PRODUCT_DETAIL_QUERY_KEY, id],
    queryFn: () => ProductApi.get(id),
  });
}

export function useProduct(id: string) {
  return useQuery(productQueryOptions(id));
}
