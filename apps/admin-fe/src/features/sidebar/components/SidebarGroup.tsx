import type { ISidebarGroup } from "../types";

import { SidebarParentItem } from "./SidebarParentItem";

interface SidebarGroupProps {
  group: ISidebarGroup;
}

/**
 *
 */
export function SidebarGroup({ group }: SidebarGroupProps) {
  return (
    <div>
      {group.title && (
        <p className="text-sm text-primary-foreground-subtle">{group.title}</p>
      )}

      <div className="mt-1 flex flex-col text-sm">
        {group.items.map((item, index) => (
          <SidebarParentItem item={item} key={index} />
        ))}
      </div>
    </div>
  );
}
