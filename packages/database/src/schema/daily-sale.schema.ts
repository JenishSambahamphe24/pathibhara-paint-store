import { sql } from "drizzle-orm";
import { bigint, check, date, index, integer, pgTable, text, uniqueIndex, uuid } from "drizzle-orm/pg-core";

import { admins } from "./admin.schema";
import { primaryId, timestamps } from "./columns";
import { productVariants } from "./product-variant.schema";

export const dailySales = pgTable("daily_sales", {
  id: primaryId(),
  // One entry per store calendar day (Asia/Kathmandu).
  saleDate: date("sale_date", { mode: "string" }).notNull().unique(),
  notes: text("notes"),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => admins.id, { onDelete: "restrict" }),
  updatedBy: uuid("updated_by")
    .notNull()
    .references(() => admins.id, { onDelete: "restrict" }),
  ...timestamps,
});

export const dailySaleItems = pgTable(
  "daily_sale_items",
  {
    id: primaryId(),
    dailySaleId: uuid("daily_sale_id")
      .notNull()
      .references(() => dailySales.id, { onDelete: "restrict" }),
    variantId: uuid("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "restrict" }),
    quantity: integer("quantity").notNull(),
    // Snapshot of the variant price when the line was recorded, so a later
    // price change doesn't rewrite past revenue.
    unitPricePaisa: bigint("unit_price_paisa", { mode: "number" }).notNull(),
  },
  (table) => [
    uniqueIndex("daily_sale_items_sale_variant_uq").on(table.dailySaleId, table.variantId),
    index("daily_sale_items_variant_idx").on(table.variantId),
    check("daily_sale_items_quantity_positive", sql`${table.quantity} > 0`),
    check("daily_sale_items_price_non_negative", sql`${table.unitPricePaisa} >= 0`),
  ],
);
