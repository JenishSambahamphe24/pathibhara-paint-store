import type { ReactNode } from "react";

export interface ITabItem {
  value: string;
  label: ReactNode;
  to?: string;
}

export type TTabsParams = Record<string, string>;
