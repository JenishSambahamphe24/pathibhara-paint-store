import type { IProductListItem } from "../types";
import type { ColumnDef } from "@tanstack/react-table";

import { Link } from "@tanstack/react-router";
import { ImageOff } from "lucide-react";

import { Chip } from "#/components/Chip/Chip";

import { CurrencyHelper } from "#/lib/helpers/currency.helper";
import { DateHelper } from "#/lib/helpers/date.helper";
import { m } from "#/paraglide/messages";

export function useProductColumns(): Array<ColumnDef<IProductListItem>> {
  return [
    {
      id: "name",
      header: m.products_column_product(),
      meta: { skipTruncate: true },
      cell: ({ row }) => {
        const product = row.original;
        return (
          <Link
            to="/products/$productId"
            params={{ productId: product.id }}
            className="flex items-center gap-3 hover:underline"
          >
            <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-surface-muted">
              {product.coverImage ? (
                <img
                  src={product.coverImage.url}
                  alt=""
                  className="size-full object-contain"
                  loading="lazy"
                />
              ) : (
                <ImageOff size={16} className="text-foreground-faint" />
              )}
            </span>
            <span className="min-w-0">
              <span className="block truncate font-medium text-foreground">
                {product.name}
              </span>
              {!product.hasNepali && (
                <span className="block text-xs text-foreground-faint">
                  {m.products_missing_nepali()}
                </span>
              )}
            </span>
          </Link>
        );
      },
    },
    {
      id: "category",
      header: m.products_column_category(),
      enableSorting: false,
      cell: ({ row }) => row.original.categoryName ?? "—",
    },
    {
      id: "sizes",
      header: m.products_column_sizes(),
      enableSorting: false,
      cell: ({ row }) => row.original.variantCount,
    },
    {
      id: "price",
      header: m.products_column_price(),
      enableSorting: false,
      cell: ({ row }) => {
        const { minPricePaisa, maxPricePaisa } = row.original;
        if (minPricePaisa === null || maxPricePaisa === null) return "—";
        return minPricePaisa === maxPricePaisa
          ? CurrencyHelper.formatNpr(minPricePaisa)
          : `${CurrencyHelper.formatNpr(minPricePaisa)} – ${CurrencyHelper.formatNpr(maxPricePaisa)}`;
      },
    },
    {
      id: "stock",
      header: m.products_column_stock(),
      meta: { skipTruncate: true },
      cell: ({ row }) => (
        <span className="flex items-center gap-2">
          {CurrencyHelper.toLocaleString(row.original.totalStock)}
          {row.original.lowStockCount > 0 && (
            <Chip variant="warning">
              {m.products_low_stock_count({
                count: row.original.lowStockCount,
              })}
            </Chip>
          )}
        </span>
      ),
    },
    {
      id: "status",
      header: m.common_status(),
      enableSorting: false,
      cell: ({ row }) =>
        row.original.isActive ? (
          <Chip variant="success">{m.common_active()}</Chip>
        ) : (
          <Chip variant="neutral">{m.common_inactive()}</Chip>
        ),
    },
    {
      id: "updatedAt",
      header: m.common_updated(),
      cell: ({ row }) => DateHelper.formatDate(row.original.updatedAt),
    },
  ];
}
