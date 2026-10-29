import type { VisualizerComponent } from "@repo/shared";
import type { IShadeSummary } from "#/features/shades/types";

export type TComponentShades = Record<VisualizerComponent, IShadeSummary>;

export interface IColourSetListItem {
  id: string;
  slug: string;
  name: string;
  isActive: boolean;
  shades: TComponentShades;
  updatedAt: string;
}

export interface IColourSet {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  isActive: boolean;
  shades: TComponentShades;
  createdAt: string;
  updatedAt: string;
}
