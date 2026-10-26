import { sql } from "drizzle-orm";
import {
  bigint,
  check,
  date,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { admins } from "./admin.schema";
import { primaryId, timestamps } from "./columns";
import { productVariants } from "./product-variant.schema";

export const stockBatches = pgTable(
  "stock_batches",
  {
    id: primaryId(),
    // Human-facing "Batch-1", "Batch-2"...; never reused, even after a void.
    batchNumber: integer("batch_number").notNull().unique().generatedAlwaysAsIdentity(),
    receivedOn: date("received_on", { mode: "string" }).notNull(),
    supplierName: text("supplier_name"),
    notes: text("notes"),
    // A mistaken batch is voided (its stock reversed through the ledger),
    // never deleted.
    voidedAt: timestamp("voided_at", { withTimezone: true }),
    voidedBy: uuid("voided_by").references(() => admins.id, { onDelete: "restrict" }),
    voidReason: text("void_reason"),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => admins.id, { onDelete: "restrict" }),
    ...timestamps,
  },
  (table) => [
    index("stock_batches_received_on_idx").on(table.receivedOn.desc()),
    check(
      "stock_batches_void_complete",
      sql`(${table.voidedAt} IS NULL) = (${table.voidedBy} IS NULL)`,
    ),
  ],
);

export const stockBatchItems = pgTable(
  "stock_batch_items",
  {
    id: primaryId(),
    batchId: uuid("batch_id")
      .notNull()
      .references(() => stockBatches.id, { onDelete: "restrict" }),
    variantId: uuid("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "restrict" }),
    quantity: integer("quantity").notNull(),
    unitCostPaisa: bigint("unit_cost_paisa", { mode: "number" }),
  },
  (table) => [
    uniqueIndex("stock_batch_items_batch_variant_uq").on(table.batchId, table.variantId),
    index("stock_batch_items_variant_idx").on(table.variantId),
    check("stock_batch_items_quantity_positive", sql`${table.quantity} > 0`),
    check(
      "stock_batch_items_cost_non_negative",
      sql`${table.unitCostPaisa} IS NULL OR ${table.unitCostPaisa} >= 0`,
    ),
  ],
);
