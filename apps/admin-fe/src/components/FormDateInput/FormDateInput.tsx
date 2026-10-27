import { Field } from "@ark-ui/react";

import { BsDatePicker } from "#/components/BsDatePicker/BsDatePicker";

import { useFieldContext } from "#/lib/formContext";
import { FormHelper } from "#/lib/helpers/form.helper";

interface FormDateInputProps {
  label: string;
  required?: boolean;
  disabled?: boolean;
  /** AD `YYYY-MM-DD` bounds; the picker shows Bikram Sambat. */
  min?: string;
  max?: string;
  hint?: string;
}

export function FormDateInput({
  label,
  required = false,
  disabled = false,
  min,
  max,
  hint,
}: FormDateInputProps) {
  const field = useFieldContext<string>();
  const error = FormHelper.getFieldError(field.state.meta.errors);

  return (
    <Field.Root invalid={!!error}>
      <Field.Label className="text-sm font-medium text-foreground-muted">
        {label}
        {required && <span className="ml-0.5 text-danger">*</span>}
      </Field.Label>

      <BsDatePicker
        value={field.state.value}
        min={min}
        max={max}
        invalid={!!error}
        disabled={disabled}
        onBlur={field.handleBlur}
        onChange={(date) => {
          field.handleChange(date);
          if (field.state.meta.errorMap.onServer) {
            field.setMeta((meta) => ({
              ...meta,
              errorMap: { ...meta.errorMap, onServer: undefined },
            }));
          }
        }}
      />

      {error ? (
        <Field.ErrorText className="text-xs text-danger">
          {error}
        </Field.ErrorText>
      ) : (
        hint && <p className="text-xs text-foreground-subtle">{hint}</p>
      )}
    </Field.Root>
  );
}
