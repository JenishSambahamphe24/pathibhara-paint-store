import type { IBreadcrumbItem } from "./types";

import { Link } from "@tanstack/react-router";
import { LucideHome } from "lucide-react";
import { Fragment } from "react/jsx-runtime";

import { SidebarUrlHelper } from "#/features/sidebar/helpers/sidebarUrl.helper";
import { useSidebarItems } from "#/features/sidebar/hooks/useSidebarItems";

import { BreadcrumbItem } from "./BreadcrumbItem";
import { BreadcrumbSeparator } from "./BreadcrumbSeparator";

interface BreadcrumbProps {
  items: Array<IBreadcrumbItem>;
}

export function BreadCrumb({ items }: BreadcrumbProps) {
  // Section crumbs carry no `url` because sidebar headings aren't routes.
  // Resolve them against the sidebar so the whole trail is navigable, rather
  // than making every page spell out a destination it doesn't own.
  const { items: sidebarGroups } = useSidebarItems();

  function withResolvedUrl(item: IBreadcrumbItem): IBreadcrumbItem {
    if (item.url) return item;
    const url = SidebarUrlHelper.resolveByTitle(sidebarGroups, item.title);
    return url ? { ...item, url } : item;
  }

  return (
    <div className="-mx-2 -mt-2 mb-4 flex min-w-0 items-center gap-1 overflow-hidden border-b border-border bg-surface-muted/70 px-2 py-2.5 md:-mx-5 md:-mt-5 md:px-5">
      <Link to="/dashboard" className="shrink-0">
        <LucideHome size={20} />
      </Link>

      <BreadcrumbSeparator />

      {items.map((item, index) => (
        <Fragment key={index}>
          <BreadcrumbItem
            key={index}
            item={withResolvedUrl(item)}
            isDisplayOnly={index === items.length - 1}
          />
          {index < items.length - 1 && <BreadcrumbSeparator />}
        </Fragment>
      ))}
    </div>
  );
}
