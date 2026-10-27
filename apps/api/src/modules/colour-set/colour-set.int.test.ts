import type { IStockFixture } from "../../test-support/integration-context";
import type { ColourSetInput, ShadeInput } from "@repo/shared";

import { sql } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { ConflictException, ValidationException } from "@repo/http-kit";
import {
  colourSetInputSchema,
  colourSetListQuerySchema,
  shadeInputSchema,
  shadeListQuerySchema,
} from "@repo/shared";

import { IntegrationContext } from "../../test-support/integration-context";

const ctx = new IntegrationContext();
let f: IStockFixture;

async function shade(code: string, name: string, overrides: Partial<ShadeInput> = {}) {
  return ctx.shades.create(
    shadeInputSchema.parse({
      code,
      hex: "#AABBCC",
      productId: null,
      isActive: true,
      translations: { en: { name }, ne: { name: "" } },
      ...overrides,
    }),
  );
}

function setInput(
  name: string,
  shadeIds: [string, string, string, string],
  overrides: Partial<ColourSetInput> = {},
) {
  const [main_surface, columns, doors_windows, roof_edge] = shadeIds;
  return colourSetInputSchema.parse({
    slug: "",
    isActive: true,
    translations: { en: { name, description: "" }, ne: { name: "", description: "" } },
    shades: { main_surface, columns, doors_windows, roof_edge },
    ...overrides,
  });
}

describe.skipIf(!IntegrationContext.isConfigured())("shades and colour sets (Postgres)", () => {
  beforeAll(async () => {
    await ctx.connect();
  });

  afterAll(async () => {
    await ctx.disconnect();
  });

  beforeEach(async () => {
    await ctx.reset();
    f = await ctx.seedStockFixture();
  });

  it("stores normalised codes and colours, and refuses a duplicate code", async () => {
    const ivory = await shade("smp-1", "Ivory", { productId: f.productId });
    expect(ivory).toMatchObject({ code: "SMP-1", hex: "#aabbcc", productName: "Paint" });

    await expect(shade("SMP-1", "Other")).rejects.toMatchObject({
      statusCode: 422,
      errors: { code: "shade.codeTaken" },
    });
  });

  it("lists shades with how many sets use each", async () => {
    const a = await shade("A", "Alpha");
    const b = await shade("B", "Beta");
    await ctx.colourSets.create(setInput("Set", [a.id, a.id, a.id, b.id]));

    const { items } = await ctx.shades.list(shadeListQuerySchema.parse({ search: "alp" }));
    expect(items).toMatchObject([{ code: "A", colourSetCount: 1 }]);
    const all = await ctx.shades.list(shadeListQuerySchema.parse({}));
    expect(all.items.map((s) => [s.code, s.colourSetCount])).toEqual([
      ["A", 1],
      ["B", 1],
    ]);
  });

  it("creates a set with a derived slug and returns all four shades", async () => {
    const a = await shade("A", "Alpha");
    const b = await shade("B", "Beta");
    const set = await ctx.colourSets.create(setInput("Warm Cream", [a.id, b.id, a.id, b.id]));

    expect(set.slug).toBe("warm-cream");
    expect(set.shades.columns).toMatchObject({ code: "B", name: "Beta", hex: "#aabbcc" });
    expect(set.shades.roof_edge.id).toBe(b.id);
  });

  it("names each component whose shade is missing or inactive", async () => {
    const a = await shade("A", "Alpha");
    const retired = await shade("R", "Retired", { isActive: false });
    const missing = "0190a0b4-6c3e-7d2a-8f00-000000000099";

    await expect(
      ctx.colourSets.create(setInput("Bad", [a.id, retired.id, a.id, missing])),
    ).rejects.toMatchObject({
      errors: {
        "shades.columns": "colourSet.shadeInactive",
        "shades.roof_edge": "colourSet.shadeNotFound",
      },
    });

    // An inactive set may keep a retired shade.
    const draft = await ctx.colourSets.create(
      setInput("Draft", [a.id, retired.id, a.id, a.id], { isActive: false }),
    );
    expect(draft.shades.columns.isActive).toBe(false);
  });

  it("won't retire or delete a shade an active set still uses", async () => {
    const a = await shade("A", "Alpha");
    const b = await shade("B", "Beta");
    const set = await ctx.colourSets.create(setInput("Live Set", [a.id, a.id, a.id, b.id]));
    const retire = shadeInputSchema.parse({
      code: "B",
      hex: b.hex,
      productId: null,
      isActive: false,
      translations: { en: { name: "Beta" }, ne: { name: "" } },
    });

    await expect(ctx.shades.update(b.id, retire)).rejects.toMatchObject({
      statusCode: 409,
      params: { names: "Live Set" },
    });
    await expect(ctx.shades.delete(b.id)).rejects.toBeInstanceOf(ConflictException);

    // Once the set is inactive the shade can retire, but still not be deleted.
    await ctx.colourSets.update(
      set.id,
      setInput("Live Set", [a.id, a.id, a.id, b.id], { isActive: false }),
    );
    expect((await ctx.shades.update(b.id, retire)).isActive).toBe(false);
    await expect(ctx.shades.delete(b.id)).rejects.toMatchObject({ params: { count: 1 } });

    const unused = await shade("U", "Unused");
    await ctx.shades.delete(unused.id);
    await expect(ctx.shades.get(unused.id)).rejects.toMatchObject({ statusCode: 404 });
  });

  it("records a redirect when the slug changes and filters sets by shade", async () => {
    const a = await shade("A", "Alpha");
    const b = await shade("B", "Beta");
    const set = await ctx.colourSets.create(setInput("Old Name", [a.id, a.id, a.id, a.id]));
    await ctx.colourSets.create(setInput("Other", [b.id, b.id, b.id, b.id]));

    const renamed = await ctx.colourSets.update(
      set.id,
      setInput("New Name", [a.id, a.id, a.id, a.id], { slug: "new-name" }),
    );
    expect(renamed.slug).toBe("new-name");
    const redirects = await ctx.db.execute(
      sql`SELECT entity_type, old_slug FROM slug_redirects WHERE entity_id = ${set.id}`,
    );
    expect(redirects.rows).toEqual([{ entity_type: "colourSet", old_slug: "old-name" }]);

    const { items } = await ctx.colourSets.list(colourSetListQuerySchema.parse({ shadeId: b.id }));
    expect(items.map((s) => s.name)).toEqual(["Other"]);
    await expect(
      ctx.colourSets.create(setInput("Clash", [a.id, a.id, a.id, a.id], { slug: "new-name" })),
    ).rejects.toBeInstanceOf(ValidationException);
  });
});
