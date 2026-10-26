import type { ISidebarChildItem } from "../types";

import { Link } from "@tanstack/react-router";

interface SidebarChildItemProps {
  item: ISidebarChildItem;
}

/**
 *
 */
export function SidebarChildItem({ item }: SidebarChildItemProps) {
  return (
    <div className="flex h-8 w-full items-center">
      <Link to={item.url} className="flex h-full w-full items-center">
        {item.title}
      </Link>
    </div>
  );
}
