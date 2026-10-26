import type { AuthenticatedRequest } from "./auth.types";
import type { NextFunction, Request, RequestHandler, Response } from "express";

import { container, injectable } from "tsyringe";

import { ForbiddenException, UnauthorizedException } from "@repo/http-kit";

import { tk } from "#i18n/tk";

import { AdminService } from "../admin/admin.service";
import { SessionService } from "../session/session.service";
import { TokenService } from "./token.service";

@injectable()
export class AuthMiddleware {
  constructor(
    private readonly tokenService: TokenService,
    private readonly sessionService: SessionService,
    private readonly adminService: AdminService,
  ) {}

  requireAdmin(): RequestHandler {
    return async (req: Request, _res: Response, next: NextFunction) => {
      try {
        const match = /^Bearer\s+(.+)$/i.exec(req.header("authorization") ?? "");
        if (!match) throw new UnauthorizedException(tk("auth.missingToken"));

        let payload;
        try {
          payload = this.tokenService.verifyAccess(match[1]);
        } catch {
          throw new UnauthorizedException(tk("auth.invalidToken"));
        }
        if (payload.type !== "admin") throw new UnauthorizedException(tk("auth.invalidToken"));

        // Checked on every request so logout takes effect before the access
        // token's own expiry.
        const session = await this.sessionService.findById(payload.sid);
        if (!session || session.revokedAt) {
          throw new UnauthorizedException(tk("auth.sessionRevoked"));
        }

        const admin = await this.adminService.findActiveById(payload.sub);
        if (!admin) throw new ForbiddenException(tk("auth.accountNotActive"));

        (req as AuthenticatedRequest).auth = { adminId: admin.id, sessionId: session.id };
        next();
      } catch (err) {
        next(err);
      }
    };
  }
}

// Resolved lazily so decorators can reference it before tsyringe is wired.
export function requireAdmin(): RequestHandler {
  return (req, res, next) => {
    container.resolve(AuthMiddleware).requireAdmin()(req, res, next);
  };
}
