import type { JwtAccessPayload, JwtRefreshPayload } from "./auth.types";

import crypto from "node:crypto";

import jwt from "jsonwebtoken";
import { injectable } from "tsyringe";

import { ConfigService } from "#config";

export interface IssuedTokens {
  accessToken: string;
  refreshToken: string;
  refreshTokenHash: string;
  refreshExpiresAt: Date;
}

@injectable()
export class TokenService {
  constructor(private readonly configService: ConfigService) {}

  issue(params: { adminId: string; sessionId: string }): IssuedTokens {
    const { accessSecret, refreshSecret, accessTtlSeconds, refreshTtlSeconds } =
      this.configService.authJwt;

    const accessPayload: JwtAccessPayload = {
      sub: params.adminId,
      type: "admin",
      sid: params.sessionId,
    };
    // A fresh jti makes every rotated refresh token unique even when two are
    // signed within the same second, so the stored hash always changes.
    const refreshPayload: JwtRefreshPayload = { ...accessPayload, jti: crypto.randomUUID() };

    const accessToken = jwt.sign(accessPayload, accessSecret, { expiresIn: accessTtlSeconds });
    const refreshToken = jwt.sign(refreshPayload, refreshSecret, { expiresIn: refreshTtlSeconds });

    return {
      accessToken,
      refreshToken,
      refreshTokenHash: this.hashRefreshToken(refreshToken),
      refreshExpiresAt: new Date(Date.now() + refreshTtlSeconds * 1000),
    };
  }

  verifyAccess(token: string): JwtAccessPayload {
    return jwt.verify(token, this.configService.authJwt.accessSecret) as JwtAccessPayload;
  }

  verifyRefresh(token: string): JwtRefreshPayload {
    return jwt.verify(token, this.configService.authJwt.refreshSecret) as JwtRefreshPayload;
  }

  hashRefreshToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }
}
