import type { ITabItem } from "./types";

import { Tabs } from "@ark-ui/react";
import clsx from "clsx";

interface TabsTriggerListProps {
  items: Array<ITabItem>;
}

export function TabsTriggerList({ items }: TabsTriggerListProps) {
  return (
    <Tabs.List className="flex gap-1 overflow-x-auto border-b border-border">
      {items.map((tab) => (
        <Tabs.Trigger
          key={tab.value}
          value={tab.value}
          className={clsx(
            "shrink-0 cursor-pointer border-b-2 border-transparent px-3 py-2 text-sm font-medium text-foreground-subtle transition-colors sm:px-4",
            "hover:text-foreground-muted",
            "data-selected:border-foreground data-selected:text-foreground",
          )}
        >
          {tab.label}
        </Tabs.Trigger>
      ))}
    </Tabs.List>
  );
}
