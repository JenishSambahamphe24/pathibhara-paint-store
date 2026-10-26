import type { StockBatchListQuery } from "@repo/shared";
import type { SQL } from "drizzle-orm";

import { and, asc, desc, eq, gte, ilike, isNotNull, isNull, lte, or, sql } from "drizzle-orm";
import { injectable } from "tsyringe";

import { productVariants, stockBatches, stockBatchItems, TransactionManager } from "@repo/database";
import { PaginationHelper } from "@repo/http-kit";

import { LikeHelper } from "#helpers/like.helper";

import { createdByAdmin, variantProductName, voidedByAdmin } from "./stock-joins";

@injectable()
export class StockBatchRepository {
  constructor(private readonly txManager: TransactionManager) {}

  private get db() {
    return this.txManager.current();
  }

  private totals() {
    return this.db
      .select({
        batchId: stockBatchItems.batchId,
        itemCount: sql<number>`count(*)::int`.as("item_count"),
        totalUnits: sql<number>`sum(${stockBatchItems.quantity})::int`.as("total_units"),
        totalCostPaisa: sql<
          number | null
        >`sum(${stockBatchItems.quantity}::bigint * ${stockBatchItems.unitCostPaisa})::bigint`.as(
          "total_cost_paisa",
        ),
      })
      .from(stockBatchItems)
      .groupBy(stockBatchItems.batchId)
      .as("batch_totals");
  }

  async list(query: StockBatchListQuery) {
    const totals = this.totals();
    const conditions: Array<SQL | undefined> = [];
    if (query.search) {
      const term = LikeHelper.contains(query.search);
      const number = Number(query.search.replace(/^batch-?/i, ""));
      conditions.push(
        or(
          ilike(stockBatches.supplierName, term),
          ilike(stockBatches.notes, term),
          Number.isInteger(number) ? eq(stockBatches.batchNumber, number) : undefined,
        ),
      );
    }
    if (query.status === "active") conditions.push(isNull(stockBatches.voidedAt));
    if (query.status === "voided") conditions.push(isNotNull(stockBatches.voidedAt));
    if (query.from) conditions.push(gte(stockBatches.receivedOn, query.from));
    if (query.to) conditions.push(lte(stockBatches.receivedOn, query.to));
    const where = and(...conditions);

    const sortColumn = {
      receivedOn: stockBatches.receivedOn,
      batchNumber: stockBatches.batchNumber,
      createdAt: stockBatches.createdAt,
    }[query.sortBy];
    const direction = query.sortOrder === "asc" ? asc : desc;

    const rows = await this.db
      .select({
        batch: stockBatches,
        itemCount: sql<number>`coalesce(${totals.itemCount}, 0)`,
        totalUnits: sql<number>`coalesce(${totals.totalUnits}, 0)`,
        totalCostPaisa: totals.totalCostPaisa,
        createdByName: createdByAdmin.name,
      })
      .from(stockBatches)
      .leftJoin(totals, eq(totals.batchId, stockBatches.id))
      .innerJoin(createdByAdmin, eq(createdByAdmin.id, stockBatches.createdBy))
      .where(where)
      .orderBy(direction(sortColumn), desc(stockBatches.batchNumber))
      .limit(query.perPage)
      .offset(PaginationHelper.offset(query.page, query.perPage));

    const [{ total }] = await this.db
      .select({ total: sql<number>`count(*)::int` })
      .from(stockBatches)
      .where(where);
    return { rows, total };
  }

  async findDetail(id: string) {
    const totals = this.totals();
    const [row] = await this.db
      .select({
        batch: stockBatches,
        itemCount: sql<number>`coalesce(${totals.itemCount}, 0)`,
        totalUnits: sql<number>`coalesce(${totals.totalUnits}, 0)`,
        totalCostPaisa: totals.totalCostPaisa,
        createdByName: createdByAdmin.name,
        voidedByName: voidedByAdmin.name,
      })
      .from(stockBatches)
      .leftJoin(totals, eq(totals.batchId, stockBatches.id))
      .innerJoin(createdByAdmin, eq(createdByAdmin.id, stockBatches.createdBy))
      .leftJoin(voidedByAdmin, eq(voidedByAdmin.id, stockBatches.voidedBy))
      .where(eq(stockBatches.id, id))
      .limit(1);
    return row;
  }

  async findItems(batchId: string) {
    return this.db
      .select({
        item: stockBatchItems,
        productId: productVariants.productId,
        productName: variantProductName.name,
        volumeMl: productVariants.volumeMl,
        sku: productVariants.sku,
        currentStock: productVariants.currentStock,
      })
      .from(stockBatchItems)
      .innerJoin(productVariants, eq(productVariants.id, stockBatchItems.variantId))
      .innerJoin(
        variantProductName,
        and(
          eq(variantProductName.productId, productVariants.productId),
          eq(variantProductName.locale, "en"),
        ),
      )
      .where(eq(stockBatchItems.batchId, batchId))
      .orderBy(asc(variantProductName.name), asc(productVariants.volumeMl));
  }

  async lockById(id: string) {
    const [row] = await this.db
      .select()
      .from(stockBatches)
      .where(eq(stockBatches.id, id))
      .limit(1)
      .for("update");
    return row;
  }

  async create(values: typeof stockBatches.$inferInsert) {
    const [row] = await this.db.insert(stockBatches).values(values).returning();
    return row;
  }

  async insertItems(values: Array<typeof stockBatchItems.$inferInsert>) {
    await this.db.insert(stockBatchItems).values(values);
  }

  async itemsForVoid(batchId: string) {
    return this.db
      .select({ variantId: stockBatchItems.variantId, quantity: stockBatchItems.quantity })
      .from(stockBatchItems)
      .where(eq(stockBatchItems.batchId, batchId));
  }

  async markVoided(id: string, values: { voidedBy: string; voidReason: string }) {
    await this.db
      .update(stockBatches)
      .set({ ...values, voidedAt: new Date() })
      .where(eq(stockBatches.id, id));
  }
}
