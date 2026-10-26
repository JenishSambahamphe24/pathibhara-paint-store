import { Field } from "@ark-ui/react";
import clsx from "clsx";

import { useFieldContext } from "#/lib/formContext";
import { FormHelper } from "#/lib/helpers/form.helper";

interface FormTextareaProps {
  label: string;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  /** Shown under the field, and replaced by the error text when invalid. */
  hint?: string;
  /** Grow the textarea to its container's height instead of sizing by `rows`,
   * for a field that owns a whole column. */
  fill?: boolean;
}

export function FormTextarea({
  label,
  placeholder,
  required = false,
  rows = 4,
  hint,
  fill = false,
}: FormTextareaProps) {
  const field = useFieldContext<string>();
  const error = FormHelper.getFieldError(field.state.meta.errors);

  return (
    <Field.Root
      invalid={!!error}
      className={clsx(fill && "flex h-full min-h-0 flex-col")}
    >
      <Field.Label className="text-sm font-medium text-foreground-muted">
        {label}
        {required && <span className="ml-0.5 text-danger">*</span>}
      </Field.Label>

      <Field.Textarea
        name={field.name}
        value={field.state.value}
        rows={rows}
        onBlur={field.handleBlur}
        onChange={(e) => {
          field.handleChange(e.target.value);
          if (field.state.meta.errorMap.onServer) {
            field.setMeta((meta) => ({
              ...meta,
              errorMap: { ...meta.errorMap, onServer: undefined },
            }));
          }
        }}
        placeholder={placeholder}
        className={clsx(
          "w-full resize-none rounded-lg border bg-surface px-3 py-2.5 text-sm text-foreground",
          fill && "min-h-48 flex-1 font-mono",
          "placeholder-foreground-faint transition-colors focus:outline-none",
          "border-border-strong focus:border-foreground focus:ring-2 focus:ring-foreground/10",
          "data-invalid:border-danger data-invalid:focus:border-danger data-invalid:focus:ring-danger/10",
        )}
      />

      {error ? (
        <Field.ErrorText className="text-xs text-danger">
          {error}
        </Field.ErrorText>
      ) : hint ? (
        <Field.HelperText className="text-xs text-foreground-faint">
          {hint}
        </Field.HelperText>
      ) : null}
    </Field.Root>
  );
}
