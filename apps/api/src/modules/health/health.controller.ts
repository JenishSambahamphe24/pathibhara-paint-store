import { Controller, Get, OkResponse } from "@repo/http-kit";

import { HealthResponseDto } from "./dto/health.response.dto";
import { HealthService } from "./health.service";

@Controller("/health-check", ["Health"])
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get("/", { summary: "Health check" })
  @OkResponse(HealthResponseDto, "Service is healthy")
  checkHealth() {
    return this.healthService.getHealth();
  }
}
