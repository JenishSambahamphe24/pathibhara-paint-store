import type { DtoType } from "@repo/http-kit";
import type { ICalculatorProduct, TCalculatorErrorCode } from "@repo/shared";

import { injectable } from "tsyringe";

import { ValidationException } from "@repo/http-kit";
import { CalculatorError, CostCalculator } from "@repo/shared";

import { tk } from "#i18n/tk";

import {
  CalculatorDefaultsDto,
  CostEstimateInputDto,
  CostEstimateResultDto,
} from "./calculator.dto";
import { CalculatorRepository } from "./calculator.repository";

const ERROR_KEYS: Record<TCalculatorErrorCode, string> = {
  productNotFound: tk("calculator.productNotFound"),
  noActiveSizes: tk("calculator.noActiveSizes"),
  noPaintableArea: tk("calculator.noPaintableArea"),
};

@injectable()
export class CalculatorService {
  constructor(private readonly calculatorRepository: CalculatorRepository) {}

  async defaults(): Promise<DtoType<typeof CalculatorDefaultsDto>> {
    return { wastagePercent: (await this.calculatorRepository.defaultWastageBps()) / 100 };
  }

  async estimate(
    input: DtoType<typeof CostEstimateInputDto>,
  ): Promise<DtoType<typeof CostEstimateResultDto>> {
    const ids = [
      ...new Set(input.sections.flatMap((section) => section.products.map((p) => p.productId))),
    ];
    const catalogue = new Map<string, ICalculatorProduct>();
    for (const row of await this.calculatorRepository.findProducts(ids)) {
      const product = catalogue.get(row.id) ?? {
        id: row.id,
        name: row.name,
        coverageSqftPerLitre: row.coverageSqftPerLitre,
        variants: [],
      };
      if (row.variantId !== null && row.volumeMl !== null && row.pricePaisa !== null) {
        product.variants = [
          ...product.variants,
          {
            id: row.variantId,
            volumeMl: row.volumeMl,
            pricePaisa: row.pricePaisa,
            isActive: row.isActive ?? false,
            currentStock: row.currentStock ?? 0,
          },
        ];
      }
      catalogue.set(row.id, product);
    }

    try {
      return CostEstimateResultDto.parse(CostCalculator.estimate(input, catalogue));
    } catch (err) {
      if (err instanceof CalculatorError)
        throw new ValidationException({ [err.path]: ERROR_KEYS[err.code] });
      throw err;
    }
  }
}
