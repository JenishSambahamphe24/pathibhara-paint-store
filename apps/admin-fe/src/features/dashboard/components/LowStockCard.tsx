import type { IDashboardLowStock } from "../types";

import { VolumeHelper } from "@repo/shared";
import { Link } from "@tanstack/react-router";

import { Chip } from "#/components/Chip/Chip";

import { m } from "#/paraglide/messages";

import { DashboardCard } from "./DashboardCard";

interface LowStockCardProps {
  rows: Array<IDashboardLowStock>;
  total: number;
}

export function LowStockCard({ rows, total }: LowStockCardProps) {
  return (
    <DashboardCard
      title={m.dashboard_low_stock()}
      description={m.dashboard_low_stock_description()}
      action={
        total > 0 && (
          <Link to="/stock/batches/new" className="shrink-0 text-sm font-medium text-info-strong hover:underline">
            {m.dashboard_record_stock_in()}
          </Link>
        )
      }
    >
      {rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-foreground-subtle">{m.dashboard_low_stock_empty()}</p>
      ) : (
        <>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs whitespace-nowrap text-foreground-subtle">
                <th className="pb-2 font-medium">{m.dashboard_column_size()}</th>
                <th className="pb-2 text-right font-medium">{m.dashboard_column_in_stock()}</th>
                <th className="pb-2 text-right font-medium">{m.dashboard_column_reorder_at()}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-muted">
              {rows.map((row) => (
                <tr key={row.variantId}>
                  <td className="py-2 pr-3">
                    <Link to="/products/$productId" params={{ productId: row.productId }} className="text-foreground hover:underline">
                      {row.productName} <span className="text-foreground-subtle">{VolumeHelper.label(row.volumeMl)}</span>
                    </Link>
                  </td>
                  <td className="py-2 text-right tabular-nums">
                    {row.currentStock === 0 ? (
                      <Chip variant="danger">{m.dashboard_out_of_stock()}</Chip>
                    ) : (
                      <span className="font-medium text-foreground">{row.currentStock}</span>
                    )}
                  </td>
                  <td className="py-2 text-right text-foreground-subtle tabular-nums">{row.reorderLevel}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {total > rows.length && (
            <Link to="/products" search={{ lowStock: true }} className="mt-3 inline-block text-xs font-medium text-info-strong hover:underline">
              {m.dashboard_low_stock_more({ count: total - rows.length })}
            </Link>
          )}
        </>
      )}
    </DashboardCard>
  );
}
