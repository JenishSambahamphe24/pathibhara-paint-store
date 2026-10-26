import type { DtoType, Pagination } from "@repo/http-kit";
import type { StockAdjustmentListQuery } from "@repo/shared";

import { injectable } from "tsyringe";

import { TransactionManager } from "@repo/database";
import {
  ConflictException,
  I18nService,
  NotFoundException,
  PaginationHelper,
} from "@repo/http-kit";

import { tk } from "#i18n/tk";

import { StockAdjustmentRepository } from "./stock-adjustment.repository";
import { InsufficientStockException, StockLedgerService } from "./stock-ledger.service";
import { StockLineValidator } from "./stock-line.validator";
import { StockAdjustmentDto, StockAdjustmentInputDto } from "./stock.dto";

type TRow = NonNullable<Awaited<ReturnType<StockAdjustmentRepository["findById"]>>>;

@injectable()
export class StockAdjustmentService {
  constructor(
    private readonly txManager: TransactionManager,
    private readonly adjustmentRepository: StockAdjustmentRepository,
    private readonly ledger: StockLedgerService,
    private readonly lineValidator: StockLineValidator,
    private readonly i18n: I18nService,
  ) {}

  async list(query: StockAdjustmentListQuery): Promise<{
    items: Array<DtoType<typeof StockAdjustmentDto>>;
    pagination: Pagination;
  }> {
    const { rows, total } = await this.adjustmentRepository.list(query);
    return {
      items: rows.map((row) => this.toDto(row)),
      pagination: PaginationHelper.build({ page: query.page, perPage: query.perPage, total }),
    };
  }

  async create(input: DtoType<typeof StockAdjustmentInputDto>, adminId: string) {
    // Allowed on inactive sizes too: a stock count can still find old cans.
    await this.lineValidator.assertExists(input.variantId, "variantId");

    const id = await this.txManager.run(async () => {
      const adjustment = await this.adjustmentRepository.create({
        variantId: input.variantId,
        quantityDelta: input.quantityDelta,
        reason: input.reason,
        note: input.note,
        createdBy: adminId,
      });
      try {
        await this.ledger.apply(
          [{ variantId: input.variantId, delta: input.quantityDelta }],
          { type: "adjustment", adjustmentId: adjustment.id },
          adminId,
        );
      } catch (err) {
        if (!(err instanceof InsufficientStockException)) throw err;
        const [shortage] = err.shortages;
        throw new ConflictException(tk("stock.insufficient"), {
          quantityDelta: this.i18n.t("stock.lineShortage", {
            available: shortage.available,
            requested: shortage.requested,
          }),
        });
      }
      return adjustment.id;
    });

    const row = await this.adjustmentRepository.findById(id);
    if (!row) throw new NotFoundException(tk("stock.adjustmentNotFound"));
    return this.toDto(row);
  }

  private toDto(row: TRow): DtoType<typeof StockAdjustmentDto> {
    return StockAdjustmentDto.parse({
      id: row.adjustment.id,
      variantId: row.adjustment.variantId,
      productId: row.productId,
      productName: row.productName,
      volumeMl: row.volumeMl,
      sku: row.sku,
      quantityDelta: row.adjustment.quantityDelta,
      reason: row.adjustment.reason,
      note: row.adjustment.note,
      createdByName: row.createdByName,
      createdAt: row.adjustment.createdAt.toISOString(),
    });
  }
}
