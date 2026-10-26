import { sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  boolean,
  check,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  uuid,
} from "drizzle-orm/pg-core";

import { primaryId, timestamps } from "./columns";
import { localeEnum } from "./enums";
import { files } from "./file.schema";

export const categories = pgTable(
  "categories",
  {
    id: primaryId(),
    // `restrict`: a category with children can't be deleted, only deactivated.
    parentId: uuid("parent_id").references((): AnyPgColumn => categories.id, {
      onDelete: "restrict",
    }),
    slug: text("slug").notNull().unique(),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    imageFileId: uuid("image_file_id").references(() => files.id, { onDelete: "set null" }),
    ...timestamps,
  },
  (table) => [
    index("categories_parent_sort_idx").on(table.parentId, table.sortOrder),
    check("categories_not_own_parent", sql`${table.parentId} IS DISTINCT FROM ${table.id}`),
  ],
);

export const categoryTranslations = pgTable(
  "category_translations",
  {
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    locale: localeEnum("locale").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    ...timestamps,
  },
  (table) => [primaryKey({ columns: [table.categoryId, table.locale] })],
);
