import { z } from "zod";

import { TextSchema } from "../helpers/text.schema";
import {
  ListQuerySchema,
  paginationQueryShape,
  searchQueryShape,
} from "../list/list-query.schemas";
import { paisaSchema } from "../money/money.helper";
import { STOCK_ADJUSTMENT_REASONS, STOCK_MOVEMENT_TYPES } from "./constants";

const MAX_LINE_QUANTITY = 100_000;
const MAX_LINES = 200;

const quantitySchema = z
  .number({ error: "Enter a quantity" })
  .int("Use whole units")
  .positive("Quantity must be at least 1")
  .max(MAX_LINE_QUANTITY);

function uniqueVariants<T extends { variantId: string }>(lines: Array<T>, ctx: z.RefinementCtx) {
  const seen = new Set<string>();
  lines.forEach((line, index) => {
    if (seen.has(line.variantId)) {
      ctx.addIssue({
        code: "custom",
        path: [index, "variantId"],
        message: "This size is already on another line",
      });
    }
    seen.add(line.variantId);
  });
}

export const stockBatchInputSchema = z.object({
  receivedOn: z.iso.date("Choose the date it arrived"),
  supplierName: TextSchema.optional(120),
  notes: TextSchema.optional(1000),
  items: z
    .array(
      z.object({
        variantId: z.uuid("Choose a product size"),
        quantity: quantitySchema,
        unitCostPaisa: z.number({ error: "Enter a valid cost" }).pipe(paisaSchema).nullable(),
      }),
    )
    .min(1, "Add at least one line")
    .max(MAX_LINES)
    .superRefine(uniqueVariants),
});
export type StockBatchInput = z.input<typeof stockBatchInputSchema>;

export const stockBatchVoidSchema = z.object({
  reason: TextSchema.required(500, "Say why this batch is being voided"),
});
export type StockBatchVoidInput = z.input<typeof stockBatchVoidSchema>;

// An empty list is allowed: it clears a day that was recorded by mistake.
export const dailySaleInputSchema = z.object({
  notes: TextSchema.optional(1000),
  items: z
    .array(
      z.object({
        variantId: z.uuid("Choose a product size"),
        quantity: quantitySchema,
      }),
    )
    .max(MAX_LINES)
    .superRefine(uniqueVariants),
});
export type DailySaleInput = z.input<typeof dailySaleInputSchema>;

export const stockAdjustmentInputSchema = z
  .object({
    variantId: z.uuid("Choose a product size"),
    quantityDelta: z
      .number({ error: "Enter a quantity" })
      .int("Use whole units")
      .min(-MAX_LINE_QUANTITY)
      .max(MAX_LINE_QUANTITY)
      .refine((value) => value !== 0, "Enter a quantity other than 0"),
    reason: z.enum(STOCK_ADJUSTMENT_REASONS, "Choose a reason"),
    note: TextSchema.optional(500),
  })
  .superRefine((value, ctx) => {
    if (value.reason === "other" && !value.note) {
      ctx.addIssue({ code: "custom", path: ["note"], message: "Add a note when the reason is Other" });
    }
  });
export type StockAdjustmentInput = z.input<typeof stockAdjustmentInputSchema>;

export const BATCH_STATUSES = ["active", "voided"] as const;
export type BatchStatus = (typeof BATCH_STATUSES)[number];

export const stockBatchListQuerySchema = z.object({
  ...paginationQueryShape,
  ...searchQueryShape,
  ...ListQuerySchema.sort(["receivedOn", "batchNumber", "createdAt"] as const, "receivedOn"),
  status: ListQuerySchema.optionalEnum(BATCH_STATUSES),
  from: ListQuerySchema.optionalDate(),
  to: ListQuerySchema.optionalDate(),
});
export type StockBatchListQuery = z.output<typeof stockBatchListQuerySchema>;

export const dailySaleListQuerySchema = z.object({
  ...paginationQueryShape,
  ...ListQuerySchema.sort(["saleDate", "revenue", "units"] as const, "saleDate"),
  from: ListQuerySchema.optionalDate(),
  to: ListQuerySchema.optionalDate(),
});
export type DailySaleListQuery = z.output<typeof dailySaleListQuerySchema>;

export const stockAdjustmentListQuerySchema = z.object({
  ...paginationQueryShape,
  ...searchQueryShape,
  ...ListQuerySchema.sort(["createdAt", "quantityDelta"] as const, "createdAt"),
  reason: ListQuerySchema.optionalEnum(STOCK_ADJUSTMENT_REASONS),
  variantId: ListQuerySchema.optionalUuid(),
  from: ListQuerySchema.optionalDate(),
  to: ListQuerySchema.optionalDate(),
});
export type StockAdjustmentListQuery = z.output<typeof stockAdjustmentListQuerySchema>;

export const stockMovementListQuerySchema = z.object({
  ...paginationQueryShape,
  ...searchQueryShape,
  ...ListQuerySchema.sort(["createdAt", "quantityDelta"] as const, "createdAt"),
  type: ListQuerySchema.optionalEnum(STOCK_MOVEMENT_TYPES),
  variantId: ListQuerySchema.optionalUuid(),
  from: ListQuerySchema.optionalDate(),
  to: ListQuerySchema.optionalDate(),
});
export type StockMovementListQuery = z.output<typeof stockMovementListQuerySchema>;
