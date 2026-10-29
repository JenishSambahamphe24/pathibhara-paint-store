import { eq, inArray } from "drizzle-orm";
import { injectable } from "tsyringe";

import { products, productVariants, storeSettings, TransactionManager } from "@repo/database";

@injectable()
export class CalculatorRepository {
  constructor(private readonly txManager: TransactionManager) {}

  private get db() {
    return this.txManager.current();
  }

  async findProducts(ids: Array<string>) {
    if (ids.length === 0) return [];
    return this.db
      .select({
        id: products.id,
        name: products.name,
        coverageSqftPerLitre: products.coverageSqftPerLitre,
        variantId: productVariants.id,
        volumeMl: productVariants.volumeMl,
        pricePaisa: productVariants.pricePaisa,
        isActive: productVariants.isActive,
        currentStock: productVariants.currentStock,
      })
      .from(products)
      .leftJoin(productVariants, eq(productVariants.productId, products.id))
      .where(inArray(products.id, ids));
  }

  async defaultWastageBps(): Promise<number> {
    const [row] = await this.db
      .select({ bps: storeSettings.defaultWastageBps })
      .from(storeSettings)
      .where(eq(storeSettings.id, 1))
      .limit(1);
    return row?.bps ?? 1000;
  }
}
