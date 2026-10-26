import type { DtoType, Pagination } from "@repo/http-kit";
import type { StockMovementListQuery } from "@repo/shared";

import { injectable } from "tsyringe";

import { PaginationHelper } from "@repo/http-kit";

import { StockMovementRepository } from "./stock-movement.repository";
import { StockMovementDto } from "./stock.dto";

@injectable()
export class StockMovementService {
  constructor(private readonly movementRepository: StockMovementRepository) {}

  async list(query: StockMovementListQuery): Promise<{
    items: Array<DtoType<typeof StockMovementDto>>;
    pagination: Pagination;
  }> {
    const { rows, total } = await this.movementRepository.list(query);
    return {
      items: rows.map((row) =>
        StockMovementDto.parse({
          id: row.movement.id,
          variantId: row.movement.variantId,
          productId: row.productId,
          productName: row.productName,
          volumeMl: row.volumeMl,
          sku: row.sku,
          type: row.movement.type,
          quantityDelta: row.movement.quantityDelta,
          balanceAfter: row.movement.balanceAfter,
          batchId: row.movement.batchId,
          batchNumber: row.batchNumber,
          dailySaleId: row.movement.dailySaleId,
          saleDate: row.saleDate,
          adjustmentId: row.movement.adjustmentId,
          adjustmentReason: row.adjustmentReason,
          createdByName: row.createdByName,
          createdAt: row.movement.createdAt.toISOString(),
        }),
      ),
      pagination: PaginationHelper.build({ page: query.page, perPage: query.perPage, total }),
    };
  }
}
