import type { ReactNode } from "react";

export interface ISidebarGroup {
  title?: string;
  items: Array<TSidebarParentItem>;
}

interface ISidebarBaseItem {
  title: string;
  icon: ReactNode;
}

export interface ISidebarLinkItem extends ISidebarBaseItem {
  url: string;
  items?: never;
}

export interface ISidebarParentWithItems extends ISidebarBaseItem {
  items: Array<ISidebarChildItem>;
  key: string;
  url?: never;
}

export type TSidebarParentItem = ISidebarLinkItem | ISidebarParentWithItems;

export interface ISidebarChildItem {
  title: string;
  url: string;
}
