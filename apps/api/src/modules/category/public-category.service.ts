import type { DtoType } from "@repo/http-kit";

import { injectable } from "tsyringe";

import { NotFoundException } from "@repo/http-kit";

import { tk } from "#i18n/tk";

import { FileService } from "../file/file.service";
import { PublicCategoryDto } from "./category.dto";
import { CategoryRepository } from "./category.repository";

type TPublicCategory = DtoType<typeof PublicCategoryDto>;
type TVisibleRow = Awaited<ReturnType<CategoryRepository["findVisible"]>>[number];

@injectable()
export class PublicCategoryService {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly fileService: FileService,
  ) {}

  // Depth-first in display order, like the admin tree. The repository already
  // dropped hidden categories, so a child of a hidden parent is unreachable
  // from the roots and falls out here too.
  async tree(): Promise<Array<TPublicCategory>> {
    const rows = await this.categoryRepository.findVisible();

    const byParent = new Map<string | null, Array<TVisibleRow>>();
    for (const row of rows) {
      const siblings = byParent.get(row.category.parentId) ?? [];
      siblings.push(row);
      byParent.set(row.category.parentId, siblings);
    }

    const result: Array<TPublicCategory> = [];
    const walk = (parent: TVisibleRow | null, depth: number, path: TPublicCategory["path"]) => {
      for (const row of byParent.get(parent?.category.id ?? null) ?? []) {
        const ownPath = [...path, { slug: row.category.slug, name: row.category.name }];
        result.push(
          this.toDto(row, parent, depth, ownPath, byParent.get(row.category.id)?.length ?? 0),
        );
        walk(row, depth + 1, ownPath);
      }
    };
    walk(null, 0, []);
    return result;
  }

  async getBySlug(slug: string): Promise<TPublicCategory> {
    const category = (await this.tree()).find((c) => c.slug === slug);
    if (!category) throw new NotFoundException(tk("category.notFound"));
    return category;
  }

  private toDto(
    row: TVisibleRow,
    parent: TVisibleRow | null,
    depth: number,
    path: TPublicCategory["path"],
    childCount: number,
  ): TPublicCategory {
    return PublicCategoryDto.parse({
      slug: row.category.slug,
      parentSlug: parent?.category.slug ?? null,
      depth,
      path,
      name: row.category.name,
      description: row.category.description,
      seoTitle: row.category.seoTitle,
      seoDescription: row.category.seoDescription,
      image: row.imageFile ? this.fileService.toPublicImage(row.imageFile) : null,
      productCount: row.productCount,
      childCount,
      updatedAt: row.category.updatedAt.toISOString(),
    });
  }
}
