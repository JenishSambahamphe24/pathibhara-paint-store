import type { SlugEntityType } from "@repo/shared";

import { asc, sql } from "drizzle-orm";
import { injectable } from "tsyringe";

import { categories, colourSets, posts, products, TransactionManager } from "@repo/database";

import { PublicVisibilityHelper } from "#helpers/public-visibility.helper";

@injectable()
export class SitemapRepository {
  constructor(private readonly txManager: TransactionManager) {}

  private get db() {
    return this.txManager.current();
  }

  async findEntries() {
    const kind = (value: SlugEntityType) => sql<SlugEntityType>`${value}::text`.as("kind");

    const union = this.db
      .select({ kind: kind("category"), slug: categories.slug, updatedAt: categories.updatedAt })
      .from(categories)
      .where(PublicVisibilityHelper.category())
      .unionAll(
        this.db
          .select({ kind: kind("product"), slug: products.slug, updatedAt: products.updatedAt })
          .from(products)
          .where(PublicVisibilityHelper.product()),
      )
      .unionAll(
        this.db
          .select({ kind: kind("post"), slug: posts.slug, updatedAt: posts.updatedAt })
          .from(posts)
          .where(PublicVisibilityHelper.post()),
      )
      .unionAll(
        this.db
          .select({
            kind: kind("colourSet"),
            slug: colourSets.slug,
            updatedAt: colourSets.updatedAt,
          })
          .from(colourSets)
          .where(PublicVisibilityHelper.colourSet()),
      );
    return union.orderBy(asc(sql`kind`), asc(sql`slug`));
  }
}
