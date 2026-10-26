import clsx from "clsx";
import { useState } from "react";

import { FormHelper } from "#/lib/helpers/form.helper";
import { m } from "#/paraglide/messages";

interface AdjustmentQuantityFieldProps {
  value: number | null;
  onChange: (value: number | null) => void;
  errors: Array<unknown>;
}

// Direction and amount are entered separately (people think "remove 2"), but
// stored as one signed delta, which is what the API and ledger use.
export function AdjustmentQuantityField({
  value,
  onChange,
  errors,
}: AdjustmentQuantityFieldProps) {
  const [direction, setDirection] = useState<-1 | 1>(
    value !== null && value > 0 ? 1 : -1,
  );
  const [amount, setAmount] = useState(
    value === null ? "" : String(Math.abs(value)),
  );
  const error = FormHelper.getFieldError(errors);

  function update(nextDirection: -1 | 1, nextAmount: string) {
    setDirection(nextDirection);
    setAmount(nextAmount);
    const parsed = Number(nextAmount);
    onChange(
      nextAmount === ""
        ? null
        : Number.isInteger(parsed)
          ? nextDirection * parsed
          : Number.NaN,
    );
  }

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-foreground-muted">
        {m.adjustments_change()}
        <span className="ml-0.5 text-danger">*</span>
      </span>
      <div className="flex gap-2">
        {([-1, 1] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => update(option, amount)}
            className={clsx(
              "cursor-pointer rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
              direction === option
                ? option < 0
                  ? "border-danger-border bg-danger-subtle text-danger-strong"
                  : "border-success-border bg-success-subtle text-success-strong"
                : "border-border-strong text-foreground-muted hover:bg-surface-muted",
            )}
          >
            {option < 0 ? m.adjustments_remove() : m.adjustments_add()}
          </button>
        ))}
        <input
          type="number"
          min={1}
          step={1}
          inputMode="numeric"
          value={amount}
          onChange={(event) => update(direction, event.target.value)}
          aria-label={m.common_quantity()}
          className={clsx(
            "w-28 rounded-lg border px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-foreground/10 focus:outline-none",
            error
              ? "border-danger"
              : "border-border-strong focus:border-foreground",
          )}
        />
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
