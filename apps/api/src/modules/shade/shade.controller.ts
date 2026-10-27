import type { DtoType } from "@repo/http-kit";

import {
  ApiResponse,
  Body,
  Controller,
  CreatedResponse,
  Delete,
  Get,
  NoContentResponse,
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
import { ShadeInputDto, ShadeListItemDto, ShadeListQueryDto, ShadeResponseDto } from "./shade.dto";
import { ShadeService } from "./shade.service";

@Controller("/admin/shades", ["Shades"])
@UseMiddleware(requireAdmin())
export class ShadeController {
  constructor(private readonly shadeService: ShadeService) {}

  @Get("/", { summary: "List shades" })
  @PaginatedOkResponse(ShadeListItemDto, "Shades")
  @Validate({ query: ShadeListQueryDto })
  async list(@Query() query: DtoType<typeof ShadeListQueryDto>) {
    const { items, pagination } = await this.shadeService.list(query);
    return new PaginatedResponse(items, pagination);
  }

  @Post("/", { summary: "Create a shade" })
  @CreatedResponse(ShadeResponseDto, "Created")
  @Validate({ body: ShadeInputDto })
  async create(@Body() body: DtoType<typeof ShadeInputDto>) {
    return ApiResponse.created(await this.shadeService.create(body), tk("shade.created"));
  }

  @Get("/:id", { summary: "One shade" })
  @OkResponse(ShadeResponseDto, "Shade")
  @Validate({ params: IdParamsDto })
  async get(@Params() params: DtoType<typeof IdParamsDto>) {
    return ApiResponse.ok(await this.shadeService.get(params.id));
  }

  @Put("/:id", { summary: "Edit or (de)activate a shade" })
  @OkResponse(ShadeResponseDto, "Updated")
  @Validate({ params: IdParamsDto, body: ShadeInputDto })
  async update(
    @Params() params: DtoType<typeof IdParamsDto>,
    @Body() body: DtoType<typeof ShadeInputDto>,
  ) {
    return ApiResponse.ok(await this.shadeService.update(params.id, body), tk("shade.updated"));
  }

  @Delete("/:id", { summary: "Delete a shade no colour set uses" })
  @NoContentResponse("Deleted")
  @Validate({ params: IdParamsDto })
  async delete(@Params() params: DtoType<typeof IdParamsDto>) {
    await this.shadeService.delete(params.id);
    return ApiResponse.noContent(tk("shade.deleted"));
  }
}
