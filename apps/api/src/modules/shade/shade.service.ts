import type { DtoType, Pagination } from "@repo/http-kit";
import type { ShadeListQuery } from "@repo/shared";

import { injectable } from "tsyringe";

import { TransactionManager } from "@repo/database";
import {
  ConflictException,
  NotFoundException,
  PaginationHelper,
  ValidationException,
} from "@repo/http-kit";

import { tk } from "#i18n/tk";

import { ProductRepository } from "../product/product.repository";
import { ShadeInputDto, ShadeListItemDto, ShadeResponseDto } from "./shade.dto";
import { ShadeRepository } from "./shade.repository";

type TShadeInput = DtoType<typeof ShadeInputDto>;
type TShade = DtoType<typeof ShadeResponseDto>;

@injectable()
export class ShadeService {
  constructor(
    private readonly txManager: TransactionManager,
    private readonly shadeRepository: ShadeRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async list(query: ShadeListQuery): Promise<{
    items: Array<DtoType<typeof ShadeListItemDto>>;
    pagination: Pagination;
  }> {
    const { rows, total } = await this.shadeRepository.list(query);
    const items = rows.map((row) =>
      ShadeListItemDto.parse({
        id: row.shade.id,
        code: row.shade.code,
        hex: row.shade.hex,
        name: row.name,
        isActive: row.shade.isActive,
        hasNepali: row.hasNepali,
        productId: row.shade.productId,
        productName: row.productName,
        colourSetCount: row.colourSetCount,
        updatedAt: row.shade.updatedAt.toISOString(),
      }),
    );
    return {
      items,
      pagination: PaginationHelper.build({ page: query.page, perPage: query.perPage, total }),
    };
  }

  async get(id: string): Promise<TShade> {
    const [detail, translations] = await Promise.all([
      this.shadeRepository.findDetail(id),
      this.shadeRepository.findTranslations(id),
    ]);
    if (!detail) throw new NotFoundException(tk("shade.notFound"));
    const name = (locale: "en" | "ne") => translations.find((t) => t.locale === locale)?.name;
    const ne = name("ne");
    return ShadeResponseDto.parse({
      ...detail.shade,
      productName: detail.productName,
      colourSetCount: detail.colourSetCount,
      translations: { en: { name: name("en") }, ne: ne ? { name: ne } : null },
      createdAt: detail.shade.createdAt.toISOString(),
      updatedAt: detail.shade.updatedAt.toISOString(),
    });
  }

  async create(input: TShadeInput): Promise<TShade> {
    const id = await this.txManager.run(async () => {
      await this.assertValid(input);
      const row = await this.shadeRepository.create({
        code: input.code,
        hex: input.hex,
        productId: input.productId,
        isActive: input.isActive,
      });
      await this.shadeRepository.saveTranslations(row.id, input.translations);
      return row.id;
    });
    return this.get(id);
  }

  async update(id: string, input: TShadeInput): Promise<TShade> {
    await this.txManager.run(async () => {
      const current = await this.shadeRepository.lockById(id);
      if (!current) throw new NotFoundException(tk("shade.notFound"));
      await this.assertValid(input, id);

      // An active colour set must only show active shades, so the shade
      // can't be retired out from under one.
      if (current.isActive && !input.isActive) {
        const names = await this.shadeRepository.activeSetNamesUsing(id);
        if (names.length > 0) {
          throw new ConflictException(tk("shade.usedByActiveSets"), undefined, {
            names: names.join(", "),
          });
        }
      }

      await this.shadeRepository.update(id, {
        code: input.code,
        hex: input.hex,
        productId: input.productId,
        isActive: input.isActive,
      });
      await this.shadeRepository.saveTranslations(id, input.translations);
    });
    return this.get(id);
  }

  async delete(id: string): Promise<void> {
    await this.txManager.run(async () => {
      const current = await this.shadeRepository.lockById(id);
      if (!current) throw new NotFoundException(tk("shade.notFound"));
      const count = await this.shadeRepository.countSetsUsing(id);
      if (count > 0) throw new ConflictException(tk("shade.deleteInUse"), undefined, { count });
      await this.shadeRepository.delete(id);
    });
  }

  private async assertValid(input: TShadeInput, exceptId?: string): Promise<void> {
    const errors: Record<string, string> = {};
    if (await this.shadeRepository.codeTaken(input.code, exceptId)) {
      errors.code = tk("shade.codeTaken");
    }
    if (input.productId && !(await this.productRepository.findById(input.productId))) {
      errors.productId = tk("shade.productNotFound");
    }
    if (Object.keys(errors).length > 0) throw new ValidationException(errors);
  }
}
