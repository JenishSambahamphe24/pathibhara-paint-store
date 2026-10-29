import { and, asc, between, desc, eq, gt, lte, sql } from "drizzle-orm";
import { injectable } from "tsyringe";

import { dailySaleItems, dailySales, products, productVariants, TransactionManager } from "@repo/database";

import { variantProduct } from "../stock/stock-joins";

export interface IDashboardPeriod {
  today: string;
  from: string;
  to: string;
  previousFrom: string;
  previousTo: string;
}

const lineRevenue = sql<number>`${dailySaleItems.quantity}::bigint * ${dailySaleItems.unitPricePaisa}`;

@injectable()
export class DashboardRepository {
  constructor(private readonly txManager: TransactionManager) {}

  private get db() {
    return this.txManager.current();
  }

  private get sellableVariant() {
    return and(eq(productVariants.isActive, true), eq(products.isActive, true));
  }

  async salesSummary(period: IDashboardPeriod) {
    const inPeriod = sql`${dailySales.saleDate} BETWEEN ${period.from} AND ${period.to}`;
    const inPrevious = sql`${dailySales.saleDate} BETWEEN ${period.previousFrom} AND ${period.previousTo}`;
    const isToday = sql`${dailySales.saleDate} = ${period.today}`;
    const [row] = await this.db
      .select({
        revenuePaisa: sql<number>`coalesce(sum(${lineRevenue}) FILTER (WHERE ${inPeriod}), 0)::bigint`,
        units: sql<number>`coalesce(sum(${dailySaleItems.quantity}) FILTER (WHERE ${inPeriod}), 0)::int`,
        previousRevenuePaisa: sql<number>`coalesce(sum(${lineRevenue}) FILTER (WHERE ${inPrevious}), 0)::bigint`,
        previousUnits: sql<number>`coalesce(sum(${dailySaleItems.quantity}) FILTER (WHERE ${inPrevious}), 0)::int`,
        todayRevenuePaisa: sql<number>`coalesce(sum(${lineRevenue}) FILTER (WHERE ${isToday}), 0)::bigint`,
        todayUnits: sql<number>`coalesce(sum(${dailySaleItems.quantity}) FILTER (WHERE ${isToday}), 0)::int`,
      })
      .from(dailySaleItems)
      .innerJoin(dailySales, eq(dailySales.id, dailySaleItems.dailySaleId))
      .where(between(dailySales.saleDate, period.previousFrom, period.to));
    return row;
  }

  async isDayRecorded(date: string): Promise<boolean> {
    const [row] = await this.db
      .select({ id: dailySales.id })
      .from(dailySales)
      .where(eq(dailySales.saleDate, date))
      .limit(1);
    return !!row;
  }

  // One row per calendar day, including days with nothing recorded, so the
  // chart's gaps are real zeros rather than missing bars.
  async salesByDay(from: string, to: string) {
    const result = await this.db.execute<{ date: string; revenue_paisa: number; units: number }>(sql`
      SELECT day::date::text AS date,
        coalesce(sum(${lineRevenue}), 0)::bigint AS revenue_paisa,
        coalesce(sum(${dailySaleItems.quantity}), 0)::int AS units
      FROM generate_series(${from}::date, ${to}::date, interval '1 day') AS day
      LEFT JOIN ${dailySales} ON ${dailySales.saleDate} = day::date
      LEFT JOIN ${dailySaleItems} ON ${dailySaleItems.dailySaleId} = ${dailySales.id}
      GROUP BY day
      ORDER BY day`);
    return result.rows.map((row) => ({ date: row.date, revenuePaisa: row.revenue_paisa, units: row.units }));
  }

  async topSellers(from: string, to: string, limit: number) {
    const revenuePaisa = sql<number>`sum(${lineRevenue})::bigint`;
    return this.db
      .select({
        variantId: productVariants.id,
        productId: productVariants.productId,
        productName: variantProduct.name,
        volumeMl: productVariants.volumeMl,
        units: sql<number>`sum(${dailySaleItems.quantity})::int`,
        revenuePaisa,
      })
      .from(dailySaleItems)
      .innerJoin(dailySales, eq(dailySales.id, dailySaleItems.dailySaleId))
      .innerJoin(productVariants, eq(productVariants.id, dailySaleItems.variantId))
      .innerJoin(
        variantProduct,
        eq(variantProduct.id, productVariants.productId),
      )
      .where(between(dailySales.saleDate, from, to))
      .groupBy(productVariants.id, variantProduct.name)
      .orderBy(desc(revenuePaisa), asc(variantProduct.name), asc(productVariants.volumeMl))
      .limit(limit);
  }

  async stockSummary() {
    const [row] = await this.db
      .select({
        lowStockCount: sql<number>`(count(*) FILTER (WHERE ${productVariants.currentStock} <= ${productVariants.reorderLevel}))::int`,
        outOfStockCount: sql<number>`(count(*) FILTER (WHERE ${productVariants.currentStock} = 0))::int`,
        valuePaisa: sql<number>`coalesce(sum(${productVariants.currentStock}::bigint * ${productVariants.pricePaisa}), 0)::bigint`,
      })
      .from(productVariants)
      .innerJoin(products, eq(products.id, productVariants.productId))
      .where(this.sellableVariant);
    return row;
  }

  async lowStock(limit: number) {
    return this.db
      .select({
        variantId: productVariants.id,
        productId: productVariants.productId,
        productName: variantProduct.name,
        volumeMl: productVariants.volumeMl,
        sku: productVariants.sku,
        currentStock: productVariants.currentStock,
        reorderLevel: productVariants.reorderLevel,
      })
      .from(productVariants)
      .innerJoin(products, eq(products.id, productVariants.productId))
      .innerJoin(
        variantProduct,
        eq(variantProduct.id, productVariants.productId),
      )
      .where(and(this.sellableVariant, lte(productVariants.currentStock, productVariants.reorderLevel)))
      .orderBy(
        asc(productVariants.currentStock),
        desc(sql`${productVariants.reorderLevel} - ${productVariants.currentStock}`),
        asc(variantProduct.name),
      )
      .limit(limit);
  }

  // Sizes holding stock that sold nothing in the period, biggest tied-up
  // value first: candidates for a promotion or a smaller next order.
  async slowMovers(from: string, to: string, limit: number) {
    const stockValuePaisa = sql<number>`(${productVariants.currentStock}::bigint * ${productVariants.pricePaisa})`;
    const lastSoldOn = sql<string | null>`(
      SELECT max(${dailySales.saleDate})::text FROM ${dailySaleItems}
      INNER JOIN ${dailySales} ON ${dailySales.id} = ${dailySaleItems.dailySaleId}
      WHERE ${dailySaleItems.variantId} = ${productVariants.id})`;
    const soldInPeriod = sql`EXISTS (
      SELECT 1 FROM ${dailySaleItems}
      INNER JOIN ${dailySales} ON ${dailySales.id} = ${dailySaleItems.dailySaleId}
      WHERE ${dailySaleItems.variantId} = ${productVariants.id}
        AND ${dailySales.saleDate} BETWEEN ${from} AND ${to})`;
    return this.db
      .select({
        variantId: productVariants.id,
        productId: productVariants.productId,
        productName: variantProduct.name,
        volumeMl: productVariants.volumeMl,
        currentStock: productVariants.currentStock,
        stockValuePaisa,
        lastSoldOn,
      })
      .from(productVariants)
      .innerJoin(products, eq(products.id, productVariants.productId))
      .innerJoin(
        variantProduct,
        eq(variantProduct.id, productVariants.productId),
      )
      .where(and(this.sellableVariant, gt(productVariants.currentStock, 0), sql`NOT ${soldInPeriod}`))
      .orderBy(desc(stockValuePaisa), asc(variantProduct.name))
      .limit(limit);
  }
}
