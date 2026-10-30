import type { SQL } from "drizzle-orm";

import { eq, sql } from "drizzle-orm";

import { categories, colourSets, posts, products } from "@repo/database";

// The single definition of "the customer site may show this". Every /public
// query filters through here so a rule can't drift between the list, the
// detail page, the sitemap and the redirect lookup.
export class PublicVisibilityHelper {
  // Deactivating a category hides its whole subtree, so a category is visible
  // only when it and every ancestor are active.
  static visibleCategoryIds(): SQL {
    return sql`(
      WITH RECURSIVE visible AS (
        SELECT ${categories.id} AS id FROM ${categories}
        WHERE ${categories.parentId} IS NULL AND ${categories.isActive}
        UNION ALL
        SELECT c.id FROM ${categories} c JOIN visible ON c.parent_id = visible.id
        WHERE c.is_active
      )
      SELECT id FROM visible
    )`;
  }

  static category(): SQL {
    return sql`${categories.id} IN ${PublicVisibilityHelper.visibleCategoryIds()}`;
  }

  // A product in a hidden category is hidden too: its page would have no
  // breadcrumb to hang from.
  static product(): SQL {
    return sql`(${products.isActive} AND ${products.categoryId} IN ${PublicVisibilityHelper.visibleCategoryIds()})`;
  }

  // A future published_at is a scheduled post.
  static post(): SQL {
    return sql`(${posts.status} = 'published' AND ${posts.publishedAt} <= now())`;
  }

  static colourSet(): SQL {
    return eq(colourSets.isActive, true);
  }
}
