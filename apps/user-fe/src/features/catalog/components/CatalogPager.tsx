import type { IPagination } from "#/types/api.types";

import { Link } from "@tanstack/react-router";

interface CatalogPagerProps {
  pagination: IPagination;
  // The category being listed, so the links stay in it; null for all products.
  categorySlug: string | null;
}

const PAGE_LINK =
  "flex min-h-tap items-center rounded-control border border-line bg-surface px-4 text-[15px] font-bold";

// Plain links with ?page=, so search engines reach every product too.
export function CatalogPager({ pagination, categorySlug }: CatalogPagerProps) {
  const { page, totalPages } = pagination;
  if (totalPages <= 1) return null;

  const link = (target: number, label: string, rel: "prev" | "next") => {
    const search = { page: target > 1 ? target : undefined };
    return categorySlug ? (
      <Link
        to="/categories/$slug"
        params={{ slug: categorySlug }}
        search={search}
        rel={rel}
        className={PAGE_LINK}
      >
        {label}
      </Link>
    ) : (
      <Link to="/products" search={search} rel={rel} className={PAGE_LINK}>
        {label}
      </Link>
    );
  };

  return (
    <nav
      aria-label="Pages"
      className="flex items-center justify-between gap-3 pt-2"
    >
      {page > 1 ? link(page - 1, "← Previous", "prev") : <span />}
      <span className="text-sm text-muted">
        Page {page} of {totalPages}
      </span>
      {page < totalPages ? link(page + 1, "Next →", "next") : <span />}
    </nav>
  );
}
