import { Field } from "@ark-ui/react";
import clsx from "clsx";
import { useId, useState } from "react";

import { useFieldContext } from "#/lib/formContext";
import { FormHelper } from "#/lib/helpers/form.helper";

interface FormParsedInputProps {
  label: string;
  // Text -> stored number. Return null for empty, NaN for unparseable, so the
  // schema can tell "left blank" from "typed nonsense".
  parse: (text: string) => number | null;
  format: (value: number) => string;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  hint?: string;
  suggestions?: Array<string>;
  hideLabel?: boolean;
}

// An input whose text is not its value (rupees typed, paisa stored; litres
// typed, millilitres stored). The text is kept locally so "12." or "0.0" can
// be mid-edit without the stored number fighting the cursor.
export function FormParsedInput({
  label,
  parse,
  format,
  prefix,
  suffix,
  placeholder,
  required = false,
  disabled = false,
  hint,
  suggestions,
  hideLabel = false,
}: FormParsedInputProps) {
  const field = useFieldContext<number | null>();
  const error = FormHelper.getFieldError(field.state.meta.errors);
  const listId = useId();
  const value = field.state.value;

  const toText = (next: number | null) =>
    next === null || Number.isNaN(next) ? "" : format(next);
  const [text, setText] = useState(() => toText(value));
  const [lastValue, setLastValue] = useState(value);
  if (!Object.is(value, lastValue)) {
    setLastValue(value);
    if (!Object.is(parse(text), value)) setText(toText(value));
  }

  return (
    <Field.Root invalid={!!error}>
      <Field.Label
        className={clsx(
          "text-sm font-medium text-foreground-muted",
          hideLabel && "sr-only",
        )}
      >
        {label}
        {required && <span className="ml-0.5 text-danger">*</span>}
      </Field.Label>
      <div className="relative flex items-center">
        {prefix && (
          <span className="pointer-events-none absolute left-3 text-sm text-foreground-subtle">
            {prefix}
          </span>
        )}
        <Field.Input
          name={field.name}
          value={text}
          disabled={disabled}
          inputMode="decimal"
          placeholder={placeholder}
          list={suggestions ? listId : undefined}
          onBlur={field.handleBlur}
          onChange={(event) => {
            const next = event.target.value;
            setText(next);
            field.handleChange(parse(next));
            FormHelper.clearServerError(field);
          }}
          className={clsx(
            "w-full rounded-lg border bg-surface py-2.5 text-sm text-foreground",
            "placeholder-foreground-faint transition-colors focus:outline-none",
            "border-border-strong focus:border-foreground focus:ring-2 focus:ring-foreground/10",
            "data-invalid:border-danger data-invalid:focus:border-danger data-invalid:focus:ring-danger/10",
            "disabled:cursor-not-allowed disabled:bg-surface-subtle disabled:text-foreground-subtle",
            prefix ? "pl-10" : "pl-3",
            suffix ? "pr-10" : "pr-3",
          )}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3 text-sm text-foreground-subtle">
            {suffix}
          </span>
        )}
        {suggestions && (
          <datalist id={listId}>
            {suggestions.map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>
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
