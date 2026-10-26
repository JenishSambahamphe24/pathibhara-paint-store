import { pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

import { primaryId } from "./columns";
import { slugEntityTypeEnum } from "./enums";

// Old slugs keep answering with a 301 to the entity's current URL, so links
// and search rankings survive a rename. Polymorphic on purpose: the entity
// tables differ, and a dangling row only costs a 404.
export const slugRedirects = pgTable(
  "slug_redirects",
  {
    id: primaryId(),
    entityType: slugEntityTypeEnum("entity_type").notNull(),
    entityId: uuid("entity_id").notNull(),
    oldSlug: text("old_slug").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("slug_redirects_type_slug_uq").on(table.entityType, table.oldSlug)],
);
