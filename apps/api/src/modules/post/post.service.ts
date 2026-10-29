import type { DtoType, Pagination } from "@repo/http-kit";
import type { IPostContent, PostListQuery } from "@repo/shared";

import { injectable } from "tsyringe";

import { TransactionManager } from "@repo/database";
import { ConflictException, NotFoundException, PaginationHelper } from "@repo/http-kit";

import { UniqueSlugHelper } from "#helpers/unique-slug.helper";
import { tk } from "#i18n/tk";

import { FileService } from "../file/file.service";
import { SlugRedirectRepository } from "../slug-redirect/slug-redirect.repository";
import { PostHtmlRenderer } from "./post-html.renderer";
import { PostDetailDto, PostInputDto, PostListItemDto, PostPublishDto } from "./post.dto";
import { PostRepository } from "./post.repository";

type TPostInput = DtoType<typeof PostInputDto>;

@injectable()
export class PostService {
  constructor(
    private readonly txManager: TransactionManager,
    private readonly postRepository: PostRepository,
    private readonly renderer: PostHtmlRenderer,
    private readonly fileService: FileService,
    private readonly slugRedirectRepository: SlugRedirectRepository,
  ) {}

  async list(
    query: PostListQuery,
  ): Promise<{ items: Array<DtoType<typeof PostListItemDto>>; pagination: Pagination }> {
    const { rows, total } = await this.postRepository.list(query);
    return {
      items: rows.map((row) =>
        PostListItemDto.parse({
          id: row.post.id,
          slug: row.post.slug,
          title: row.post.title,
          status: row.post.status,
          publishedAt: row.post.publishedAt?.toISOString() ?? null,
          authorName: row.authorName,
          coverImage: row.coverFile ? this.fileService.toDto(row.coverFile) : null,
          updatedAt: row.post.updatedAt.toISOString(),
        }),
      ),
      pagination: PaginationHelper.build({ page: query.page, perPage: query.perPage, total }),
    };
  }

  async get(id: string): Promise<DtoType<typeof PostDetailDto>> {
    const row = await this.postRepository.findDetail(id);
    if (!row) throw new NotFoundException(tk("post.notFound"));
    return PostDetailDto.parse({
      id: row.post.id,
      slug: row.post.slug,
      status: row.post.status,
      publishedAt: row.post.publishedAt?.toISOString() ?? null,
      authorName: row.authorName,
      coverImage: row.coverFile ? this.fileService.toDto(row.coverFile) : null,
      title: row.post.title,
      excerpt: row.post.excerpt,
      contentJson: row.post.contentJson,
      contentHtml: row.post.contentHtml,
      seoTitle: row.post.seoTitle,
      seoDescription: row.post.seoDescription,
      createdAt: row.post.createdAt.toISOString(),
      updatedAt: row.post.updatedAt.toISOString(),
    });
  }

  async create(input: TPostInput, authorId: string) {
    const content = this.renderContent(input);
    const id = await this.txManager.run(async () => {
      if (input.coverImageFileId)
        await this.fileService.assertExist([input.coverImageFileId], "coverImageFileId");
      const post = await this.postRepository.create({
        slug: await UniqueSlugHelper.resolve(input.slug, input.title, (s) =>
          this.postRepository.slugTaken(s),
        ),
        coverImageFileId: input.coverImageFileId,
        authorId,
        ...content,
      });
      return post.id;
    });
    return this.get(id);
  }

  async update(id: string, input: TPostInput) {
    const content = this.renderContent(input);
    await this.txManager.run(async () => {
      const current = await this.postRepository.lockById(id);
      if (!current) throw new NotFoundException(tk("post.notFound"));
      if (input.coverImageFileId)
        await this.fileService.assertExist([input.coverImageFileId], "coverImageFileId");

      const slug = await UniqueSlugHelper.resolve(input.slug || current.slug, input.title, (s) =>
        this.postRepository.slugTaken(s, id),
      );
      if (slug !== current.slug)
        await this.slugRedirectRepository.recordChange("post", id, current.slug, slug);

      await this.postRepository.update(id, {
        slug,
        coverImageFileId: input.coverImageFileId,
        ...content,
      });
    });
    return this.get(id);
  }

  async publish(id: string, input: DtoType<typeof PostPublishDto>) {
    await this.txManager.run(async () => {
      const current = await this.postRepository.lockById(id);
      if (!current) throw new NotFoundException(tk("post.notFound"));
      if (current.status === "published" && !input.publishedAt) {
        throw new ConflictException(tk("post.alreadyPublished"));
      }
      // Re-publishing keeps the original date unless a new one is given, so a
      // post doesn't jump to the top of the blog after a quick unpublish.
      const publishedAt = input.publishedAt
        ? new Date(input.publishedAt)
        : (current.publishedAt ?? new Date());
      await this.postRepository.update(id, { status: "published", publishedAt });
    });
    return this.get(id);
  }

  async unpublish(id: string) {
    await this.txManager.run(async () => {
      const current = await this.postRepository.lockById(id);
      if (!current) throw new NotFoundException(tk("post.notFound"));
      await this.postRepository.update(id, { status: "draft" });
    });
    return this.get(id);
  }

  // Rendered before the transaction: a rendering error is a validation error
  // and shouldn't hold row locks while it's worked out.
  private renderContent(input: TPostInput) {
    return {
      title: input.title,
      excerpt: input.excerpt,
      contentJson: input.contentJson,
      contentHtml: this.renderer.render(input.contentJson as IPostContent, "contentJson"),
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
    };
  }
}
