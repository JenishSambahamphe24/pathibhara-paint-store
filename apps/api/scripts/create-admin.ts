// Usage: pnpm admin:create <email> <password> [name]
import "reflect-metadata";

import { container } from "tsyringe";

import { DatabaseService } from "@repo/database";

import { EnvHolder } from "../src/config/env.holder";
import { envSchema } from "../src/config/env.schema";
import { AdminSeed } from "../src/db/admin-seed";

async function main() {
  const [, , email, password, name] = process.argv;
  if (!email || !password) {
    console.error("Usage: pnpm admin:create <email> <password> [name]");
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  const env = envSchema.parse(process.env);
  EnvHolder.init(env);

  const databaseService = container.resolve(DatabaseService);
  await databaseService.connect(env.DATABASE_URL);
  try {
    await AdminSeed.admin(databaseService.db, {
      ...env,
      SUPER_ADMIN_EMAIL: email,
      SUPER_ADMIN_PASSWORD: password,
      SUPER_ADMIN_NAME: name ?? env.SUPER_ADMIN_NAME,
    });
  } finally {
    await databaseService.disconnect();
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
