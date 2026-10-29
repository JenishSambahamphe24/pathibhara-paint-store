import { sql } from "drizzle-orm";
import { boolean, check, integer, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { primaryId, timestamps } from "./columns";
import { products } from "./product.schema";

export const shades = pgTable(
  "shades",
  {
    id: primaryId(),
    code: text("code").notNull().unique(),
    name: text("name").notNull(),
    // Lowercase #rrggbb in sRGB; the visualizer converts to linear itself.
    hex: text("hex").notNull(),
    productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps,
  },
  (table) => [check("shades_hex_format", sql`${table.hex} ~ '^#[0-9a-f]{6}$'`)],
);
