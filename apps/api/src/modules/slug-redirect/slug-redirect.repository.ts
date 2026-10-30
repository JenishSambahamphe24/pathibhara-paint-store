import type { SlugEntityType } from "@repo/shared";

import { and, eq } from "drizzle-orm";
import { injectable } from "tsyringe";

import {
  categories,
  colourSets,
  posts,
  products,
  slugRedirects,
  TransactionManager,
} from "@repo/database";

import { PublicVisibilityHelper } from "#helpers/public-visibility.helper";

@injectable()
export class SlugRedirectRepository {
  constructor(private readonly txManager: TransactionManager) {}

  private get db() {
    return this.txManager.current();
  }

  // Records `oldSlug` and frees `newSlug` if it was itself an old slug of
  // something, so the live URL always wins over a redirect.
  async recordChange(
    entityType: SlugEntityType,
    entityId: string,
    oldSlug: string,
    newSlug: string,
  ) {
    await this.db
      .delete(slugRedirects)
      .where(and(eq(slugRedirects.entityType, entityType), eq(slugRedirects.oldSlug, newSlug)));
    await this.db
      .insert(slugRedirects)
      .values({ entityType, entityId, oldSlug })
      .onConflictDoUpdate({
        target: [slugRedirects.entityType, slugRedirects.oldSlug],
        set: { entityId },
      });
  }

  // The current slug an old one now points at, only while that entity is
  // public; a redirect to a hidden page would just 404 one hop later.
  async findPublicTarget(entityType: SlugEntityType, oldSlug: string): Promise<string | undefined> {
    const [redirect] = await this.db
      .select({ entityId: slugRedirects.entityId })
      .from(slugRedirects)
      .where(and(eq(slugRedirects.entityType, entityType), eq(slugRedirects.oldSlug, oldSlug)))
      .limit(1);
    if (!redirect) return undefined;

    const [row] = await this.publicSlugQuery(entityType, redirect.entityId).limit(1);
    return row?.slug;
  }

  private publicSlugQuery(entityType: SlugEntityType, id: string) {
    switch (entityType) {
      case "category":
        return this.db
          .select({ slug: categories.slug })
          .from(categories)
          .where(and(eq(categories.id, id), PublicVisibilityHelper.category()));
      case "product":
        return this.db
          .select({ slug: products.slug })
          .from(products)
          .where(and(eq(products.id, id), PublicVisibilityHelper.product()));
      case "post":
        return this.db
          .select({ slug: posts.slug })
          .from(posts)
          .where(and(eq(posts.id, id), PublicVisibilityHelper.post()));
      case "colourSet":
        return this.db
          .select({ slug: colourSets.slug })
          .from(colourSets)
          .where(and(eq(colourSets.id, id), PublicVisibilityHelper.colourSet()));
    }
  }
}
