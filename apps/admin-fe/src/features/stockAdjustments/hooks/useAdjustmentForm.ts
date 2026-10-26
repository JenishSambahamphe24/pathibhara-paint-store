import type { TAdjustmentFormValues } from "../types";
import type { StockAdjustmentInput } from "@repo/shared";

import { useMutation } from "@tanstack/react-query";
import { useRef } from "react";

import { stockAdjustmentInputSchema } from "@repo/shared";

import { useAppForm } from "#/lib/form";
import { FormHelper } from "#/lib/helpers/form.helper";
import { toaster } from "#/lib/toaster";
import { m } from "#/paraglide/messages";

import { useStockInvalidation } from "#/hooks/useStockInvalidation";

import { StockAdjustmentApi } from "../api";

export function useAdjustmentForm(onSaved: () => void, variantId = "") {
  const hasSubmittedRef = useRef(false);
  const invalidate = useStockInvalidation();

  const mutation = useMutation({
    mutationFn: (value: TAdjustmentFormValues) =>
      StockAdjustmentApi.create(value as unknown as StockAdjustmentInput),
    onSuccess: async () => {
      toaster.success({ description: m.adjustments_created() });
      await invalidate();
      onSaved();
    },
  });

  const defaultValues: TAdjustmentFormValues = {
    variantId,
    quantityDelta: null,
    reason: null,
    note: "",
  };

  const form = useAppForm({
    defaultValues,
    validators: {
      onSubmit: FormHelper.validator<TAdjustmentFormValues>(
        stockAdjustmentInputSchema,
      ),
      onChange: FormHelper.gatedSchema(
        FormHelper.validator<TAdjustmentFormValues>(stockAdjustmentInputSchema),
        hasSubmittedRef,
      ),
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
