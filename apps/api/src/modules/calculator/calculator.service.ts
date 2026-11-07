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
  PublicCostEstimateResultDto,
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
    const rows = await this.calculatorRepository.findProducts(CalculatorService.productIds(input));
    return CostEstimateResultDto.parse(this.run(input, rows, true));
  }

  // The customer's estimate never sees stock: without currentStock the
  // calculator flags nothing as short, and the DTO drops those fields.
  async estimatePublic(
    input: DtoType<typeof CostEstimateInputDto>,
  ): Promise<DtoType<typeof PublicCostEstimateResultDto>> {
    const rows = await this.calculatorRepository.findProducts(CalculatorService.productIds(input), {
      publicOnly: true,
    });
    return PublicCostEstimateResultDto.parse(this.run(input, rows, false));
  }

  private static productIds(input: DtoType<typeof CostEstimateInputDto>): Array<string> {
    return [
      ...new Set(input.sections.flatMap((section) => section.products.map((p) => p.productId))),
    ];
  }

  private run(
    input: DtoType<typeof CostEstimateInputDto>,
    rows: Awaited<ReturnType<CalculatorRepository["findProducts"]>>,
    withStock: boolean,
  ) {
    const catalogue = new Map<string, ICalculatorProduct>();
    for (const row of rows) {
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
            ...(withStock && { currentStock: row.currentStock ?? 0 }),
          },
        ];
      }
      catalogue.set(row.id, product);
    }

    try {
      return CostCalculator.estimate(input, catalogue);
    } catch (err) {
      if (err instanceof CalculatorError)
        throw new ValidationException({ [err.path]: ERROR_KEYS[err.code] });
      throw err;
    }
  }
}
