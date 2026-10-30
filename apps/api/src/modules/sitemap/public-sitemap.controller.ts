import { ApiResponse, Controller, Get, OkArrayResponse } from "@repo/http-kit";

import { SitemapEntryDto } from "./sitemap.dto";
import { SitemapService } from "./sitemap.service";

// One unpaginated list: a shop's catalogue is far below the 50,000 URLs one
// sitemap file may hold.
@Controller("/public/sitemap", ["Public"])
export class PublicSitemapController {
  constructor(private readonly sitemapService: SitemapService) {}

  @Get("/", { summary: "Every public URL's kind, slug and last change" })
  @OkArrayResponse(SitemapEntryDto, "Sitemap entries")
  async entries() {
    return ApiResponse.ok(await this.sitemapService.entries());
  }
}
