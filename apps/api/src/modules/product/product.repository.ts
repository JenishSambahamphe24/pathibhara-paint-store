import type { ProductListQuery, VariantSearchQuery } from "@repo/shared";
import type { SQL } from "drizzle-orm";

import { and, asc, desc, eq, exists, ilike, inArray, ne, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { injectable } from "tsyringe";

import {
  categories,
  files,
  productImages,
  products,
  productVariants,
  stockMovements,
  TransactionManager,
} from "@repo/database";
import { PaginationHelper } from "@repo/http-kit";

import { LikeHelper } from "#helpers/like.helper";

export type ProductRow = typeof products.$inferSelect;
export type VariantRow = typeof productVariants.$inferSelect;

const productCategory = alias(categories, "product_category");

@injectable()
export class ProductRepository {
  constructor(private readonly txManager: TransactionManager) {}

  private get db() {
    return this.txManager.current();
  }

  async list(query: ProductListQuery) {
    const variantStats = this.db
      .select({
        productId: productVariants.productId,
        variantCount: sql<number>`count(*)::int`.as("variant_count"),
        minPricePaisa: sql<number | null>`min(${productVariants.pricePaisa})`.as("min_price_paisa"),
        maxPricePaisa: sql<number | null>`max(${productVariants.pricePaisa})`.as("max_price_paisa"),
        totalStock: sql<number>`coalesce(sum(${productVariants.currentStock}), 0)::int`.as(
          "total_stock",
        ),
        lowStockCount:
          sql<number>`(count(*) FILTER (WHERE ${productVariants.isActive} AND ${productVariants.currentStock} <= ${productVariants.reorderLevel}))::int`.as(
            "low_stock_count",
          ),
      })
      .from(productVariants)
      .groupBy(productVariants.productId)
      .as("variant_stats");

    const cover = this.db
      .selectDistinctOn([productImages.productId], {
        productId: productImages.productId,
        fileId: productImages.fileId,
      })
      .from(productImages)
      .orderBy(productImages.productId, asc(productImages.sortOrder))
      .as("cover");

    const where = this.listWhere(query, variantStats.lowStockCount);
    const sortColumn = {
      name: products.name,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
      stock: sql`coalesce(${variantStats.totalStock}, 0)`,
    }[query.sortBy];
    const direction = query.sortOrder === "asc" ? asc : desc;

    const rows = await this.db
      .select({
        product: products,
        categoryName: productCategory.name,
        variantCount: sql<number>`coalesce(${variantStats.variantCount}, 0)`,
        minPricePaisa: variantStats.minPricePaisa,
        maxPricePaisa: variantStats.maxPricePaisa,
        totalStock: sql<number>`coalesce(${variantStats.totalStock}, 0)`,
        lowStockCount: sql<number>`coalesce(${variantStats.lowStockCount}, 0)`,
        coverFile: files,
      })
      .from(products)
      .leftJoin(variantStats, eq(variantStats.productId, products.id))
      .leftJoin(productCategory, eq(productCategory.id, products.categoryId))
      .leftJoin(cover, eq(cover.productId, products.id))
      .leftJoin(files, eq(files.id, cover.fileId))
      .where(where)
      .orderBy(direction(sortColumn), desc(products.id))
      .limit(query.perPage)
      .offset(PaginationHelper.offset(query.page, query.perPage));

    const [{ total }] = await this.db
      .select({ total: sql<number>`count(*)::int` })
      .from(products)
      .leftJoin(variantStats, eq(variantStats.productId, products.id))
      .where(where);

    return { rows, total };
  }

  private listWhere(query: ProductListQuery, lowStockCount: SQL.Aliased<number>): SQL | undefined {
    const conditions: Array<SQL | undefined> = [];

    if (query.search) {
      const term = LikeHelper.contains(query.search);
      conditions.push(
        or(
          ilike(products.name, term),
          ilike(products.slug, term),
          exists(
            this.db
              .select({ one: sql`1` })
              .from(productVariants)
              .where(
                and(eq(productVariants.productId, products.id), ilike(productVariants.sku, term)),
              ),
          ),
        ),
      );
    }
    if (query.categoryId) {
      // Filtering by a parent includes everything filed under its subtree.
      conditions.push(sql`${products.categoryId} IN (
        WITH RECURSIVE subtree AS (
          SELECT ${categories.id} AS id FROM ${categories} WHERE ${categories.id} = ${query.categoryId}
          UNION ALL
          SELECT c.id FROM ${categories} c JOIN subtree ON c.parent_id = subtree.id
        )
        SELECT id FROM subtree
      )`);
    }
    if (query.status) conditions.push(eq(products.isActive, query.status === "active"));
    if (query.lowStock) conditions.push(sql`coalesce(${lowStockCount}, 0) > 0`);

    return and(...conditions);
  }

  async findById(id: string): Promise<ProductRow | undefined> {
    const [row] = await this.db.select().from(products).where(eq(products.id, id)).limit(1);
    return row;
  }

  async lockById(id: string): Promise<ProductRow | undefined> {
    const [row] = await this.db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1)
      .for("update");
    return row;
  }

  async findVariants(productId: string): Promise<Array<VariantRow & { hasHistory: boolean }>> {
    // A join (not a correlated EXISTS) so Drizzle table-qualifies the columns;
    // an unqualified "id" inside a subquery would bind to the inner table.
    const history = this.db
      .selectDistinct({ variantId: stockMovements.variantId })
      .from(stockMovements)
      .innerJoin(productVariants, eq(productVariants.id, stockMovements.variantId))
      .where(eq(productVariants.productId, productId))
      .as("history");

    return this.db
      .select({
        ...this.variantColumns(),
        hasHistory: sql<boolean>`${history.variantId} IS NOT NULL`,
      })
      .from(productVariants)
      .leftJoin(history, eq(history.variantId, productVariants.id))
      .where(eq(productVariants.productId, productId))
      .orderBy(asc(productVariants.volumeMl));
  }

  async findImages(productId: string) {
    return this.db
      .select({ file: files })
      .from(productImages)
      .innerJoin(files, eq(files.id, productImages.fileId))
      .where(eq(productImages.productId, productId))
      .orderBy(asc(productImages.sortOrder));
  }

  async slugTaken(slug: string, exceptId?: string): Promise<boolean> {
    const [row] = await this.db
      .select({ id: products.id })
      .from(products)
      .where(
        exceptId
          ? and(eq(products.slug, slug), ne(products.id, exceptId))
          : eq(products.slug, slug),
      )
      .limit(1);
    return !!row;
  }

  async skusUsedElsewhere(skus: Array<string>, productId?: string) {
    if (skus.length === 0) return [];
    return this.db
      .select({ sku: productVariants.sku })
      .from(productVariants)
      .where(
        productId
          ? and(inArray(productVariants.sku, skus), ne(productVariants.productId, productId))
          : inArray(productVariants.sku, skus),
      );
  }

  async create(values: typeof products.$inferInsert): Promise<ProductRow> {
    const [row] = await this.db.insert(products).values(values).returning();
    return row;
  }

  async update(id: string, values: Partial<typeof products.$inferInsert>): Promise<void> {
    await this.db.update(products).set(values).where(eq(products.id, id));
  }

  // Always bump updated_at: changing only images or sizes is
  // still an edit to the product as the list and sitemap see it.
  async touch(id: string): Promise<void> {
    await this.db.update(products).set({ updatedAt: new Date() }).where(eq(products.id, id));
  }

  async replaceImages(productId: string, fileIds: Array<string>): Promise<void> {
    await this.db.delete(productImages).where(eq(productImages.productId, productId));
    if (fileIds.length === 0) return;
    await this.db
      .insert(productImages)
      .values(fileIds.map((fileId, sortOrder) => ({ productId, fileId, sortOrder })));
  }

  async insertVariant(values: typeof productVariants.$inferInsert): Promise<void> {
    await this.db.insert(productVariants).values(values);
  }

  async updateVariant(
    id: string,
    values: Partial<typeof productVariants.$inferInsert>,
  ): Promise<void> {
    await this.db.update(productVariants).set(values).where(eq(productVariants.id, id));
  }

  async deleteVariants(ids: Array<string>): Promise<void> {
    if (ids.length === 0) return;
    await this.db.delete(productVariants).where(inArray(productVariants.id, ids));
  }

  async searchVariants(query: VariantSearchQuery) {
    const conditions: Array<SQL | undefined> = [];
    if (!query.includeInactive) {
      conditions.push(eq(productVariants.isActive, true), eq(products.isActive, true));
    }
    if (query.search) {
      const term = LikeHelper.contains(query.search);
      conditions.push(or(ilike(products.name, term), ilike(productVariants.sku, term)));
    }
    const where = and(...conditions);

    const rows = await this.db
      .select({
        variant: this.variantColumns(),
        productName: products.name,
        productSlug: products.slug,
        productIsActive: products.isActive,
      })
      .from(productVariants)
      .innerJoin(products, eq(products.id, productVariants.productId))
      .where(where)
      .orderBy(asc(products.name), asc(productVariants.volumeMl))
      .limit(query.perPage)
      .offset(PaginationHelper.offset(query.page, query.perPage));
    const [{ total }] = await this.db
      .select({ total: sql<number>`count(*)::int` })
      .from(productVariants)
      .innerJoin(products, eq(products.id, productVariants.productId))
      .where(where);
    return { rows, total };
  }

  async findVariantSummaries(variantIds: Array<string>) {
    if (variantIds.length === 0) return [];
    return this.db
      .select({
        variant: this.variantColumns(),
        productName: products.name,
        productSlug: products.slug,
        productIsActive: products.isActive,
      })
      .from(productVariants)
      .innerJoin(products, eq(products.id, productVariants.productId))
      .where(inArray(productVariants.id, variantIds));
  }

  private variantColumns() {
    return {
      id: productVariants.id,
      productId: productVariants.productId,
      volumeMl: productVariants.volumeMl,
      pricePaisa: productVariants.pricePaisa,
      sku: productVariants.sku,
      reorderLevel: productVariants.reorderLevel,
      currentStock: productVariants.currentStock,
      isActive: productVariants.isActive,
      createdAt: productVariants.createdAt,
      updatedAt: productVariants.updatedAt,
    };
  }
}
