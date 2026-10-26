import type { ContentTranslations } from "@repo/shared";

import { and, asc, eq, inArray, ne, sql } from "drizzle-orm";
import { injectable } from "tsyringe";

import { categories, categoryTranslations, products, TransactionManager } from "@repo/database";

export type CategoryRow = typeof categories.$inferSelect;

@injectable()
export class CategoryRepository {
  constructor(private readonly txManager: TransactionManager) {}

  private get db() {
    return this.txManager.current();
  }

  async findAll() {
    const productCounts = this.db
      .select({
        categoryId: products.categoryId,
        count: sql<number>`count(*)::int`.as("count"),
      })
      .from(products)
      .groupBy(products.categoryId)
      .as("product_counts");

    return this.db
      .select({
        category: categories,
        productCount: sql<number>`coalesce(${productCounts.count}, 0)`,
      })
      .from(categories)
      .leftJoin(productCounts, eq(productCounts.categoryId, categories.id))
      .orderBy(asc(categories.sortOrder), asc(categories.createdAt));
  }

  async findTranslations(categoryIds: Array<string>) {
    if (categoryIds.length === 0) return [];
    return this.db
      .select()
      .from(categoryTranslations)
      .where(inArray(categoryTranslations.categoryId, categoryIds));
  }

  async findById(id: string): Promise<CategoryRow | undefined> {
    const [row] = await this.db.select().from(categories).where(eq(categories.id, id)).limit(1);
    return row;
  }

  async lockById(id: string): Promise<CategoryRow | undefined> {
    const [row] = await this.db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1)
      .for("update");
    return row;
  }

  async slugTaken(slug: string, exceptId?: string): Promise<boolean> {
    const [row] = await this.db
      .select({ id: categories.id })
      .from(categories)
      .where(
        exceptId
          ? and(eq(categories.slug, slug), ne(categories.id, exceptId))
          : eq(categories.slug, slug),
      )
      .limit(1);
    return !!row;
  }

  async nextSortOrder(parentId: string | null): Promise<number> {
    const [row] = await this.db
      .select({ next: sql<number>`coalesce(max(${categories.sortOrder}) + 1, 0)::int` })
      .from(categories)
      .where(parentId ? eq(categories.parentId, parentId) : sql`${categories.parentId} IS NULL`);
    return row.next;
  }

  async childIds(parentId: string | null): Promise<Array<string>> {
    const rows = await this.db
      .select({ id: categories.id })
      .from(categories)
      .where(parentId ? eq(categories.parentId, parentId) : sql`${categories.parentId} IS NULL`);
    return rows.map((r) => r.id);
  }

  async parentIdOf(id: string): Promise<string | null | undefined> {
    const [row] = await this.db
      .select({ parentId: categories.parentId })
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);
    return row ? row.parentId : undefined;
  }

  async countProducts(id: string): Promise<number> {
    const [row] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(products)
      .where(eq(products.categoryId, id));
    return row.count;
  }

  async create(values: typeof categories.$inferInsert): Promise<CategoryRow> {
    const [row] = await this.db.insert(categories).values(values).returning();
    return row;
  }

  async update(id: string, values: Partial<typeof categories.$inferInsert>): Promise<CategoryRow> {
    const [row] = await this.db
      .update(categories)
      .set(values)
      .where(eq(categories.id, id))
      .returning();
    return row;
  }

  async setSortOrders(orderedIds: Array<string>): Promise<void> {
    for (const [sortOrder, id] of orderedIds.entries()) {
      await this.db.update(categories).set({ sortOrder }).where(eq(categories.id, id));
    }
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(categories).where(eq(categories.id, id));
  }

  async saveTranslations(categoryId: string, translations: ContentTranslations): Promise<void> {
    await this.db
      .insert(categoryTranslations)
      .values({ categoryId, locale: "en", ...translations.en })
      .onConflictDoUpdate({
        target: [categoryTranslations.categoryId, categoryTranslations.locale],
        set: translations.en,
      });

    if (translations.ne.name) {
      const ne = { ...translations.ne, name: translations.ne.name };
      await this.db
        .insert(categoryTranslations)
        .values({ categoryId, locale: "ne", ...ne })
        .onConflictDoUpdate({
          target: [categoryTranslations.categoryId, categoryTranslations.locale],
          set: ne,
        });
    } else {
      await this.db
        .delete(categoryTranslations)
        .where(
          and(
            eq(categoryTranslations.categoryId, categoryId),
            eq(categoryTranslations.locale, "ne"),
          ),
        );
    }
  }
}
