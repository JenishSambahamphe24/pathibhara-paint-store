import type { CostEstimate } from "./calculator.schemas";

import { MoneyHelper } from "../money/money.helper";
import { AreaMath } from "./calculator.schemas";
import { ContainerPlanner } from "./container-planner";

export interface ICalculatorVariant {
  id: string;
  volumeMl: number;
  pricePaisa: number;
  isActive: boolean;
  // Present only for the admin view, which flags cans the shop can't supply.
  currentStock?: number;
}

export interface ICalculatorProduct {
  id: string;
  name: string;
  coverageSqftPerLitre: number;
  variants: ReadonlyArray<ICalculatorVariant>;
}

export interface IEstimateContainer {
  variantId: string;
  volumeMl: number;
  count: number;
  unitPricePaisa: number;
  lineTotalPaisa: number;
  currentStock: number | null;
  isShort: boolean;
}

export interface IEstimateProductLine {
  productId: string;
  name: string;
  coats: number;
  coverageSqftPerLitre: number;
  areaSqft: number;
  // Paint the job needs, including wastage, before rounding to can sizes.
  requiredMl: number;
  // Rounded up to a multiple of the product's smallest can.
  roundedMl: number;
  purchasedMl: number;
  overshootMl: number;
  containers: Array<IEstimateContainer>;
  costPaisa: number;
  hasStockShortage: boolean;
}

export interface IEstimateSection {
  name: string;
  grossAreaSqft: number;
  deductionAreaSqft: number;
  netAreaSqft: number;
  products: Array<IEstimateProductLine>;
  subtotalPaisa: number;
}

export interface ICostEstimateResult {
  wastagePercent: number;
  sections: Array<IEstimateSection>;
  totalPaisa: number;
  hasStockShortage: boolean;
}

export type TCalculatorErrorCode = "productNotFound" | "noActiveSizes" | "noPaintableArea";

export class CalculatorError extends Error {
  constructor(
    readonly code: TCalculatorErrorCode,
    readonly path: string,
  ) {
    super(code);
    this.name = "CalculatorError";
  }
}

// Float noise (e.g. 15999.999999998 ml) must not round a whole litre up.
const ML_EPSILON = 1e-6;

export class CostCalculator {
  static estimate(input: CostEstimate, products: ReadonlyMap<string, ICalculatorProduct>): ICostEstimateResult {
    const sections = input.sections.map((section, sectionIndex) => {
      const grossAreaSqft = AreaMath.total(section.surfaces);
      const deductionAreaSqft = AreaMath.total(section.deductions);
      const netAreaSqft = grossAreaSqft - deductionAreaSqft;
      if (netAreaSqft <= 0) {
        throw new CalculatorError("noPaintableArea", `sections[${sectionIndex}].deductions`);
      }

      const lines = section.products.map((choice, productIndex) => {
        const path = `sections[${sectionIndex}].products[${productIndex}].productId`;
        const product = products.get(choice.productId);
        if (!product) throw new CalculatorError("productNotFound", path);
        return CostCalculator.line(product, choice.coats, netAreaSqft, input.wastagePercent, path);
      });

      return {
        name: section.name,
        grossAreaSqft: CostCalculator.round2(grossAreaSqft),
        deductionAreaSqft: CostCalculator.round2(deductionAreaSqft),
        netAreaSqft: CostCalculator.round2(netAreaSqft),
        products: lines,
        subtotalPaisa: lines.reduce((sum, line) => sum + line.costPaisa, 0),
      };
    });

    return {
      wastagePercent: input.wastagePercent,
      sections,
      totalPaisa: sections.reduce((sum, section) => sum + section.subtotalPaisa, 0),
      hasStockShortage: sections.some((section) => section.products.some((line) => line.hasStockShortage)),
    };
  }

  private static line(
    product: ICalculatorProduct,
    coats: number,
    areaSqft: number,
    wastagePercent: number,
    path: string,
  ): IEstimateProductLine {
    const sizes = product.variants.filter((variant) => variant.isActive);
    if (sizes.length === 0) throw new CalculatorError("noActiveSizes", path);

    const exactMl = (areaSqft * coats * (1 + wastagePercent / 100) * 1000) / product.coverageSqftPerLitre;
    const requiredMl = Math.ceil(exactMl - ML_EPSILON);
    const smallestMl = Math.min(...sizes.map((size) => size.volumeMl));
    const roundedMl = Math.ceil(requiredMl / smallestMl) * smallestMl;

    const plan = ContainerPlanner.plan(roundedMl, sizes);
    const containers = plan.containers.map(({ size, count }) => {
      const currentStock = size.currentStock ?? null;
      return {
        variantId: size.id,
        volumeMl: size.volumeMl,
        count,
        unitPricePaisa: size.pricePaisa,
        lineTotalPaisa: MoneyHelper.multiply(size.pricePaisa, count),
        currentStock,
        isShort: currentStock !== null && currentStock < count,
      };
    });

    return {
      productId: product.id,
      name: product.name,
      coats,
      coverageSqftPerLitre: product.coverageSqftPerLitre,
      areaSqft: CostCalculator.round2(areaSqft),
      requiredMl,
      roundedMl,
      purchasedMl: plan.totalMl,
      overshootMl: plan.totalMl - requiredMl,
      containers,
      costPaisa: containers.reduce((sum, container) => sum + container.lineTotalPaisa, 0),
      hasStockShortage: containers.some((container) => container.isShort),
    };
  }

  private static round2(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
