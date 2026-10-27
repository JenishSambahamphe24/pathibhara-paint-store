import type { DtoType } from "@repo/http-kit";

import { ApiResponse, Controller, Get, OkResponse, Query, UseMiddleware, Validate } from "@repo/http-kit";

import { requireAdmin } from "../auth/auth.middleware";
import { DashboardDto, DashboardQueryDto } from "./dashboard.dto";
import { DashboardService } from "./dashboard.service";

@Controller("/admin/dashboard", ["Dashboard"])
@UseMiddleware(requireAdmin())
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get("/", { summary: "Sales and stock analytics for a trailing period, in store days" })
  @OkResponse(DashboardDto, "Dashboard")
  @Validate({ query: DashboardQueryDto })
  async get(@Query() query: DtoType<typeof DashboardQueryDto>) {
    return ApiResponse.ok(await this.dashboardService.get(query));
  }
}
