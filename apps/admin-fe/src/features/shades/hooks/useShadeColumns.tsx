import type { IShadeListItem } from "../types";
import type { ColumnDef } from "@tanstack/react-table";

import { Link } from "@tanstack/react-router";

import { Chip } from "#/components/Chip/Chip";
import { ColorSwatch } from "#/components/ColorSwatch/ColorSwatch";

import { DateHelper } from "#/lib/helpers/date.helper";
import { m } from "#/paraglide/messages";

export function useShadeColumns(
  onEdit: (shade: IShadeListItem) => void,
): Array<ColumnDef<IShadeListItem>> {
  return [
    {
      id: "code",
      header: m.shades_column_shade(),
      meta: { skipTruncate: true },
      cell: ({ row }) => {
        const shade = row.original;
        return (
          <button
            type="button"
            onClick={() => onEdit(shade)}
            className="flex cursor-pointer items-center gap-3 text-left hover:underline"
          >
            <ColorSwatch hex={shade.hex} size="lg" />
            <span className="min-w-0">
              <span className="block truncate font-medium text-foreground">
                {shade.name}
              </span>
              <span className="block font-mono text-xs text-foreground-subtle">
                {shade.code} · {shade.hex}
              </span>
              {!shade.hasNepali && (
                <span className="block text-xs text-foreground-faint">
                  {m.shades_missing_nepali()}
                </span>
              )}
            </span>
          </button>
        );
      },
    },
    {
      id: "product",
      header: m.shades_column_product(),
      enableSorting: false,
      cell: ({ row }) => row.original.productName ?? "—",
    },
    {
      id: "colourSets",
      header: m.shades_column_used_in(),
      enableSorting: false,
      cell: ({ row }) =>
        row.original.colourSetCount > 0 ? (
          <Link
            to="/colour-sets"
            search={{ shadeId: row.original.id }}
            className="text-info-strong hover:underline"
          >
            {m.shades_used_in_sets({ count: row.original.colourSetCount })}
          </Link>
        ) : (
          <span className="text-foreground-faint">{m.shades_unused()}</span>
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
