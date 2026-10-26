import { Link } from "@tanstack/react-router";
import clsx from "clsx";

import { Logo } from "#/components/Logo/Logo";

import { m } from "#/paraglide/messages";

import { useSidebarItems } from "../hooks/useSidebarItems";
import { SidebarGroup } from "./SidebarGroup";

export function Sidebar() {
  const { items } = useSidebarItems();

  return (
    <div className="flex h-screen w-64 flex-col overflow-hidden border-r border-r-primary-foreground/20 bg-primary text-primary-foreground">
      <div className="flex h-18 w-full shrink-0 items-center justify-center border-b border-b-primary-foreground/20">
        <Link
          to="/"
          aria-label={m.sidebar_home()}
          className="flex items-center"
        >
          <Logo />
        </Link>
      </div>

      <div className="scrollbar-slim grow overflow-y-auto select-none">
        <div className="px-4 py-2">
          {items.map((itemGroup, index) => (
            <div key={index} className={clsx({ "mt-5": index !== 0 })}>
              <SidebarGroup group={itemGroup} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
