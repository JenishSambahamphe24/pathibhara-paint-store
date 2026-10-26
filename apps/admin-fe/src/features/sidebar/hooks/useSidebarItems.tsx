import type { ISidebarGroup } from "../types";

import {
  ArrowDownToLine,
  FolderTree,
  LayoutDashboard,
  Package,
  ReceiptText,
  ScrollText,
  SlidersHorizontal,
} from "lucide-react";
import { useState } from "react";

import { m } from "#/paraglide/messages";

export function useSidebarItems() {
  const [openItems, setOpenItems] = useState<Array<string>>([]);

  function toggleItem(key: string) {
    setOpenItems((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }

  const items = [
    {
      items: [
        {
          title: m.sidebar_dashboard(),
          icon: <LayoutDashboard size={20} />,
          url: "/dashboard",
        },
      ],
    },
    {
      title: m.sidebar_catalogue(),
      items: [
        {
          title: m.sidebar_categories(),
          icon: <FolderTree size={20} />,
          url: "/categories",
        },
        {
          title: m.sidebar_products(),
          icon: <Package size={20} />,
          url: "/products",
        },
      ],
    },
    {
      title: m.sidebar_stock(),
      items: [
        {
          title: m.sidebar_daily_sales(),
          icon: <ReceiptText size={20} />,
          url: "/stock/sales",
        },
        {
          title: m.sidebar_batches(),
          icon: <ArrowDownToLine size={20} />,
          url: "/stock/batches",
        },
        {
          title: m.sidebar_adjustments(),
          icon: <SlidersHorizontal size={20} />,
          url: "/stock/adjustments",
        },
        {
          title: m.sidebar_movements(),
          icon: <ScrollText size={20} />,
          url: "/stock/movements",
        },
      ],
    },
  ] satisfies Array<ISidebarGroup>;

  return { items, openItems, toggleItem };
}
