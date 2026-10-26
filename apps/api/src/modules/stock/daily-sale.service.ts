import type { DtoType, Pagination } from "@repo/http-kit";
import type { DailySaleListQuery } from "@repo/shared";

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

import { DailySaleRepository } from "./daily-sale.repository";
import { InsufficientStockException, StockLedgerService } from "./stock-ledger.service";
import { StockLineValidator } from "./stock-line.validator";
import { DailySaleDetailDto, DailySaleInputDto, DailySaleListItemDto } from "./stock.dto";

type TSummaryRow = NonNullable<Awaited<ReturnType<DailySaleRepository["findSummaryByDate"]>>>;

@injectable()
export class DailySaleService {
  constructor(
    private readonly txManager: TransactionManager,
    private readonly saleRepository: DailySaleRepository,
    private readonly ledger: StockLedgerService,
    private readonly lineValidator: StockLineValidator,
    private readonly i18n: I18nService,
  ) {}

  async list(query: DailySaleListQuery): Promise<{
    items: Array<DtoType<typeof DailySaleListItemDto>>;
    pagination: Pagination;
  }> {
    const { rows, total } = await this.saleRepository.list(query);
    return {
      items: rows.map((row) => DailySaleListItemDto.parse(this.summary(row))),
      pagination: PaginationHelper.build({ page: query.page, perPage: query.perPage, total }),
    };
  }

  async getByDate(saleDate: string): Promise<DtoType<typeof DailySaleDetailDto>> {
    const row = await this.saleRepository.findSummaryByDate(saleDate);
    if (!row) throw new NotFoundException(tk("stock.saleNotFound"));
    const items = await this.saleRepository.findItems(row.sale.id);
    return DailySaleDetailDto.parse({
      ...this.summary(row),
      notes: row.sale.notes,
      createdByName: row.createdByName,
      createdAt: row.sale.createdAt.toISOString(),
      items: items.map((line) => ({
        id: line.item.id,
        variantId: line.item.variantId,
        productId: line.productId,
        productName: line.productName,
        volumeMl: line.volumeMl,
        sku: line.sku,
        quantity: line.item.quantity,
        unitPricePaisa: line.item.unitPricePaisa,
        currentStock: line.currentStock,
      })),
    });
  }

  // Creates the day's entry or edits it. Only the per-size difference between
  // what was saved and what is submitted reaches the ledger: a new day writes
  // `sale` movements, an edit writes `saleEdit` corrections.
  async save(saleDate: string, input: DtoType<typeof DailySaleInputDto>, adminId: string) {
    if (StoreDateHelper.isFuture(saleDate)) {
      throw new ValidationException({ saleDate: tk("stock.dateInFuture") });
    }

    await this.txManager.run(async () => {
      const existing = await this.saleRepository.lockByDate(saleDate);
      const sale =
        existing ??
        (await this.saleRepository.create({
          saleDate,
          notes: input.notes,
          createdBy: adminId,
          updatedBy: adminId,
        }));
      const oldLines = existing ? await this.saleRepository.lineItems(sale.id) : [];
      const oldByVariant = new Map(oldLines.map((line) => [line.variantId, line]));

      const added = input.items
        .map((item, index) => ({ ...item, index }))
        .filter((item) => !oldByVariant.has(item.variantId));
      const prices = await this.lineValidator.assertSellable(added);

      const newByVariant = new Map(input.items.map((item) => [item.variantId, item.quantity]));
      const variantIds = new Set([...oldByVariant.keys(), ...newByVariant.keys()]);
      const changes = [...variantIds].map((variantId) => ({
        variantId,
        delta: (oldByVariant.get(variantId)?.quantity ?? 0) - (newByVariant.get(variantId) ?? 0),
      }));

      try {
        await this.ledger.apply(
          changes,
          { type: existing ? "saleEdit" : "sale", dailySaleId: sale.id },
          adminId,
        );
      } catch (err) {
        if (!(err instanceof InsufficientStockException)) throw err;
        const errors: Record<string, string> = {};
        for (const shortage of err.shortages) {
          const index = input.items.findIndex((item) => item.variantId === shortage.variantId);
          errors[`items[${index}].quantity`] = this.i18n.t("stock.lineShortage", {
            available: shortage.available,
            requested: shortage.requested,
          });
        }
        throw new ConflictException(tk("stock.insufficient"), errors);
      }

      await this.saleRepository.deleteItems(
        oldLines.filter((line) => !newByVariant.has(line.variantId)).map((line) => line.id),
      );
      for (const line of oldLines) {
        const quantity = newByVariant.get(line.variantId);
        if (quantity !== undefined && quantity !== line.quantity) {
          await this.saleRepository.updateItemQuantity(line.id, quantity);
        }
      }
      await this.saleRepository.insertItems(
        added.map((item) => ({
          dailySaleId: sale.id,
          variantId: item.variantId,
          quantity: item.quantity,
          unitPricePaisa: prices.get(item.variantId)!.pricePaisa,
        })),
      );
      if (existing)
        await this.saleRepository.update(sale.id, { notes: input.notes, updatedBy: adminId });
    });

    return this.getByDate(saleDate);
  }

  private summary(row: TSummaryRow) {
    return {
      id: row.sale.id,
      saleDate: row.sale.saleDate,
      lineCount: row.lineCount,
      units: row.units,
      revenuePaisa: row.revenuePaisa,
      updatedByName: row.updatedByName,
      updatedAt: row.sale.updatedAt.toISOString(),
    };
  }
}
