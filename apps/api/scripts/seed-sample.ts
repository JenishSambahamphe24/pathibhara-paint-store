import "reflect-metadata";

import { container } from "tsyringe";

import { DatabaseService } from "@repo/database";

import { envSchema } from "../src/config/env.schema";
import { SampleSeed } from "../src/db/sample-seed";

async function main() {
  const env = envSchema.parse(process.env);
  if (env.NODE_ENV === "production") {
    console.error("Refusing to load sample data in production.");
    process.exit(1);
  }

  const databaseService = container.resolve(DatabaseService);
  await databaseService.connect(env.DATABASE_URL);
  try {
    await SampleSeed.run(databaseService.db);
  } finally {
    await databaseService.disconnect();
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
