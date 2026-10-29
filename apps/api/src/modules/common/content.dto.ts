import { z } from "@repo/http-kit";

// The text a catalogue page shows and its search metadata.
export const contentResponseShape = {
  name: z.string(),
  description: z.string().nullable(),
  seoTitle: z.string().nullable(),
  seoDescription: z.string().nullable(),
};
