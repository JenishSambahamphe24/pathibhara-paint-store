import type { HealthStatus } from "./health.types";

import { injectable } from "tsyringe";

import { HealthResponseDto } from "./dto/health.response.dto";

@injectable()
export class HealthService {
  getHealth(): HealthStatus {
    return HealthResponseDto.parse({
      status: "ok" as const,
      timestamp: new Date().toISOString(),
    });
  }
}
