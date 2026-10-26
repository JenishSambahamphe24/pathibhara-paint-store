import type { StockMovementType } from "@repo/shared";

import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { injectable } from "tsyringe";

import {
  productTranslations,
  productVariants,
  stockMovements,
  TransactionManager,
} from "@repo/database";

const enName = alias(productTranslations, "en_name");

export interface ILockedVariant {
  id: string;
  currentStock: number;
  volumeMl: number;
  productName: string;
}

@injectable()
export class StockLedgerRepository {
  constructor(private readonly txManager: TransactionManager) {}

  private get db() {
    return this.txManager.current();
  }

  // Row locks on the variants only (`OF product_variants`), taken in id order
  // so two operations touching overlapping variants queue instead of deadlocking.
  async lockVariants(ids: Array<string>): Promise<Array<ILockedVariant>> {
    if (ids.length === 0) return [];
    return this.db
      .select({
        id: productVariants.id,
        currentStock: productVariants.currentStock,
        volumeMl: productVariants.volumeMl,
        productName: enName.name,
      })
      .from(productVariants)
      .innerJoin(
        enName,
        and(eq(enName.productId, productVariants.productId), eq(enName.locale, "en")),
      )
      .where(inArray(productVariants.id, ids))
      .orderBy(asc(productVariants.id))
      .for("update", { of: productVariants });
  }

  async applyDelta(variantId: string, delta: number): Promise<number> {
    const [row] = await this.db
      .update(productVariants)
      .set({ currentStock: sql`${productVariants.currentStock} + ${delta}` })
      .where(eq(productVariants.id, variantId))
      .returning({ currentStock: productVariants.currentStock });
    return row.currentStock;
  }

  async insertMovement(values: {
    variantId: string;
    type: StockMovementType;
    quantityDelta: number;
    balanceAfter: number;
    createdBy: string;
    batchId?: string;
    dailySaleId?: string;
    adjustmentId?: string;
  }): Promise<void> {
    await this.db.insert(stockMovements).values(values);
  }
}
