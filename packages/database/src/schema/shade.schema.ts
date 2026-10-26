import { sql } from "drizzle-orm";
import { boolean, check, integer, pgTable, primaryKey, text, uuid } from "drizzle-orm/pg-core";

import { primaryId, timestamps } from "./columns";
import { localeEnum } from "./enums";
import { products } from "./product.schema";

export const shades = pgTable(
  "shades",
  {
    id: primaryId(),
    code: text("code").notNull().unique(),
    // Lowercase #rrggbb in sRGB; the visualizer converts to linear itself.
    hex: text("hex").notNull(),
    productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps,
  },
  (table) => [check("shades_hex_format", sql`${table.hex} ~ '^#[0-9a-f]{6}$'`)],
);

export const shadeTranslations = pgTable(
  "shade_translations",
  {
    shadeId: uuid("shade_id")
      .notNull()
      .references(() => shades.id, { onDelete: "cascade" }),
    locale: localeEnum("locale").notNull(),
    name: text("name").notNull(),
    ...timestamps,
  },
  (table) => [primaryKey({ columns: [table.shadeId, table.locale] })],
);
