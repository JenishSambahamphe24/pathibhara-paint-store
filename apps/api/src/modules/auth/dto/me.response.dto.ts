import { BaseDto, z } from "@repo/http-kit";
import { ADMIN_STATUSES } from "@repo/shared";

export class MeResponseDto extends BaseDto {
  static override readonly schema = z.object({
    id: z.uuid(),
    email: z.email(),
    name: z.string(),
    status: z.enum(ADMIN_STATUSES),
    lastLoginAt: z.iso.datetime().nullable(),
  });
}
