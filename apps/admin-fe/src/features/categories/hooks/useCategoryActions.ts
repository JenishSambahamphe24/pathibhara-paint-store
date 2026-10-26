import type { ICategory } from "../types";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ApiErrorHelper } from "#/lib/helpers/apiError.helper";
import { toaster } from "#/lib/toaster";
import { m } from "#/paraglide/messages";

import { CategoryApi } from "../api";
import { CategoryTreeHelper } from "../helpers/categoryTree.helper";
import { CATEGORY_LIST_QUERY_KEY } from "./useCategories";

export function useCategoryActions(categories: Array<ICategory>) {
  const queryClient = useQueryClient();

  function notifyError(error: unknown) {
    toaster.error({ description: ApiErrorHelper.describe(error) });
  }

  const reorderMutation = useMutation({
    mutationFn: CategoryApi.reorder,
    onSuccess: (list) =>
      queryClient.setQueryData([CATEGORY_LIST_QUERY_KEY], list),
    onError: notifyError,
  });

  const removeMutation = useMutation({
    mutationFn: CategoryApi.remove,
    onSuccess: () => toaster.success({ description: m.categories_deleted() }),
    onError: notifyError,
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: [CATEGORY_LIST_QUERY_KEY] }),
  });

  function move(category: ICategory, direction: -1 | 1) {
    const siblings = CategoryTreeHelper.siblings(categories, category);
    const index = siblings.findIndex((c) => c.id === category.id);
    const target = index + direction;
    if (target < 0 || target >= siblings.length) return;
    const ids = siblings.map((c) => c.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    reorderMutation.mutate({ parentId: category.parentId, orderedIds: ids });
  }

  return {
    move,
    remove: removeMutation.mutateAsync,
    isReordering: reorderMutation.isPending,
    isRemoving: removeMutation.isPending,
  };
}
