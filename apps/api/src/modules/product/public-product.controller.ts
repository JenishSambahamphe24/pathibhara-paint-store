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
import {
  PublicProductDto,
  PublicProductListItemDto,
  PublicProductListQueryDto,
} from "./product.dto";
import { PublicProductService } from "./public-product.service";

@Controller("/public/products", ["Public"])
export class PublicProductController {
  constructor(private readonly publicProductService: PublicProductService) {}

  @Get("/", { summary: "List products on sale" })
  @PaginatedOkResponse(PublicProductListItemDto, "Products")
  @Validate({ query: PublicProductListQueryDto })
  async list(@Query() query: DtoType<typeof PublicProductListQueryDto>) {
    const { items, pagination } = await this.publicProductService.list(query);
    return new PaginatedResponse(items, pagination);
  }

  @Get("/:slug", { summary: "One product with sizes, availability, images and shades" })
  @OkResponse(PublicProductDto, "Product")
  @NotFoundResponse("No visible product has this slug; try /public/redirects")
  @Validate({ params: SlugParamsDto })
  async get(@Params() params: DtoType<typeof SlugParamsDto>) {
    return ApiResponse.ok(await this.publicProductService.getBySlug(params.slug));
  }
}
