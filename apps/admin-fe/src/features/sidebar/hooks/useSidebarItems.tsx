import type { ISidebarGroup } from "../types";

import {
  ArrowDownToLine,
  Calculator,
  FolderTree,
  House,
  LayoutDashboard,
  Newspaper,
  Package,
  Palette,
  ReceiptText,
  ScrollText,
  SlidersHorizontal,
  SwatchBook,
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
        {
          title: m.sidebar_calculator(),
          icon: <Calculator size={20} />,
          url: "/calculator",
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
      title: m.sidebar_colours(),
      items: [
        {
          title: m.sidebar_shades(),
          icon: <Palette size={20} />,
          url: "/shades",
        },
        {
          title: m.sidebar_colour_sets(),
          icon: <SwatchBook size={20} />,
          url: "/colour-sets",
        },
        {
          title: m.sidebar_visualizer(),
          icon: <House size={20} />,
          url: "/visualizer",
        },
      ],
    },
    {
      title: m.sidebar_content(),
      items: [
        {
          title: m.sidebar_blog(),
          icon: <Newspaper size={20} />,
          url: "/blog",
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
