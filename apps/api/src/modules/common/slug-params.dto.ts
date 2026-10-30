import { BaseDto, z } from "@repo/http-kit";
import { slugParamSchema } from "@repo/shared";

export class SlugParamsDto extends BaseDto {
  static override readonly schema = z.object({ slug: slugParamSchema });
}
