import { queryOptions, useQuery } from "@tanstack/react-query";

import { CategoryApi } from "../api";

export const CATEGORY_LIST_QUERY_KEY = "categories";

export function categoriesQueryOptions() {
  return queryOptions({
    queryKey: [CATEGORY_LIST_QUERY_KEY],
    queryFn: CategoryApi.list,
  });
}

export function useCategories() {
  return useQuery(categoriesQueryOptions());
}
