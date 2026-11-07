import type { DtoType, Pagination } from "@repo/http-kit";
import type { PublicShadeListQuery } from "@repo/shared";

import { injectable } from "tsyringe";

import { NotFoundException, PaginationHelper } from "@repo/http-kit";

import { tk } from "#i18n/tk";

import { ProductRepository } from "../product/product.repository";
import { PublicShadeDto, PublicShadeListItemDto } from "./shade.dto";
import { ShadeRepository } from "./shade.repository";

@injectable()
export class PublicShadeService {
  constructor(
    private readonly shadeRepository: ShadeRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async list(query: PublicShadeListQuery): Promise<{
    items: Array<DtoType<typeof PublicShadeListItemDto>>;
    pagination: Pagination;
  }> {
    const { rows, total } = await this.shadeRepository.list({ ...query, status: "active" });
    const products = await this.productsById(rows.map((row) => row.shade.productId));
    const items = rows.map((row) =>
      PublicShadeListItemDto.parse({
        code: row.shade.code,
        name: row.shade.name,
        hex: row.shade.hex,
        product: (row.shade.productId && products.get(row.shade.productId)) ?? null,
      }),
    );
    return {
      items,
      pagination: PaginationHelper.build({ page: query.page, perPage: query.perPage, total }),
    };
  }

  async getByCode(code: string): Promise<DtoType<typeof PublicShadeDto>> {
    const shade = await this.shadeRepository.findActiveByCode(code);
    if (!shade) throw new NotFoundException(tk("shade.notFound"));
    const [products, colourSets] = await Promise.all([
      this.productsById([shade.productId]),
      this.shadeRepository.activeSetsUsing(shade.id),
    ]);
    return PublicShadeDto.parse({
      code: shade.code,
      name: shade.name,
      hex: shade.hex,
      product: (shade.productId && products.get(shade.productId)) ?? null,
      colourSets,
    });
  }

  // A shade may point at a product that is now hidden; that link is dropped
  // rather than sending the customer to a 404.
  private async productsById(ids: Array<string | null>) {
    const unique = [...new Set(ids.filter((id): id is string => id !== null))];
    const rows = await this.productRepository.findPublicSummaries(unique);
    return new Map(rows.map((row) => [row.id, { slug: row.slug, name: row.name }]));
  }
}
