import { encode } from "blurhash";
import sharp from "sharp";

export interface IImageMeta {
  blurHash: string | null;
  width: number | null;
  height: number | null;
}

// A missing placeholder must never block an upload, so decode failures
// return nulls instead of throwing.
export class BlurHashHelper {
  private static readonly SAMPLE_DIM = 32;

  static async fromBuffer(buffer: Buffer): Promise<IImageMeta> {
    try {
      const metadata = await sharp(buffer, { failOn: "none" }).metadata();
      const { data, info } = await sharp(buffer, { failOn: "none" })
        .raw()
        .ensureAlpha()
        .resize(BlurHashHelper.SAMPLE_DIM, BlurHashHelper.SAMPLE_DIM, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .toBuffer({ resolveWithObject: true });

      return {
        blurHash: encode(new Uint8ClampedArray(data), info.width, info.height, 4, 3),
        width: metadata.width ?? null,
        height: metadata.height ?? null,
      };
    } catch {
      return { blurHash: null, width: null, height: null };
    }
  }
}
