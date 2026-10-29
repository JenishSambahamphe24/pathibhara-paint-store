import { z } from "zod";

// URL state only; the API never sees it.
export const visualizerSearchSchema = z.object({
  colourSetId: z.uuid().optional(),
});
export type TVisualizerSearch = z.output<typeof visualizerSearchSchema>;
