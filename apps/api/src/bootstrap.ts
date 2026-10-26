import type { Express } from "express";

import { container } from "tsyringe";

import { DatabaseService } from "@repo/database";
import { AppFactory, I18nService, LoggerService } from "@repo/http-kit";

import { ConfigService } from "#config";

import translationEn from "./i18n/en/translation.json";
import { AuthController } from "./modules/auth/auth.controller";
import { HealthController } from "./modules/health/health.controller";

export class Bootstrap {
  static async init(): Promise<Express> {
    const config = container.resolve(ConfigService);

    const logger = container.resolve(LoggerService);
    logger.init({
      level: config.app.production ? "info" : "debug",
      ...(config.app.logPretty && { transport: { target: "pino-pretty" } }),
    });

    await container.resolve(I18nService).init({
      resources: { en: { translation: translationEn } },
    });

    await container.resolve(DatabaseService).connect(config.database.url, {
      poolMax: config.database.poolMax,
      idleTimeoutMs: config.database.idleTimeoutMs,
      connectionTimeoutMs: config.database.connectionTimeoutMs,
    });

    return AppFactory.create({
      title: "Pathibhara Paints API",
      version: "0.1.0",
      production: config.app.production,
      corsOrigins: config.corsOrigins,
      trustProxy: config.trustProxy,
      docsAuth: config.docsAuth,
      controllers: [HealthController, AuthController],
    });
  }
}
