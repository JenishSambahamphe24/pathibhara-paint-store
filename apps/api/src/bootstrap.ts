import type { Express } from "express";

import { container } from "tsyringe";

import { DatabaseService } from "@repo/database";
import { AppFactory, I18nService, LoggerService } from "@repo/http-kit";

import { ConfigService } from "#config";

import translationEn from "./i18n/en/translation.json";
import { AuthController } from "./modules/auth/auth.controller";
import { CalculatorController } from "./modules/calculator/calculator.controller";
import { CategoryController } from "./modules/category/category.controller";
import { ColourSetController } from "./modules/colour-set/colour-set.controller";
import { DashboardController } from "./modules/dashboard/dashboard.controller";
import { FileController } from "./modules/file/file.controller";
import { HealthController } from "./modules/health/health.controller";
import { PostController } from "./modules/post/post.controller";
import { ProductController } from "./modules/product/product.controller";
import { VariantController } from "./modules/product/variant.controller";
import { ShadeController } from "./modules/shade/shade.controller";
import { StockController } from "./modules/stock/stock.controller";
import { StorageBootstrap } from "./modules/storage/storage.bootstrap";

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

    StorageBootstrap.register();

    return AppFactory.create({
      title: "Pathibhara Paints API",
      version: "0.1.0",
      production: config.app.production,
      corsOrigins: config.corsOrigins,
      trustProxy: config.trustProxy,
      docsAuth: config.docsAuth,
      middlewares: StorageBootstrap.staticMiddleware(),
      controllers: [
        HealthController,
        AuthController,
        FileController,
        CategoryController,
        ProductController,
        VariantController,
        StockController,
        CalculatorController,
        PostController,
        DashboardController,
        ShadeController,
        ColourSetController,
      ],
    });
  }
}
