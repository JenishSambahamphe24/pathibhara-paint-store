import type { DtoType } from "@repo/http-kit";

import {
  ApiResponse,
  Body,
  Controller,
  CreatedResponse,
  Get,
  OkResponse,
  PaginatedOkResponse,
  PaginatedResponse,
  Params,
  Post,
  Put,
  Query,
  UseMiddleware,
  Validate,
} from "@repo/http-kit";

import { tk } from "#i18n/tk";

import { requireAdmin } from "../auth/auth.middleware";
import { IdParamsDto } from "../common/id-params.dto";
import {
  ColourSetInputDto,
  ColourSetListItemDto,
  ColourSetListQueryDto,
  ColourSetResponseDto,
} from "./colour-set.dto";
import { ColourSetService } from "./colour-set.service";

// No delete: a colour set has a public URL, so it retires by deactivation.
@Controller("/admin/colour-sets", ["Colour sets"])
@UseMiddleware(requireAdmin())
export class ColourSetController {
  constructor(private readonly colourSetService: ColourSetService) {}

  @Get("/", { summary: "List colour sets" })
  @PaginatedOkResponse(ColourSetListItemDto, "Colour sets")
  @Validate({ query: ColourSetListQueryDto })
  async list(@Query() query: DtoType<typeof ColourSetListQueryDto>) {
    const { items, pagination } = await this.colourSetService.list(query);
    return new PaginatedResponse(items, pagination);
  }

  @Post("/", { summary: "Create a colour set" })
  @CreatedResponse(ColourSetResponseDto, "Created")
  @Validate({ body: ColourSetInputDto })
  async create(@Body() body: DtoType<typeof ColourSetInputDto>) {
    return ApiResponse.created(await this.colourSetService.create(body), tk("colourSet.created"));
  }

  @Get("/:id", { summary: "One colour set with its four shades" })
  @OkResponse(ColourSetResponseDto, "Colour set")
  @Validate({ params: IdParamsDto })
  async get(@Params() params: DtoType<typeof IdParamsDto>) {
    return ApiResponse.ok(await this.colourSetService.get(params.id));
  }

  @Put("/:id", { summary: "Edit, re-slug or (de)activate a colour set" })
  @OkResponse(ColourSetResponseDto, "Updated")
  @Validate({ params: IdParamsDto, body: ColourSetInputDto })
  async update(
    @Params() params: DtoType<typeof IdParamsDto>,
    @Body() body: DtoType<typeof ColourSetInputDto>,
  ) {
    return ApiResponse.ok(
      await this.colourSetService.update(params.id, body),
      tk("colourSet.updated"),
    );
  }
}
