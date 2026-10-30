import type { ColourSetRow } from "./colour-set.repository";
import type { DtoType, Pagination } from "@repo/http-kit";
import type { ColourSetListQuery } from "@repo/shared";

import { injectable } from "tsyringe";

import { TransactionManager } from "@repo/database";
import { NotFoundException, PaginationHelper, ValidationException } from "@repo/http-kit";
import { VISUALIZER_COMPONENTS } from "@repo/shared";

import { UniqueSlugHelper } from "#helpers/unique-slug.helper";
import { tk } from "#i18n/tk";

import { ShadeRepository } from "../shade/shade.repository";
import { SlugRedirectRepository } from "../slug-redirect/slug-redirect.repository";
import { ColourSetInputDto, ColourSetListItemDto, ColourSetResponseDto } from "./colour-set.dto";
import { ColourSetRepository, COMPONENT_COLUMNS } from "./colour-set.repository";

type TColourSetInput = DtoType<typeof ColourSetInputDto>;
type TColourSet = DtoType<typeof ColourSetResponseDto>;
type TShadeSummary = Awaited<ReturnType<ShadeRepository["findSummaries"]>>[number];

@injectable()
export class ColourSetService {
  constructor(
    private readonly txManager: TransactionManager,
    private readonly colourSetRepository: ColourSetRepository,
    private readonly shadeRepository: ShadeRepository,
    private readonly slugRedirectRepository: SlugRedirectRepository,
  ) {}

  async list(query: ColourSetListQuery): Promise<{
    items: Array<DtoType<typeof ColourSetListItemDto>>;
    pagination: Pagination;
  }> {
    const { rows, total } = await this.colourSetRepository.list(query);
    const shades = await this.shadeRepository.findSummaries([
      ...new Set(rows.flatMap((row) => ColourSetService.shadeIds(row.colourSet))),
    ]);
    const items = rows.map((row) =>
      ColourSetListItemDto.parse({
        id: row.colourSet.id,
        slug: row.colourSet.slug,
        name: row.colourSet.name,
        isActive: row.colourSet.isActive,
        shades: ColourSetService.componentShades(row.colourSet, shades),
        updatedAt: row.colourSet.updatedAt.toISOString(),
      }),
    );
    return {
      items,
      pagination: PaginationHelper.build({ page: query.page, perPage: query.perPage, total }),
    };
  }

  async get(id: string): Promise<TColourSet> {
    const colourSet = await this.colourSetRepository.findById(id);
    if (!colourSet) throw new NotFoundException(tk("colourSet.notFound"));
    const shades = await this.shadeRepository.findSummaries(ColourSetService.shadeIds(colourSet));
    return ColourSetResponseDto.parse({
      id: colourSet.id,
      slug: colourSet.slug,
      isActive: colourSet.isActive,
      name: colourSet.name,
      description: colourSet.description,
      shades: ColourSetService.componentShades(colourSet, shades),
      createdAt: colourSet.createdAt.toISOString(),
      updatedAt: colourSet.updatedAt.toISOString(),
    });
  }

  async create(input: TColourSetInput): Promise<TColourSet> {
    const id = await this.txManager.run(async () => {
      await this.assertShades(input);
      const slug = await UniqueSlugHelper.resolve(input.slug, input.name, (s) =>
        this.colourSetRepository.slugTaken(s),
      );
      const row = await this.colourSetRepository.create({
        slug,
        name: input.name,
        description: input.description,
        isActive: input.isActive,
        ...ColourSetService.shadeColumns(input),
      });
      return row.id;
    });
    return this.get(id);
  }

  async update(id: string, input: TColourSetInput): Promise<TColourSet> {
    await this.txManager.run(async () => {
      const current = await this.colourSetRepository.lockById(id);
      if (!current) throw new NotFoundException(tk("colourSet.notFound"));
      await this.assertShades(input);

      const slug = await UniqueSlugHelper.resolve(input.slug || current.slug, input.name, (s) =>
        this.colourSetRepository.slugTaken(s, id),
      );
      if (slug !== current.slug) {
        await this.slugRedirectRepository.recordChange("colourSet", id, current.slug, slug);
      }

      await this.colourSetRepository.update(id, {
        slug,
        name: input.name,
        description: input.description,
        isActive: input.isActive,
        ...ColourSetService.shadeColumns(input),
      });
    });
    return this.get(id);
  }

  // An inactive set may keep retired shades (it isn't shown anywhere), but an
  // active one is what customers see, so all four of its shades must be live.
  private async assertShades(input: TColourSetInput): Promise<void> {
    const found = await this.shadeRepository.lockSummaries([
      ...new Set(Object.values(input.shades)),
    ]);
    const errors: Record<string, string> = {};
    for (const component of VISUALIZER_COMPONENTS) {
      const shade = found.find((s) => s.id === input.shades[component]);
      if (!shade) errors[`shades.${component}`] = tk("colourSet.shadeNotFound");
      else if (input.isActive && !shade.isActive) {
        errors[`shades.${component}`] = tk("colourSet.shadeInactive");
      }
    }
    if (Object.keys(errors).length > 0) throw new ValidationException(errors);
  }

  static shadeIds(row: ColourSetRow): Array<string> {
    return VISUALIZER_COMPONENTS.map((component) => row[COMPONENT_COLUMNS[component]]);
  }

  private static shadeColumns(input: TColourSetInput) {
    return {
      mainSurfaceShadeId: input.shades.main_surface,
      columnsShadeId: input.shades.columns,
      doorsWindowsShadeId: input.shades.doors_windows,
      roofEdgeShadeId: input.shades.roof_edge,
    } satisfies Pick<ColourSetRow, (typeof COMPONENT_COLUMNS)[keyof typeof COMPONENT_COLUMNS]>;
  }

  static componentShades(row: ColourSetRow, shades: Array<TShadeSummary>) {
    return Object.fromEntries(
      VISUALIZER_COMPONENTS.map((component) => [
        component,
        shades.find((s) => s.id === row[COMPONENT_COLUMNS[component]]),
      ]),
    );
  }
}
