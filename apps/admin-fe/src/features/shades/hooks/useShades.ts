import type { ShadeListQuery } from "@repo/shared";

import {
  keepPreviousData,
  queryOptions,
  useQuery,
} from "@tanstack/react-query";

import { ShadeApi } from "../api";

export const SHADE_LIST_QUERY_KEY = "shades";
export const SHADE_DETAIL_QUERY_KEY = "shade";

export function useShades(query: ShadeListQuery) {
  return useQuery(
    queryOptions({
      queryKey: [SHADE_LIST_QUERY_KEY, query],
      queryFn: () => ShadeApi.list(query),
      placeholderData: keepPreviousData,
    }),
  );
}

export function useShade(id: string | null) {
  return useQuery(
    queryOptions({
      queryKey: [SHADE_DETAIL_QUERY_KEY, id],
      queryFn: () => ShadeApi.get(id ?? ""),
      enabled: id !== null,
    }),
  );
}
