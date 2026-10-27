import type { PostTranslationValues } from "./post.repository";
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

  async list(query: PostListQuery): Promise<{ items: Array<DtoType<typeof PostListItemDto>>; pagination: Pagination }> {
    const { rows, total } = await this.postRepository.list(query);
    return {
      items: rows.map((row) =>
        PostListItemDto.parse({
          id: row.post.id,
          slug: row.post.slug,
          title: row.title,
          hasNepali: row.hasNepali,
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
    const translations = await this.postRepository.findTranslations(id);
    const pick = (locale: "en" | "ne") => {
      const t = translations.find((tr) => tr.locale === locale);
      return t
        ? {
            title: t.title,
            excerpt: t.excerpt,
            contentJson: t.contentJson,
            contentHtml: t.contentHtml,
            seoTitle: t.seoTitle,
            seoDescription: t.seoDescription,
          }
        : null;
    };
    return PostDetailDto.parse({
      id: row.post.id,
      slug: row.post.slug,
      status: row.post.status,
      publishedAt: row.post.publishedAt?.toISOString() ?? null,
      authorName: row.authorName,
      coverImage: row.coverFile ? this.fileService.toDto(row.coverFile) : null,
      translations: { en: pick("en"), ne: pick("ne") },
      createdAt: row.post.createdAt.toISOString(),
      updatedAt: row.post.updatedAt.toISOString(),
    });
  }

  async create(input: TPostInput, authorId: string) {
    const translations = this.renderTranslations(input);
    const id = await this.txManager.run(async () => {
      if (input.coverImageFileId) await this.fileService.assertExist([input.coverImageFileId], "coverImageFileId");
      const post = await this.postRepository.create({
        slug: await UniqueSlugHelper.resolve(input.slug, input.translations.en.title, (s) =>
          this.postRepository.slugTaken(s),
        ),
        coverImageFileId: input.coverImageFileId,
        authorId,
      });
      await this.saveTranslations(post.id, translations);
      return post.id;
    });
    return this.get(id);
  }

  async update(id: string, input: TPostInput) {
    const translations = this.renderTranslations(input);
    await this.txManager.run(async () => {
      const current = await this.postRepository.lockById(id);
      if (!current) throw new NotFoundException(tk("post.notFound"));
      if (input.coverImageFileId) await this.fileService.assertExist([input.coverImageFileId], "coverImageFileId");

      const slug = await UniqueSlugHelper.resolve(input.slug || current.slug, input.translations.en.title, (s) =>
        this.postRepository.slugTaken(s, id),
      );
      if (slug !== current.slug) await this.slugRedirectRepository.recordChange("post", id, current.slug, slug);

      await this.postRepository.update(id, { slug, coverImageFileId: input.coverImageFileId });
      await this.saveTranslations(id, translations);
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
      const publishedAt = input.publishedAt ? new Date(input.publishedAt) : (current.publishedAt ?? new Date());
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
  private renderTranslations(input: TPostInput) {
    const toRow = (
      t: { title: string | null; excerpt: string | null; contentJson: unknown; seoTitle: string | null; seoDescription: string | null },
      locale: "en" | "ne",
    ): PostTranslationValues => ({
      title: t.title ?? "",
      excerpt: t.excerpt,
      contentJson: t.contentJson,
      contentHtml: this.renderer.render(t.contentJson as IPostContent, `translations.${locale}.contentJson`),
      seoTitle: t.seoTitle,
      seoDescription: t.seoDescription,
    });
    return {
      en: toRow(input.translations.en, "en"),
      ne: input.translations.ne.title ? toRow(input.translations.ne, "ne") : null,
    };
  }

  private async saveTranslations(
    postId: string,
    translations: { en: PostTranslationValues; ne: PostTranslationValues | null },
  ) {
    await this.postRepository.saveTranslation(postId, "en", translations.en);
    if (translations.ne) await this.postRepository.saveTranslation(postId, "ne", translations.ne);
    else await this.postRepository.deleteTranslation(postId, "ne");
  }
}
