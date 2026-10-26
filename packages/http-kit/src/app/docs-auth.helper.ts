import type { NextFunction, Request, RequestHandler, Response } from "express";

import crypto from "node:crypto";

export interface DocsAuthConfig {
  /** Shared password that unlocks the API docs. */
  password: string;
  /** Whether the auth cookie must be `Secure` (HTTPS-only). */
  secure?: boolean;
  /** Human title shown on the login page (e.g. the API name). */
  title?: string;
  /**
   * Path the login form lives at and that the guard redirects to. Defaults to
   * `/docs/login`. Set it (e.g. `/login`) to mount the same password gate for
   * an app page under a dedicated path — the signed cookie is shared, so one
   * login unlocks every surface guarded by the same password.
   */
  loginPath?: string;
}

const COOKIE_NAME = "bitsky_docs_auth";
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const DEFAULT_LOGIN_PATH = "/docs/login";

/**
 * Custom-login gate for the Scalar docs UI. Unauthenticated visitors are
 * redirected to a branded password page instead of getting a native browser
 * basic-auth prompt. A successful login sets a signed, HTTP-only cookie whose
 * signature key is the password itself — rotating the password invalidates
 * every issued cookie, and no server-side session store is needed.
 */
export class DocsAuthHelper {
  /**
   * Guards `/docs` and `/openapi.json`. Valid cookie → continue; otherwise
   * redirect to the login page. Scalar fetches `/openapi.json` from the
   * browser, so the same-origin cookie rides along once the user is signed in.
   */
  static guard(config: DocsAuthConfig, returnTo?: string): RequestHandler {
    return (req: Request, res: Response, next: NextFunction): void => {
      const token = DocsAuthHelper.readCookie(req, COOKIE_NAME);
      if (token && DocsAuthHelper.verifyToken(token, config.password)) {
        next();
        return;
      }
      // Carry the originally-requested path so login can send the user back
      // there instead of always to /docs (lets the same gate protect app pages).
      const loginPath = config.loginPath ?? DEFAULT_LOGIN_PATH;
      const target = returnTo
        ? `${loginPath}?returnTo=${encodeURIComponent(returnTo)}`
        : loginPath;
      res.redirect(target);
    };
  }

  /** GET `/docs/login` — renders the password form. */
  static loginPage(config: DocsAuthConfig): RequestHandler {
    return (req: Request, res: Response): void => {
      const returnTo = DocsAuthHelper.safeReturnTo(req.query.returnTo);
      // Already authenticated → skip the form.
      const token = DocsAuthHelper.readCookie(req, COOKIE_NAME);
      if (token && DocsAuthHelper.verifyToken(token, config.password)) {
        res.redirect(returnTo);
        return;
      }
      const failed = req.query.error !== undefined;
      res
        .status(failed ? 401 : 200)
        .type("html")
        .send(
          DocsAuthHelper.renderPage(
            config.title,
            failed,
            returnTo,
            config.loginPath ?? DEFAULT_LOGIN_PATH,
          ),
        );
    };
  }

  /** POST `/docs/login` — validates the password and issues the cookie. */
  static loginSubmit(config: DocsAuthConfig): RequestHandler {
    return (req: Request, res: Response): void => {
      const returnTo = DocsAuthHelper.safeReturnTo(req.body?.returnTo);
      const submitted =
        typeof req.body?.password === "string" ? req.body.password : "";

      if (!DocsAuthHelper.safeEqual(submitted, config.password)) {
        res
          .status(401)
          .type("html")
          .send(
            DocsAuthHelper.renderPage(
              config.title,
              true,
              returnTo,
              config.loginPath ?? DEFAULT_LOGIN_PATH,
            ),
          );
        return;
      }

      res.setHeader(
        "Set-Cookie",
        DocsAuthHelper.buildCookie(
          DocsAuthHelper.issueToken(config.password),
          config.secure,
        ),
      );
      res.redirect(returnTo);
    };
  }

  /** GET `/docs/logout` — clears the cookie. */
  static logout(config: DocsAuthConfig): RequestHandler {
    return (_req: Request, res: Response): void => {
      res.setHeader(
        "Set-Cookie",
        `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${
          config.secure ? "; Secure" : ""
        }`,
      );
      res.redirect(config.loginPath ?? DEFAULT_LOGIN_PATH);
    };
  }

  private static issueToken(password: string): string {
    const payload = Buffer.from(
      JSON.stringify({ exp: Date.now() + TOKEN_TTL_MS }),
    ).toString("base64url");
    return `${payload}.${DocsAuthHelper.sign(payload, password)}`;
  }

  private static verifyToken(token: string, password: string): boolean {
    const [payload, signature] = token.split(".");
    if (!payload || !signature) return false;
    if (
      !DocsAuthHelper.safeEqual(
        signature,
        DocsAuthHelper.sign(payload, password),
      )
    ) {
      return false;
    }
    try {
      const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString());
      return typeof exp === "number" && exp > Date.now();
    } catch {
      return false;
    }
  }

  private static sign(data: string, key: string): string {
    return crypto.createHmac("sha256", key).update(data).digest("base64url");
  }

  private static buildCookie(token: string, secure?: boolean): string {
    return [
      `${COOKIE_NAME}=${token}`,
      "Path=/",
      "HttpOnly",
      "SameSite=Lax",
      `Max-Age=${Math.floor(TOKEN_TTL_MS / 1000)}`,
      secure ? "Secure" : "",
    ]
      .filter(Boolean)
      .join("; ");
  }

  private static readCookie(req: Request, name: string): string | undefined {
    const header = req.headers.cookie;
    if (!header) return undefined;
    for (const part of header.split(";")) {
      const idx = part.indexOf("=");
      if (idx === -1) continue;
      if (part.slice(0, idx).trim() === name) {
        return decodeURIComponent(part.slice(idx + 1).trim());
      }
    }
    return undefined;
  }

  /**
   * Sanitises a caller-supplied return path to a same-origin, absolute path so
   * the login redirect can't be turned into an open redirect. Anything that
   * isn't a single-leading-slash local path falls back to `/docs`.
   */
  private static safeReturnTo(value: unknown): string {
    if (typeof value === "string" && /^\/(?![/\\])/.test(value)) return value;
    return "/docs";
  }

  /** Constant-time string compare that never throws on length mismatch. */
  private static safeEqual(a: string, b: string): boolean {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) {
      // Still run a compare to avoid leaking length via early return timing.
      crypto.timingSafeEqual(bufA, bufA);
      return false;
    }
    return crypto.timingSafeEqual(bufA, bufB);
  }

  private static renderPage(
    title = "API Documentation",
    failed = false,
    returnTo = "/docs",
    loginPath = DEFAULT_LOGIN_PATH,
  ): string {
    const safeTitle = DocsAuthHelper.escapeHtml(title);
    const safeReturnTo = DocsAuthHelper.escapeHtml(returnTo);
    const safeAction = DocsAuthHelper.escapeHtml(loginPath);
    const error = failed
      ? `<p class="error">Incorrect password. Please try again.</p>`
      : "";
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<title>${safeTitle} — Sign in</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body {
    margin: 0; min-height: 100vh; display: flex; align-items: center;
    justify-content: center; padding: 24px;
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    background: radial-gradient(1200px 600px at 50% -10%, #241a4d 0%, #130e2c 60%);
    color: #e7e4f5;
  }
  .card {
    width: 100%; max-width: 360px; background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08); border-radius: 16px;
    padding: 32px 28px; backdrop-filter: blur(8px);
    box-shadow: 0 20px 60px rgba(0,0,0,0.45);
  }
  .brand { font-size: 20px; font-weight: 700; letter-spacing: -0.01em; }
  .subtitle { margin: 4px 0 24px; font-size: 13px; color: #9c96bf; }
  label { display: block; font-size: 12px; margin-bottom: 8px; color: #b7b1d8; }
  input[type="password"] {
    width: 100%; padding: 12px 14px; border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.12); background: rgba(0,0,0,0.25);
    color: #fff; font-size: 15px; outline: none;
  }
  input[type="password"]:focus { border-color: #7c6cf0; box-shadow: 0 0 0 3px rgba(124,108,240,0.25); }
  button {
    width: 100%; margin-top: 20px; padding: 12px 14px; border: 0;
    border-radius: 10px; background: #7c6cf0; color: #fff; font-size: 15px;
    font-weight: 600; cursor: pointer; transition: background 0.15s ease;
  }
  button:hover { background: #6a58ea; }
  .error {
    margin: 0 0 16px; padding: 10px 12px; border-radius: 10px; font-size: 13px;
    background: rgba(240,82,82,0.12); border: 1px solid rgba(240,82,82,0.35);
    color: #ff9a9a;
  }
</style>
</head>
<body>
  <form class="card" method="POST" action="${safeAction}">
    <div class="brand">${safeTitle}</div>
    <p class="subtitle">Enter the password to continue.</p>
    ${error}
    <input type="hidden" name="returnTo" value="${safeReturnTo}" />
    <label for="password">Password</label>
    <input id="password" name="password" type="password" autocomplete="current-password" autofocus required />
    <button type="submit">Sign in</button>
  </form>
</body>
</html>`;
  }

  private static escapeHtml(input: string): string {
    return input
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
}
