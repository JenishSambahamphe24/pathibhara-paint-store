import { clsx } from "clsx";

interface StepperProps {
  value: number;
  min: number;
  max: number;
  // The shown value, e.g. "2 coats"; the number alone when left out.
  label?: string;
  lessLabel: string;
  moreLabel: string;
  onChange: (value: number) => void;
  size?: "md" | "sm";
}

export function Stepper({
  value,
  min,
  max,
  label,
  lessLabel,
  moreLabel,
  onChange,
  size = "md",
}: StepperProps) {
  const isSmall = size === "sm";
  const button = clsx(
    "flex items-center justify-center text-ink disabled:text-muted/50",
    isSmall ? "h-tap w-[34px] text-lg" : "h-[46px] w-9 text-xl",
  );

  return (
    <span
      className={clsx(
        "inline-flex shrink-0 items-center border border-line bg-surface",
        isSmall ? "rounded-lg" : "rounded-field",
      )}
    >
      <button
        type="button"
        aria-label={lessLabel}
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
        className={button}
      >
        −
      </button>
      <span
        aria-live="polite"
        className={clsx(
          "text-center tabular-nums",
          isSmall
            ? "min-w-[50px] text-[13px] font-bold"
            : "min-w-[22px] pt-1 font-display text-[26px]",
        )}
      >
        {label ?? value}
      </span>
      <button
        type="button"
        aria-label={moreLabel}
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
        className={button}
      >
        +
      </button>
    </span>
  );
}
