import { VolumeHelper } from "@repo/shared";

export class VariantLabelHelper {
  static label(variant: { productName: string; volumeMl: number }): string {
    return `${variant.productName} · ${VolumeHelper.label(variant.volumeMl)}`;
  }
}
