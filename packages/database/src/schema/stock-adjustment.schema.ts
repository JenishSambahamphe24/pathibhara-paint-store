import { sql } from "drizzle-orm";
import { check, index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { admins } from "./admin.schema";
import { primaryId } from "./columns";
import { stockAdjustmentReasonEnum } from "./enums";
import { productVariants } from "./product-variant.schema";

export const stockAdjustments = pgTable(
  "stock_adjustments",
  {
    id: primaryId(),
    variantId: uuid("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "restrict" }),
    quantityDelta: integer("quantity_delta").notNull(),
    reason: stockAdjustmentReasonEnum("reason").notNull(),
    note: text("note"),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => admins.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("stock_adjustments_variant_idx").on(table.variantId, table.createdAt.desc()),
    check("stock_adjustments_delta_non_zero", sql`${table.quantityDelta} <> 0`),
  ],
);
