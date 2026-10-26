import { boolean, integer, pgTable, primaryKey, text, uuid } from "drizzle-orm/pg-core";

import { primaryId, timestamps } from "./columns";
import { localeEnum } from "./enums";
import { shades } from "./shade.schema";

// One column per VISUALIZER_COMPONENTS entry, so "exactly one shade per
// component" is enforced by NOT NULL rather than by application code.
export const colourSets = pgTable("colour_sets", {
  id: primaryId(),
  slug: text("slug").notNull().unique(),
  mainSurfaceShadeId: uuid("main_surface_shade_id")
    .notNull()
    .references(() => shades.id, { onDelete: "restrict" }),
  columnsShadeId: uuid("columns_shade_id")
    .notNull()
    .references(() => shades.id, { onDelete: "restrict" }),
  doorsWindowsShadeId: uuid("doors_windows_shade_id")
    .notNull()
    .references(() => shades.id, { onDelete: "restrict" }),
  roofEdgeShadeId: uuid("roof_edge_shade_id")
    .notNull()
    .references(() => shades.id, { onDelete: "restrict" }),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  ...timestamps,
});

export const colourSetTranslations = pgTable(
  "colour_set_translations",
  {
    colourSetId: uuid("colour_set_id")
      .notNull()
      .references(() => colourSets.id, { onDelete: "cascade" }),
    locale: localeEnum("locale").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    ...timestamps,
  },
  (table) => [primaryKey({ columns: [table.colourSetId, table.locale] })],
);
