import type { TCalculatorFormValues } from "../types";
import type { CostEstimateInput } from "@repo/shared";

import { useMutation } from "@tanstack/react-query";
import { useRef } from "react";

import { costEstimateInputSchema } from "@repo/shared";

import { useAppForm } from "#/lib/form";
import { FormHelper } from "#/lib/helpers/form.helper";

import { CalculatorApi } from "../api";
import { CalculatorFormHelper } from "../helpers/calculatorForm.helper";

export function useCalculatorForm(defaultWastagePercent: number) {
  const hasSubmittedRef = useRef(false);
  const mutation = useMutation({
    mutationFn: (value: TCalculatorFormValues) =>
      CalculatorApi.estimate(value as unknown as CostEstimateInput),
  });

  const form = useAppForm({
    defaultValues: CalculatorFormHelper.defaults(defaultWastagePercent),
    validators: {
      onSubmit: FormHelper.validator<TCalculatorFormValues>(
        costEstimateInputSchema,
      ),
      onChange: FormHelper.gatedSchema(
        FormHelper.validator<TCalculatorFormValues>(costEstimateInputSchema),
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

  return { form, handleSubmit, result: mutation.data ?? null };
}
