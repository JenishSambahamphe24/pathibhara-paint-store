import type { ITabItem, TTabsParams } from "./types";
import type { ReactNode } from "react";

import { RoutedTabs } from "./RoutedTabs";
import { StatefulTabs } from "./StatefulTabs";

interface TabsProps {
  items: Array<ITabItem>;
  params?: TTabsParams;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  contentClassName?: string;
  children?: ReactNode;
}

export function Tabs({
  items,
  params,
  defaultValue,
  value,
  onValueChange,
  className,
  contentClassName,
  children,
}: TabsProps) {
  const isRouted = items.length > 0 && items.every((item) => !!item.to);

  if (isRouted) {
    return (
      <RoutedTabs
        items={items}
        params={params}
        className={className}
        contentClassName={contentClassName}
      >
        {children}
      </RoutedTabs>
    );
  }

  return (
    <StatefulTabs
      items={items}
      defaultValue={defaultValue}
      value={value}
      onValueChange={onValueChange}
      className={className}
    >
      {children}
    </StatefulTabs>
  );
}
