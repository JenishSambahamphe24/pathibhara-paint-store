import type { IPublicProduct, IPublicVariant } from "../types";
import type { StockAvailability } from "@repo/shared";

import { MoneyHelper, VolumeHelper } from "@repo/shared";

export class ProductHelper {
  static sortedVariants(product: IPublicProduct): Array<IPublicVariant> {
    return [...product.variants].sort((a, b) => a.volumeMl - b.volumeMl);
  }

  // What a bigger can saves against the same paint in the smallest cans, in
  // paisa. Null for the smallest can, or when it isn't a whole number of
  // small cans (no fair comparison).
  static savingPaisa(
    variant: IPublicVariant,
    smallest: IPublicVariant,
  ): number | null {
    if (variant.volumeMl === smallest.volumeMl) return null;
    if (variant.volumeMl % smallest.volumeMl !== 0) return null;
    const count = variant.volumeMl / smallest.volumeMl;
    const saving =
      MoneyHelper.multiply(smallest.pricePaisa, count) - variant.pricePaisa;
    return saving > 0 ? saving : null;
  }

  // The side of a square wall one litre covers, for "about one 6 × 6 ft wall
  // per coat".
  static wallSideFt(coverageSqftPerLitre: number): number {
    return Math.max(1, Math.round(Math.sqrt(coverageSqftPerLitre)));
  }

  static sizesLabel(variants: ReadonlyArray<IPublicVariant>): string {
    return variants
      .map((variant) => VolumeHelper.label(variant.volumeMl))
      .join(" · ");
  }

  static availabilityLabel(availability: StockAvailability): string {
    return {
      inStock: "In stock",
      lowStock: "Only a few left",
      askInStore: "Ask the store",
    }[availability];
  }
}
