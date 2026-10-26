import type { StockMovementType } from "@repo/shared";

import { injectable } from "tsyringe";

import { TransactionManager } from "@repo/database";
import { ConflictException, ValidationException } from "@repo/http-kit";
import { VolumeHelper } from "@repo/shared";

import { tk } from "#i18n/tk";

import { StockLedgerRepository } from "./stock-ledger.repository";

export interface IStockChange {
  variantId: string;
  delta: number;
}

export interface IStockSource {
  type: StockMovementType;
  batchId?: string;
  dailySaleId?: string;
  adjustmentId?: string;
}

export interface IShortage {
  variantId: string;
  label: string;
  available: number;
  requested: number;
}

// Thrown before anything is written, listing every short variant at once so
// the admin can fix the whole form in one go.
export class InsufficientStockException extends ConflictException {
  constructor(readonly shortages: Array<IShortage>) {
    super(tk("stock.insufficient"));
  }
}

@injectable()
export class StockLedgerService {
  constructor(
    private readonly txManager: TransactionManager,
    private readonly ledgerRepository: StockLedgerRepository,
  ) {}

  // The only way stock changes. Must run inside the caller's transaction so
  // the domain rows (batch, sale, adjustment) and their movements commit or
  // roll back together.
  async apply(changes: Array<IStockChange>, source: IStockSource, adminId: string): Promise<void> {
    if (!this.txManager.isActive()) {
      throw new Error("StockLedgerService.apply must run inside txManager.run()");
    }

    const net = new Map<string, number>();
    for (const change of changes) {
      net.set(change.variantId, (net.get(change.variantId) ?? 0) + change.delta);
    }
    const effective = [...net.entries()].filter(([, delta]) => delta !== 0);
    if (effective.length === 0) return;

    const locked = await this.ledgerRepository.lockVariants(effective.map(([id]) => id));
    const byId = new Map(locked.map((variant) => [variant.id, variant]));

    const missing = effective.filter(([id]) => !byId.has(id));
    if (missing.length > 0) {
      throw new ValidationException(
        Object.fromEntries(missing.map(([id]) => [id, tk("product.variantNotFound")])),
      );
    }

    const shortages: Array<IShortage> = [];
    for (const [id, delta] of effective) {
      const variant = byId.get(id)!;
      if (variant.currentStock + delta < 0) {
        shortages.push({
          variantId: id,
          label: `${variant.productName} ${VolumeHelper.label(variant.volumeMl)}`,
          available: variant.currentStock,
          requested: -delta,
        });
      }
    }
    if (shortages.length > 0) throw new InsufficientStockException(shortages);

    // Same id order as the locks, purely for predictable movement ordering.
    for (const [variantId, delta] of effective.sort(([a], [b]) => a.localeCompare(b))) {
      const balanceAfter = await this.ledgerRepository.applyDelta(variantId, delta);
      await this.ledgerRepository.insertMovement({
        variantId,
        type: source.type,
        quantityDelta: delta,
        balanceAfter,
        createdBy: adminId,
        batchId: source.batchId,
        dailySaleId: source.dailySaleId,
        adjustmentId: source.adjustmentId,
      });
    }
  }
}
