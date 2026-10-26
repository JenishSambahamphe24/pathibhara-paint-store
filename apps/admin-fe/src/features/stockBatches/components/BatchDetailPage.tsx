import { Link } from "@tanstack/react-router";
import { Ban } from "lucide-react";
import { useState } from "react";

import { VolumeHelper } from "@repo/shared";

import { BreadCrumb } from "#/components/Breadcrumb/Breadcrumb";
import { Button } from "#/components/Button/Button";
import { Chip } from "#/components/Chip/Chip";
import { NotFound } from "#/components/NotFound/NotFound";
import { PageHeader } from "#/components/PageHeader/PageHeader";
import { SkeletonCell } from "#/components/Table/SkeletonCell";

import { CurrencyHelper } from "#/lib/helpers/currency.helper";
import { DateHelper } from "#/lib/helpers/date.helper";
import { m } from "#/paraglide/messages";

import { useStockBatch } from "../hooks/useStockBatches";
import { VoidBatchDialog } from "./VoidBatchDialog";

interface BatchDetailPageProps {
  batchId: string;
}

export function BatchDetailPage({ batchId }: BatchDetailPageProps) {
  const { data: batch, isLoading, isError } = useStockBatch(batchId);
  const [voiding, setVoiding] = useState(false);

  if (isError) return <NotFound />;
  if (isLoading || !batch) return <SkeletonCell />;

  const title = m.batches_number({ number: batch.batchNumber });
  const facts = [
    {
      label: m.batches_received_on(),
      value: DateHelper.formatCalendarDate(batch.receivedOn),
    },
    { label: m.batches_supplier(), value: batch.supplierName ?? "—" },
    {
      label: m.common_recorded_by(),
      value: `${batch.createdByName}, ${DateHelper.formatDateTime(batch.createdAt)}`,
    },
    {
      label: m.batches_column_lines(),
      value: m.batches_lines_units({
        lines: batch.itemCount,
        units: batch.totalUnits,
      }),
    },
    {
      label: m.batches_column_cost(),
      value: CurrencyHelper.formatNpr(batch.totalCostPaisa),
    },
  ];

  return (
    <>
      <BreadCrumb
        items={[
          { title: m.sidebar_stock() },
          { title: m.sidebar_batches(), url: "/stock/batches" },
          { title },
        ]}
      />
      <PageHeader
        title={title}
        actions={
          <>
            {batch.status === "voided" ? (
              <Chip variant="danger">{m.batches_voided()}</Chip>
            ) : (
              <Button
                variant="danger"
                startIcon={<Ban size={16} />}
                onClick={() => setVoiding(true)}
              >
                {m.batches_void_action()}
              </Button>
            )}
          </>
        }
      />

      {batch.status === "voided" && (
        <div className="mb-5 rounded-xl border border-danger-border bg-danger-subtle p-4 text-sm text-danger-strong">
          {m.batches_voided_banner({
            by: batch.voidedByName ?? "",
            at: DateHelper.formatDateTime(batch.voidedAt),
            reason: batch.voidReason ?? "",
          })}
        </div>
      )}

      <dl className="mb-5 grid gap-4 rounded-xl border border-border bg-surface p-5 sm:grid-cols-2 lg:grid-cols-5">
        {facts.map((fact) => (
          <div key={fact.label}>
            <dt className="text-xs text-foreground-subtle">{fact.label}</dt>
            <dd className="mt-1 text-sm font-medium text-foreground">
              {fact.value}
            </dd>
          </div>
        ))}
        {batch.notes && (
          <div className="sm:col-span-2 lg:col-span-5">
            <dt className="text-xs text-foreground-subtle">
              {m.common_notes()}
            </dt>
            <dd className="mt-1 text-sm text-foreground">{batch.notes}</dd>
          </div>
        )}
      </dl>

      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs tracking-wide text-foreground-subtle uppercase">
              <th className="px-4 py-3">{m.common_product_size()}</th>
              <th className="px-4 py-3">{m.products_variant_sku()}</th>
              <th className="px-4 py-3 text-right">{m.common_quantity()}</th>
              <th className="px-4 py-3 text-right">{m.batches_unit_cost()}</th>
              <th className="px-4 py-3 text-right">{m.batches_stock_now()}</th>
            </tr>
          </thead>
          <tbody>
            {batch.items.map((item) => (
              <tr
                key={item.id}
                className="border-b border-border-muted last:border-b-0"
              >
                <td className="px-4 py-3">
                  <Link
                    to="/products/$productId"
                    params={{ productId: item.productId }}
                    className="text-foreground hover:underline"
                  >
                    {item.productName}
                  </Link>{" "}
                  <span className="text-foreground-subtle">
                    {VolumeHelper.label(item.volumeMl)}
                  </span>
                </td>
                <td className="px-4 py-3 text-foreground-muted">{item.sku}</td>
                <td className="px-4 py-3 text-right font-medium text-foreground">
                  +{item.quantity}
                </td>
                <td className="px-4 py-3 text-right text-foreground-muted">
                  {CurrencyHelper.formatNpr(item.unitCostPaisa)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    to="/stock/movements"
                    search={{ variantId: item.variantId }}
                    className="text-foreground-muted hover:underline"
                  >
                    {item.currentStock}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <VoidBatchDialog
        batchId={batch.id}
        batchNumber={batch.batchNumber}
        open={voiding}
        onOpenChange={setVoiding}
      />
    </>
  );
}
