import type { DtoType } from "@repo/http-kit";

import {
  ApiResponse,
  Body,
  Controller,
  CreatedResponse,
  Delete,
  Get,
  NoContentResponse,
  OkArrayResponse,
  OkResponse,
  Params,
  Post,
  Put,
  UseMiddleware,
  Validate,
} from "@repo/http-kit";

import { tk } from "#i18n/tk";

import { requireAdmin } from "../auth/auth.middleware";
import { IdParamsDto } from "../common/id-params.dto";
import { CategoryInputDto, CategoryReorderDto, CategoryResponseDto } from "./category.dto";
import { CategoryService } from "./category.service";

@Controller("/admin/categories", ["Categories"])
@UseMiddleware(requireAdmin())
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get("/", { summary: "Whole category tree, depth-first" })
  @OkArrayResponse(CategoryResponseDto, "Categories")
  async list() {
    return ApiResponse.ok(await this.categoryService.list());
  }

  @Post("/", { summary: "Create a category" })
  @CreatedResponse(CategoryResponseDto, "Created")
  @Validate({ body: CategoryInputDto })
  async create(@Body() body: DtoType<typeof CategoryInputDto>) {
    return ApiResponse.created(await this.categoryService.create(body), tk("category.created"));
  }

  @Post("/reorder", { summary: "Set the order of one parent's children" })
  @OkArrayResponse(CategoryResponseDto, "Categories")
  @Validate({ body: CategoryReorderDto })
  async reorder(@Body() body: DtoType<typeof CategoryReorderDto>) {
    return ApiResponse.ok(await this.categoryService.reorder(body), tk("category.reordered"));
  }

  @Get("/:id", { summary: "One category" })
  @OkResponse(CategoryResponseDto, "Category")
  @Validate({ params: IdParamsDto })
  async get(@Params() params: DtoType<typeof IdParamsDto>) {
    return ApiResponse.ok(await this.categoryService.get(params.id));
  }

  @Put("/:id", { summary: "Rename, move, re-slug or (de)activate a category" })
  @OkResponse(CategoryResponseDto, "Updated")
  @Validate({ params: IdParamsDto, body: CategoryInputDto })
  async update(
    @Params() params: DtoType<typeof IdParamsDto>,
    @Body() body: DtoType<typeof CategoryInputDto>,
  ) {
    return ApiResponse.ok(
      await this.categoryService.update(params.id, body),
      tk("category.updated"),
    );
  }

  @Delete("/:id", { summary: "Delete an empty category" })
  @NoContentResponse("Deleted")
  @Validate({ params: IdParamsDto })
  async delete(@Params() params: DtoType<typeof IdParamsDto>) {
    await this.categoryService.delete(params.id);
    return ApiResponse.noContent(tk("category.deleted"));
  }
}
