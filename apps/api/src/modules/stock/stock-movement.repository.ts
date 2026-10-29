import type { StockMovementListQuery } from "@repo/shared";
import type { SQL } from "drizzle-orm";

import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { injectable } from "tsyringe";

import {
  dailySales,
  productVariants,
  stockAdjustments,
  stockBatches,
  stockMovements,
  TransactionManager,
} from "@repo/database";
import { PaginationHelper } from "@repo/http-kit";

import { LikeHelper } from "#helpers/like.helper";
import { StoreDayHelper } from "#helpers/store-day.helper";

import { createdByAdmin, variantProduct } from "./stock-joins";

@injectable()
export class StockMovementRepository {
  constructor(private readonly txManager: TransactionManager) {}

  private get db() {
    return this.txManager.current();
  }

  async list(query: StockMovementListQuery) {
    const conditions: Array<SQL | undefined> = [];
    if (query.search) {
      const term = LikeHelper.contains(query.search);
      conditions.push(or(ilike(variantProduct.name, term), ilike(productVariants.sku, term)));
    }
    if (query.type) conditions.push(eq(stockMovements.type, query.type));
    if (query.variantId) conditions.push(eq(stockMovements.variantId, query.variantId));
    if (query.from) conditions.push(StoreDayHelper.from(stockMovements.createdAt, query.from));
    if (query.to) conditions.push(StoreDayHelper.to(stockMovements.createdAt, query.to));
    const where = and(...conditions);

    const sortColumn = {
      createdAt: stockMovements.createdAt,
      quantityDelta: stockMovements.quantityDelta,
    }[query.sortBy];
    const direction = query.sortOrder === "asc" ? asc : desc;
    const joinVariant = eq(variantProduct.id, productVariants.productId);

    const rows = await this.db
      .select({
        movement: stockMovements,
        productId: productVariants.productId,
        productName: variantProduct.name,
        volumeMl: productVariants.volumeMl,
        sku: productVariants.sku,
        batchNumber: stockBatches.batchNumber,
        saleDate: dailySales.saleDate,
        adjustmentReason: stockAdjustments.reason,
        createdByName: createdByAdmin.name,
      })
      .from(stockMovements)
      .innerJoin(productVariants, eq(productVariants.id, stockMovements.variantId))
      .innerJoin(variantProduct, joinVariant)
      .innerJoin(createdByAdmin, eq(createdByAdmin.id, stockMovements.createdBy))
      .leftJoin(stockBatches, eq(stockBatches.id, stockMovements.batchId))
      .leftJoin(dailySales, eq(dailySales.id, stockMovements.dailySaleId))
      .leftJoin(stockAdjustments, eq(stockAdjustments.id, stockMovements.adjustmentId))
      .where(where)
      // id breaks ties inside one transaction (same created_at); v7 ids are
      // time-ordered, so this matches insertion order.
      .orderBy(direction(sortColumn), direction(stockMovements.id))
      .limit(query.perPage)
      .offset(PaginationHelper.offset(query.page, query.perPage));

    const [{ total }] = await this.db
      .select({ total: sql<number>`count(*)::int` })
      .from(stockMovements)
      .innerJoin(productVariants, eq(productVariants.id, stockMovements.variantId))
      .innerJoin(variantProduct, joinVariant)
      .where(where);
    return { rows, total };
  }
}
