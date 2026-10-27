import { z } from "zod";

import { nameTranslationsSchema } from "../i18n/translation.schemas";
import {
  ACTIVE_FILTERS,
  ListQuerySchema,
  paginationQueryShape,
  searchQueryShape,
} from "../list/list-query.schemas";
import { HEX_COLOUR_PATTERN } from "./constants";

export const SHADE_CODE_MAX_LENGTH = 32;

// Colour pickers hand back "#7C3AED"; the database stores lowercase.
export const hexColourSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(HEX_COLOUR_PATTERN, "Pick a colour");

export const shadeInputSchema = z.object({
  // Codes from a shade card are case-insensitive, so "smp-1001" and
  // "SMP-1001" are the same shade.
  code: z
    .string()
    .trim()
    .toUpperCase()
    .min(1, "Code is required")
    .max(SHADE_CODE_MAX_LENGTH),
  hex: hexColourSchema,
  productId: z.uuid().nullable(),
  isActive: z.boolean(),
  translations: nameTranslationsSchema,
});
export type ShadeInput = z.input<typeof shadeInputSchema>;

export const SHADE_SORT_KEYS = ["code", "name", "updatedAt"] as const;

export const shadeListQuerySchema = z.object({
  ...paginationQueryShape,
  ...searchQueryShape,
  ...ListQuerySchema.sort(SHADE_SORT_KEYS, "code", "asc"),
  status: ListQuerySchema.optionalEnum(ACTIVE_FILTERS),
});
export type ShadeListQuery = z.output<typeof shadeListQuerySchema>;
