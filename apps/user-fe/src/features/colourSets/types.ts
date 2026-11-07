import type { VisualizerComponent } from "@repo/shared";
import type { IShade } from "#/types/shade";

export interface IPublicColourSet {
  slug: string;
  name: string;
  description: string | null;
  shades: Record<VisualizerComponent, IShade>;
  updatedAt: string;
}
