import type { IBreadcrumbItem } from "./types";

import { Link } from "@tanstack/react-router";
import clsx from "clsx";

interface BreadcrumbItemProps {
  item: IBreadcrumbItem;
  isDisplayOnly?: boolean;
}

export function BreadcrumbItem(props: BreadcrumbItemProps) {
  const { item, isDisplayOnly } = props;

  if (item.url && !isDisplayOnly) {
    return (
      <Link to={item.url} className="shrink-0 text-sm hover:underline">
        {item.title}
      </Link>
    );
  }

  return (
    <p
      className={clsx("min-w-0 truncate text-sm", {
        "font-semibold": isDisplayOnly,
      })}
    >
      {item.title}
    </p>
  );
}
