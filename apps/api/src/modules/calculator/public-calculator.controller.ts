import type { DtoType } from "@repo/http-kit";

import { ApiResponse, Body, Controller, Get, OkResponse, Post, Validate } from "@repo/http-kit";

import {
  CalculatorDefaultsDto,
  CostEstimateInputDto,
  PublicCostEstimateResultDto,
} from "./calculator.dto";
import { CalculatorService } from "./calculator.service";

@Controller("/public/calculator", ["Public"])
export class PublicCalculatorController {
  constructor(private readonly calculatorService: CalculatorService) {}

  @Get("/defaults", { summary: "Default wastage for a new estimate" })
  @OkResponse(CalculatorDefaultsDto, "Defaults")
  async defaults() {
    return ApiResponse.ok(await this.calculatorService.defaults());
  }

  // POST (not GET) because an estimate is a nested document; nothing is saved.
  @Post("/estimate", { summary: "Paint quantities, cans and price for products on sale" })
  @OkResponse(PublicCostEstimateResultDto, "Estimate")
  @Validate({ body: CostEstimateInputDto })
  async estimate(@Body() body: DtoType<typeof CostEstimateInputDto>) {
    return ApiResponse.ok(await this.calculatorService.estimatePublic(body));
  }
}
