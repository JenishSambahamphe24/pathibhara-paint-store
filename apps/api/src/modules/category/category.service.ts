import type { CategoryRow } from "./category.repository";
import type { DtoType } from "@repo/http-kit";

import { injectable } from "tsyringe";

import { TransactionManager } from "@repo/database";
import { ConflictException, NotFoundException, ValidationException } from "@repo/http-kit";

import { UniqueSlugHelper } from "#helpers/unique-slug.helper";
import { tk } from "#i18n/tk";

import { SlugRedirectRepository } from "../slug-redirect/slug-redirect.repository";
import { CategoryInputDto, CategoryReorderDto, CategoryResponseDto } from "./category.dto";
import { CategoryRepository } from "./category.repository";

type TCategory = DtoType<typeof CategoryResponseDto>;

@injectable()
export class CategoryService {
  constructor(
    private readonly txManager: TransactionManager,
    private readonly categoryRepository: CategoryRepository,
    private readonly slugRedirectRepository: SlugRedirectRepository,
  ) {}

  // The whole tree, depth-first in display order. A shop has tens of
  // categories, not thousands, so one round trip beats paging a tree.
  async list(): Promise<Array<TCategory>> {
    const rows = await this.categoryRepository.findAll();

    const byParent = new Map<string | null, typeof rows>();
    for (const row of rows) {
      const siblings = byParent.get(row.category.parentId) ?? [];
      siblings.push(row);
      byParent.set(row.category.parentId, siblings);
    }

    const result: Array<TCategory> = [];
    const walk = (parentId: string | null, depth: number, path: Array<string>) => {
      for (const row of byParent.get(parentId) ?? []) {
        const ownPath = [...path, row.category.name];
        result.push(
          CategoryResponseDto.parse({
            ...row.category,
            depth,
            path: ownPath,
            productCount: row.productCount,
            childCount: byParent.get(row.category.id)?.length ?? 0,
          }),
        );
        walk(row.category.id, depth + 1, ownPath);
      }
    };
    walk(null, 0, []);
    return result;
  }

  async get(id: string): Promise<TCategory> {
    const category = (await this.list()).find((c) => c.id === id);
    if (!category) throw new NotFoundException(tk("category.notFound"));
    return category;
  }

  async create(input: DtoType<typeof CategoryInputDto>): Promise<TCategory> {
    const id = await this.txManager.run(async () => {
      if (input.parentId) await this.requireExisting(input.parentId, "parentId");
      const slug = await UniqueSlugHelper.resolve(input.slug, input.name, (s) =>
        this.categoryRepository.slugTaken(s),
      );
      const row = await this.categoryRepository.create({
        parentId: input.parentId,
        slug,
        isActive: input.isActive,
        ...CategoryService.content(input),
        sortOrder: await this.categoryRepository.nextSortOrder(input.parentId),
      });
      return row.id;
    });
    return this.get(id);
  }

  async update(id: string, input: DtoType<typeof CategoryInputDto>): Promise<TCategory> {
    await this.txManager.run(async () => {
      const current = await this.categoryRepository.lockById(id);
      if (!current) throw new NotFoundException(tk("category.notFound"));

      const moved = current.parentId !== input.parentId;
      if (moved && input.parentId) {
        await this.requireExisting(input.parentId, "parentId");
        await this.assertNotDescendant(id, input.parentId);
      }

      const slug = await UniqueSlugHelper.resolve(input.slug || current.slug, input.name, (s) =>
        this.categoryRepository.slugTaken(s, id),
      );
      if (slug !== current.slug) {
        await this.slugRedirectRepository.recordChange("category", id, current.slug, slug);
      }

      await this.categoryRepository.update(id, {
        parentId: input.parentId,
        slug,
        isActive: input.isActive,
        ...CategoryService.content(input),
        ...(moved && { sortOrder: await this.categoryRepository.nextSortOrder(input.parentId) }),
      });
    });
    return this.get(id);
  }

  async reorder(input: DtoType<typeof CategoryReorderDto>): Promise<Array<TCategory>> {
    await this.txManager.run(async () => {
      const children = await this.categoryRepository.childIds(input.parentId);
      const sameSet =
        children.length === input.orderedIds.length &&
        new Set(input.orderedIds).size === children.length &&
        input.orderedIds.every((id) => children.includes(id));
      if (!sameSet) throw new ValidationException({ orderedIds: tk("category.reorderMismatch") });
      await this.categoryRepository.setSortOrders(input.orderedIds);
    });
    return this.list();
  }

  async delete(id: string): Promise<void> {
    await this.txManager.run(async () => {
      const current = await this.categoryRepository.lockById(id);
      if (!current) throw new NotFoundException(tk("category.notFound"));
      const hasChildren = (await this.categoryRepository.childIds(id)).length > 0;
      const productCount = await this.categoryRepository.countProducts(id);
      if (hasChildren || productCount > 0) {
        throw new ConflictException(tk("category.deleteNotEmpty"));
      }
      await this.categoryRepository.delete(id);
    });
  }

  private static content(input: DtoType<typeof CategoryInputDto>) {
    return {
      name: input.name,
      description: input.description,
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
    };
  }

  private async requireExisting(id: string, field: string): Promise<CategoryRow> {
    const row = await this.categoryRepository.findById(id);
    if (!row) throw new ValidationException({ [field]: tk("category.notFound") });
    return row;
  }

  // Walks up from the new parent; meeting `id` on the way means the move would
  // put the category inside its own subtree and cut that branch off the tree.
  private async assertNotDescendant(id: string, newParentId: string): Promise<void> {
    let cursor: string | null | undefined = newParentId;
    const seen = new Set<string>();
    while (cursor) {
      if (cursor === id)
        throw new ValidationException({ parentId: tk("category.moveIntoOwnSubtree") });
      if (seen.has(cursor)) break;
      seen.add(cursor);
      cursor = await this.categoryRepository.parentIdOf(cursor);
    }
  }
}
