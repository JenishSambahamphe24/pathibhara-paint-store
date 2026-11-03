import { clsx } from "clsx";

interface LookSwitchProps {
  value: 0 | 1;
  onChange: (look: 0 | 1) => void;
  label: string;
  className?: string;
}

const LOOKS = [
  { value: 0, name: "Look A" },
  { value: 1, name: "Look B" },
] as const;

export function LookSwitch({
  value,
  onChange,
  label,
  className,
}: LookSwitchProps) {
  return (
    <div
      role="group"
      aria-label={label}
      className={clsx(
        "grid grid-cols-2 gap-[3px] rounded-lg border border-line bg-surface p-[3px]",
        className,
      )}
    >
      {LOOKS.map((look) => (
        <button
          key={look.value}
          type="button"
          aria-pressed={value === look.value}
          onClick={() => onChange(look.value)}
          className={clsx(
            "min-h-10 rounded-control px-3.5 pt-[3px] font-display text-[22px] leading-none font-semibold uppercase",
            value === look.value ? "bg-ink text-on-ink" : "text-ink",
          )}
        >
          {look.name}
        </button>
      ))}
    </div>
  );
}
