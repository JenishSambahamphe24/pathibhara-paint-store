import type { DtoType, Pagination } from "@repo/http-kit";
import type { PublicPostListQuery } from "@repo/shared";

import { injectable } from "tsyringe";

import { NotFoundException, PaginationHelper } from "@repo/http-kit";

import { tk } from "#i18n/tk";

import { FileService } from "../file/file.service";
import { PublicPostDto, PublicPostListItemDto } from "./post.dto";
import { PostRepository } from "./post.repository";

@injectable()
export class PublicPostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly fileService: FileService,
  ) {}

  async list(query: PublicPostListQuery): Promise<{
    items: Array<DtoType<typeof PublicPostListItemDto>>;
    pagination: Pagination;
  }> {
    const { rows, total } = await this.postRepository.listPublished(query);
    return {
      items: rows.map((row) =>
        PublicPostListItemDto.parse({
          slug: row.post.slug,
          title: row.post.title,
          excerpt: row.post.excerpt,
          coverImage: row.coverFile ? this.fileService.toPublicImage(row.coverFile) : null,
          publishedAt: row.post.publishedAt?.toISOString(),
          updatedAt: row.post.updatedAt.toISOString(),
        }),
      ),
      pagination: PaginationHelper.build({ page: query.page, perPage: query.perPage, total }),
    };
  }

  // Serves the HTML stored at save time rather than re-rendering contentJson:
  // the renderer already ran (and sanitized) when the post was saved.
  async getBySlug(slug: string): Promise<DtoType<typeof PublicPostDto>> {
    const row = await this.postRepository.findPublishedBySlug(slug);
    if (!row) throw new NotFoundException(tk("post.notFound"));
    return PublicPostDto.parse({
      slug: row.post.slug,
      title: row.post.title,
      excerpt: row.post.excerpt,
      coverImage: row.coverFile ? this.fileService.toPublicImage(row.coverFile) : null,
      publishedAt: row.post.publishedAt?.toISOString(),
      updatedAt: row.post.updatedAt.toISOString(),
      contentHtml: row.post.contentHtml,
      seoTitle: row.post.seoTitle,
      seoDescription: row.post.seoDescription,
    });
  }
}
