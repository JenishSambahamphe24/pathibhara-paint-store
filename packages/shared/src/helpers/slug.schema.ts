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

// A slug read from a URL. No pattern check: a malformed slug should reach the
// lookup and come back 404 like any other unknown page, not 400.
export const slugParamSchema = z.string().trim().min(1).max(SLUG_MAX_LENGTH);
