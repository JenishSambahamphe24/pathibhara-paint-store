import type { AuthenticatedRequest } from "./auth.types";
import type { DtoType } from "@repo/http-kit";
import type { Request } from "express";

import {
  ApiResponse,
  Body,
  Controller,
  Get,
  NoContentResponse,
  OkResponse,
  Post,
  Req,
  UseMiddleware,
  Validate,
} from "@repo/http-kit";

import { tk } from "#i18n/tk";

import { requireAdmin } from "./auth.middleware";
import { AuthService } from "./auth.service";
import { AuthTokensResponseDto } from "./dto/auth-tokens.response.dto";
import { LoginRequestDto } from "./dto/login.request.dto";
import { MeResponseDto } from "./dto/me.response.dto";
import { RefreshRequestDto } from "./dto/refresh.request.dto";
import { LoginRateLimit } from "./login-rate-limit.middleware";

@Controller("/admin/auth", ["Auth"])
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("/login", { summary: "Admin login with email and password" })
  @OkResponse(AuthTokensResponseDto, "Logged in")
  @UseMiddleware(LoginRateLimit.middleware())
  @Validate({ body: LoginRequestDto })
  async login(@Body() body: DtoType<typeof LoginRequestDto>) {
    const data = await this.authService.login(body);
    return ApiResponse.ok(data, tk("auth.loginSuccess"));
  }

  @Post("/refresh", { summary: "Rotate access and refresh tokens" })
  @OkResponse(AuthTokensResponseDto, "Tokens refreshed")
  @Validate({ body: RefreshRequestDto })
  async refresh(@Body() body: DtoType<typeof RefreshRequestDto>) {
    const data = await this.authService.refresh(body);
    return ApiResponse.ok(data, tk("auth.refreshSuccess"));
  }

  @Post("/logout", { summary: "Revoke the current session" })
  @NoContentResponse("Logged out")
  @UseMiddleware(requireAdmin())
  async logout(@Req() req: Request) {
    await this.authService.logout((req as AuthenticatedRequest).auth.sessionId);
    return ApiResponse.noContent(tk("auth.logoutSuccess"));
  }

  @Get("/me", { summary: "The signed-in admin" })
  @OkResponse(MeResponseDto, "Current admin")
  @UseMiddleware(requireAdmin())
  async me(@Req() req: Request) {
    const data = await this.authService.getMe((req as AuthenticatedRequest).auth.adminId);
    return ApiResponse.ok(data);
  }
}
