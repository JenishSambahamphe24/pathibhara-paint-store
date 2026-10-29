import type { VariantRow } from "./product.repository";
import type { DtoType, Pagination } from "@repo/http-kit";
import type { ProductListQuery, VariantSearchQuery } from "@repo/shared";

import { injectable } from "tsyringe";

import { TransactionManager } from "@repo/database";
import {
  ConflictException,
  NotFoundException,
  PaginationHelper,
  ValidationException,
} from "@repo/http-kit";

import { UniqueSlugHelper } from "#helpers/unique-slug.helper";
import { tk } from "#i18n/tk";

import { CategoryRepository } from "../category/category.repository";
import { CategoryService } from "../category/category.service";
import { FileService } from "../file/file.service";
import { SlugRedirectRepository } from "../slug-redirect/slug-redirect.repository";
import {
  ProductInputDto,
  ProductListItemDto,
  ProductResponseDto,
  VariantSummaryDto,
} from "./product.dto";
import { ProductRepository } from "./product.repository";

type TProductInput = DtoType<typeof ProductInputDto>;

@injectable()
export class ProductService {
  constructor(
    private readonly txManager: TransactionManager,
    private readonly productRepository: ProductRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly categoryService: CategoryService,
    private readonly fileService: FileService,
    private readonly slugRedirectRepository: SlugRedirectRepository,
  ) {}

  async list(query: ProductListQuery): Promise<{
    items: Array<DtoType<typeof ProductListItemDto>>;
    pagination: Pagination;
  }> {
    const { rows, total } = await this.productRepository.list(query);
    const items = rows.map((row) =>
      ProductListItemDto.parse({
        id: row.product.id,
        slug: row.product.slug,
        name: row.product.name,
        categoryId: row.product.categoryId,
        categoryName: row.categoryName,
        isActive: row.product.isActive,
        coverageSqftPerLitre: row.product.coverageSqftPerLitre,
        defaultCoats: row.product.defaultCoats,
        coverImage: row.coverFile ? this.fileService.toDto(row.coverFile) : null,
        variantCount: row.variantCount,
        minPricePaisa: row.minPricePaisa,
        maxPricePaisa: row.maxPricePaisa,
        totalStock: row.totalStock,
        lowStockCount: row.lowStockCount,
        updatedAt: row.product.updatedAt.toISOString(),
      }),
    );
    return {
      items,
      pagination: PaginationHelper.build({ page: query.page, perPage: query.perPage, total }),
    };
  }

  async get(id: string): Promise<DtoType<typeof ProductResponseDto>> {
    const product = await this.productRepository.findById(id);
    if (!product) throw new NotFoundException(tk("product.notFound"));

    const [variants, images, category] = await Promise.all([
      this.productRepository.findVariants(id),
      this.productRepository.findImages(id),
      this.categoryService.get(product.categoryId),
    ]);

    return ProductResponseDto.parse({
      ...product,
      categoryPath: category.path,
      images: images.map((image) => this.fileService.toDto(image.file)),
      variants: variants.map((variant) => ({
        id: variant.id,
        volumeMl: variant.volumeMl,
        pricePaisa: variant.pricePaisa,
        sku: variant.sku,
        reorderLevel: variant.reorderLevel,
        currentStock: variant.currentStock,
        isActive: variant.isActive,
        hasHistory: variant.hasHistory,
      })),
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    });
  }

  async create(input: TProductInput): Promise<DtoType<typeof ProductResponseDto>> {
    const id = await this.txManager.run(async () => {
      await this.validateRefs(input);
      const variants = this.normaliseVariants(input);
      await this.assertSkusFree(variants);

      const product = await this.productRepository.create({
        categoryId: input.categoryId,
        slug: await UniqueSlugHelper.resolve(input.slug, input.name, (s) =>
          this.productRepository.slugTaken(s),
        ),
        coverageSqftPerLitre: input.coverageSqftPerLitre,
        defaultCoats: input.defaultCoats,
        isActive: input.isActive,
        ...ProductService.content(input),
      });
      await this.productRepository.replaceImages(product.id, input.imageFileIds);
      for (const variant of variants) {
        await this.productRepository.insertVariant({
          ...this.variantValues(variant),
          productId: product.id,
        });
      }
      return product.id;
    });
    return this.get(id);
  }

  async update(id: string, input: TProductInput): Promise<DtoType<typeof ProductResponseDto>> {
    await this.txManager.run(async () => {
      const current = await this.productRepository.lockById(id);
      if (!current) throw new NotFoundException(tk("product.notFound"));
      await this.validateRefs(input);
      const variants = this.normaliseVariants(input);
      await this.assertSkusFree(variants, id);

      const slug = await UniqueSlugHelper.resolve(input.slug || current.slug, input.name, (s) =>
        this.productRepository.slugTaken(s, id),
      );
      if (slug !== current.slug) {
        await this.slugRedirectRepository.recordChange("product", id, current.slug, slug);
      }

      await this.productRepository.update(id, {
        categoryId: input.categoryId,
        slug,
        coverageSqftPerLitre: input.coverageSqftPerLitre,
        defaultCoats: input.defaultCoats,
        isActive: input.isActive,
        ...ProductService.content(input),
      });
      await this.productRepository.replaceImages(id, input.imageFileIds);
      await this.syncVariants(id, variants);
      await this.productRepository.touch(id);
    });
    return this.get(id);
  }

  async searchVariants(query: VariantSearchQuery): Promise<{
    items: Array<DtoType<typeof VariantSummaryDto>>;
    pagination: Pagination;
  }> {
    const { rows, total } = await this.productRepository.searchVariants(query);
    return {
      items: rows.map((row) => this.toVariantSummary(row)),
      pagination: PaginationHelper.build({ page: query.page, perPage: query.perPage, total }),
    };
  }

  async getVariant(id: string): Promise<DtoType<typeof VariantSummaryDto>> {
    const [row] = await this.productRepository.findVariantSummaries([id]);
    if (!row) throw new NotFoundException(tk("product.variantNotFound"));
    return this.toVariantSummary(row);
  }

  private static content(input: TProductInput) {
    return {
      name: input.name,
      description: input.description,
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
    };
  }

  private toVariantSummary(row: {
    variant: Omit<VariantRow, never>;
    productName: string;
    productSlug: string;
    productIsActive: boolean;
  }): DtoType<typeof VariantSummaryDto> {
    return VariantSummaryDto.parse({
      ...row.variant,
      productName: row.productName,
      productSlug: row.productSlug,
      productIsActive: row.productIsActive,
    });
  }

  private async validateRefs(input: TProductInput): Promise<void> {
    if (!(await this.categoryRepository.findById(input.categoryId))) {
      throw new ValidationException({ categoryId: tk("category.notFound") });
    }
    await this.fileService.assertExist(input.imageFileIds, "imageFileIds");
  }

  private normaliseVariants(input: TProductInput) {
    return input.variants.map((variant, index) => ({
      ...variant,
      sku: variant.sku.toUpperCase(),
      index,
    }));
  }

  private async assertSkusFree(
    variants: Array<{ sku: string; index: number }>,
    productId?: string,
  ): Promise<void> {
    const taken = new Set(
      (
        await this.productRepository.skusUsedElsewhere(
          variants.map((v) => v.sku),
          productId,
        )
      ).map((row) => row.sku),
    );
    const errors: Record<string, string> = {};
    for (const variant of variants) {
      if (taken.has(variant.sku)) errors[`variants[${variant.index}].sku`] = tk("product.skuTaken");
    }
    if (Object.keys(errors).length > 0) throw new ValidationException(errors);
  }

  private variantValues(variant: ReturnType<ProductService["normaliseVariants"]>[number]) {
    return {
      volumeMl: variant.volumeMl,
      pricePaisa: variant.pricePaisa,
      sku: variant.sku,
      reorderLevel: variant.reorderLevel,
      isActive: variant.isActive,
    };
  }

  // Sizes with stock history can't be removed or change volume: past batches
  // and sales would silently change meaning. They can still be deactivated.
  private async syncVariants(
    productId: string,
    variants: ReturnType<ProductService["normaliseVariants"]>,
  ): Promise<void> {
    const existing = new Map(
      (await this.productRepository.findVariants(productId)).map((v) => [v.id, v]),
    );
    const errors: Record<string, string> = {};

    for (const variant of variants) {
      if (!variant.id) continue;
      const current = existing.get(variant.id);
      if (!current) {
        errors[`variants[${variant.index}].id`] = tk("product.variantNotFound");
      } else if (current.hasHistory && current.volumeMl !== variant.volumeMl) {
        errors[`variants[${variant.index}].volumeMl`] = tk("product.variantVolumeLocked");
      }
    }
    if (Object.keys(errors).length > 0) throw new ValidationException(errors);

    const keptIds = new Set(variants.flatMap((v) => (v.id ? [v.id] : [])));
    const removed = [...existing.values()].filter((v) => !keptIds.has(v.id));
    if (removed.some((v) => v.hasHistory)) {
      throw new ConflictException(tk("product.variantHasHistory"));
    }

    await this.productRepository.deleteVariants(removed.map((v) => v.id));
    for (const variant of variants) {
      if (variant.id)
        await this.productRepository.updateVariant(variant.id, this.variantValues(variant));
      else
        await this.productRepository.insertVariant({ ...this.variantValues(variant), productId });
    }
  }
}
