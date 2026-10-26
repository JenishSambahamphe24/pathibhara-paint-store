import type { ITabItem, TTabsParams } from "./types";
import type { ReactNode } from "react";

import { Tabs as ArkTabs } from "@ark-ui/react";
import { Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import clsx from "clsx";

import { TabsTriggerList } from "./TabsTriggerList";

interface RoutedTabsProps {
  items: Array<ITabItem>;
  params?: TTabsParams;
  className?: string;
  contentClassName?: string;
  children?: ReactNode;
}

function resolvePath(to: string, params?: TTabsParams): string {
  if (!params) return to;
  return to.replace(/\$(\w+)/g, (_, key: string) => params[key] ?? `$${key}`);
}

export function RoutedTabs({
  items,
  params,
  className,
  contentClassName,
  children,
}: RoutedTabsProps) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const activeValue =
    items.find((item) => {
      if (!item.to) return false;
      const resolved = resolvePath(item.to, params);
      return pathname === resolved || pathname.startsWith(`${resolved}/`);
    })?.value ?? items[0]?.value;

  function handleValueChange(value: string) {
    const item = items.find((tab) => tab.value === value);
    if (!item?.to) return;
    void navigate({ to: item.to, params });
  }

  return (
    <ArkTabs.Root
      value={activeValue}
      onValueChange={({ value }) => handleValueChange(value)}
      className={clsx(className)}
    >
      <TabsTriggerList items={items} />
      <div className={clsx(contentClassName)}>{children ?? <Outlet />}</div>
    </ArkTabs.Root>
  );
}
