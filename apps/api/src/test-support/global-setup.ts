import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";

// Rebuilds the test database from the real migrations once per run, so the
// integration tests always exercise the current schema and its constraints.
export default async function setup(): Promise<void> {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) return;
  if (url === process.env.DATABASE_URL) {
    throw new Error("TEST_DATABASE_URL must not point at the dev database; tests wipe it.");
  }

  const pool = new pg.Pool({ connectionString: url });
  try {
    await pool.query("DROP SCHEMA IF EXISTS public CASCADE");
    await pool.query("CREATE SCHEMA public");
    await pool.query("DROP SCHEMA IF EXISTS drizzle CASCADE");
    const migrationsFolder = resolve(
      dirname(fileURLToPath(import.meta.url)),
      "../../../../packages/database/drizzle",
    );
    await migrate(drizzle(pool), { migrationsFolder });
  } finally {
    await pool.end();
  }
}
