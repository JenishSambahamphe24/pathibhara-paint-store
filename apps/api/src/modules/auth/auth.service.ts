import type { AdminRecord } from "../admin/admin.service";
import type { DtoType } from "@repo/http-kit";

import { injectable } from "tsyringe";

import { TransactionManager } from "@repo/database";
import {
  ForbiddenException,
  NotFoundException,
  RequestContextHelper,
  UnauthorizedException,
} from "@repo/http-kit";

import { ConfigService } from "#config";
import { tk } from "#i18n/tk";

import { AdminService } from "../admin/admin.service";
import { SessionService } from "../session/session.service";
import { AuthTokensResponseDto } from "./dto/auth-tokens.response.dto";
import { LoginRequestDto } from "./dto/login.request.dto";
import { MeResponseDto } from "./dto/me.response.dto";
import { RefreshRequestDto } from "./dto/refresh.request.dto";
import { PasswordService } from "./password.service";
import { TokenService } from "./token.service";

@injectable()
export class AuthService {
  constructor(
    private readonly txManager: TransactionManager,
    private readonly adminService: AdminService,
    private readonly sessionService: SessionService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
  ) {}

  async login(
    input: DtoType<typeof LoginRequestDto>,
  ): Promise<DtoType<typeof AuthTokensResponseDto>> {
    const admin = await this.adminService.findByEmail(input.email);
    const ok = await this.passwordService.verify(input.password, admin?.passwordHash);
    if (!admin || !ok) throw new UnauthorizedException(tk("auth.invalidCredentials"));
    if (admin.status !== "active") throw new ForbiddenException(tk("auth.accountNotActive"));

    return this.issueSession(admin);
  }

  async refresh(
    input: DtoType<typeof RefreshRequestDto>,
  ): Promise<DtoType<typeof AuthTokensResponseDto>> {
    let payload;
    try {
      payload = this.tokenService.verifyRefresh(input.refreshToken);
    } catch {
      throw new UnauthorizedException(tk("auth.invalidRefreshToken"));
    }
    if (payload.type !== "admin") {
      throw new UnauthorizedException(tk("auth.invalidRefreshToken"));
    }

    const hash = this.tokenService.hashRefreshToken(input.refreshToken);
    const session = await this.sessionService.findByRefreshHash(hash);
    if (!session || session.id !== payload.sid) {
      throw new UnauthorizedException(tk("auth.invalidRefreshToken"));
    }
    if (session.revokedAt) throw new UnauthorizedException(tk("auth.sessionRevoked"));
    if (session.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException(tk("auth.sessionExpired"));
    }

    const admin = await this.adminService.findActiveById(session.adminId);
    if (!admin) throw new ForbiddenException(tk("auth.accountNotActive"));

    const issued = this.tokenService.issue({ adminId: admin.id, sessionId: session.id });
    await this.sessionService.rotateRefresh({
      id: session.id,
      refreshTokenHash: issued.refreshTokenHash,
      expiresAt: issued.refreshExpiresAt,
    });

    return this.toTokensResponse(admin, issued.accessToken, issued.refreshToken);
  }

  async logout(sessionId: string): Promise<void> {
    await this.sessionService.revoke(sessionId);
  }

  async getMe(adminId: string): Promise<DtoType<typeof MeResponseDto>> {
    const admin = await this.adminService.findById(adminId);
    if (!admin) throw new NotFoundException(tk("auth.adminNotFound"));
    return this.toMe(admin);
  }

  private issueSession(admin: AdminRecord): Promise<DtoType<typeof AuthTokensResponseDto>> {
    const ctx = RequestContextHelper.get();
    return this.txManager.run(async () => {
      // Two steps so the JWT's `sid` matches the row id: insert with a
      // placeholder hash to get the id, then sign and store the real hash.
      const placeholder = await this.sessionService.create({
        adminId: admin.id,
        refreshTokenHash: `pending-${crypto.randomUUID()}`,
        expiresAt: new Date(Date.now() + this.configService.authJwt.refreshTtlSeconds * 1000),
        ipAddress: ctx.ipAddress,
        userAgent: ctx.userAgent,
      });

      const tokens = this.tokenService.issue({ adminId: admin.id, sessionId: placeholder.id });
      await this.sessionService.rotateRefresh({
        id: placeholder.id,
        refreshTokenHash: tokens.refreshTokenHash,
        expiresAt: tokens.refreshExpiresAt,
      });
      const loggedInAt = new Date();
      await this.adminService.touchLastLogin(admin.id, loggedInAt);

      return this.toTokensResponse(
        { ...admin, lastLoginAt: loggedInAt },
        tokens.accessToken,
        tokens.refreshToken,
      );
    });
  }

  private toTokensResponse(
    admin: AdminRecord,
    accessToken: string,
    refreshToken: string,
  ): DtoType<typeof AuthTokensResponseDto> {
    return AuthTokensResponseDto.parse({
      accessToken,
      refreshToken,
      expiresIn: this.configService.authJwt.accessTtlSeconds,
      admin: this.toMe(admin),
    });
  }

  private toMe(admin: AdminRecord): DtoType<typeof MeResponseDto> {
    return MeResponseDto.parse({
      id: admin.id,
      email: admin.email,
      name: admin.name,
      status: admin.status,
      lastLoginAt: admin.lastLoginAt?.toISOString() ?? null,
    });
  }
}
