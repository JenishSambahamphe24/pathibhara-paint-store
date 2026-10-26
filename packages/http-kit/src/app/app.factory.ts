import type { Constructor } from "../metadata/metadata-types";
import type { SpecConfig } from "../openapi/openapi-generator.service";
import type {
  Express,
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "express";

import { apiReference } from "@scalar/express-api-reference";
import express from "express";
import { container } from "tsyringe";

import { RequestContextHelper } from "../context/request-context.helper";
import { ErrorHandler } from "../errors/error-handler.middleware";
import { ControllerLoader } from "../loader/controller-loader";
import { LoggerService } from "../logger/logger.service";
import { RequestLogger } from "../logger/request-logger.middleware";
import { OpenApiGeneratorService } from "../openapi/openapi-generator.service";
import { DocsAuthHelper } from "./docs-auth.helper";

export interface AppConfig extends SpecConfig {
  controllers: Constructor[];
  production?: boolean;
  /**
   * Allowed CORS origins. `"*"` echoes the request origin (dev convenience —
   * not safe with credentials in production). An array enables the specific
   * origins; an empty/undefined value disables the middleware entirely.
   */
  corsOrigins?: string[] | "*";
  /**
   * Express `trust proxy` setting. Use a hop count (e.g. `1` behind a single
   * proxy), never `true`: that makes `req.ip` the caller-supplied
   * `X-Forwarded-For` entry.
   */
  trustProxy?: boolean | number | string;
  /**
   * When set, the Scalar docs UI (`/docs`) and the raw spec (`/openapi.json`)
   * are gated behind a custom password login page. Unauthenticated visitors
   * are redirected to `/docs/login`; a successful login sets a signed cookie.
   * Leave undefined to keep the docs public (dev convenience).
   */
  docsAuth?: { password: string };
  /**
   * Extra middleware installed after the built-in stack and before the routes,
   * for anything that has to wrap the handlers themselves (e.g. static file
   * serving for local uploads).
   */
  middlewares?: RequestHandler[];
}

const ALLOWED_METHODS = "GET, POST, PUT, PATCH, DELETE, OPTIONS";
const ALLOWED_HEADERS = "Authorization, Content-Type, X-Requested-With";

export class AppFactory {
  static create(config: AppConfig): Express {
    const app = express();

    // Must be set before any middleware that reads the client IP.
    if (config.trustProxy !== undefined) {
      app.set("trust proxy", config.trustProxy);
    }
    if (config.production) AppFactory.warnOnUnsafeTrustProxy(config.trustProxy);

    if (config.corsOrigins) {
      app.use(AppFactory.corsMiddleware(config.corsOrigins));
    }

    app.use(express.json({ limit: "1mb" }));
    // The /docs login page posts a plain HTML form.
    app.use(express.urlencoded({ extended: false }));
    // Before anything that reads IP / User-Agent off AsyncLocalStorage.
    app.use(RequestContextHelper.middleware());

    app.use(RequestLogger.middleware({ production: config.production }));

    for (const middleware of config.middlewares ?? []) {
      app.use(middleware);
    }

    ControllerLoader.load(app, config.controllers);

    const generator = container.resolve(OpenApiGeneratorService);

    if (config.docsAuth) {
      const docsAuth = {
        password: config.docsAuth.password,
        secure: config.production,
        title: config.title,
      };
      // Login routes must be registered before the guarded mounts so the
      // `/docs` prefix guard never intercepts the login/logout paths.
      app.get("/docs/login", DocsAuthHelper.loginPage(docsAuth));
      app.post("/docs/login", DocsAuthHelper.loginSubmit(docsAuth));
      app.get("/docs/logout", DocsAuthHelper.logout(docsAuth));

      const guard = DocsAuthHelper.guard(docsAuth);
      app.get("/openapi.json", guard);
      app.use("/docs", guard);
    }

    app.get("/openapi.json", (_req, res) => {
      res.json(generator.generate(config));
    });

    app.use(
      "/docs",
      apiReference({
        url: "/openapi.json",
      }),
    );

    app.use(ErrorHandler.middleware());

    return app;
  }

  // A wrong `trust proxy` fails silently (every visitor resolves to the load
  // balancer), so say so at boot.
  private static warnOnUnsafeTrustProxy(
    trustProxy: AppConfig["trustProxy"],
  ): void {
    const problem =
      trustProxy === undefined || trustProxy === false
        ? "unset — `req.ip` will be the proxy's address, not the visitor's"
        : trustProxy === true
          ? "`true` — `req.ip` is the caller-supplied X-Forwarded-For hop and can be spoofed"
          : null;
    if (!problem) return;

    container
      .resolve(LoggerService)
      .warn(
        { event: "app.trustProxy.unsafe", trustProxy },
        `trust proxy is ${problem}. Set TRUST_PROXY to the number of proxies in front of this service.`,
      );
  }

  private static corsMiddleware(allowed: string[] | "*") {
    return (req: Request, res: Response, next: NextFunction): void => {
      const origin = req.headers.origin;

      if (allowed === "*") {
        res.setHeader("Access-Control-Allow-Origin", origin ?? "*");
      } else if (origin && allowed.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
      }

      res.setHeader("Vary", "Origin");
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Allow-Methods", ALLOWED_METHODS);

      const requestHeaders = req.headers["access-control-request-headers"];
      res.setHeader(
        "Access-Control-Allow-Headers",
        typeof requestHeaders === "string" && requestHeaders.length > 0
          ? requestHeaders
          : ALLOWED_HEADERS,
      );

      if (req.method === "OPTIONS") {
        res.status(204).end();
        return;
      }

      next();
    };
  }
}
