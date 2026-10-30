import type { StorageService } from "../storage/storage.service";

import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import {
  admins,
  categories,
  colourSets,
  files,
  posts,
  productImages,
  products,
  productVariants,
  shades,
  slugRedirects,
} from "@repo/database";
import { LoggerService, NotFoundException, ValidationException } from "@repo/http-kit";
import {
  costEstimateInputSchema,
  publicColourSetListQuerySchema,
  publicPostListQuerySchema,
  publicProductListQuerySchema,
  publicShadeListQuerySchema,
} from "@repo/shared";

import { IntegrationContext } from "../../test-support/integration-context";
import { CalculatorRepository } from "../calculator/calculator.repository";
import { CalculatorService } from "../calculator/calculator.service";
import { CategoryRepository } from "../category/category.repository";
import { PublicCategoryService } from "../category/public-category.service";
import { ColourSetRepository } from "../colour-set/colour-set.repository";
import { PublicColourSetService } from "../colour-set/public-colour-set.service";
import { FileRepository } from "../file/file.repository";
import { FileService } from "../file/file.service";
import { PostRepository } from "../post/post.repository";
import { PublicPostService } from "../post/public-post.service";
import { ProductRepository } from "../product/product.repository";
import { PublicProductService } from "../product/public-product.service";
import { PublicShadeService } from "../shade/public-shade.service";
import { ShadeRepository } from "../shade/shade.repository";
import { PublicRedirectService } from "../slug-redirect/public-redirect.service";
import { SlugRedirectRepository } from "../slug-redirect/slug-redirect.repository";
import { SitemapRepository } from "./sitemap.repository";
import { SitemapService } from "./sitemap.service";

const ctx = new IntegrationContext();
const tx = ctx.txManager;

const storage = { getUrl: (key: string) => `/uploads/${key}` } as unknown as StorageService;
const fileService = new FileService(new FileRepository(tx), storage, new LoggerService());
const productRepository = new ProductRepository(tx);
const shadeRepository = new ShadeRepository(tx);
const categoryService = new PublicCategoryService(new CategoryRepository(tx), fileService);
const productService = new PublicProductService(
  productRepository,
  shadeRepository,
  categoryService,
  fileService,
);
const shadeService = new PublicShadeService(shadeRepository, productRepository);
const colourSetService = new PublicColourSetService(new ColourSetRepository(tx), shadeRepository);
const postService = new PublicPostService(new PostRepository(tx), fileService);
const redirectService = new PublicRedirectService(new SlugRedirectRepository(tx));
const sitemapService = new SitemapService(new SitemapRepository(tx));
const calculatorService = new CalculatorService(new CalculatorRepository(tx));

const DAY_MS = 24 * 60 * 60 * 1000;

interface IFixture {
  visibleProductId: string;
  hiddenTreeProductId: string;
  inactiveProductId: string;
}

// Catalogue:
//   interior (active) > emulsion (active) > Silk (active), Old (inactive)
//   exterior (inactive) > weather (active) > Shield (active, hidden by tree)
async function seed(): Promise<IFixture> {
  const db = ctx.db;
  const [admin] = await db
    .insert(admins)
    .values({ email: "a@example.com", name: "Admin", passwordHash: "x" })
    .returning();
  const [interior, exterior] = await db
    .insert(categories)
    .values([
      { slug: "interior", name: "Interior", sortOrder: 0 },
      { slug: "exterior", name: "Exterior", sortOrder: 1, isActive: false },
    ])
    .returning();
  const [emulsion, weather] = await db
    .insert(categories)
    .values([
      { slug: "emulsion", name: "Emulsion", parentId: interior.id },
      { slug: "weather", name: "Weather", parentId: exterior.id },
    ])
    .returning();
  const [silk, old, shield] = await db
    .insert(products)
    .values([
      { categoryId: emulsion.id, slug: "silk", name: "Silk", coverageSqftPerLitre: 100 },
      {
        categoryId: emulsion.id,
        slug: "old",
        name: "Old",
        coverageSqftPerLitre: 100,
        isActive: false,
      },
      { categoryId: weather.id, slug: "shield", name: "Shield", coverageSqftPerLitre: 100 },
    ])
    .returning();
  await db.insert(productVariants).values([
    { productId: silk.id, volumeMl: 1000, pricePaisa: 50000, sku: "S-1", currentStock: 0 },
    {
      productId: silk.id,
      volumeMl: 4000,
      pricePaisa: 180000,
      sku: "S-4",
      currentStock: 3,
      reorderLevel: 5,
    },
    {
      productId: silk.id,
      volumeMl: 20000,
      pricePaisa: 800000,
      sku: "S-20",
      currentStock: 50,
      reorderLevel: 5,
    },
    {
      productId: silk.id,
      volumeMl: 10000,
      pricePaisa: 1,
      sku: "S-10",
      currentStock: 9,
      isActive: false,
    },
    { productId: old.id, volumeMl: 1000, pricePaisa: 1000, sku: "O-1" },
    { productId: shield.id, volumeMl: 1000, pricePaisa: 1000, sku: "SH-1" },
  ]);
  const [cover] = await db
    .insert(files)
    .values({
      provider: "local",
      key: "products/silk.webp",
      originalName: "silk.webp",
      mimeType: "image/webp",
      sizeBytes: 10,
      width: 800,
      height: 600,
      altText: "A tin of Silk",
      uploadedBy: admin.id,
    })
    .returning();
  await db.insert(productImages).values({ productId: silk.id, fileId: cover.id });

  const [ivory, sky, retired] = await db
    .insert(shades)
    .values([
      { code: "SM-1", name: "Ivory", hex: "#fffff0", productId: silk.id },
      { code: "SM-2", name: "Sky", hex: "#87ceeb", productId: shield.id },
      { code: "SM-3", name: "Retired", hex: "#000000", isActive: false },
    ])
    .returning();
  const shadeColumns = {
    mainSurfaceShadeId: ivory.id,
    columnsShadeId: sky.id,
    doorsWindowsShadeId: ivory.id,
    roofEdgeShadeId: sky.id,
  };
  await db.insert(colourSets).values([
    { slug: "calm", name: "Calm", ...shadeColumns },
    {
      slug: "gone",
      name: "Gone",
      isActive: false,
      ...shadeColumns,
      roofEdgeShadeId: retired.id,
    },
  ]);

  const post = {
    authorId: admin.id,
    contentJson: { type: "doc" },
    contentHtml: "<p>Hi</p>",
  };
  await db.insert(posts).values([
    {
      ...post,
      slug: "older",
      title: "Older",
      status: "published",
      publishedAt: new Date(Date.now() - 2 * DAY_MS),
    },
    {
      ...post,
      slug: "newer",
      title: "Newer",
      status: "published",
      publishedAt: new Date(Date.now() - DAY_MS),
    },
    {
      ...post,
      slug: "scheduled",
      title: "Scheduled",
      status: "published",
      publishedAt: new Date(Date.now() + DAY_MS),
    },
    { ...post, slug: "draft", title: "Draft" },
  ]);

  await db.insert(slugRedirects).values([
    { entityType: "product", entityId: silk.id, oldSlug: "silk-old" },
    { entityType: "product", entityId: shield.id, oldSlug: "shield-old" },
  ]);

  return {
    visibleProductId: silk.id,
    hiddenTreeProductId: shield.id,
    inactiveProductId: old.id,
  };
}

function estimate(productId: string) {
  return costEstimateInputSchema.parse({
    wastagePercent: 0,
    sections: [
      {
        name: "Room",
        surfaces: [{ label: "Wall", widthFt: 10, heightFt: 10, quantity: 1 }],
        deductions: [],
        products: [{ productId, coats: 1 }],
      },
    ],
  });
}

describe.skipIf(!IntegrationContext.isConfigured())("public read API visibility (Postgres)", () => {
  let f: IFixture;

  beforeAll(async () => {
    await ctx.connect();
  });

  afterAll(async () => {
    await ctx.disconnect();
  });

  beforeEach(async () => {
    await ctx.reset();
    f = await seed();
  });

  it("hides inactive categories together with their subtree", async () => {
    const tree = await categoryService.tree();
    expect(tree.map((c) => [c.slug, c.depth, c.productCount, c.childCount])).toEqual([
      ["interior", 0, 1, 1],
      ["emulsion", 1, 1, 0],
    ]);
    expect(tree[1].path).toEqual([
      { slug: "interior", name: "Interior" },
      { slug: "emulsion", name: "Emulsion" },
    ]);
    await expect(categoryService.getBySlug("weather")).rejects.toBeInstanceOf(NotFoundException);
  });

  it("lists only visible products, with prices over active sizes", async () => {
    const all = await productService.list(publicProductListQuerySchema.parse({}));
    expect(all.items.map((p) => p.slug)).toEqual(["silk"]);
    expect(all.pagination.total).toBe(1);
    expect(all.items[0]).toMatchObject({
      minPricePaisa: 50000,
      maxPricePaisa: 800000,
      variantCount: 3,
      category: { slug: "emulsion", name: "Emulsion" },
      coverImage: { url: "/uploads/products/silk.webp", width: 800, alt: "A tin of Silk" },
    });

    const byParent = await productService.list(
      publicProductListQuerySchema.parse({ category: "interior", sortBy: "price" }),
    );
    expect(byParent.items.map((p) => p.slug)).toEqual(["silk"]);
    const hiddenTree = await productService.list(
      publicProductListQuerySchema.parse({ category: "exterior" }),
    );
    expect(hiddenTree.items).toEqual([]);
  });

  it("serves a product page with coarse availability and no stock counts", async () => {
    const product = await productService.getBySlug("silk");
    expect(product.variants).toEqual([
      expect.objectContaining({ volumeMl: 1000, availability: "askInStore" }),
      expect.objectContaining({ volumeMl: 4000, availability: "lowStock" }),
      expect.objectContaining({ volumeMl: 20000, availability: "inStock" }),
    ]);
    expect(Object.keys(product.variants[0]).sort()).toEqual([
      "availability",
      "id",
      "pricePaisa",
      "volumeMl",
    ]);
    expect(product.categoryPath.map((c) => c.slug)).toEqual(["interior", "emulsion"]);
    expect(product.shades).toEqual([{ code: "SM-1", name: "Ivory", hex: "#fffff0" }]);

    await expect(productService.getBySlug("old")).rejects.toBeInstanceOf(NotFoundException);
    await expect(productService.getBySlug("shield")).rejects.toBeInstanceOf(NotFoundException);
  });

  it("lists active shades and drops links to hidden products", async () => {
    const { items } = await shadeService.list(publicShadeListQuerySchema.parse({}));
    expect(items).toEqual([
      { code: "SM-1", name: "Ivory", hex: "#fffff0", product: { slug: "silk", name: "Silk" } },
      { code: "SM-2", name: "Sky", hex: "#87ceeb", product: null },
    ]);
    const sky = await shadeService.getByCode("SM-2");
    expect(sky.colourSets).toEqual([{ slug: "calm", name: "Calm" }]);
    await expect(shadeService.getByCode("SM-3")).rejects.toBeInstanceOf(NotFoundException);
  });

  it("lists active colour sets, filterable by shade code", async () => {
    const all = await colourSetService.list(publicColourSetListQuerySchema.parse({}));
    expect(all.items.map((s) => s.slug)).toEqual(["calm"]);
    expect(all.items[0].shades.roof_edge).toEqual({ code: "SM-2", name: "Sky", hex: "#87ceeb" });

    const bySky = await colourSetService.list(
      publicColourSetListQuerySchema.parse({ shade: "sm-2" }),
    );
    expect(bySky.items.map((s) => s.slug)).toEqual(["calm"]);
    const byRetired = await colourSetService.list(
      publicColourSetListQuerySchema.parse({ shade: "SM-3" }),
    );
    expect(byRetired.items).toEqual([]);
    await expect(colourSetService.getBySlug("gone")).rejects.toBeInstanceOf(NotFoundException);
  });

  it("serves published posts newest first and hides scheduled ones", async () => {
    const { items } = await postService.list(publicPostListQuerySchema.parse({}));
    expect(items.map((p) => p.slug)).toEqual(["newer", "older"]);
    expect((await postService.getBySlug("newer")).contentHtml).toBe("<p>Hi</p>");
    await expect(postService.getBySlug("scheduled")).rejects.toBeInstanceOf(NotFoundException);
    await expect(postService.getBySlug("draft")).rejects.toBeInstanceOf(NotFoundException);
  });

  it("redirects an old slug only while its target is public", async () => {
    expect(await redirectService.resolve({ type: "product", slug: "silk-old" })).toEqual({
      type: "product",
      slug: "silk",
    });
    await expect(
      redirectService.resolve({ type: "product", slug: "shield-old" }),
    ).rejects.toBeInstanceOf(NotFoundException);
    await expect(
      redirectService.resolve({ type: "category", slug: "silk-old" }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("puts exactly the public URLs in the sitemap", async () => {
    const entries = await sitemapService.entries();
    expect(entries.map((e) => `${e.kind}:${e.slug}`)).toEqual([
      "category:emulsion",
      "category:interior",
      "colourSet:calm",
      "post:newer",
      "post:older",
      "product:silk",
    ]);
  });

  it("estimates only visible products, without stock data", async () => {
    const result = await calculatorService.estimatePublic(estimate(f.visibleProductId));
    expect(result).not.toHaveProperty("hasStockShortage");
    const line = result.sections[0].products[0];
    expect(line).not.toHaveProperty("hasStockShortage");
    expect(line.containers.every((c) => !("currentStock" in c) && !("isShort" in c))).toBe(true);
    expect(line.containers.map((c) => c.volumeMl)).not.toContain(10000);

    for (const hidden of [f.inactiveProductId, f.hiddenTreeProductId]) {
      await expect(calculatorService.estimatePublic(estimate(hidden))).rejects.toBeInstanceOf(
        ValidationException,
      );
    }
  });
});
