import { BaseDto } from "@repo/http-kit";
import { adminLoginSchema } from "@repo/shared";

export class LoginRequestDto extends BaseDto {
  static override readonly schema = adminLoginSchema;
}
