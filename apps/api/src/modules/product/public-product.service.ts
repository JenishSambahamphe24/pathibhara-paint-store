import type { DtoType, Pagination } from "@repo/http-kit";
import type { PublicProductListQuery } from "@repo/shared";

import { injectable } from "tsyringe";

import { NotFoundException, PaginationHelper } from "@repo/http-kit";
import { StockAvailabilityHelper } from "@repo/shared";

import { tk } from "#i18n/tk";

import { PublicCategoryService } from "../category/public-category.service";
import { FileService } from "../file/file.service";
import { ShadeRepository } from "../shade/shade.repository";
import { PublicProductDto, PublicProductListItemDto } from "./product.dto";
import { ProductRepository } from "./product.repository";

@injectable()
export class PublicProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly shadeRepository: ShadeRepository,
    private readonly publicCategoryService: PublicCategoryService,
    private readonly fileService: FileService,
  ) {}

  async list(query: PublicProductListQuery): Promise<{
    items: Array<DtoType<typeof PublicProductListItemDto>>;
    pagination: Pagination;
  }> {
    const { rows, total } = await this.productRepository.listPublic(query);
    const items = rows.map((row) =>
      PublicProductListItemDto.parse({
        id: row.product.id,
        slug: row.product.slug,
        name: row.product.name,
        category: { slug: row.categorySlug, name: row.categoryName },
        coverImage: row.coverFile ? this.fileService.toPublicImage(row.coverFile) : null,
        minPricePaisa: row.minPricePaisa,
        maxPricePaisa: row.maxPricePaisa,
        variantCount: row.variantCount,
        volumesMl: row.volumesMl ?? [],
        defaultCoats: row.product.defaultCoats,
        updatedAt: row.product.updatedAt.toISOString(),
      }),
    );
    return {
      items,
      pagination: PaginationHelper.build({ page: query.page, perPage: query.perPage, total }),
    };
  }

  async getBySlug(slug: string): Promise<DtoType<typeof PublicProductDto>> {
    const row = await this.productRepository.findPublicBySlug(slug);
    if (!row) throw new NotFoundException(tk("product.notFound"));
    const { product } = row;

    const [variants, images, shades, category] = await Promise.all([
      this.productRepository.findActiveVariants(product.id),
      this.productRepository.findImages(product.id),
      this.shadeRepository.findActiveByProduct(product.id),
      this.publicCategoryService.getBySlug(row.categorySlug),
    ]);

    return PublicProductDto.parse({
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description,
      seoTitle: product.seoTitle,
      seoDescription: product.seoDescription,
      coverageSqftPerLitre: product.coverageSqftPerLitre,
      defaultCoats: product.defaultCoats,
      category: { slug: row.categorySlug, name: row.categoryName },
      categoryPath: category.path,
      images: images.map((image) => this.fileService.toPublicImage(image.file)),
      variants: variants.map((variant) => ({
        id: variant.id,
        volumeMl: variant.volumeMl,
        pricePaisa: variant.pricePaisa,
        availability: StockAvailabilityHelper.of(variant.currentStock, variant.reorderLevel),
      })),
      shades,
      updatedAt: product.updatedAt.toISOString(),
    });
  }
}
