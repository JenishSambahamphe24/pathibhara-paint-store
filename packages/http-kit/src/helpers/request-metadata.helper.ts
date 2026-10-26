import type { Request } from "express";

export class RequestMetadataHelper {
  static extract(req: Request): { ipAddress: string | null; userAgent: string | null } {
    return {
      ipAddress: RequestMetadataHelper.ip(req),
      userAgent: RequestMetadataHelper.userAgent(req),
    };
  }

  // `req.ip` honours Express's `trust proxy` hop count; the raw first
  // X-Forwarded-For entry is caller-supplied and would be spoofable.
  static ip(req: Request): string | null {
    const ip = req.ip?.replace(/^::ffff:/i, "");
    return ip ? ip : null;
  }

  static userAgent(req: Request): string | null {
    const ua = req.headers["user-agent"];
    if (typeof ua !== "string") return null;
    return ua.length > 512 ? ua.slice(0, 512) : ua;
  }
}
