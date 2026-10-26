import type { IDailySaleDetail, TDailySaleFormValues } from "../types";
import type { DailySaleInput } from "@repo/shared";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";

import { dailySaleInputSchema } from "@repo/shared";

import { useAppForm } from "#/lib/form";
import { FormHelper } from "#/lib/helpers/form.helper";
import { toaster } from "#/lib/toaster";
import { m } from "#/paraglide/messages";

import { useStockInvalidation } from "#/hooks/useStockInvalidation";

import { DailySaleApi } from "../api";
import { SaleLinesHelper } from "../helpers/saleLines.helper";
import { DAILY_SALE_DETAIL_QUERY_KEY } from "./useDailySales";

export function useDailySaleForm(date: string, sale: IDailySaleDetail | null) {
  const hasSubmittedRef = useRef(false);
  const queryClient = useQueryClient();
  const invalidate = useStockInvalidation();

  const mutation = useMutation({
    mutationFn: (value: TDailySaleFormValues) =>
      DailySaleApi.save(date, value as unknown as DailySaleInput),
    onSuccess: async (saved) => {
      toaster.success({ description: m.sales_saved() });
      queryClient.setQueryData([DAILY_SALE_DETAIL_QUERY_KEY, date], saved);
      await invalidate();
    },
  });

  const defaultValues: TDailySaleFormValues = {
    notes: sale?.notes ?? "",
    items: sale?.items.length
      ? sale.items.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        }))
      : [SaleLinesHelper.emptyLine()],
  };

  const form = useAppForm({
    defaultValues,
    validators: {
      onSubmit:
        FormHelper.validator<TDailySaleFormValues>(dailySaleInputSchema),
      onChange: FormHelper.gatedSchema(
        FormHelper.validator<TDailySaleFormValues>(dailySaleInputSchema),
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
