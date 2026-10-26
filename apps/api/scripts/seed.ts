import "reflect-metadata";

import { container } from "tsyringe";

import { DatabaseService } from "@repo/database";

import { EnvHolder } from "../src/config/env.holder";
import { envSchema } from "../src/config/env.schema";
import { AdminSeed } from "../src/db/admin-seed";
import { StoreSettingsSeed } from "../src/db/store-settings-seed";

async function main() {
  const env = envSchema.parse(process.env);
  EnvHolder.init(env);

  const databaseService = container.resolve(DatabaseService);
  await databaseService.connect(env.DATABASE_URL);
  try {
    await AdminSeed.admin(databaseService.db, env);
    await StoreSettingsSeed.ensure(databaseService.db);
  } finally {
    await databaseService.disconnect();
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
