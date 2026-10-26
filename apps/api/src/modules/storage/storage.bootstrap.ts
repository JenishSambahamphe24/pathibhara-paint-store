import type { StorageService } from "./storage.service";
import type { RequestHandler } from "express";

import { resolve } from "node:path";

import express from "express";
import { container } from "tsyringe";

import { ConfigService } from "#config";

import { LocalStorageService } from "./local-storage.service";
import { STORAGE_SERVICE } from "./storage.service";

export class StorageBootstrap {
  static register(): void {
    container.register<StorageService>(STORAGE_SERVICE, { useClass: LocalStorageService });
  }

  // Serves local uploads from the path in STORAGE_PUBLIC_BASE_URL. A cloud
  // provider serves its own URLs, so this returns nothing for it.
  static staticMiddleware(): RequestHandler[] {
    const { provider, localRoot, publicBaseUrl } = container.resolve(ConfigService).storage;
    if (provider !== "local") return [];
    const router = express.Router();
    router.use(
      new URL(publicBaseUrl).pathname || "/uploads",
      (_req, res, next) => {
        res.setHeader("X-Content-Type-Options", "nosniff");
        next();
      },
      express.static(resolve(localRoot), { immutable: true, maxAge: "365d", index: false }),
    );
    return [router];
  }
}
