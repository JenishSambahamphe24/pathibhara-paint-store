import type { DtoType } from "@repo/http-kit";

import { injectable } from "tsyringe";

import { SitemapEntryDto } from "./sitemap.dto";
import { SitemapRepository } from "./sitemap.repository";

@injectable()
export class SitemapService {
  constructor(private readonly sitemapRepository: SitemapRepository) {}

  async entries(): Promise<Array<DtoType<typeof SitemapEntryDto>>> {
    const rows = await this.sitemapRepository.findEntries();
    return rows.map((row) =>
      SitemapEntryDto.parse({
        kind: row.kind,
        slug: row.slug,
        updatedAt: row.updatedAt.toISOString(),
      }),
    );
  }
}
