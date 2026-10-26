// Also the material names in the 3D house (code-built and Blender .glb), so
// they must stay snake_case and stable.
export const VISUALIZER_COMPONENTS = [
  "main_surface",
  "columns",
  "doors_windows",
  "roof_edge",
] as const;
export type VisualizerComponent = (typeof VISUALIZER_COMPONENTS)[number];

export const HEX_COLOUR_PATTERN = /^#[0-9a-f]{6}$/;
