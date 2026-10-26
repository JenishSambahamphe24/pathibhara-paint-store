import type { ICostEstimateResult } from "@repo/shared";

import { TriangleAlert } from "lucide-react";

import { VolumeHelper } from "@repo/shared";

import { Chip } from "#/components/Chip/Chip";

import { CurrencyHelper } from "#/lib/helpers/currency.helper";
import { m } from "#/paraglide/messages";

interface EstimateResultPanelProps {
  result: ICostEstimateResult;
}

export function EstimateResultPanel({ result }: EstimateResultPanelProps) {
  return (
    <div className="space-y-4">
      {result.sections.map((section, sectionIndex) => (
        <section
          key={sectionIndex}
          className="rounded-xl border border-border bg-surface"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border px-5 py-3">
            <h3 className="font-semibold text-foreground">{section.name}</h3>
            <p className="text-sm text-foreground-subtle">
              {m.calculator_area_summary({
                gross: section.grossAreaSqft,
                deducted: section.deductionAreaSqft,
                net: section.netAreaSqft,
              })}
            </p>
          </div>
          <div className="divide-y divide-border-muted">
            {section.products.map((line) => (
              <div
                key={line.productId}
                className="grid gap-3 px-5 py-4 md:grid-cols-12"
              >
                <div className="md:col-span-4">
                  <p className="font-medium text-foreground">{line.name}</p>
                  <p className="text-xs text-foreground-subtle">
                    {m.calculator_line_basis({
                      coats: line.coats,
                      coverage: line.coverageSqftPerLitre,
                      area: line.areaSqft,
                    })}
                  </p>
                </div>
                <div className="text-sm md:col-span-3">
                  <p className="text-foreground-muted">
                    {m.calculator_needed({
                      litres: (line.requiredMl / 1000).toFixed(2),
                    })}
                  </p>
                  <p className="text-xs text-foreground-subtle">
                    {m.calculator_buying({
                      litres: VolumeHelper.toLitresString(line.purchasedMl),
                      spare: VolumeHelper.toLitresString(line.overshootMl),
                    })}
                  </p>
                </div>
                <div className="flex flex-wrap items-start gap-1.5 md:col-span-3">
                  {line.containers.map((container) => (
                    <Chip
                      key={container.variantId}
                      variant={container.isShort ? "warning" : "neutral"}
                    >
                      {container.count} ×{" "}
                      {VolumeHelper.label(container.volumeMl)}
                      {container.isShort &&
                        ` · ${m.calculator_in_stock({ count: container.currentStock ?? 0 })}`}
                    </Chip>
                  ))}
                </div>
                <p className="text-right font-medium text-foreground md:col-span-2">
                  {CurrencyHelper.formatNpr(line.costPaisa)}
                </p>
              </div>
            ))}
          </div>
          <div className="flex justify-between border-t border-border px-5 py-3 text-sm">
            <span className="text-foreground-subtle">
              {m.calculator_subtotal()}
            </span>
            <span className="font-semibold text-foreground">
              {CurrencyHelper.formatNpr(section.subtotalPaisa)}
            </span>
          </div>
        </section>
      ))}

      {result.hasStockShortage && (
        <div className="flex items-start gap-2 rounded-xl border border-warning-border bg-warning-subtle p-4 text-sm text-warning-strong">
          <TriangleAlert size={16} className="mt-0.5 shrink-0" />
          {m.calculator_shortage_note()}
        </div>
      )}

      <div className="flex items-center justify-between rounded-xl border border-border bg-surface-muted px-5 py-4">
        <span className="text-sm text-foreground-muted">
          {m.calculator_total_label({ wastage: result.wastagePercent })}
        </span>
        <span className="text-xl font-semibold text-foreground">
          {CurrencyHelper.formatNpr(result.totalPaisa)}
        </span>
      </div>
    </div>
  );
}
