import type { PostListQuery } from "@repo/shared";
import type { SQL } from "drizzle-orm";

import { and, asc, desc, eq, ilike, ne, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { injectable } from "tsyringe";

import { admins, files, posts, postTranslations, TransactionManager } from "@repo/database";
import { PaginationHelper } from "@repo/http-kit";

import { LikeHelper } from "#helpers/like.helper";

export type PostRow = typeof posts.$inferSelect;
export type PostTranslationValues = Omit<typeof postTranslations.$inferInsert, "postId" | "locale">;

const enTitle = alias(postTranslations, "en_title");
const neTitle = alias(postTranslations, "ne_title");

@injectable()
export class PostRepository {
  constructor(private readonly txManager: TransactionManager) {}

  private get db() {
    return this.txManager.current();
  }

  async list(query: PostListQuery) {
    const conditions: Array<SQL | undefined> = [];
    if (query.search) {
      const term = LikeHelper.contains(query.search);
      conditions.push(or(ilike(enTitle.title, term), ilike(neTitle.title, term), ilike(posts.slug, term)));
    }
    if (query.status) conditions.push(eq(posts.status, query.status));
    const where = and(...conditions);

    const sortColumn = {
      updatedAt: posts.updatedAt,
      publishedAt: posts.publishedAt,
      createdAt: posts.createdAt,
      title: enTitle.title,
    }[query.sortBy];
    const direction = query.sortOrder === "asc" ? asc : desc;

    const rows = await this.db
      .select({
        post: posts,
        title: enTitle.title,
        hasNepali: sql<boolean>`${neTitle.postId} IS NOT NULL`,
        authorName: admins.name,
        coverFile: files,
      })
      .from(posts)
      .innerJoin(enTitle, and(eq(enTitle.postId, posts.id), eq(enTitle.locale, "en")))
      .leftJoin(neTitle, and(eq(neTitle.postId, posts.id), eq(neTitle.locale, "ne")))
      .innerJoin(admins, eq(admins.id, posts.authorId))
      .leftJoin(files, eq(files.id, posts.coverImageFileId))
      .where(where)
      .orderBy(sql`${direction(sortColumn)} NULLS LAST`, desc(posts.id))
      .limit(query.perPage)
      .offset(PaginationHelper.offset(query.page, query.perPage));

    const [{ total }] = await this.db
      .select({ total: sql<number>`count(*)::int` })
      .from(posts)
      .innerJoin(enTitle, and(eq(enTitle.postId, posts.id), eq(enTitle.locale, "en")))
      .leftJoin(neTitle, and(eq(neTitle.postId, posts.id), eq(neTitle.locale, "ne")))
      .where(where);
    return { rows, total };
  }

  async findDetail(id: string) {
    const [row] = await this.db
      .select({ post: posts, authorName: admins.name, coverFile: files })
      .from(posts)
      .innerJoin(admins, eq(admins.id, posts.authorId))
      .leftJoin(files, eq(files.id, posts.coverImageFileId))
      .where(eq(posts.id, id))
      .limit(1);
    return row;
  }

  async findTranslations(postId: string) {
    return this.db.select().from(postTranslations).where(eq(postTranslations.postId, postId));
  }

  async lockById(id: string): Promise<PostRow | undefined> {
    const [row] = await this.db.select().from(posts).where(eq(posts.id, id)).limit(1).for("update");
    return row;
  }

  async slugTaken(slug: string, exceptId?: string): Promise<boolean> {
    const [row] = await this.db
      .select({ id: posts.id })
      .from(posts)
      .where(exceptId ? and(eq(posts.slug, slug), ne(posts.id, exceptId)) : eq(posts.slug, slug))
      .limit(1);
    return !!row;
  }

  async create(values: typeof posts.$inferInsert): Promise<PostRow> {
    const [row] = await this.db.insert(posts).values(values).returning();
    return row;
  }

  async update(id: string, values: Partial<typeof posts.$inferInsert>): Promise<void> {
    await this.db
      .update(posts)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(posts.id, id));
  }

  async saveTranslation(postId: string, locale: "en" | "ne", values: PostTranslationValues): Promise<void> {
    await this.db
      .insert(postTranslations)
      .values({ postId, locale, ...values })
      .onConflictDoUpdate({ target: [postTranslations.postId, postTranslations.locale], set: values });
  }

  async deleteTranslation(postId: string, locale: "en" | "ne"): Promise<void> {
    await this.db
      .delete(postTranslations)
      .where(and(eq(postTranslations.postId, postId), eq(postTranslations.locale, locale)));
  }
}
