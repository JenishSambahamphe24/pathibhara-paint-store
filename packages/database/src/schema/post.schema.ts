import { sql } from "drizzle-orm";
import { check, index, jsonb, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { admins } from "./admin.schema";
import { primaryId, timestamps } from "./columns";
import { localeEnum, postStatusEnum } from "./enums";
import { files } from "./file.schema";

export const posts = pgTable(
  "posts",
  {
    id: primaryId(),
    slug: text("slug").notNull().unique(),
    status: postStatusEnum("status").notNull().default("draft"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    coverImageFileId: uuid("cover_image_file_id").references(() => files.id, {
      onDelete: "set null",
    }),
    authorId: uuid("author_id")
      .notNull()
      .references(() => admins.id, { onDelete: "restrict" }),
    ...timestamps,
  },
  (table) => [
    index("posts_published_idx")
      .on(table.publishedAt.desc())
      .where(sql`${table.status} = 'published'`),
    check(
      "posts_published_has_date",
      sql`${table.status} <> 'published' OR ${table.publishedAt} IS NOT NULL`,
    ),
  ],
);

export const postTranslations = pgTable(
  "post_translations",
  {
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    locale: localeEnum("locale").notNull(),
    title: text("title").notNull(),
    excerpt: text("excerpt"),
    // TipTap document as authored; the source of truth for editing.
    contentJson: jsonb("content_json").notNull(),
    // Rendered from contentJson and sanitized on the server at save time, so
    // the public site serves it without re-rendering or trusting the client.
    contentHtml: text("content_html").notNull(),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    ...timestamps,
  },
  (table) => [primaryKey({ columns: [table.postId, table.locale] })],
);
