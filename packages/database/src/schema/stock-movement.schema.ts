import { sql } from "drizzle-orm";
import { check, index, integer, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";

import { admins } from "./admin.schema";
import { primaryId } from "./columns";
import { dailySales } from "./daily-sale.schema";
import { stockMovementTypeEnum } from "./enums";
import { productVariants } from "./product-variant.schema";
import { stockAdjustments } from "./stock-adjustment.schema";
import { stockBatches } from "./stock-batch.schema";

// Append-only ledger: every stock change for a variant, signed. Current stock
// is SUM(quantity_delta); product_variants.current_stock caches it.
export const stockMovements = pgTable(
  "stock_movements",
  {
    id: primaryId(),
    variantId: uuid("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "restrict" }),
    type: stockMovementTypeEnum("type").notNull(),
    quantityDelta: integer("quantity_delta").notNull(),
    // Stock right after this movement, for the per-variant history chart
    // without a window function over the whole ledger.
    balanceAfter: integer("balance_after").notNull(),
    batchId: uuid("batch_id").references(() => stockBatches.id, { onDelete: "restrict" }),
    dailySaleId: uuid("daily_sale_id").references(() => dailySales.id, { onDelete: "restrict" }),
    adjustmentId: uuid("adjustment_id").references(() => stockAdjustments.id, {
      onDelete: "restrict",
    }),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => admins.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("stock_movements_variant_created_idx").on(table.variantId, table.createdAt.desc()),
    index("stock_movements_type_created_idx").on(table.type, table.createdAt.desc()),
    index("stock_movements_batch_idx").on(table.batchId),
    index("stock_movements_daily_sale_idx").on(table.dailySaleId),
    check("stock_movements_delta_non_zero", sql`${table.quantityDelta} <> 0`),
    check("stock_movements_balance_non_negative", sql`${table.balanceAfter} >= 0`),
    // Exactly the source reference that matches the movement type.
    check(
      "stock_movements_source_matches_type",
      sql`CASE ${table.type}
        WHEN 'batchIn' THEN ${table.batchId} IS NOT NULL AND ${table.dailySaleId} IS NULL AND ${table.adjustmentId} IS NULL AND ${table.quantityDelta} > 0
        WHEN 'batchVoid' THEN ${table.batchId} IS NOT NULL AND ${table.dailySaleId} IS NULL AND ${table.adjustmentId} IS NULL AND ${table.quantityDelta} < 0
        WHEN 'sale' THEN ${table.dailySaleId} IS NOT NULL AND ${table.batchId} IS NULL AND ${table.adjustmentId} IS NULL AND ${table.quantityDelta} < 0
        WHEN 'saleEdit' THEN ${table.dailySaleId} IS NOT NULL AND ${table.batchId} IS NULL AND ${table.adjustmentId} IS NULL
        WHEN 'adjustment' THEN ${table.adjustmentId} IS NOT NULL AND ${table.batchId} IS NULL AND ${table.dailySaleId} IS NULL
        ELSE false
      END`,
    ),
  ],
);
