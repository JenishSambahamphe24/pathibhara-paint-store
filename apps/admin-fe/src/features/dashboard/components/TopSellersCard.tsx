import type { IDashboardTopSeller } from "../types";

import { Link } from "@tanstack/react-router";

import { VolumeHelper } from "@repo/shared";

import { CurrencyHelper } from "#/lib/helpers/currency.helper";
import { m } from "#/paraglide/messages";

import { DashboardCard } from "./DashboardCard";

interface TopSellersCardProps {
  rows: Array<IDashboardTopSeller>;
}

export function TopSellersCard({ rows }: TopSellersCardProps) {
  const max = rows[0]?.revenuePaisa ?? 0;

  return (
    <DashboardCard
      title={m.dashboard_top_sellers()}
      description={m.dashboard_top_sellers_description()}
    >
      {rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-foreground-subtle">
          {m.dashboard_no_sales()}
        </p>
      ) : (
        <ol className="space-y-4">
          {rows.map((row) => (
            <li key={row.variantId}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <Link
                  to="/products/$productId"
                  params={{ productId: row.productId }}
                  className="min-w-0 truncate text-foreground hover:underline"
                >
                  {row.productName}{" "}
                  <span className="text-foreground-subtle">
                    {VolumeHelper.label(row.volumeMl)}
                  </span>
                </Link>
                <span className="shrink-0 font-medium text-foreground tabular-nums">
                  {CurrencyHelper.formatNpr(row.revenuePaisa)}
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-3">
                <div className="h-2 grow rounded-full bg-chart-series-muted">
                  <div
                    className="h-2 rounded-full bg-chart-series"
                    // Share of the leader; a ratio for drawing, never shown as money.
                    style={{
                      width: `${max > 0 ? Math.max((row.revenuePaisa / max) * 100, 2) : 0}%`,
                    }}
                  />
                </div>
                <span className="w-16 shrink-0 text-right text-xs text-foreground-subtle tabular-nums">
                  {m.dashboard_units({ count: row.units })}
                </span>
              </div>
            </li>
          ))}
        </ol>
      )}
    </DashboardCard>
  );
}
