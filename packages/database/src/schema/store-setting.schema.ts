import { sql } from "drizzle-orm";
import { check, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { admins } from "./admin.schema";

// Single row (id = 1). Store details double as the LocalBusiness JSON-LD on
// the public site.
export const storeSettings = pgTable(
  "store_settings",
  {
    id: integer("id").primaryKey().default(1),
    storeName: text("store_name").notNull(),
    phone: text("phone"),
    email: text("email"),
    addressLine: text("address_line"),
    city: text("city"),
    // Basis points so a fractional percentage stays an integer: 1000 = 10%.
    defaultWastageBps: integer("default_wastage_bps").notNull().default(1000),
    updatedBy: uuid("updated_by").references(() => admins.id, { onDelete: "set null" }),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    check("store_settings_single_row", sql`${table.id} = 1`),
    check(
      "store_settings_wastage_range",
      sql`${table.defaultWastageBps} BETWEEN 0 AND 5000`,
    ),
  ],
);
