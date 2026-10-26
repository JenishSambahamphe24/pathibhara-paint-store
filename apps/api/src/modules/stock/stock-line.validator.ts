import { injectable } from "tsyringe";

import { ValidationException } from "@repo/http-kit";

import { tk } from "#i18n/tk";

import { ProductRepository } from "../product/product.repository";

@injectable()
export class StockLineValidator {
  constructor(private readonly productRepository: ProductRepository) {}

  async assertExists(variantId: string, field: string): Promise<void> {
    const [row] = await this.productRepository.findVariantSummaries([variantId]);
    if (!row) throw new ValidationException({ [field]: tk("product.variantNotFound") });
  }

  // New stock lines must point at sizes that exist and are on sale. Lines
  // already recorded keep working after a size is deactivated, so callers
  // pass only the lines being added.
  async assertSellable(lines: Array<{ variantId: string; index: number }>) {
    if (lines.length === 0) return new Map<string, { pricePaisa: number }>();
    const found = new Map(
      (await this.productRepository.findVariantSummaries(lines.map((l) => l.variantId))).map(
        (row) => [row.variant.id, row],
      ),
    );
    const errors: Record<string, string> = {};
    for (const line of lines) {
      const row = found.get(line.variantId);
      if (!row) errors[`items[${line.index}].variantId`] = tk("product.variantNotFound");
      else if (!row.variant.isActive || !row.productIsActive) {
        errors[`items[${line.index}].variantId`] = tk("stock.variantInactive");
      }
    }
    if (Object.keys(errors).length > 0) throw new ValidationException(errors);
    return new Map([...found].map(([id, row]) => [id, { pricePaisa: row.variant.pricePaisa }]));
  }
}
