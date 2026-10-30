import type { IStockFixture } from "../../test-support/integration-context";

import { sql } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { IntegrationContext } from "../../test-support/integration-context";

const ctx = new IntegrationContext();
let f: IStockFixture;

// 06:00 UTC is midday in Kathmandu, so the store day is unambiguous.
const NOW = new Date("2026-10-21T06:00:00Z");

async function sell(date: string, lines: Array<{ variantId: string; quantity: number }>) {
  await ctx.sales.save(date, { notes: null, items: lines }, f.adminId);
}

describe.skipIf(!IntegrationContext.isConfigured())("dashboard analytics (Postgres)", () => {
  beforeAll(async () => {
    await ctx.connect();
  });

  afterAll(async () => {
    await ctx.disconnect();
  });

  beforeEach(async () => {
    await ctx.reset();
    f = await ctx.seedStockFixture();
    await ctx.batches.create(
      {
        receivedOn: "2026-10-01",
        supplierName: null,
        notes: null,
        items: [
          { variantId: f.litre, quantity: 50, unitCostPaisa: null },
          { variantId: f.fourLitre, quantity: 10, unitCostPaisa: null },
        ],
      },
      f.adminId,
    );
  });

  it("totals the period, the period before it and today, in store days", async () => {
    await sell("2026-10-14", [{ variantId: f.litre, quantity: 4 }]); // previous 7 days
    await sell("2026-10-15", [{ variantId: f.litre, quantity: 1 }]); // first day of the period
    await sell("2026-10-21", [
      { variantId: f.litre, quantity: 2 },
      { variantId: f.fourLitre, quantity: 1 },
    ]);

    const result = await ctx.dashboard.get({ range: "7d" }, NOW);

    expect(result).toMatchObject({ today: "2026-10-21", from: "2026-10-15", to: "2026-10-21" });
    expect(result.sales).toEqual({
      revenuePaisa: 3 * 45000 + 165000,
      units: 4,
      previousRevenuePaisa: 4 * 45000,
      previousUnits: 4,
      todayRevenuePaisa: 2 * 45000 + 165000,
      todayUnits: 3,
      todayRecorded: true,
    });
  });

  it("returns every day of the period, with zeros for days without sales", async () => {
    await sell("2026-10-17", [{ variantId: f.litre, quantity: 3 }]);

    const { salesByDay } = await ctx.dashboard.get({ range: "7d" }, NOW);

    expect(salesByDay).toHaveLength(7);
    expect(salesByDay[0]).toEqual({ date: "2026-10-15", revenuePaisa: 0, units: 0 });
    expect(salesByDay[2]).toEqual({ date: "2026-10-17", revenuePaisa: 135000, units: 3 });
  });

  it("ranks top sellers by revenue at the price they were sold for", async () => {
    await sell("2026-10-20", [
      { variantId: f.litre, quantity: 3 },
      { variantId: f.fourLitre, quantity: 1 },
    ]);
    await ctx.db.execute(
      sql`UPDATE product_variants SET price_paisa = 1 WHERE id = ${f.fourLitre}`,
    );

    const { topSellers } = await ctx.dashboard.get({ range: "7d" }, NOW);

    expect(topSellers.map((row) => [row.volumeMl, row.units, row.revenuePaisa])).toEqual([
      [4000, 1, 165000],
      [1000, 3, 135000],
    ]);
  });

  it("lists low stock and slow movers among sellable sizes only", async () => {
    await ctx.db.execute(
      sql`UPDATE product_variants SET reorder_level = 10 WHERE id = ${f.fourLitre}`,
    );
    await sell("2026-10-10", [{ variantId: f.fourLitre, quantity: 2 }]); // before the 7-day period

    const result = await ctx.dashboard.get({ range: "7d" }, NOW);

    expect(result.stock).toEqual({
      lowStockCount: 1,
      outOfStockCount: 0,
      valuePaisa: 50 * 45000 + 8 * 165000,
    });
    expect(result.lowStock.map((row) => [row.volumeMl, row.currentStock])).toEqual([[4000, 8]]);
    expect(result.slowMovers.map((row) => [row.volumeMl, row.lastSoldOn])).toEqual([
      [1000, null],
      [4000, "2026-10-10"],
    ]);
    expect(result.sales.todayRecorded).toBe(false);

    await ctx.db.execute(sql`UPDATE products SET is_active = false WHERE id = ${f.productId}`);
    const retired = await ctx.dashboard.get({ range: "7d" }, NOW);
    expect(retired.stock.lowStockCount).toBe(0);
    expect(retired.lowStock).toEqual([]);
    expect(retired.slowMovers).toEqual([]);
  });
});
