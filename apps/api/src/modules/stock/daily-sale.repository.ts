import type { DailySaleListQuery } from "@repo/shared";
import type { SQL } from "drizzle-orm";

import { and, asc, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { injectable } from "tsyringe";

import { dailySaleItems, dailySales, productVariants, TransactionManager } from "@repo/database";
import { PaginationHelper } from "@repo/http-kit";

import { createdByAdmin, updatedByAdmin, variantProductName } from "./stock-joins";

@injectable()
export class DailySaleRepository {
  constructor(private readonly txManager: TransactionManager) {}

  private get db() {
    return this.txManager.current();
  }

  private totals() {
    return this.db
      .select({
        dailySaleId: dailySaleItems.dailySaleId,
        lineCount: sql<number>`count(*)::int`.as("line_count"),
        units: sql<number>`sum(${dailySaleItems.quantity})::int`.as("units"),
        revenuePaisa:
          sql<number>`sum(${dailySaleItems.quantity}::bigint * ${dailySaleItems.unitPricePaisa})::bigint`.as(
            "revenue_paisa",
          ),
      })
      .from(dailySaleItems)
      .groupBy(dailySaleItems.dailySaleId)
      .as("sale_totals");
  }

  async list(query: DailySaleListQuery) {
    const totals = this.totals();
    const conditions: Array<SQL> = [];
    if (query.from) conditions.push(gte(dailySales.saleDate, query.from));
    if (query.to) conditions.push(lte(dailySales.saleDate, query.to));
    const where = and(...conditions);

    const sortColumn = {
      saleDate: dailySales.saleDate,
      revenue: sql`coalesce(${totals.revenuePaisa}, 0)`,
      units: sql`coalesce(${totals.units}, 0)`,
    }[query.sortBy];
    const direction = query.sortOrder === "asc" ? asc : desc;

    const rows = await this.db
      .select(this.summaryColumns(totals))
      .from(dailySales)
      .leftJoin(totals, eq(totals.dailySaleId, dailySales.id))
      .innerJoin(updatedByAdmin, eq(updatedByAdmin.id, dailySales.updatedBy))
      .innerJoin(createdByAdmin, eq(createdByAdmin.id, dailySales.createdBy))
      .where(where)
      .orderBy(direction(sortColumn), desc(dailySales.saleDate))
      .limit(query.perPage)
      .offset(PaginationHelper.offset(query.page, query.perPage));

    const [{ total }] = await this.db
      .select({ total: sql<number>`count(*)::int` })
      .from(dailySales)
      .where(where);
    return { rows, total };
  }

  async findSummaryByDate(saleDate: string) {
    const totals = this.totals();
    const [row] = await this.db
      .select(this.summaryColumns(totals))
      .from(dailySales)
      .leftJoin(totals, eq(totals.dailySaleId, dailySales.id))
      .innerJoin(updatedByAdmin, eq(updatedByAdmin.id, dailySales.updatedBy))
      .innerJoin(createdByAdmin, eq(createdByAdmin.id, dailySales.createdBy))
      .where(eq(dailySales.saleDate, saleDate))
      .limit(1);
    return row;
  }

  private summaryColumns(totals: ReturnType<DailySaleRepository["totals"]>) {
    return {
      sale: dailySales,
      lineCount: sql<number>`coalesce(${totals.lineCount}, 0)`,
      units: sql<number>`coalesce(${totals.units}, 0)`,
      revenuePaisa: sql<number>`coalesce(${totals.revenuePaisa}, 0)`,
      updatedByName: updatedByAdmin.name,
      createdByName: createdByAdmin.name,
    };
  }

  async findItems(dailySaleId: string) {
    return this.db
      .select({
        item: dailySaleItems,
        productId: productVariants.productId,
        productName: variantProductName.name,
        volumeMl: productVariants.volumeMl,
        sku: productVariants.sku,
        currentStock: productVariants.currentStock,
      })
      .from(dailySaleItems)
      .innerJoin(productVariants, eq(productVariants.id, dailySaleItems.variantId))
      .innerJoin(
        variantProductName,
        and(
          eq(variantProductName.productId, productVariants.productId),
          eq(variantProductName.locale, "en"),
        ),
      )
      .where(eq(dailySaleItems.dailySaleId, dailySaleId))
      .orderBy(asc(variantProductName.name), asc(productVariants.volumeMl));
  }

  async lockByDate(saleDate: string) {
    const [row] = await this.db
      .select()
      .from(dailySales)
      .where(eq(dailySales.saleDate, saleDate))
      .limit(1)
      .for("update");
    return row;
  }

  async lineItems(dailySaleId: string) {
    return this.db.select().from(dailySaleItems).where(eq(dailySaleItems.dailySaleId, dailySaleId));
  }

  async create(values: typeof dailySales.$inferInsert) {
    const [row] = await this.db.insert(dailySales).values(values).returning();
    return row;
  }

  async update(id: string, values: Partial<typeof dailySales.$inferInsert>) {
    await this.db
      .update(dailySales)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(dailySales.id, id));
  }

  async insertItems(values: Array<typeof dailySaleItems.$inferInsert>) {
    if (values.length === 0) return;
    await this.db.insert(dailySaleItems).values(values);
  }

  async updateItemQuantity(id: string, quantity: number) {
    await this.db.update(dailySaleItems).set({ quantity }).where(eq(dailySaleItems.id, id));
  }

  async deleteItems(ids: Array<string>) {
    if (ids.length === 0) return;
    await this.db.delete(dailySaleItems).where(inArray(dailySaleItems.id, ids));
  }
}
