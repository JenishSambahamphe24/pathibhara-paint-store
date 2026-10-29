import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  numeric,
  pgTable,
  primaryKey,
  smallint,
  text,
  uuid,
} from "drizzle-orm/pg-core";

import { categories } from "./category.schema";
import { primaryId, timestamps } from "./columns";
import { files } from "./file.schema";

export const products = pgTable(
  "products",
  {
    id: primaryId(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    description: text("description"),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    // Per coat. Not money or volume, so a fractional number is fine (e.g. 32.5).
    coverageSqftPerLitre: numeric("coverage_sqft_per_litre", {
      precision: 7,
      scale: 2,
      mode: "number",
    }).notNull(),
    defaultCoats: smallint("default_coats").notNull().default(2),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps,
  },
  (table) => [
    index("products_category_idx").on(table.categoryId),
    check("products_coverage_positive", sql`${table.coverageSqftPerLitre} > 0`),
    check("products_default_coats_range", sql`${table.defaultCoats} BETWEEN 1 AND 10`),
  ],
);

export const productImages = pgTable(
  "product_images",
  {
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    fileId: uuid("file_id")
      .notNull()
      .references(() => files.id, { onDelete: "restrict" }),
    // 0 is the cover image (Open Graph image on the public page).
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [
    primaryKey({ columns: [table.productId, table.fileId] }),
    index("product_images_order_idx").on(table.productId, table.sortOrder),
  ],
);
