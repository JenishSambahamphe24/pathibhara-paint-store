import type { VisualizerComponent } from "@repo/shared";

// The shade code picked for each part; null keeps the house's own colour.
export type TLook = Record<VisualizerComponent, string | null>;

export type TLookSearchKey = "w" | "c" | "d" | "r";

// A look as URL search params, so a shared link reopens it.
export type TLookSearch = Partial<Record<TLookSearchKey, string>>;
