import type { IColourSetListItem } from "../types";
import type { ColumnDef } from "@tanstack/react-table";

import { Chip } from "#/components/Chip/Chip";

import { DateHelper } from "#/lib/helpers/date.helper";
import { m } from "#/paraglide/messages";

import { ColourSetSwatches } from "../components/ColourSetSwatches";

export function useColourSetColumns(
  onEdit: (colourSet: IColourSetListItem) => void,
): Array<ColumnDef<IColourSetListItem>> {
  return [
    {
      id: "name",
      header: m.colour_sets_column_set(),
      meta: { skipTruncate: true },
      cell: ({ row }) => {
        const colourSet = row.original;
        return (
          <button
            type="button"
            onClick={() => onEdit(colourSet)}
            className="flex cursor-pointer items-center gap-3 text-left hover:underline"
          >
            <ColourSetSwatches shades={colourSet.shades} />
            <span className="min-w-0">
              <span className="block truncate font-medium text-foreground">
                {colourSet.name}
              </span>
              <span className="block text-xs text-foreground-subtle">
                /{colourSet.slug}
              </span>
              {!colourSet.hasNepali && (
                <span className="block text-xs text-foreground-faint">
                  {m.colour_sets_missing_nepali()}
                </span>
              )}
            </span>
          </button>
        );
      },
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
