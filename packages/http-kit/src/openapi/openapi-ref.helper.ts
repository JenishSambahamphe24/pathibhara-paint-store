import type { ZodType } from "zod";

import { zodToOpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

export class OpenApiRefHelper {
  // Gives a schema a components/schemas name, like `schema.openapi(refId)`,
  // but on the instance itself and whenever it was created. zod v4 attaches
  // methods when a schema is built, so one defined in @repo/shared before
  // extendZodWithOpenApi ran has no `.openapi`. A recursive z.lazy needs this:
  // without a name the generator recurses until the stack overflows.
  static name(schema: ZodType, refId: string): void {
    const current = zodToOpenAPIRegistry.get(schema);
    zodToOpenAPIRegistry.add(schema, {
      ...current,
      _internal: { ...current?._internal, refId },
    });
  }
}
