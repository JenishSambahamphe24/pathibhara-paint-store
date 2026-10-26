import type { IProduct, TProductFormValues } from "../types";
import type { ProductInput } from "@repo/shared";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useRef } from "react";

import { productInputSchema } from "@repo/shared";

import { useAppForm } from "#/lib/form";
import { FormHelper } from "#/lib/helpers/form.helper";
import { toaster } from "#/lib/toaster";
import { m } from "#/paraglide/messages";

import { ProductApi } from "../api";
import { ProductFormHelper } from "../helpers/productForm.helper";
import {
  PRODUCT_DETAIL_QUERY_KEY,
  PRODUCT_LIST_QUERY_KEY,
} from "./useProducts";

export function useProductForm(product: IProduct | null) {
  const hasSubmittedRef = useRef(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    // The shared schema has already validated `value` on submit, so the
    // nullable form shape is the API shape by now.
    mutationFn: (value: TProductFormValues) => {
      const body = value as ProductInput;
      return product
        ? ProductApi.update(product.id, body)
        : ProductApi.create(body);
    },
    onSuccess: async (saved) => {
      toaster.success({
        description: product ? m.products_saved() : m.products_created(),
      });
      queryClient.setQueryData([PRODUCT_DETAIL_QUERY_KEY, saved.id], saved);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [PRODUCT_LIST_QUERY_KEY] }),
        queryClient.invalidateQueries({ queryKey: ["categories"] }),
      ]);
      if (!product)
        await navigate({
          to: "/products/$productId",
          params: { productId: saved.id },
        });
    },
  });

  const form = useAppForm({
    defaultValues: ProductFormHelper.defaults(product, null),
    validators: {
      onSubmit: productInputSchema,
      onChange: FormHelper.gatedSchema(productInputSchema, hasSubmittedRef),
    },
    onSubmit: async ({ value, formApi }) => {
      try {
        const saved = await mutation.mutateAsync(value);
        // Reset from the server's copy: new sizes now have ids, and saving
        // again must update them rather than insert duplicates.
        formApi.reset(ProductFormHelper.defaults(saved, null));
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
