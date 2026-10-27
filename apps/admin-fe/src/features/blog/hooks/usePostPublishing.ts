import type { IPost } from "../types";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ApiErrorHelper } from "#/lib/helpers/apiError.helper";
import { toaster } from "#/lib/toaster";
import { m } from "#/paraglide/messages";

import { PostApi } from "../api";
import { POST_DETAIL_QUERY_KEY, POST_LIST_QUERY_KEY } from "./usePosts";

export function usePostPublishing(postId: string) {
  const queryClient = useQueryClient();

  async function settle(post: IPost) {
    queryClient.setQueryData([POST_DETAIL_QUERY_KEY, postId], post);
    await queryClient.invalidateQueries({ queryKey: [POST_LIST_QUERY_KEY] });
  }

  const publish = useMutation({
    mutationFn: () => PostApi.publish(postId),
    onSuccess: async (post) => {
      toaster.success({ description: m.blog_published() });
      await settle(post);
    },
    onError: (error) => toaster.error({ description: ApiErrorHelper.describe(error) }),
  });

  const unpublish = useMutation({
    mutationFn: () => PostApi.unpublish(postId),
    onSuccess: async (post) => {
      toaster.success({ description: m.blog_unpublished() });
      await settle(post);
    },
    onError: (error) => toaster.error({ description: ApiErrorHelper.describe(error) }),
  });

  return { publish, unpublish };
}
