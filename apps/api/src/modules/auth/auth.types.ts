import type { Request } from "express";

export interface JwtAccessPayload {
  sub: string;
  type: "admin";
  sid: string;
}

export interface JwtRefreshPayload extends JwtAccessPayload {
  jti: string;
}

export interface AuthenticatedRequest extends Request {
  auth: {
    adminId: string;
    sessionId: string;
  };
}
