import type { DtoType } from "@repo/http-kit";

import {
  ApiResponse,
  Controller,
  Get,
  NotFoundResponse,
  OkResponse,
  Query,
  Validate,
} from "@repo/http-kit";

import { PublicRedirectService } from "./public-redirect.service";
import { SlugRedirectDto, SlugRedirectQueryDto } from "./slug-redirect.dto";

@Controller("/public/redirects", ["Public"])
export class PublicRedirectController {
  constructor(private readonly publicRedirectService: PublicRedirectService) {}

  // For a slug that 404s: user-fe answers with a 301 to the returned slug.
  @Get("/", { summary: "Current slug for a retired one" })
  @OkResponse(SlugRedirectDto, "Redirect target")
  @NotFoundResponse("No redirect, or its target is no longer public")
  @Validate({ query: SlugRedirectQueryDto })
  async resolve(@Query() query: DtoType<typeof SlugRedirectQueryDto>) {
    return ApiResponse.ok(await this.publicRedirectService.resolve(query));
  }
}
