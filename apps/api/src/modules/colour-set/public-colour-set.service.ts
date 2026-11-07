import type { ColourSetRow } from "./colour-set.repository";
import type { DtoType, Pagination } from "@repo/http-kit";
import type { PublicColourSetListQuery } from "@repo/shared";

import { injectable } from "tsyringe";

import { NotFoundException, PaginationHelper } from "@repo/http-kit";

import { tk } from "#i18n/tk";

import { ShadeRepository } from "../shade/shade.repository";
import { PublicColourSetDto } from "./colour-set.dto";
import { ColourSetRepository } from "./colour-set.repository";
import { ColourSetService } from "./colour-set.service";

type TPublicColourSet = DtoType<typeof PublicColourSetDto>;

@injectable()
export class PublicColourSetService {
  constructor(
    private readonly colourSetRepository: ColourSetRepository,
    private readonly shadeRepository: ShadeRepository,
  ) {}

  async list(
    query: PublicColourSetListQuery,
  ): Promise<{ items: Array<TPublicColourSet>; pagination: Pagination }> {
    const { shade: shadeCode, ...rest } = query;
    const shade = shadeCode ? await this.shadeRepository.findActiveByCode(shadeCode) : undefined;
    if (shadeCode && !shade) {
      return {
        items: [],
        pagination: PaginationHelper.build({ page: query.page, perPage: query.perPage, total: 0 }),
      };
    }

    const { rows, total } = await this.colourSetRepository.list({
      ...rest,
      status: "active",
      shadeId: shade?.id,
    });
    const items = await this.toDtos(rows.map((row) => row.colourSet));
    return {
      items,
      pagination: PaginationHelper.build({ page: query.page, perPage: query.perPage, total }),
    };
  }

  async getBySlug(slug: string): Promise<TPublicColourSet> {
    const colourSet = await this.colourSetRepository.findPublicBySlug(slug);
    if (!colourSet) throw new NotFoundException(tk("colourSet.notFound"));
    const [dto] = await this.toDtos([colourSet]);
    return dto;
  }

  // An active set's shades are all active: ColourSetService refuses to save
  // one otherwise and ShadeService refuses to retire a shade an active set uses.
  private async toDtos(rows: Array<ColourSetRow>): Promise<Array<TPublicColourSet>> {
    const shades = await this.shadeRepository.findSummaries([
      ...new Set(rows.flatMap((row) => ColourSetService.shadeIds(row))),
    ]);
    return rows.map((row) =>
      PublicColourSetDto.parse({
        slug: row.slug,
        name: row.name,
        description: row.description,
        shades: ColourSetService.componentShades(row, shades),
        updatedAt: row.updatedAt.toISOString(),
      }),
    );
  }
}
