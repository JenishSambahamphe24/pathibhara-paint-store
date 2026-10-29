import type { ICategory } from "../types";
import type { CategoryInput } from "@repo/shared";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";

import { categoryInputSchema } from "@repo/shared";

import { useAppForm } from "#/lib/form";
import { ContentFormHelper } from "#/lib/helpers/contentForm.helper";
import { FormHelper } from "#/lib/helpers/form.helper";
import { toaster } from "#/lib/toaster";
import { m } from "#/paraglide/messages";

import { CategoryApi } from "../api";
import { CATEGORY_LIST_QUERY_KEY } from "./useCategories";

interface UseCategoryFormOptions {
  category: ICategory | null;
  defaultParentId: string | null;
  onSaved: () => void;
}

export function useCategoryForm({
  category,
  defaultParentId,
  onSaved,
}: UseCategoryFormOptions) {
  const hasSubmittedRef = useRef(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (value: CategoryInput) =>
      category
        ? CategoryApi.update(category.id, value)
        : CategoryApi.create(value),
    onSuccess: async () => {
      toaster.success({
        description: category ? m.categories_saved() : m.categories_created(),
      });
      // Product lists show category names, so they go stale too.
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [CATEGORY_LIST_QUERY_KEY] }),
        queryClient.invalidateQueries({ queryKey: ["products"] }),
      ]);
      onSaved();
    },
  });

  const defaultValues: CategoryInput = category
    ? {
        parentId: category.parentId,
        slug: category.slug,
        isActive: category.isActive,
        ...ContentFormHelper.fromApi(category),
      }
    : {
        parentId: defaultParentId,
        slug: "",
        isActive: true,
        ...ContentFormHelper.empty(),
      };

  const form = useAppForm({
    defaultValues,
    validators: {
      onSubmit: categoryInputSchema,
      onChange: FormHelper.gatedSchema(categoryInputSchema, hasSubmittedRef),
    },
    onSubmit: async ({ value, formApi }) => {
      try {
        await mutation.mutateAsync(value);
      } catch (error) {
        FormHelper.handleSubmitError(error, formApi);
      }
    },
  });

  function handleSubmit() {
    hasSubmittedRef.current = true;
    form.handleSubmit();
  }

  return { form, handleSubmit };
}
