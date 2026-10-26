import type { DtoType } from "@repo/http-kit";

import {
  ApiResponse,
  Body,
  Controller,
  Get,
  OkResponse,
  Post,
  UseMiddleware,
  Validate,
} from "@repo/http-kit";

import { requireAdmin } from "../auth/auth.middleware";
import {
  CalculatorDefaultsDto,
  CostEstimateInputDto,
  CostEstimateResultDto,
} from "./calculator.dto";
import { CalculatorService } from "./calculator.service";

@Controller("/admin/calculator", ["Calculator"])
@UseMiddleware(requireAdmin())
export class CalculatorController {
  constructor(private readonly calculatorService: CalculatorService) {}

  @Get("/defaults", { summary: "Default wastage for new estimates" })
  @OkResponse(CalculatorDefaultsDto, "Defaults")
  async defaults() {
    return ApiResponse.ok(await this.calculatorService.defaults());
  }

  // POST (not GET) because an estimate is a nested document; nothing is saved.
  @Post("/estimate", { summary: "Paint quantities, cans and cost for an estimate" })
  @OkResponse(CostEstimateResultDto, "Estimate")
  @Validate({ body: CostEstimateInputDto })
  async estimate(@Body() body: DtoType<typeof CostEstimateInputDto>) {
    return ApiResponse.ok(await this.calculatorService.estimate(body));
  }
}
