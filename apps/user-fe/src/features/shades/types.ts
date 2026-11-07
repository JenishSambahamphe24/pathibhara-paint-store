import type { ISlugRef } from "#/types/api.types";
import type { IShade } from "#/types/shade";

export interface IPublicShadeListItem extends IShade {
  // The product this shade is mixed in, when that product is on sale.
  product: ISlugRef | null;
}
