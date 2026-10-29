import { z } from "zod";

import { slugInputSchema } from "../helpers/slug.schema";
import { contentDescriptionSchema, contentNameSchema } from "../content/content.schemas";
import {
  ACTIVE_FILTERS,
  ListQuerySchema,
  paginationQueryShape,
  searchQueryShape,
} from "../list/list-query.schemas";
import type { VisualizerComponent } from "./constants";

const shadeIdSchema = z.uuid("Pick a shade");

// Keyed by the visualizer's material names, so the 3D house can paint each
// component straight from this object.
export const colourSetShadesSchema = z.object({
  main_surface: shadeIdSchema,
  columns: shadeIdSchema,
  doors_windows: shadeIdSchema,
  roof_edge: shadeIdSchema,
} satisfies Record<VisualizerComponent, typeof shadeIdSchema>);

export const colourSetInputSchema = z.object({
  slug: slugInputSchema,
  isActive: z.boolean(),
  name: contentNameSchema,
  description: contentDescriptionSchema,
  shades: colourSetShadesSchema,
});
export type ColourSetInput = z.input<typeof colourSetInputSchema>;

export const COLOUR_SET_SORT_KEYS = ["name", "updatedAt"] as const;

export const colourSetListQuerySchema = z.object({
  ...paginationQueryShape,
  ...searchQueryShape,
  ...ListQuerySchema.sort(COLOUR_SET_SORT_KEYS, "updatedAt"),
  status: ListQuerySchema.optionalEnum(ACTIVE_FILTERS),
  // "Which sets use this shade", linked from the shade list.
  shadeId: ListQuerySchema.optionalUuid(),
});
export type ColourSetListQuery = z.output<typeof colourSetListQuerySchema>;
