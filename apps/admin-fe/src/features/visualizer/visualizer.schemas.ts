import type { VisualizerComponent } from "@repo/shared";

import { z } from "zod";

const shadeIdSchema = z.uuid().optional();

// URL state only; the API never sees it. One shade id per part of the house,
// so a combination can be bookmarked or shared.
export const visualizerSearchSchema = z.object({
  main_surface: shadeIdSchema,
  columns: shadeIdSchema,
  doors_windows: shadeIdSchema,
  roof_edge: shadeIdSchema,
} satisfies Record<VisualizerComponent, typeof shadeIdSchema>);
export type TVisualizerSearch = z.output<typeof visualizerSearchSchema>;
