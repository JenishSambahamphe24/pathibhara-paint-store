import type { VisualizerComponent } from "@repo/shared";
import type { IShadeSummary } from "#/features/shades/types";

export type TComponentShades = Record<VisualizerComponent, IShadeSummary>;

export interface IColourSetListItem {
  id: string;
  slug: string;
  name: string;
  hasNepali: boolean;
  isActive: boolean;
  shades: TComponentShades;
  updatedAt: string;
}

export interface IColourSetTranslation {
  name: string;
  description: string | null;
}

export interface IColourSet {
  id: string;
  slug: string;
  isActive: boolean;
  translations: {
    en: IColourSetTranslation;
    ne: IColourSetTranslation | null;
  };
  shades: TComponentShades;
  createdAt: string;
  updatedAt: string;
}
