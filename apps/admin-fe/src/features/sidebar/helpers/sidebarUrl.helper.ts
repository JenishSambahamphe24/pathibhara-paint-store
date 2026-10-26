import type { ISidebarGroup, TSidebarParentItem } from "../types";

export class SidebarUrlHelper {
  /**
   * The first page reachable under a sidebar section heading or collapsible
   * parent, matched by title. Breadcrumbs name these sections (`Financial`,
   * `Configuration`, `Eligibility`) but no route backs them, so a trail would
   * otherwise be unclickable except for its last segment.
   *
   * Expects groups straight from `useSidebarItems()`, which are already
   * permission-filtered — so "first" is always "first the admin can open", and
   * a section they can't reach at all resolves to undefined.
   */
  static resolveByTitle(
    groups: Array<ISidebarGroup>,
    title: string,
  ): string | undefined {
    for (const group of groups) {
      if (group.title === title) {
        const url = this.firstUrl(group.items);
        if (url) return url;
      }

      for (const item of group.items) {
        if (item.title !== title) continue;
        if (item.url) return item.url;
        const child = item.items?.[0];
        if (child) return child.url;
      }
    }
    return undefined;
  }

  private static firstUrl(
    items: Array<TSidebarParentItem>,
  ): string | undefined {
    for (const item of items) {
      if (item.url) return item.url;
      const child = item.items?.[0];
      if (child) return child.url;
    }
    return undefined;
  }
}
