import { BaseDto, z } from "@repo/http-kit";

import { MeResponseDto } from "./me.response.dto";

export class AuthTokensResponseDto extends BaseDto {
  static override readonly schema = z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    expiresIn: z.number().int(),
    admin: MeResponseDto.schema,
  });
}
