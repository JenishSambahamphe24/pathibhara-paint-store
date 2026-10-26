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
  ProductInputDto,
  ProductListItemDto,
  ProductListQueryDto,
  ProductResponseDto,
} from "./product.dto";
import { ProductService } from "./product.service";

@Controller("/admin/products", ["Products"])
@UseMiddleware(requireAdmin())
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get("/", { summary: "List products" })
  @PaginatedOkResponse(ProductListItemDto, "Products")
  @Validate({ query: ProductListQueryDto })
  async list(@Query() query: DtoType<typeof ProductListQueryDto>) {
    const { items, pagination } = await this.productService.list(query);
    return new PaginatedResponse(items, pagination);
  }

  @Post("/", { summary: "Create a product with its sizes" })
  @CreatedResponse(ProductResponseDto, "Created")
  @Validate({ body: ProductInputDto })
  async create(@Body() body: DtoType<typeof ProductInputDto>) {
    return ApiResponse.created(await this.productService.create(body), tk("product.created"));
  }

  @Get("/:id", { summary: "One product with sizes and images" })
  @OkResponse(ProductResponseDto, "Product")
  @Validate({ params: IdParamsDto })
  async get(@Params() params: DtoType<typeof IdParamsDto>) {
    return ApiResponse.ok(await this.productService.get(params.id));
  }

  @Put("/:id", { summary: "Replace a product's details, sizes and images" })
  @OkResponse(ProductResponseDto, "Updated")
  @Validate({ params: IdParamsDto, body: ProductInputDto })
  async update(
    @Params() params: DtoType<typeof IdParamsDto>,
    @Body() body: DtoType<typeof ProductInputDto>,
  ) {
    return ApiResponse.ok(await this.productService.update(params.id, body), tk("product.updated"));
  }
}
