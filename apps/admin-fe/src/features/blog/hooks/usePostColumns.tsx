import type { IPostListItem } from "../types";
import type { ColumnDef } from "@tanstack/react-table";

import { Link } from "@tanstack/react-router";

import { Chip } from "#/components/Chip/Chip";

import { DateHelper } from "#/lib/helpers/date.helper";
import { m } from "#/paraglide/messages";

export function usePostColumns(): Array<ColumnDef<IPostListItem>> {
  return [
    {
      id: "title",
      header: m.blog_column_title(),
      meta: { skipTruncate: true },
      cell: ({ row }) => (
        <Link to="/blog/$postId" params={{ postId: row.original.id }} className="block max-w-md hover:underline">
          <span className="block truncate font-medium text-foreground">{row.original.title}</span>
          {!row.original.hasNepali && <span className="block text-xs text-foreground-faint">{m.blog_no_nepali()}</span>}
        </Link>
      ),
    },
    {
      id: "status",
      header: m.common_status(),
      enableSorting: false,
      cell: ({ row }) =>
        row.original.status === "published" ? (
          <Chip variant="success">{m.blog_status_published()}</Chip>
        ) : (
          <Chip variant="neutral">{m.blog_status_draft()}</Chip>
        ),
    },
    { id: "publishedAt", header: m.blog_column_published(), cell: ({ row }) => DateHelper.formatDate(row.original.publishedAt) },
    { id: "author", header: m.blog_column_author(), enableSorting: false, cell: ({ row }) => row.original.authorName },
    { id: "updatedAt", header: m.common_updated(), cell: ({ row }) => DateHelper.formatDateTime(row.original.updatedAt) },
  ];
}
