import type { TBatchFormValues } from "../types";
import type { StockBatchInput } from "@repo/shared";

import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useRef } from "react";

import { stockBatchInputSchema } from "@repo/shared";

import { useAppForm } from "#/lib/form";
import { DateHelper } from "#/lib/helpers/date.helper";
import { FormHelper } from "#/lib/helpers/form.helper";
import { toaster } from "#/lib/toaster";
import { m } from "#/paraglide/messages";

import { useStockInvalidation } from "#/hooks/useStockInvalidation";

import { StockBatchApi } from "../api";
import { BatchFormHelper } from "../helpers/batchForm.helper";

export function useBatchForm() {
  const hasSubmittedRef = useRef(false);
  const navigate = useNavigate();
  const invalidate = useStockInvalidation();

  const mutation = useMutation({
    mutationFn: (value: TBatchFormValues) =>
      StockBatchApi.create(value as unknown as StockBatchInput),
    onSuccess: async (batch) => {
      toaster.success({
        description: m.batches_created({ number: batch.batchNumber }),
      });
      await invalidate();
      await navigate({
        to: "/stock/batches/$batchId",
        params: { batchId: batch.id },
      });
    },
  });

  const defaultValues: TBatchFormValues = {
    receivedOn: DateHelper.todayInStore(),
    supplierName: "",
    notes: "",
    items: [BatchFormHelper.emptyLine()],
  };

  const form = useAppForm({
    defaultValues,
    validators: {
      onSubmit: FormHelper.validator<TBatchFormValues>(stockBatchInputSchema),
      onChange: FormHelper.gatedSchema(
        FormHelper.validator<TBatchFormValues>(stockBatchInputSchema),
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
