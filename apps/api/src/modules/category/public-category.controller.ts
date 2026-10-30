import type { DtoType } from "@repo/http-kit";

import {
  ApiResponse,
  Controller,
  Get,
  NotFoundResponse,
  OkArrayResponse,
  OkResponse,
  Params,
  Validate,
} from "@repo/http-kit";

import { SlugParamsDto } from "../common/slug-params.dto";
import { PublicCategoryDto } from "./category.dto";
import { PublicCategoryService } from "./public-category.service";

@Controller("/public/categories", ["Public"])
export class PublicCategoryController {
  constructor(private readonly publicCategoryService: PublicCategoryService) {}

  @Get("/", { summary: "Visible category tree, depth-first" })
  @OkArrayResponse(PublicCategoryDto, "Categories")
  async tree() {
    return ApiResponse.ok(await this.publicCategoryService.tree());
  }

  @Get("/:slug", { summary: "One visible category by slug" })
  @OkResponse(PublicCategoryDto, "Category")
  @NotFoundResponse("No visible category has this slug; try /public/redirects")
  @Validate({ params: SlugParamsDto })
  async get(@Params() params: DtoType<typeof SlugParamsDto>) {
    return ApiResponse.ok(await this.publicCategoryService.getBySlug(params.slug));
  }
}
