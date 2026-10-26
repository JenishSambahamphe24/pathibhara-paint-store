import { BaseDto, z } from "@repo/http-kit";

export class IdParamsDto extends BaseDto {
  static override readonly schema = z.object({ id: z.uuid() });
}
