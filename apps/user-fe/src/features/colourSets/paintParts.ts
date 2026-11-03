import type { VisualizerComponent } from "@repo/shared";

export const PAINT_PART_LABELS: Record<VisualizerComponent, string> = {
  main_surface: "Walls",
  columns: "Columns",
  doors_windows: "Doors & windows",
  roof_edge: "Roof edge",
};

// What the house shows when the store has no colour sets yet.
export const UNPAINTED_HOUSE: Record<VisualizerComponent, string> = {
  main_surface: "#f1ecdf",
  columns: "#d8d0bf",
  doors_windows: "#6b4630",
  roof_edge: "#f1ecdf",
};
