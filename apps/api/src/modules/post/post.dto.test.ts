import { describe, expect, test } from "vitest";

import { OpenApiGeneratorService, OpenApiRegistryService } from "@repo/http-kit";

import { PostInputDto } from "./post.dto";

describe("PostInputDto in OpenAPI", () => {
  // The recursive TipTap node once overflowed the stack and took /openapi.json down.
  test("generates, with the content node as a self-referencing schema", () => {
    const registry = new OpenApiRegistryService();
    registry.registerRoute({
      method: "post",
      path: "/admin/posts",
      tags: ["Blog"],
      validation: { body: PostInputDto.schema },
      responses: {},
    });

    const spec = new OpenApiGeneratorService(registry).generate({
      title: "test",
      version: "0",
    });

    expect(spec.components?.schemas?.PostContentNode).toMatchObject({
      properties: {
        content: {
          type: "array",
          items: { $ref: "#/components/schemas/PostContentNode" },
        },
      },
    });
  });
});
