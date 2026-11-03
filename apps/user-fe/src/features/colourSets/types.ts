import type { IShade } from "#/types/shade";

export interface IPublicColourSet {
  slug: string;
  name: string;
  description: string | null;
  // Keyed by the visualizer's paintable parts.
  shades: {
    main_surface: IShade;
    columns: IShade;
    doors_windows: IShade;
    roof_edge: IShade;
  };
  updatedAt: string;
}
