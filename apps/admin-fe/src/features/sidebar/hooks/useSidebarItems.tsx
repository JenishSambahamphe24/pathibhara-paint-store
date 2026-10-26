import type { ISidebarGroup } from "../types";

import { LayoutDashboard } from "lucide-react";
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
  ] satisfies Array<ISidebarGroup>;

  return { items, openItems, toggleItem };
}
