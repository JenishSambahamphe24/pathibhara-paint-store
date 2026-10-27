import { dashboardQuerySchema, DASHBOARD_RANGES } from "@repo/shared";
import { BaseDto, z } from "@repo/http-kit";

export class DashboardQueryDto extends BaseDto {
  static override readonly schema = dashboardQuerySchema;
}

const variantRefShape = {
  variantId: z.uuid(),
  productId: z.uuid(),
  productName: z.string(),
  volumeMl: z.number().int(),
};

export class DashboardDto extends BaseDto {
  static override readonly schema = z.object({
    range: z.enum(DASHBOARD_RANGES),
    today: z.iso.date(),
    from: z.iso.date(),
    to: z.iso.date(),
    sales: z.object({
      revenuePaisa: z.number().int(),
      units: z.number().int(),
      previousRevenuePaisa: z.number().int(),
      previousUnits: z.number().int(),
      todayRevenuePaisa: z.number().int(),
      todayUnits: z.number().int(),
      todayRecorded: z.boolean(),
    }),
    stock: z.object({
      lowStockCount: z.number().int(),
      outOfStockCount: z.number().int(),
      valuePaisa: z.number().int(),
    }),
    salesByDay: z.array(z.object({ date: z.iso.date(), revenuePaisa: z.number().int(), units: z.number().int() })),
    topSellers: z.array(z.object({ ...variantRefShape, units: z.number().int(), revenuePaisa: z.number().int() })),
    lowStock: z.array(
      z.object({
        ...variantRefShape,
        sku: z.string(),
        currentStock: z.number().int(),
        reorderLevel: z.number().int(),
      }),
    ),
    slowMovers: z.array(
      z.object({
        ...variantRefShape,
        currentStock: z.number().int(),
        stockValuePaisa: z.number().int(),
        lastSoldOn: z.iso.date().nullable(),
      }),
    ),
  });
}
