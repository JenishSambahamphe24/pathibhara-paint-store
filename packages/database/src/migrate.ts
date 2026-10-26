import "reflect-metadata";

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { LoggerService } from "@repo/http-kit";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";

import { DB_SESSION_OPTIONS } from "./database.service";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Run via an app's db:migrate script (which loads .env), or export DATABASE_URL manually.",
  );
}

const migrationsFolder = resolve(dirname(fileURLToPath(import.meta.url)), "..", "drizzle");

const logger = new LoggerService();
logger.init({ transport: { target: "pino-pretty" } });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  options: DB_SESSION_OPTIONS,
});
const db = drizzle(pool);

async function run() {
  logger.info({ migrationsFolder }, "Running migrations...");
  await migrate(db, { migrationsFolder });
  logger.info("Migrations complete.");
}

run()
  .catch((err: unknown) => {
    logger.error(err, "Migration failed");
    process.exit(1);
  })
  .finally(() => pool.end());
