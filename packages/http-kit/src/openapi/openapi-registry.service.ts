import type { HttpMethod, ValidationMetadata } from "../metadata/metadata-types";
import type { ZodType } from "zod";

import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { singleton } from "tsyringe";

import { z } from "../zod/zod-extended";

export interface RouteRegistration {
  method: HttpMethod;
  path: string;
  summary?: string;
  description?: string;
  tags: string[];
  validation?: ValidationMetadata;
  responses: Record<number, { description: string; schema?: ZodType; paginated?: boolean }>;
}

@singleton()
export class OpenApiRegistryService {
  readonly registry = new OpenAPIRegistry();

  registerRoute(route: RouteRegistration): void {
    const openApiResponses: Record<
      string,
      { description: string; content?: Record<string, { schema: ZodType }> }
    > = {};

    for (const [code, resp] of Object.entries(route.responses)) {
      const statusCode = Number(code);

      if (statusCode === 204) {
        openApiResponses[code] = { description: resp.description };
        continue;
      }

      const schema = OpenApiRegistryService.wrapSchema(statusCode, resp.schema, resp.paginated);
      openApiResponses[code] = {
        description: resp.description,
        content: { "application/json": { schema } },
      };
    }

    this.registry.registerPath({
      method: route.method,
      // Express routes use `:param`; OpenAPI path templating requires `{param}`.
      // Convert here so the spec is conformant and Scalar/clients substitute
      // path params correctly (the Express router still uses the `:param` form).
      path: route.path.replace(/:([A-Za-z0-9_]+)/g, "{$1}"),
      summary: route.summary,
      description: route.description,
      tags: route.tags,
      request: route.validation
        ? ({
            ...(route.validation.body && {
              body: {
                content: {
                  "application/json": { schema: route.validation.body },
                },
              },
            }),
            ...(route.validation.query && {
              query: route.validation.query,
            }),
            ...(route.validation.params && {
              params: route.validation.params,
            }),
            ...(route.validation.headers && {
              headers: route.validation.headers,
            }),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any)
        : undefined,
      responses: openApiResponses,
    });
  }

  private static wrapSchema(
    statusCode: number,
    innerSchema?: ZodType,
    paginated?: boolean,
  ): ZodType {
    if (statusCode >= 200 && statusCode < 300 && innerSchema) {
      if (paginated) {
        return z.object({
          message: z.string(),
          data: z.array(innerSchema),
          pagination: z.object({
            page: z.number().int(),
            perPage: z.number().int(),
            total: z.number().int(),
            totalPages: z.number().int(),
          }),
        });
      }

      return z.object({
        message: z.string(),
        data: innerSchema,
      });
    }

    if (statusCode === 422) {
      return z.object({
        message: z.string(),
        errors: z.record(z.string(), z.string()),
      });
    }

    return z.object({
      message: z.string(),
    });
  }
}
