import type { DtoType } from "@repo/http-kit";

import {
  ApiResponse,
  Controller,
  Get,
  OkResponse,
  PaginatedOkResponse,
  PaginatedResponse,
  Params,
  Query,
  UseMiddleware,
  Validate,
} from "@repo/http-kit";

import { requireAdmin } from "../auth/auth.middleware";
import { IdParamsDto } from "../common/id-params.dto";
import { VariantSearchQueryDto, VariantSummaryDto } from "./product.dto";
import { ProductService } from "./product.service";

@Controller("/admin/variants", ["Products"])
@UseMiddleware(requireAdmin())
export class VariantController {
  constructor(private readonly productService: ProductService) {}

  @Get("/", { summary: "Search product sizes (for stock pickers)" })
  @PaginatedOkResponse(VariantSummaryDto, "Sizes")
  @Validate({ query: VariantSearchQueryDto })
  async search(@Query() query: DtoType<typeof VariantSearchQueryDto>) {
    const { items, pagination } = await this.productService.searchVariants(query);
    return new PaginatedResponse(items, pagination);
  }

  @Get("/:id", { summary: "One product size with its current stock" })
  @OkResponse(VariantSummaryDto, "Size")
  @Validate({ params: IdParamsDto })
  async get(@Params() params: DtoType<typeof IdParamsDto>) {
    return ApiResponse.ok(await this.productService.getVariant(params.id));
  }
}
