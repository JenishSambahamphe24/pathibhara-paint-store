import type { IPublicCategory } from "../types";

import { Link } from "@tanstack/react-router";
import { clsx } from "clsx";
import { ChevronRight } from "lucide-react";
import { useState } from "react";

import { CategoryTreeHelper } from "../helpers/categoryTree.helper";

interface CategorySidebarProps {
  categories: ReadonlyArray<IPublicCategory>;
  current: IPublicCategory | null;
}

// Desktop only. The current category's branch starts open; any other branch
// opens with its arrow without leaving the page.
export function CategorySidebar({ categories, current }: CategorySidebarProps) {
  const onPath = CategoryTreeHelper.pathSlugs(current);
  const [open, setOpen] = useState<Set<string>>(() => new Set(onPath));

  function toggle(slug: string) {
    setOpen((previous) => {
      const next = new Set(previous);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  return (
    <aside
      aria-label="Categories"
      className="hidden w-full max-w-[300px] shrink-0 rounded-card border border-line bg-surface p-2.5 lg:block"
    >
      <div className="mb-2 rounded-sign bg-sign-blue p-1">
        <div className="rounded-sign-inner border-2 border-sign-cream px-2.5 pt-1 pb-px font-display text-[26px] font-semibold text-sign-cream uppercase">
          Categories
        </div>
      </div>
      <Link
        to="/products"
        className={clsx(
          "flex min-h-10 items-center rounded-control px-2 text-[15px] font-bold",
          current ? "text-ink" : "bg-ink text-on-ink",
        )}
      >
        All products
      </Link>
      <ul className="m-0 mt-1 flex list-none flex-col gap-0.5 p-0">
        {categories
          .filter((category) => CategoryTreeHelper.isVisible(category, open))
          .map((category) => {
            const isCurrent = category.slug === current?.slug;
            const isOpen = open.has(category.slug);
            return (
              <li
                key={category.slug}
                className={clsx(
                  "flex items-center gap-1 rounded-control",
                  isCurrent
                    ? "bg-ink text-on-ink"
                    : onPath.has(category.slug) && "bg-surface-2",
                )}
                style={{ paddingLeft: category.depth * 16 }}
              >
                {category.childCount > 0 ? (
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-label={`Show or hide ${category.name} subcategories`}
                    onClick={() => toggle(category.slug)}
                    className="flex h-10 w-8 shrink-0 items-center justify-center"
                  >
                    <ChevronRight
                      size={16}
                      aria-hidden="true"
                      className={clsx(
                        "motion-safe:transition-transform",
                        isOpen && "rotate-90",
                      )}
                    />
                  </button>
                ) : (
                  <span className="w-8 shrink-0" />
                )}
                <Link
                  to="/categories/$slug"
                  params={{ slug: category.slug }}
                  aria-current={isCurrent ? "page" : undefined}
                  className={clsx(
                    "flex min-h-10 min-w-0 flex-1 items-center justify-between gap-2 px-2 text-[15px]",
                    isCurrent || onPath.has(category.slug)
                      ? "font-bold"
                      : "font-medium",
                  )}
                >
                  <span className="wrap-anywhere">{category.name}</span>
                  <span className="text-xs font-medium opacity-75">
                    {category.productCount}
                  </span>
                </Link>
              </li>
            );
          })}
      </ul>
    </aside>
  );
}
