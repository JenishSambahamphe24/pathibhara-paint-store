import type { ShadeRepository } from "../shade/shade.repository";
import type { ColourSetRepository } from "./colour-set.repository";

import { describe, expect, it } from "vitest";

import { publicColourSetListQuerySchema } from "@repo/shared";

import { PublicColourSetService } from "./public-colour-set.service";

const SHADE_ID = "0190a000-0000-7000-8000-000000000001";

class FakeShadeRepository {
  findActiveByCode(code: string) {
    return Promise.resolve(code === "SM-1" ? { id: SHADE_ID } : undefined);
  }

  findSummaries() {
    return Promise.resolve([]);
  }
}

class FakeColourSetRepository {
  listQuery: unknown;

  list(query: unknown) {
    this.listQuery = query;
    return Promise.resolve({ rows: [], total: 0 });
  }
}

function service(sets: FakeColourSetRepository) {
  return new PublicColourSetService(
    sets as unknown as ColourSetRepository,
    new FakeShadeRepository() as unknown as ShadeRepository,
  );
}

describe("PublicColourSetService", () => {
  it("filters active sets by the shade's id", async () => {
    const sets = new FakeColourSetRepository();
    await service(sets).list(publicColourSetListQuerySchema.parse({ shade: "sm-1" }));
    expect(sets.listQuery).toMatchObject({ status: "active", shadeId: SHADE_ID });
    expect(sets.listQuery).not.toHaveProperty("shade");
  });

  it("returns an empty page for an unknown or inactive shade without listing", async () => {
    const sets = new FakeColourSetRepository();
    const result = await service(sets).list(
      publicColourSetListQuerySchema.parse({ shade: "SM-9" }),
    );
    expect(result.items).toEqual([]);
    expect(result.pagination.total).toBe(0);
    expect(sets.listQuery).toBeUndefined();
  });
});
