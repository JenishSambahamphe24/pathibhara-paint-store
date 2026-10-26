import "reflect-metadata";

import { LoggerService } from "@repo/http-kit";
import pg from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Run via an app's db:reset script (which loads .env), or export DATABASE_URL manually.",
  );
}

const logger = new LoggerService();
logger.init({ transport: { target: "pino-pretty" } });

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  logger.warn("Dropping the public schema and everything in it...");
  await pool.query("DROP SCHEMA IF EXISTS public CASCADE");
  await pool.query("CREATE SCHEMA public");
  // Drizzle records applied migrations in a separate `drizzle` schema. It must
  // be dropped too, otherwise db:migrate sees a full journal and replays nothing.
  await pool.query("DROP SCHEMA IF EXISTS drizzle CASCADE");
  logger.info("Schema reset. Run db:migrate (and db:seed) to rebuild.");
}

run()
  .catch((err: unknown) => {
    logger.error(err, "Reset failed");
    process.exit(1);
  })
  .finally(() => pool.end());
