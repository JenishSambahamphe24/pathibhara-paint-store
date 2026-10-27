import type { ColourSetListQuery } from "@repo/shared";

import {
  keepPreviousData,
  queryOptions,
  useQuery,
} from "@tanstack/react-query";

import { ColourSetApi } from "../api";

export const COLOUR_SET_LIST_QUERY_KEY = "colour-sets";
export const COLOUR_SET_DETAIL_QUERY_KEY = "colour-set";

export function useColourSets(query: ColourSetListQuery) {
  return useQuery(
    queryOptions({
      queryKey: [COLOUR_SET_LIST_QUERY_KEY, query],
      queryFn: () => ColourSetApi.list(query),
      placeholderData: keepPreviousData,
    }),
  );
}

export function useColourSet(id: string | null) {
  return useQuery(
    queryOptions({
      queryKey: [COLOUR_SET_DETAIL_QUERY_KEY, id],
      queryFn: () => ColourSetApi.get(id ?? ""),
      enabled: id !== null,
    }),
  );
}
