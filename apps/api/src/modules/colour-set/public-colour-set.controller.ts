import type { DtoType } from "@repo/http-kit";

import {
  ApiResponse,
  Controller,
  Get,
  NotFoundResponse,
  OkResponse,
  PaginatedOkResponse,
  PaginatedResponse,
  Params,
  Query,
  Validate,
} from "@repo/http-kit";

import { SlugParamsDto } from "../common/slug-params.dto";
import { PublicColourSetDto, PublicColourSetListQueryDto } from "./colour-set.dto";
import { PublicColourSetService } from "./public-colour-set.service";

@Controller("/public/colour-sets", ["Public"])
export class PublicColourSetController {
  constructor(private readonly publicColourSetService: PublicColourSetService) {}

  @Get("/", { summary: "List active colour sets with their shades" })
  @PaginatedOkResponse(PublicColourSetDto, "Colour sets")
  @Validate({ query: PublicColourSetListQueryDto })
  async list(@Query() query: DtoType<typeof PublicColourSetListQueryDto>) {
    const { items, pagination } = await this.publicColourSetService.list(query);
    return new PaginatedResponse(items, pagination);
  }

  @Get("/:slug", { summary: "One active colour set with its four shades" })
  @OkResponse(PublicColourSetDto, "Colour set")
  @NotFoundResponse("No active colour set has this slug; try /public/redirects")
  @Validate({ params: SlugParamsDto })
  async get(@Params() params: DtoType<typeof SlugParamsDto>) {
    return ApiResponse.ok(await this.publicColourSetService.getBySlug(params.slug));
  }
}
