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

import { PublicShadeService } from "./public-shade.service";
import {
  PublicShadeDto,
  PublicShadeListItemDto,
  PublicShadeListQueryDto,
  ShadeCodeParamsDto,
} from "./shade.dto";

// Shades have no slug; their shade-card code is the stable public key.
@Controller("/public/shades", ["Public"])
export class PublicShadeController {
  constructor(private readonly publicShadeService: PublicShadeService) {}

  @Get("/", { summary: "List active shades" })
  @PaginatedOkResponse(PublicShadeListItemDto, "Shades")
  @Validate({ query: PublicShadeListQueryDto })
  async list(@Query() query: DtoType<typeof PublicShadeListQueryDto>) {
    const { items, pagination } = await this.publicShadeService.list(query);
    return new PaginatedResponse(items, pagination);
  }

  @Get("/:code", { summary: "One active shade by code, with the colour sets using it" })
  @OkResponse(PublicShadeDto, "Shade")
  @NotFoundResponse("No active shade has this code")
  @Validate({ params: ShadeCodeParamsDto })
  async get(@Params() params: DtoType<typeof ShadeCodeParamsDto>) {
    return ApiResponse.ok(await this.publicShadeService.getByCode(params.code));
  }
}
