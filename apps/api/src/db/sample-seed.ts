import type { ISampleLine } from "./sample-data";
import type { Db, DbTransaction } from "@repo/database";
import type { StockMovementType } from "@repo/shared";

import { asc, eq, sql } from "drizzle-orm";

import {
  admins,
  categories,
  colourSets,
  dailySaleItems,
  dailySales,
  products,
  productVariants,
  shades,
  stockAdjustments,
  stockBatches,
  stockBatchItems,
  stockMovements,
} from "@repo/database";
import { PAISA_PER_RUPEE } from "@repo/shared";

import {
  SAMPLE_ADJUSTMENT,
  SAMPLE_BATCHES,
  SAMPLE_CATEGORIES,
  SAMPLE_COLOUR_SETS,
  SAMPLE_NOTE,
  SAMPLE_PRODUCTS,
  SAMPLE_SALES,
  SAMPLE_SHADES,
} from "./sample-data";

interface IMovementRefs {
  batchId?: string;
  dailySaleId?: string;
  adjustmentId?: string;
}

export class SampleSeed {
  static async run(db: Db): Promise<void> {
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(categories);
    if (count > 0) {
      console.warn("Catalogue is not empty; skipping sample data.");
      return;
    }

    const [admin] = await db
      .select({ id: admins.id })
      .from(admins)
      .orderBy(asc(admins.createdAt))
      .limit(1);
    if (!admin) throw new Error("No admin found. Run `pnpm db:seed` first.");

    await db.transaction(async (tx) => {
      const categoryIds = await SampleSeed.categories(tx);
      const variantIds = await SampleSeed.products(tx, categoryIds);
      await SampleSeed.stock(tx, variantIds, admin.id);
      await SampleSeed.visualizer(tx);
    });
    console.warn("Inserted sample catalogue, stock, sales, shades and colour sets.");
  }

  private static async categories(tx: DbTransaction): Promise<Map<string, string>> {
    const ids = new Map<string, string>();
    for (const [sortOrder, category] of SAMPLE_CATEGORIES.entries()) {
      const [row] = await tx
        .insert(categories)
        .values({
          slug: category.slug,
          name: category.name,
          description: SAMPLE_NOTE,
          parentId: category.parentKey ? ids.get(category.parentKey) : null,
          sortOrder,
        })
        .returning({ id: categories.id });
      ids.set(category.key, row.id);
    }
    return ids;
  }

  // Keyed "productKey:volumeMl".
  private static async products(
    tx: DbTransaction,
    categoryIds: Map<string, string>,
  ): Promise<Map<string, { id: string; pricePaisa: number }>> {
    const variants = new Map<string, { id: string; pricePaisa: number }>();
    for (const product of SAMPLE_PRODUCTS) {
      const [row] = await tx
        .insert(products)
        .values({
          categoryId: categoryIds.get(product.categoryKey)!,
          slug: product.slug,
          name: product.name,
          description: SAMPLE_NOTE,
          coverageSqftPerLitre: product.coverageSqftPerLitre,
          defaultCoats: product.defaultCoats,
        })
        .returning({ id: products.id });
      for (const variant of product.variants) {
        const pricePaisa = variant.priceRupees * PAISA_PER_RUPEE;
        const [variantRow] = await tx
          .insert(productVariants)
          .values({
            productId: row.id,
            volumeMl: variant.volumeMl,
            pricePaisa,
            sku: `SMP-${product.slug}-${variant.volumeMl}ml`.toUpperCase(),
            reorderLevel: variant.reorderLevel,
          })
          .returning({ id: productVariants.id });
        variants.set(`${product.key}:${variant.volumeMl}`, { id: variantRow.id, pricePaisa });
      }
    }
    return variants;
  }

  private static async stock(
    tx: DbTransaction,
    variants: Map<string, { id: string; pricePaisa: number }>,
    adminId: string,
  ): Promise<void> {
    const variantFor = (line: Pick<ISampleLine, "productKey" | "volumeMl">) => {
      const variant = variants.get(`${line.productKey}:${line.volumeMl}`);
      if (!variant) throw new Error(`Unknown sample variant ${line.productKey} ${line.volumeMl}ml`);
      return variant;
    };

    for (const batch of SAMPLE_BATCHES) {
      const [batchRow] = await tx
        .insert(stockBatches)
        .values({
          receivedOn: batch.receivedOn,
          supplierName: batch.supplierName,
          notes: SAMPLE_NOTE,
          createdBy: adminId,
        })
        .returning({ id: stockBatches.id });
      for (const item of batch.items) {
        const variant = variantFor(item);
        await tx.insert(stockBatchItems).values({
          batchId: batchRow.id,
          variantId: variant.id,
          quantity: item.quantity,
          unitCostPaisa: item.unitCostRupees ? item.unitCostRupees * PAISA_PER_RUPEE : null,
        });
        await SampleSeed.move(
          tx,
          variant.id,
          "batchIn",
          item.quantity,
          { batchId: batchRow.id },
          adminId,
        );
      }
    }

    for (const sale of SAMPLE_SALES) {
      const [saleRow] = await tx
        .insert(dailySales)
        .values({
          saleDate: sale.saleDate,
          notes: SAMPLE_NOTE,
          createdBy: adminId,
          updatedBy: adminId,
        })
        .returning({ id: dailySales.id });
      for (const item of sale.items) {
        const variant = variantFor(item);
        await tx.insert(dailySaleItems).values({
          dailySaleId: saleRow.id,
          variantId: variant.id,
          quantity: item.quantity,
          unitPricePaisa: variant.pricePaisa,
        });
        await SampleSeed.move(
          tx,
          variant.id,
          "sale",
          -item.quantity,
          { dailySaleId: saleRow.id },
          adminId,
        );
      }
    }

    const variant = variantFor(SAMPLE_ADJUSTMENT);
    const [adjustment] = await tx
      .insert(stockAdjustments)
      .values({
        variantId: variant.id,
        quantityDelta: SAMPLE_ADJUSTMENT.quantityDelta,
        reason: SAMPLE_ADJUSTMENT.reason,
        note: SAMPLE_ADJUSTMENT.note,
        createdBy: adminId,
      })
      .returning({ id: stockAdjustments.id });
    await SampleSeed.move(
      tx,
      variant.id,
      "adjustment",
      SAMPLE_ADJUSTMENT.quantityDelta,
      { adjustmentId: adjustment.id },
      adminId,
    );
  }

  // Same shape as the real ledger write: the cached stock and the movement
  // row change together, and the balance comes from the updated row.
  private static async move(
    tx: DbTransaction,
    variantId: string,
    type: StockMovementType,
    quantityDelta: number,
    refs: IMovementRefs,
    adminId: string,
  ): Promise<void> {
    const [updated] = await tx
      .update(productVariants)
      .set({ currentStock: sql`${productVariants.currentStock} + ${quantityDelta}` })
      .where(eq(productVariants.id, variantId))
      .returning({ currentStock: productVariants.currentStock });
    await tx.insert(stockMovements).values({
      variantId,
      type,
      quantityDelta,
      balanceAfter: updated.currentStock,
      createdBy: adminId,
      ...refs,
    });
  }

  private static async visualizer(tx: DbTransaction): Promise<void> {
    const productIds = new Map(
      (await tx.select({ id: products.id, slug: products.slug }).from(products)).map((p) => [
        p.slug,
        p.id,
      ]),
    );
    const shadeIds = new Map<string, string>();
    for (const [sortOrder, shade] of SAMPLE_SHADES.entries()) {
      const product = SAMPLE_PRODUCTS.find((p) => p.key === shade.productKey);
      const [row] = await tx
        .insert(shades)
        .values({
          code: shade.code,
          name: shade.name,
          hex: shade.hex,
          sortOrder,
          productId: product ? productIds.get(product.slug) : null,
        })
        .returning({ id: shades.id });
      shadeIds.set(shade.key, row.id);
    }

    for (const [sortOrder, set] of SAMPLE_COLOUR_SETS.entries()) {
      await tx.insert(colourSets).values({
        slug: set.slug,
        name: set.name,
        description: set.description,
        sortOrder,
        mainSurfaceShadeId: shadeIds.get(set.mainSurface)!,
        columnsShadeId: shadeIds.get(set.columns)!,
        doorsWindowsShadeId: shadeIds.get(set.doorsWindows)!,
        roofEdgeShadeId: shadeIds.get(set.roofEdge)!,
      });
    }
  }
}
