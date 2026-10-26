import type { SlugEntityType } from "@repo/shared";

import { and, eq } from "drizzle-orm";
import { injectable } from "tsyringe";

import { slugRedirects, TransactionManager } from "@repo/database";

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
}
