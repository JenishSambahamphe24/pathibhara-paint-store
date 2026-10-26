import { alias } from "drizzle-orm/pg-core";

import { admins, productTranslations } from "@repo/database";

// Shared aliases so every stock query names the product and the acting admin
// the same way.
export const variantProductName = alias(productTranslations, "variant_product_name");
export const createdByAdmin = alias(admins, "created_by_admin");
export const updatedByAdmin = alias(admins, "updated_by_admin");
export const voidedByAdmin = alias(admins, "voided_by_admin");
