import type { z } from "zod";

export class SearchParamsHelper {
  // URL search params come from bookmarks and hand edits. Instead of failing
  // the page on one bad value, drop each invalid key and let its default apply.
  static parse<TSchema extends z.ZodObject>(
    schema: TSchema,
    raw: Record<string, unknown>,
  ): z.output<TSchema> {
    const input = { ...raw };
    for (let attempt = 0; attempt < 10; attempt++) {
      const result = schema.safeParse(input);
      if (result.success) return result.data;
      for (const issue of result.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string") delete input[key];
      }
    }
    return schema.parse({});
  }
}
