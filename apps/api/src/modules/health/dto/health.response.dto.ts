import { BaseDto, z } from "@repo/http-kit";

export class HealthResponseDto extends BaseDto {
  static override readonly schema = z.object({
    status: z.enum(["ok", "degraded", "down"]),
    timestamp: z.iso.datetime(),
  });
}
