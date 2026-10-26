import { useDebouncedValue } from "@tanstack/react-pacer";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { ProductApi } from "../api";

export const VARIANT_SEARCH_QUERY_KEY = "variant-search";

export function useVariantSearch(includeInactive = false) {
  const [search, setSearch] = useState("");
  const [debounced] = useDebouncedValue(search, { wait: 250 });
  const query = useQuery({
    queryKey: [VARIANT_SEARCH_QUERY_KEY, debounced, includeInactive],
    queryFn: () =>
      ProductApi.searchVariants({
        search: debounced || undefined,
        perPage: 20,
        includeInactive,
      }),
    placeholderData: keepPreviousData,
  });
  return {
    search,
    setSearch,
    results: query.data?.items ?? [],
    isLoading: query.isFetching,
  };
}
