import type { IShade } from "#/types/shade";

import { clsx } from "clsx";

interface ShadeChipProps {
  shade: IShade;
  selected?: boolean;
  size?: "sm" | "md";
  onSelect?: (shade: IShade) => void;
}

// Selection is shown by ring, check badge and "On" text together, never by
// colour alone. The paint hex goes in inline style so the theme can't touch it.
export function ShadeChip({
  shade,
  selected = false,
  size = "md",
  onSelect,
}: ShadeChipProps) {
  const isSmall = size === "sm";
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={`${shade.code} ${shade.name}`}
      onClick={() => onSelect?.(shade)}
      className={clsx(
        "flex shrink-0 flex-col overflow-hidden rounded-card bg-surface text-left text-ink motion-safe:transition-transform",
        isSmall ? "w-14" : "w-28",
        selected
          ? "border-2 border-ink outline-2 outline-offset-2 outline-ink"
          : "border border-line",
        selected && isSmall && "motion-safe:-translate-y-1.5",
      )}
    >
      <span
        className={clsx(
          "relative block border-b border-line",
          isSmall ? "h-14" : "h-24",
        )}
        style={{ backgroundColor: shade.hex }}
      >
        {selected && !isSmall && (
          <span className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full border-2 border-surface bg-ink">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-on-ink"
              aria-hidden="true"
            >
              <path d="M5 12l5 5L20 7" />
            </svg>
          </span>
        )}
      </span>
      <span className="flex flex-col gap-0.5 px-2 py-1.5">
        <span className="text-[13px] font-semibold tabular-nums">
          {selected && "✓ "}
          {isSmall ? shade.code.replace(/^S-/, "") : shade.code}
          {selected && !isSmall && " · On"}
        </span>
        {!isSmall && (
          <span
            className={clsx(
              "text-[13px]",
              selected ? "font-semibold" : "text-muted",
            )}
          >
            {shade.name}
          </span>
        )}
      </span>
    </button>
  );
}
