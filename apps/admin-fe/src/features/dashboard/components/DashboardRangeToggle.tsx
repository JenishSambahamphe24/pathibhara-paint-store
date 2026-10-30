import type { DashboardRange } from "@repo/shared";

import clsx from "clsx";

import { DASHBOARD_RANGES } from "@repo/shared";

import { m } from "#/paraglide/messages";

interface DashboardRangeToggleProps {
  value: DashboardRange;
  onChange: (range: DashboardRange) => void;
}

const LABELS: Record<DashboardRange, () => string> = {
  "7d": m.dashboard_range_7d,
  "30d": m.dashboard_range_30d,
  "90d": m.dashboard_range_90d,
};

export function DashboardRangeToggle({
  value,
  onChange,
}: DashboardRangeToggleProps) {
  return (
    <div
      role="group"
      aria-label={m.dashboard_range_label()}
      className="inline-flex rounded-lg border border-border bg-surface p-0.5"
    >
      {DASHBOARD_RANGES.map((range) => (
        <button
          key={range}
          type="button"
          aria-pressed={range === value}
          onClick={() => onChange(range)}
          className={clsx(
            "cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            range === value
              ? "bg-primary text-primary-foreground"
              : "text-foreground-muted hover:bg-surface-subtle",
          )}
        >
          {LABELS[range]()}
        </button>
      ))}
    </div>
  );
}
