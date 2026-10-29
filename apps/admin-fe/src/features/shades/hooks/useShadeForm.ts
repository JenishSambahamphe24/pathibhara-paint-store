import type { IShade } from "../types";
import type { ShadeInput } from "@repo/shared";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";

import { shadeInputSchema } from "@repo/shared";

import { useAppForm } from "#/lib/form";
import { FormHelper } from "#/lib/helpers/form.helper";
import { toaster } from "#/lib/toaster";
import { m } from "#/paraglide/messages";

import { ShadeApi } from "../api";
import { SHADE_DETAIL_QUERY_KEY, SHADE_LIST_QUERY_KEY } from "./useShades";

interface UseShadeFormOptions {
  shade: IShade | null;
  onSaved: () => void;
}

export function useShadeForm({ shade, onSaved }: UseShadeFormOptions) {
  const hasSubmittedRef = useRef(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (value: ShadeInput) =>
      shade ? ShadeApi.update(shade.id, value) : ShadeApi.create(value),
    onSuccess: async () => {
      toaster.success({
        description: shade ? m.shades_saved() : m.shades_created(),
      });
      // Colour sets show each shade's name, code and colour.
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [SHADE_LIST_QUERY_KEY] }),
        queryClient.invalidateQueries({ queryKey: [SHADE_DETAIL_QUERY_KEY] }),
        queryClient.invalidateQueries({ queryKey: ["colour-sets"] }),
        queryClient.invalidateQueries({ queryKey: ["colour-set"] }),
      ]);
      onSaved();
    },
  });

  const defaultValues: ShadeInput = shade
    ? {
        code: shade.code,
        hex: shade.hex,
        productId: shade.productId,
        isActive: shade.isActive,
        name: shade.name,
      }
    : {
        code: "",
        hex: "#ffffff",
        productId: null,
        isActive: true,
        name: "",
      };

  const form = useAppForm({
    defaultValues,
    validators: {
      onSubmit: shadeInputSchema,
      onChange: FormHelper.gatedSchema(shadeInputSchema, hasSubmittedRef),
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
