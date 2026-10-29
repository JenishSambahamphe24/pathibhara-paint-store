import type { StockAdjustmentListQuery } from "@repo/shared";
import type { SQL } from "drizzle-orm";

import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { injectable } from "tsyringe";

import { productVariants, stockAdjustments, TransactionManager } from "@repo/database";
import { PaginationHelper } from "@repo/http-kit";

import { LikeHelper } from "#helpers/like.helper";
import { StoreDayHelper } from "#helpers/store-day.helper";

import { createdByAdmin, variantProduct } from "./stock-joins";

@injectable()
export class StockAdjustmentRepository {
  constructor(private readonly txManager: TransactionManager) {}

  private get db() {
    return this.txManager.current();
  }

  private select() {
    return this.db
      .select({
        adjustment: stockAdjustments,
        productId: productVariants.productId,
        productName: variantProduct.name,
        volumeMl: productVariants.volumeMl,
        sku: productVariants.sku,
        createdByName: createdByAdmin.name,
      })
      .from(stockAdjustments)
      .innerJoin(productVariants, eq(productVariants.id, stockAdjustments.variantId))
      .innerJoin(variantProduct, eq(variantProduct.id, productVariants.productId))
      .innerJoin(createdByAdmin, eq(createdByAdmin.id, stockAdjustments.createdBy))
      .$dynamic();
  }

  async list(query: StockAdjustmentListQuery) {
    const conditions: Array<SQL | undefined> = [];
    if (query.search) {
      const term = LikeHelper.contains(query.search);
      conditions.push(
        or(
          ilike(variantProduct.name, term),
          ilike(productVariants.sku, term),
          ilike(stockAdjustments.note, term),
        ),
      );
    }
    if (query.reason) conditions.push(eq(stockAdjustments.reason, query.reason));
    if (query.variantId) conditions.push(eq(stockAdjustments.variantId, query.variantId));
    if (query.from) conditions.push(StoreDayHelper.from(stockAdjustments.createdAt, query.from));
    if (query.to) conditions.push(StoreDayHelper.to(stockAdjustments.createdAt, query.to));
    const where = and(...conditions);

    const sortColumn = {
      createdAt: stockAdjustments.createdAt,
      quantityDelta: stockAdjustments.quantityDelta,
    }[query.sortBy];
    const direction = query.sortOrder === "asc" ? asc : desc;

    const rows = await this.select()
      .where(where)
      .orderBy(direction(sortColumn), desc(stockAdjustments.id))
      .limit(query.perPage)
      .offset(PaginationHelper.offset(query.page, query.perPage));

    const [{ total }] = await this.db
      .select({ total: sql<number>`count(*)::int` })
      .from(stockAdjustments)
      .innerJoin(productVariants, eq(productVariants.id, stockAdjustments.variantId))
      .innerJoin(variantProduct, eq(variantProduct.id, productVariants.productId))
      .where(where);
    return { rows, total };
  }

  async findById(id: string) {
    const [row] = await this.select().where(eq(stockAdjustments.id, id)).limit(1);
    return row;
  }

  async create(values: typeof stockAdjustments.$inferInsert) {
    const [row] = await this.db.insert(stockAdjustments).values(values).returning();
    return row;
  }
}
