import type { SortingState } from "@tanstack/react-table";

export class SortingHelper {
  static toState(sortBy: string, sortOrder: "asc" | "desc"): SortingState {
    return [{ id: sortBy, desc: sortOrder === "desc" }];
  }

  // TanStack cycles asc -> desc -> none; "none" falls back to the default
  // order rather than an unsorted list the API can't express.
  static fromState<TKey extends string>(
    state: SortingState,
    defaults: { sortBy: TKey; sortOrder: "asc" | "desc" },
  ): { sortBy: TKey; sortOrder: "asc" | "desc" } {
    if (state.length === 0) return defaults;
    const [first] = state;
    return { sortBy: first.id as TKey, sortOrder: first.desc ? "desc" : "asc" };
  }
}
