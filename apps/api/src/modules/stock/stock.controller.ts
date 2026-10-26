import type { AuthenticatedRequest } from "../auth/auth.types";
import type { DtoType } from "@repo/http-kit";
import type { Request } from "express";

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
  Req,
  UseMiddleware,
  Validate,
} from "@repo/http-kit";

import { tk } from "#i18n/tk";

import { requireAdmin } from "../auth/auth.middleware";
import { IdParamsDto } from "../common/id-params.dto";
import { DailySaleService } from "./daily-sale.service";
import { StockAdjustmentService } from "./stock-adjustment.service";
import { StockBatchService } from "./stock-batch.service";
import { StockMovementService } from "./stock-movement.service";
import {
  DailySaleDetailDto,
  DailySaleInputDto,
  DailySaleListItemDto,
  DailySaleListQueryDto,
  SaleDateParamsDto,
  StockAdjustmentDto,
  StockAdjustmentInputDto,
  StockAdjustmentListQueryDto,
  StockBatchDetailDto,
  StockBatchInputDto,
  StockBatchListItemDto,
  StockBatchListQueryDto,
  StockBatchVoidDto,
  StockMovementDto,
  StockMovementListQueryDto,
} from "./stock.dto";

function adminId(req: Request): string {
  return (req as AuthenticatedRequest).auth.adminId;
}

@Controller("/admin/stock", ["Stock"])
@UseMiddleware(requireAdmin())
export class StockController {
  constructor(
    private readonly batchService: StockBatchService,
    private readonly saleService: DailySaleService,
    private readonly adjustmentService: StockAdjustmentService,
    private readonly movementService: StockMovementService,
  ) {}

  @Get("/batches", { summary: "List stock-in batches" })
  @PaginatedOkResponse(StockBatchListItemDto, "Batches")
  @Validate({ query: StockBatchListQueryDto })
  async listBatches(@Query() query: DtoType<typeof StockBatchListQueryDto>) {
    const { items, pagination } = await this.batchService.list(query);
    return new PaginatedResponse(items, pagination);
  }

  @Post("/batches", { summary: "Record a stock-in batch" })
  @CreatedResponse(StockBatchDetailDto, "Recorded")
  @Validate({ body: StockBatchInputDto })
  async createBatch(@Body() body: DtoType<typeof StockBatchInputDto>, @Req() req: Request) {
    return ApiResponse.created(
      await this.batchService.create(body, adminId(req)),
      tk("stock.batchCreated"),
    );
  }

  @Get("/batches/:id", { summary: "One batch with its lines" })
  @OkResponse(StockBatchDetailDto, "Batch")
  @Validate({ params: IdParamsDto })
  async getBatch(@Params() params: DtoType<typeof IdParamsDto>) {
    return ApiResponse.ok(await this.batchService.get(params.id));
  }

  @Post("/batches/:id/void", { summary: "Void a batch, reversing its stock" })
  @OkResponse(StockBatchDetailDto, "Voided")
  @Validate({ params: IdParamsDto, body: StockBatchVoidDto })
  async voidBatch(
    @Params() params: DtoType<typeof IdParamsDto>,
    @Body() body: DtoType<typeof StockBatchVoidDto>,
    @Req() req: Request,
  ) {
    return ApiResponse.ok(
      await this.batchService.void(params.id, body, adminId(req)),
      tk("stock.batchVoided"),
    );
  }

  @Get("/daily-sales", { summary: "List daily sales entries" })
  @PaginatedOkResponse(DailySaleListItemDto, "Daily sales")
  @Validate({ query: DailySaleListQueryDto })
  async listSales(@Query() query: DtoType<typeof DailySaleListQueryDto>) {
    const { items, pagination } = await this.saleService.list(query);
    return new PaginatedResponse(items, pagination);
  }

  @Get("/daily-sales/:date", { summary: "One day's sales (404 when not recorded yet)" })
  @OkResponse(DailySaleDetailDto, "Daily sales")
  @Validate({ params: SaleDateParamsDto })
  async getSale(@Params() params: DtoType<typeof SaleDateParamsDto>) {
    return ApiResponse.ok(await this.saleService.getByDate(params.date));
  }

  @Put("/daily-sales/:date", { summary: "Record or edit one day's sales" })
  @OkResponse(DailySaleDetailDto, "Saved")
  @Validate({ params: SaleDateParamsDto, body: DailySaleInputDto })
  async saveSale(
    @Params() params: DtoType<typeof SaleDateParamsDto>,
    @Body() body: DtoType<typeof DailySaleInputDto>,
    @Req() req: Request,
  ) {
    return ApiResponse.ok(
      await this.saleService.save(params.date, body, adminId(req)),
      tk("stock.saleSaved"),
    );
  }

  @Get("/adjustments", { summary: "List stock adjustments" })
  @PaginatedOkResponse(StockAdjustmentDto, "Adjustments")
  @Validate({ query: StockAdjustmentListQueryDto })
  async listAdjustments(@Query() query: DtoType<typeof StockAdjustmentListQueryDto>) {
    const { items, pagination } = await this.adjustmentService.list(query);
    return new PaginatedResponse(items, pagination);
  }

  @Post("/adjustments", { summary: "Correct stock with a reason" })
  @CreatedResponse(StockAdjustmentDto, "Recorded")
  @Validate({ body: StockAdjustmentInputDto })
  async createAdjustment(
    @Body() body: DtoType<typeof StockAdjustmentInputDto>,
    @Req() req: Request,
  ) {
    return ApiResponse.created(
      await this.adjustmentService.create(body, adminId(req)),
      tk("stock.adjustmentCreated"),
    );
  }

  @Get("/movements", { summary: "The stock ledger" })
  @PaginatedOkResponse(StockMovementDto, "Movements")
  @Validate({ query: StockMovementListQueryDto })
  async listMovements(@Query() query: DtoType<typeof StockMovementListQueryDto>) {
    const { items, pagination } = await this.movementService.list(query);
    return new PaginatedResponse(items, pagination);
  }
}
