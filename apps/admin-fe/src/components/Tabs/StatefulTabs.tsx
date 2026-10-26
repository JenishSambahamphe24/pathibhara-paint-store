import type { ITabItem } from "./types";
import type { ReactNode } from "react";

import { Tabs as ArkTabs } from "@ark-ui/react";
import clsx from "clsx";

import { TabsTriggerList } from "./TabsTriggerList";

interface StatefulTabsProps {
  items: Array<ITabItem>;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children?: ReactNode;
  className?: string;
}

export function StatefulTabs({
  items,
  defaultValue,
  value,
  onValueChange,
  children,
  className,
}: StatefulTabsProps) {
  return (
    <ArkTabs.Root
      defaultValue={defaultValue ?? items[0]?.value}
      value={value}
      onValueChange={({ value: next }) => onValueChange?.(next)}
      lazyMount
      unmountOnExit
      className={clsx(className)}
    >
      <TabsTriggerList items={items} />
      {children}
    </ArkTabs.Root>
  );
}
