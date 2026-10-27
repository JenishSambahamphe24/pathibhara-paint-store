import { Field } from "@ark-ui/react";
import clsx from "clsx";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import { useFieldContext } from "#/lib/formContext";
import { FormHelper } from "#/lib/helpers/form.helper";

interface FormInputProps {
  label: string;
  type?: "text" | "email" | "password" | "url" | "number" | "time";
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  disabled?: boolean;
  min?: number | string;
  max?: number | string;
  step?: number;
  inputMode?: "text" | "numeric" | "decimal" | "tel" | "email" | "url";
  maxLength?: number;
  /** Shown under the input, replaced by the validation error when there is one. */
  hint?: string;
}

export function FormInput({
  label,
  type = "text",
  placeholder,
  autoComplete,
  required = false,
  disabled = false,
  min,
  max,
  step,
  inputMode,
  maxLength,
  hint,
}: FormInputProps) {
  const field = useFieldContext<string | number | null>();
  const [showPassword, setShowPassword] = useState(false);
  const error = FormHelper.getFieldError(field.state.meta.errors);
  const rawValue = field.state.value;
  const value = rawValue === null ? "" : String(rawValue);

  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <Field.Root invalid={!!error}>
      <Field.Label className="text-sm font-medium text-foreground-muted">
        {label}
        {required && <span className="ml-0.5 text-danger">*</span>}
      </Field.Label>

      <div className="relative">
        <Field.Input
          type={inputType}
          name={field.name}
          value={value}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          inputMode={inputMode}
          maxLength={maxLength}
          onBlur={field.handleBlur}
          onChange={(e) => {
            const next = e.target.value;
            if (type === "number") {
              field.handleChange(next === "" ? null : Number(next));
            } else {
              field.handleChange(next);
            }
            if (field.state.meta.errorMap.onServer) {
              field.setMeta((meta) => ({
                ...meta,
                errorMap: { ...meta.errorMap, onServer: undefined },
              }));
            }
          }}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={clsx(
            "w-full rounded-lg border bg-surface px-3 py-2.5 text-sm text-foreground",
            "placeholder-foreground-faint transition-colors focus:outline-none",
            "border-border-strong focus:border-foreground focus:ring-2 focus:ring-foreground/10",
            "data-invalid:border-danger data-invalid:focus:border-danger data-invalid:focus:ring-danger/10",
            "disabled:cursor-not-allowed disabled:bg-surface-subtle disabled:text-foreground-subtle",
            isPassword && "pr-10",
          )}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 flex cursor-pointer items-center px-3 text-foreground-faint transition-colors hover:text-foreground-muted focus:text-foreground-muted focus:outline-none"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>

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
