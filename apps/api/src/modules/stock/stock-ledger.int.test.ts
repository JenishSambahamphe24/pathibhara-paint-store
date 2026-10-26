import type { IStockFixture } from "../../test-support/integration-context";

import { sql } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { ConflictException } from "@repo/http-kit";

import { IntegrationContext } from "../../test-support/integration-context";

const ctx = new IntegrationContext();
let f: IStockFixture;

function batchInput(
  lines: Array<{ variantId: string; quantity: number }>,
  receivedOn = "2026-10-20",
) {
  return {
    receivedOn,
    supplierName: null,
    notes: null,
    items: lines.map((line) => ({ ...line, unitCostPaisa: null })),
  };
}

describe.skipIf(!IntegrationContext.isConfigured())("stock ledger (Postgres)", () => {
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

  it("records a batch as positive movements with running balances", async () => {
    await ctx.batches.create(batchInput([{ variantId: f.litre, quantity: 20 }]), f.adminId);
    await ctx.batches.create(batchInput([{ variantId: f.litre, quantity: 5 }]), f.adminId);

    expect(await ctx.stockOf(f.litre)).toBe(25);
    expect(await ctx.movementTypes(f.litre)).toEqual([
      { type: "batchIn", delta: 20, balance: 20 },
      { type: "batchIn", delta: 5, balance: 25 },
    ]);
    expect(await ctx.ledgerMismatches()).toBe(0);
  });

  it("refuses a sale that would make stock negative and writes nothing", async () => {
    await ctx.batches.create(batchInput([{ variantId: f.litre, quantity: 3 }]), f.adminId);

    await expect(
      ctx.sales.save(
        "2026-10-21",
        { notes: null, items: [{ variantId: f.litre, quantity: 4 }] },
        f.adminId,
      ),
    ).rejects.toMatchObject({
      statusCode: 409,
      errors: { "items[0].quantity": expect.stringContaining("Only 3") },
    });

    expect(await ctx.stockOf(f.litre)).toBe(3);
    const sales = await ctx.db.execute(sql`SELECT count(*)::int AS n FROM daily_sales`);
    expect(sales.rows[0]).toEqual({ n: 0 });
    expect(await ctx.ledgerMismatches()).toBe(0);
  });

  it("lists every short line at once", async () => {
    await expect(
      ctx.sales.save(
        "2026-10-21",
        {
          notes: null,
          items: [
            { variantId: f.litre, quantity: 1 },
            { variantId: f.fourLitre, quantity: 2 },
          ],
        },
        f.adminId,
      ),
    ).rejects.toMatchObject({
      errors: { "items[0].quantity": expect.any(String), "items[1].quantity": expect.any(String) },
    });
  });

  it("edits a day by writing only the per-size difference", async () => {
    await ctx.batches.create(
      batchInput([
        { variantId: f.litre, quantity: 20 },
        { variantId: f.fourLitre, quantity: 10 },
      ]),
      f.adminId,
    );
    const day = "2026-10-21";
    await ctx.sales.save(
      day,
      {
        notes: null,
        items: [
          { variantId: f.litre, quantity: 5 },
          { variantId: f.fourLitre, quantity: 2 },
        ],
      },
      f.adminId,
    );

    // 5 -> 7 on the litre, 4L unchanged: one -2 correction, nothing for 4L.
    await ctx.sales.save(
      day,
      {
        notes: null,
        items: [
          { variantId: f.litre, quantity: 7 },
          { variantId: f.fourLitre, quantity: 2 },
        ],
      },
      f.adminId,
    );

    expect(await ctx.movementTypes(f.litre)).toEqual([
      { type: "batchIn", delta: 20, balance: 20 },
      { type: "sale", delta: -5, balance: 15 },
      { type: "saleEdit", delta: -2, balance: 13 },
    ]);
    expect(await ctx.movementTypes(f.fourLitre)).toHaveLength(2);

    // Removing a line returns its stock.
    await ctx.sales.save(
      day,
      { notes: null, items: [{ variantId: f.litre, quantity: 7 }] },
      f.adminId,
    );
    expect(await ctx.stockOf(f.fourLitre)).toBe(10);
    expect(await ctx.ledgerMismatches()).toBe(0);
  });

  it("keeps the price a line was sold at when the price changes later", async () => {
    await ctx.batches.create(batchInput([{ variantId: f.litre, quantity: 10 }]), f.adminId);
    await ctx.sales.save(
      "2026-10-21",
      { notes: null, items: [{ variantId: f.litre, quantity: 2 }] },
      f.adminId,
    );
    await ctx.db.execute(
      sql`UPDATE product_variants SET price_paisa = 99900 WHERE id = ${f.litre}`,
    );

    const edited = await ctx.sales.save(
      "2026-10-21",
      { notes: null, items: [{ variantId: f.litre, quantity: 3 }] },
      f.adminId,
    );
    expect(edited.items[0].unitPricePaisa).toBe(45000);
    expect(edited.revenuePaisa).toBe(135000);
  });

  it("voids a batch by reversing it, and only once", async () => {
    const batch = await ctx.batches.create(
      batchInput([{ variantId: f.litre, quantity: 8 }]),
      f.adminId,
    );
    await ctx.batches.void(batch.id, { reason: "Wrong delivery" }, f.adminId);

    expect(await ctx.stockOf(f.litre)).toBe(0);
    expect((await ctx.movementTypes(f.litre)).map((m) => m.type)).toEqual(["batchIn", "batchVoid"]);
    await expect(ctx.batches.void(batch.id, { reason: "Again" }, f.adminId)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(await ctx.ledgerMismatches()).toBe(0);
  });

  it("refuses to void a batch whose stock has been sold, naming the size", async () => {
    const batch = await ctx.batches.create(
      batchInput([{ variantId: f.fourLitre, quantity: 10 }]),
      f.adminId,
    );
    await ctx.sales.save(
      "2026-10-21",
      { notes: null, items: [{ variantId: f.fourLitre, quantity: 8 }] },
      f.adminId,
    );

    await expect(
      ctx.batches.void(batch.id, { reason: "Mistake" }, f.adminId),
    ).rejects.toMatchObject({
      statusCode: 409,
      params: {
        batchNumber: 1,
        detail: expect.stringContaining("Paint 4 L: 2 in stock, batch added 10"),
      },
    });
    const detail = await ctx.batches.get(batch.id);
    expect(detail.status).toBe("active");
    expect(await ctx.stockOf(f.fourLitre)).toBe(2);
  });

  it("applies adjustments with a reason and blocks negative results", async () => {
    await ctx.batches.create(batchInput([{ variantId: f.litre, quantity: 2 }]), f.adminId);
    await ctx.adjustments.create(
      { variantId: f.litre, quantityDelta: -1, reason: "damaged", note: null },
      f.adminId,
    );
    expect(await ctx.stockOf(f.litre)).toBe(1);

    await expect(
      ctx.adjustments.create(
        { variantId: f.litre, quantityDelta: -2, reason: "countCorrection", note: null },
        f.adminId,
      ),
    ).rejects.toMatchObject({ statusCode: 409, errors: { quantityDelta: expect.any(String) } });
    // The rejected adjustment's own row rolled back with it.
    const rows = await ctx.db.execute(sql`SELECT count(*)::int AS n FROM stock_adjustments`);
    expect(rows.rows[0]).toEqual({ n: 1 });
  });

  it("serialises concurrent sales so they can't oversell together", async () => {
    await ctx.batches.create(batchInput([{ variantId: f.litre, quantity: 10 }]), f.adminId);

    const results = await Promise.allSettled([
      ctx.sales.save(
        "2026-10-21",
        { notes: null, items: [{ variantId: f.litre, quantity: 8 }] },
        f.adminId,
      ),
      ctx.sales.save(
        "2026-10-22",
        { notes: null, items: [{ variantId: f.litre, quantity: 8 }] },
        f.adminId,
      ),
    ]);

    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    const rejected = results.find((r) => r.status === "rejected");
    expect(rejected?.reason).toBeInstanceOf(ConflictException);
    expect(await ctx.stockOf(f.litre)).toBe(2);
    expect(await ctx.ledgerMismatches()).toBe(0);
  });

  it("rejects new stock lines for inactive sizes", async () => {
    await ctx.db.execute(
      sql`UPDATE product_variants SET is_active = false WHERE id = ${f.fourLitre}`,
    );
    await expect(
      ctx.batches.create(batchInput([{ variantId: f.fourLitre, quantity: 1 }]), f.adminId),
    ).rejects.toMatchObject({ errors: { "items[0].variantId": expect.any(String) } });
  });

  it("refuses to run outside a transaction", async () => {
    await expect(
      ctx.ledger.apply([{ variantId: f.litre, delta: 1 }], { type: "adjustment" }, f.adminId),
    ).rejects.toThrow("inside txManager.run");
  });

  it("is backed by database constraints even if code skips the checks", async () => {
    await expect(
      ctx.db.execute(sql`UPDATE product_variants SET current_stock = -1 WHERE id = ${f.litre}`),
    ).rejects.toThrow();
  });
});
