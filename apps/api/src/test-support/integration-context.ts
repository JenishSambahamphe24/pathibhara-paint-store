import { sql } from "drizzle-orm";

import {
  admins,
  categories,
  categoryTranslations,
  DatabaseService,
  products,
  productTranslations,
  productVariants,
  TransactionManager,
} from "@repo/database";
import { I18nService } from "@repo/http-kit";

import translationEn from "../i18n/en/translation.json";
import { ProductRepository } from "../modules/product/product.repository";
import { DailySaleRepository } from "../modules/stock/daily-sale.repository";
import { DailySaleService } from "../modules/stock/daily-sale.service";
import { StockAdjustmentRepository } from "../modules/stock/stock-adjustment.repository";
import { StockAdjustmentService } from "../modules/stock/stock-adjustment.service";
import { StockBatchRepository } from "../modules/stock/stock-batch.repository";
import { StockBatchService } from "../modules/stock/stock-batch.service";
import { StockLedgerRepository } from "../modules/stock/stock-ledger.repository";
import { StockLedgerService } from "../modules/stock/stock-ledger.service";
import { StockLineValidator } from "../modules/stock/stock-line.validator";

export interface IStockFixture {
  adminId: string;
  productId: string;
  litre: string;
  fourLitre: string;
}

// Real services over the test database, wired by hand (Vitest's compiler
// doesn't emit the decorator metadata tsyringe would need).
export class IntegrationContext {
  readonly databaseService = new DatabaseService();
  readonly txManager = new TransactionManager(this.databaseService);
  readonly i18n = new I18nService();

  readonly ledger = new StockLedgerService(
    this.txManager,
    new StockLedgerRepository(this.txManager),
  );
  private readonly lineValidator = new StockLineValidator(new ProductRepository(this.txManager));

  readonly batches = new StockBatchService(
    this.txManager,
    new StockBatchRepository(this.txManager),
    this.ledger,
    this.lineValidator,
    this.i18n,
  );
  readonly sales = new DailySaleService(
    this.txManager,
    new DailySaleRepository(this.txManager),
    this.ledger,
    this.lineValidator,
    this.i18n,
  );
  readonly adjustments = new StockAdjustmentService(
    this.txManager,
    new StockAdjustmentRepository(this.txManager),
    this.ledger,
    this.lineValidator,
    this.i18n,
  );

  static isConfigured(): boolean {
    return !!process.env.TEST_DATABASE_URL;
  }

  async connect(): Promise<void> {
    await this.databaseService.connect(process.env.TEST_DATABASE_URL!, { poolMax: 5 });
    await this.i18n.init({ resources: { en: { translation: translationEn } } });
  }

  async disconnect(): Promise<void> {
    await this.databaseService.disconnect();
  }

  get db() {
    return this.databaseService.db;
  }

  async reset(): Promise<void> {
    await this.db.execute(sql`TRUNCATE
      stock_movements, stock_adjustments, daily_sale_items, daily_sales,
      stock_batch_items, stock_batches, product_variants, product_images,
      product_translations, products, category_translations, categories,
      sessions, admins RESTART IDENTITY CASCADE`);
  }

  async seedStockFixture(): Promise<IStockFixture> {
    const [admin] = await this.db
      .insert(admins)
      .values({ email: "test@example.com", name: "Tester", passwordHash: "x" })
      .returning();
    const [category] = await this.db.insert(categories).values({ slug: "test" }).returning();
    await this.db
      .insert(categoryTranslations)
      .values({ categoryId: category.id, locale: "en", name: "Test" });
    const [product] = await this.db
      .insert(products)
      .values({ categoryId: category.id, slug: "paint", coverageSqftPerLitre: 20 })
      .returning();
    await this.db
      .insert(productTranslations)
      .values({ productId: product.id, locale: "en", name: "Paint" });
    const [litre, fourLitre] = await this.db
      .insert(productVariants)
      .values([
        { productId: product.id, volumeMl: 1000, pricePaisa: 45000, sku: "P-1" },
        { productId: product.id, volumeMl: 4000, pricePaisa: 165000, sku: "P-4" },
      ])
      .returning();
    return { adminId: admin.id, productId: product.id, litre: litre.id, fourLitre: fourLitre.id };
  }

  async stockOf(variantId: string): Promise<number> {
    const result = await this.db.execute<{ current_stock: number }>(
      sql`SELECT current_stock FROM product_variants WHERE id = ${variantId}`,
    );
    return result.rows[0].current_stock;
  }

  // The ledger invariant: every variant's cached stock equals the sum of its
  // movements, and the latest movement's balance agrees with it.
  async ledgerMismatches(): Promise<number> {
    const result = await this.db.execute<{ mismatches: number }>(sql`
      SELECT count(*)::int AS mismatches
      FROM product_variants v
      LEFT JOIN (
        SELECT variant_id, sum(quantity_delta) AS total FROM stock_movements GROUP BY variant_id
      ) m ON m.variant_id = v.id
      LEFT JOIN LATERAL (
        SELECT balance_after FROM stock_movements
        WHERE variant_id = v.id ORDER BY created_at DESC, id DESC LIMIT 1
      ) last ON true
      WHERE v.current_stock <> coalesce(m.total, 0)
         OR v.current_stock <> coalesce(last.balance_after, 0)`);
    return result.rows[0].mismatches;
  }

  async movementTypes(
    variantId: string,
  ): Promise<Array<{ type: string; delta: number; balance: number }>> {
    const result = await this.db.execute<{
      type: string;
      quantity_delta: number;
      balance_after: number;
    }>(sql`
      SELECT type, quantity_delta, balance_after FROM stock_movements
      WHERE variant_id = ${variantId} ORDER BY created_at, id`);
    return result.rows.map((row) => ({
      type: row.type,
      delta: row.quantity_delta,
      balance: row.balance_after,
    }));
  }
}
