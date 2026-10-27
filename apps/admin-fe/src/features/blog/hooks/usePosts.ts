import type { PostListQuery } from "@repo/shared";

import { keepPreviousData, queryOptions, useQuery } from "@tanstack/react-query";

import { PostApi } from "../api";

export const POST_LIST_QUERY_KEY = "posts";
export const POST_DETAIL_QUERY_KEY = "post";

export function usePosts(query: PostListQuery) {
  return useQuery(
    queryOptions({ queryKey: [POST_LIST_QUERY_KEY, query], queryFn: () => PostApi.list(query), placeholderData: keepPreviousData }),
  );
}

export function usePost(id: string) {
  return useQuery(queryOptions({ queryKey: [POST_DETAIL_QUERY_KEY, id], queryFn: () => PostApi.get(id) }));
}
