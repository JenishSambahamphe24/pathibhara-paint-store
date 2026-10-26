import type { DtoType, Pagination } from "@repo/http-kit";
import type { StockBatchListQuery } from "@repo/shared";

import { injectable } from "tsyringe";

import { TransactionManager } from "@repo/database";
import {
  ConflictException,
  I18nService,
  NotFoundException,
  PaginationHelper,
  ValidationException,
} from "@repo/http-kit";
import { StoreDateHelper } from "@repo/shared";

import { tk } from "#i18n/tk";

import { StockBatchRepository } from "./stock-batch.repository";
import { InsufficientStockException, StockLedgerService } from "./stock-ledger.service";
import { StockLineValidator } from "./stock-line.validator";
import {
  StockBatchDetailDto,
  StockBatchInputDto,
  StockBatchListItemDto,
  StockBatchVoidDto,
} from "./stock.dto";

type TBatchSummaryRow = Awaited<ReturnType<StockBatchRepository["list"]>>["rows"][number];

@injectable()
export class StockBatchService {
  constructor(
    private readonly txManager: TransactionManager,
    private readonly batchRepository: StockBatchRepository,
    private readonly ledger: StockLedgerService,
    private readonly lineValidator: StockLineValidator,
    private readonly i18n: I18nService,
  ) {}

  async list(query: StockBatchListQuery): Promise<{
    items: Array<DtoType<typeof StockBatchListItemDto>>;
    pagination: Pagination;
  }> {
    const { rows, total } = await this.batchRepository.list(query);
    return {
      items: rows.map((row) => StockBatchListItemDto.parse(this.summary(row))),
      pagination: PaginationHelper.build({ page: query.page, perPage: query.perPage, total }),
    };
  }

  async get(id: string): Promise<DtoType<typeof StockBatchDetailDto>> {
    const row = await this.batchRepository.findDetail(id);
    if (!row) throw new NotFoundException(tk("stock.batchNotFound"));
    const items = await this.batchRepository.findItems(id);
    return StockBatchDetailDto.parse({
      ...this.summary(row),
      notes: row.batch.notes,
      voidedAt: row.batch.voidedAt?.toISOString() ?? null,
      voidedByName: row.voidedByName,
      voidReason: row.batch.voidReason,
      items: items.map((line) => ({
        id: line.item.id,
        variantId: line.item.variantId,
        productId: line.productId,
        productName: line.productName,
        volumeMl: line.volumeMl,
        sku: line.sku,
        quantity: line.item.quantity,
        unitCostPaisa: line.item.unitCostPaisa,
        currentStock: line.currentStock,
      })),
    });
  }

  async create(input: DtoType<typeof StockBatchInputDto>, adminId: string) {
    if (StoreDateHelper.isFuture(input.receivedOn)) {
      throw new ValidationException({ receivedOn: tk("stock.dateInFuture") });
    }
    await this.lineValidator.assertSellable(
      input.items.map((item, index) => ({ variantId: item.variantId, index })),
    );

    const id = await this.txManager.run(async () => {
      const batch = await this.batchRepository.create({
        receivedOn: input.receivedOn,
        supplierName: input.supplierName,
        notes: input.notes,
        createdBy: adminId,
      });
      await this.batchRepository.insertItems(
        input.items.map((item) => ({
          batchId: batch.id,
          variantId: item.variantId,
          quantity: item.quantity,
          unitCostPaisa: item.unitCostPaisa,
        })),
      );
      await this.ledger.apply(
        input.items.map((item) => ({ variantId: item.variantId, delta: item.quantity })),
        { type: "batchIn", batchId: batch.id },
        adminId,
      );
      return batch.id;
    });
    return this.get(id);
  }

  // Reverses the batch through the ledger. If some of its stock has already
  // been sold, the reversal would go negative, so it's refused with the sizes
  // named; the admin corrects the difference with an adjustment instead.
  async void(id: string, input: DtoType<typeof StockBatchVoidDto>, adminId: string) {
    await this.txManager.run(async () => {
      const batch = await this.batchRepository.lockById(id);
      if (!batch) throw new NotFoundException(tk("stock.batchNotFound"));
      if (batch.voidedAt) throw new ConflictException(tk("stock.batchAlreadyVoided"));

      const items = await this.batchRepository.itemsForVoid(id);
      try {
        await this.ledger.apply(
          items.map((item) => ({ variantId: item.variantId, delta: -item.quantity })),
          { type: "batchVoid", batchId: id },
          adminId,
        );
      } catch (err) {
        if (!(err instanceof InsufficientStockException)) throw err;
        const detail = err.shortages
          .map((s) =>
            this.i18n.t("stock.voidShortageLine", {
              label: s.label,
              available: s.available,
              requested: s.requested,
            }),
          )
          .join("; ");
        throw new ConflictException(tk("stock.voidWouldGoNegative"), undefined, {
          batchNumber: batch.batchNumber,
          detail,
        });
      }
      await this.batchRepository.markVoided(id, { voidedBy: adminId, voidReason: input.reason });
    });
    return this.get(id);
  }

  private summary(row: TBatchSummaryRow) {
    return {
      id: row.batch.id,
      batchNumber: row.batch.batchNumber,
      receivedOn: row.batch.receivedOn,
      supplierName: row.batch.supplierName,
      status: row.batch.voidedAt ? ("voided" as const) : ("active" as const),
      itemCount: row.itemCount,
      totalUnits: row.totalUnits,
      totalCostPaisa: row.totalCostPaisa,
      createdByName: row.createdByName,
      createdAt: row.batch.createdAt.toISOString(),
    };
  }
}
