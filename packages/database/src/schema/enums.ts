import { pgEnum } from "drizzle-orm/pg-core";

import {
  ADMIN_STATUSES,
  FILE_PROVIDERS,
  LOCALES,
  POST_STATUSES,
  SLUG_ENTITY_TYPES,
  STOCK_ADJUSTMENT_REASONS,
  STOCK_MOVEMENT_TYPES,
} from "@repo/shared";

export const adminStatusEnum = pgEnum("admin_status", ADMIN_STATUSES);
export const localeEnum = pgEnum("locale", LOCALES);
export const fileProviderEnum = pgEnum("file_provider", FILE_PROVIDERS);
export const stockMovementTypeEnum = pgEnum("stock_movement_type", STOCK_MOVEMENT_TYPES);
export const stockAdjustmentReasonEnum = pgEnum("stock_adjustment_reason", STOCK_ADJUSTMENT_REASONS);
export const postStatusEnum = pgEnum("post_status", POST_STATUSES);
export const slugEntityTypeEnum = pgEnum("slug_entity_type", SLUG_ENTITY_TYPES);
