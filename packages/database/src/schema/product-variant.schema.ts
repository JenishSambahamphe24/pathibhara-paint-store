import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  index,
  integer,
  pgTable,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { primaryId, timestamps } from "./columns";
import { products } from "./product.schema";

export const productVariants = pgTable(
  "product_variants",
  {
    id: primaryId(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    volumeMl: integer("volume_ml").notNull(),
    pricePaisa: bigint("price_paisa", { mode: "number" }).notNull(),
    sku: text("sku").notNull().unique(),
    reorderLevel: integer("reorder_level").notNull().default(0),
    // Cache of SUM(stock_movements.quantity_delta); only ever changed in the
    // same transaction as the movement that explains it.
    currentStock: integer("current_stock").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("product_variants_product_volume_uq").on(table.productId, table.volumeMl),
    index("product_variants_low_stock_idx")
      .on(table.currentStock)
      .where(sql`${table.isActive} AND ${table.currentStock} <= ${table.reorderLevel}`),
    check("product_variants_volume_positive", sql`${table.volumeMl} > 0`),
    check("product_variants_price_non_negative", sql`${table.pricePaisa} >= 0`),
    check("product_variants_reorder_non_negative", sql`${table.reorderLevel} >= 0`),
    check("product_variants_stock_non_negative", sql`${table.currentStock} >= 0`),
  ],
);
