import type {
  IProduct,
  TProductFormValues,
  TProductVariantFormValue,
} from "../types";

import { ContentFormHelper } from "#/lib/helpers/contentForm.helper";

export class ProductFormHelper {
  static emptyVariant(): TProductVariantFormValue {
    return {
      volumeMl: null,
      pricePaisa: null,
      sku: "",
      reorderLevel: 0,
      isActive: true,
    };
  }

  static defaults(
    product: IProduct | null,
    categoryId: string | null,
  ): TProductFormValues {
    if (!product) {
      return {
        categoryId,
        slug: "",
        coverageSqftPerLitre: null,
        defaultCoats: 2,
        isActive: true,
        ...ContentFormHelper.empty(),
        imageFileIds: [],
        variants: [ProductFormHelper.emptyVariant()],
      };
    }
    return {
      categoryId: product.categoryId,
      slug: product.slug,
      coverageSqftPerLitre: product.coverageSqftPerLitre,
      defaultCoats: product.defaultCoats,
      isActive: product.isActive,
      ...ContentFormHelper.fromApi(product),
      imageFileIds: product.images.map((image) => image.id),
      variants: product.variants.map((variant) => ({
        id: variant.id,
        volumeMl: variant.volumeMl,
        pricePaisa: variant.pricePaisa,
        sku: variant.sku,
        reorderLevel: variant.reorderLevel,
        isActive: variant.isActive,
      })),
    };
  }
}
