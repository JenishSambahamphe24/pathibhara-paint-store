import { z } from "zod";

export class TextSchema {
  // Form inputs submit "" for an empty optional field; store that as null.
  static optional(max: number) {
    return z
      .string()
      .trim()
      .max(max, `Must be ${max} characters or fewer`)
      .nullable()
      .transform((value) => (value ? value : null));
  }

  static required(max: number, message = "This field is required") {
    return z.string().trim().min(1, message).max(max, `Must be ${max} characters or fewer`);
  }
}
