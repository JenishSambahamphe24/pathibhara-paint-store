import type { DtoType } from "@repo/http-kit";
import type { SlugRedirectQuery } from "@repo/shared";

import { injectable } from "tsyringe";

import { NotFoundException } from "@repo/http-kit";

import { tk } from "#i18n/tk";

import { SlugRedirectDto } from "./slug-redirect.dto";
import { SlugRedirectRepository } from "./slug-redirect.repository";

@injectable()
export class PublicRedirectService {
  constructor(private readonly slugRedirectRepository: SlugRedirectRepository) {}

  async resolve(query: SlugRedirectQuery): Promise<DtoType<typeof SlugRedirectDto>> {
    const slug = await this.slugRedirectRepository.findPublicTarget(query.type, query.slug);
    if (!slug) throw new NotFoundException(tk("redirect.notFound"));
    return SlugRedirectDto.parse({ type: query.type, slug });
  }
}
