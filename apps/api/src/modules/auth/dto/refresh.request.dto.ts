import { BaseDto } from "@repo/http-kit";
import { refreshTokenSchema } from "@repo/shared";

export class RefreshRequestDto extends BaseDto {
  static override readonly schema = refreshTokenSchema;
}
