import type { SlugRedirectRepository } from "./slug-redirect.repository";
import type { SlugEntityType } from "@repo/shared";

import { describe, expect, it } from "vitest";

import { NotFoundException } from "@repo/http-kit";

import { PublicRedirectService } from "./public-redirect.service";

class FakeSlugRedirectRepository {
  findPublicTarget(type: SlugEntityType, oldSlug: string) {
    return Promise.resolve(type === "product" && oldSlug === "silk-old" ? "silk" : undefined);
  }
}

const service = new PublicRedirectService(
  new FakeSlugRedirectRepository() as unknown as SlugRedirectRepository,
);

describe("PublicRedirectService", () => {
  it("returns the current slug for an old one", async () => {
    expect(await service.resolve({ type: "product", slug: "silk-old" })).toEqual({
      type: "product",
      slug: "silk",
    });
  });

  it("throws not found when there is no public target", async () => {
    await expect(service.resolve({ type: "post", slug: "silk-old" })).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
