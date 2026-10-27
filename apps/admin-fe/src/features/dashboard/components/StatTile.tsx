import type { ReactNode } from "react";

import clsx from "clsx";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

interface StatTileProps {
  label: string;
  value: string;
  delta?: { percent: number; label: string } | null;
  footer?: ReactNode;
  tone?: "default" | "warning";
}

export function StatTile({ label, value, delta, footer, tone = "default" }: StatTileProps) {
  return (
    <div
      className={clsx(
        "rounded-xl border bg-surface p-5",
        tone === "warning" ? "border-warning-border" : "border-border",
      )}
    >
      <p className="text-sm text-foreground-subtle">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
      {delta && (
        <p className="mt-2 flex items-center gap-1 text-xs text-foreground-subtle">
          <span
            className={clsx(
              "inline-flex items-center font-semibold",
              delta.percent >= 0 ? "text-success-strong" : "text-danger-strong",
            )}
          >
            {delta.percent >= 0 ? <ArrowUpRight size={14} aria-hidden /> : <ArrowDownRight size={14} aria-hidden />}
            {Math.abs(delta.percent)}%
          </span>
          {delta.label}
        </p>
      )}
      {footer && <div className="mt-2 text-xs text-foreground-subtle">{footer}</div>}
    </div>
  );
}
