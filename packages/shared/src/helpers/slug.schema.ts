import { z } from "zod";

import { SlugHelper } from "./slug.helper";

export const SLUG_MAX_LENGTH = 120;

// "" means "derive it from the English name".
export const slugInputSchema = z
  .string()
  .trim()
  .max(SLUG_MAX_LENGTH)
  .refine((value) => value === "" || SlugHelper.PATTERN.test(value), {
    message: "Use lowercase letters, numbers and hyphens only",
  });
