import type { TSidebarParentItem } from "../types";

import { Link } from "@tanstack/react-router";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";

import { AnimatedCollapse } from "#/components/AnimatedCollapse/AnimatedCollapse";

import { useSidebarItems } from "../hooks/useSidebarItems";
import { SidebarChildItem } from "./SidebarChildItem";

interface SidebarParentItemProps {
  item: TSidebarParentItem;
}

/**
 *
 */
export function SidebarParentItem({ item }: SidebarParentItemProps) {
  const { openItems, toggleItem } = useSidebarItems();

  // Single item i.e. URL only
  if (item.url) {
    return (
      <Link
        to={item.url}
        className="flex h-8 items-center gap-2 text-primary-foreground-muted hover:text-primary-foreground"
      >
        {item.icon}
        <span>{item.title}</span>
      </Link>
    );
  }

  // Expandable items
  if (item.items) {
    const isOpen = openItems.includes(item.key);

    return (
      <div className="relative">
        <div
          className="flex h-8 cursor-pointer items-center justify-between text-primary-foreground-muted"
          onClick={() => toggleItem(item.key)}
        >
          <div className="flex items-center gap-2">
            {item.icon}
            <p>{item.title}</p>
          </div>

          <ChevronDown
            className={clsx("size-4 transition-all duration-300", {
              "rotate-180": isOpen,
            })}
          />
        </div>

        <AnimatedCollapse isOpen={isOpen}>
          <div className="ml-7">
            {item.items.map((child, index) => (
              <SidebarChildItem key={index} item={child} />
            ))}
          </div>
        </AnimatedCollapse>
      </div>
    );
  }

  return null;
}
