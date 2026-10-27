import type { IDashboardSlowMover } from "../types";

import { VolumeHelper } from "@repo/shared";
import { Link } from "@tanstack/react-router";

import { CurrencyHelper } from "#/lib/helpers/currency.helper";
import { DateHelper } from "#/lib/helpers/date.helper";
import { m } from "#/paraglide/messages";

import { DashboardCard } from "./DashboardCard";

interface SlowMoversCardProps {
  rows: Array<IDashboardSlowMover>;
}

export function SlowMoversCard({ rows }: SlowMoversCardProps) {
  return (
    <DashboardCard title={m.dashboard_slow_movers()} description={m.dashboard_slow_movers_description()}>
      {rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-foreground-subtle">{m.dashboard_slow_movers_empty()}</p>
      ) : (
        <ul className="divide-y divide-border-muted text-sm">
          {rows.map((row) => (
            <li key={row.variantId} className="flex items-center justify-between gap-3 py-2">
              <div className="min-w-0">
                <Link
                  to="/products/$productId"
                  params={{ productId: row.productId }}
                  className="block truncate text-foreground hover:underline"
                >
                  {row.productName} <span className="text-foreground-subtle">{VolumeHelper.label(row.volumeMl)}</span>
                </Link>
                <p className="text-xs text-foreground-subtle">
                  {row.lastSoldOn
                    ? m.dashboard_last_sold({ date: DateHelper.formatCalendarDate(row.lastSoldOn) })
                    : m.dashboard_never_sold()}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-medium text-foreground tabular-nums">{CurrencyHelper.formatNpr(row.stockValuePaisa)}</p>
                <p className="text-xs text-foreground-subtle">{m.dashboard_in_stock({ count: row.currentStock })}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  );
}
