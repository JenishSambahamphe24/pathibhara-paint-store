import { integer, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

import { admins } from "./admin.schema";
import { primaryId } from "./columns";
import { fileProviderEnum } from "./enums";

export const files = pgTable(
  "files",
  {
    id: primaryId(),
    provider: fileProviderEnum("provider").notNull(),
    key: text("key").notNull(),
    originalName: text("original_name").notNull(),
    mimeType: text("mime_type").notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    width: integer("width"),
    height: integer("height"),
    blurHash: text("blur_hash"),
    // Default alt text; product/post pages may override it with translated copy.
    altText: text("alt_text"),
    uploadedBy: uuid("uploaded_by").references(() => admins.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("files_provider_key_uq").on(table.provider, table.key)],
);
