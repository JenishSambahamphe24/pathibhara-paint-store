import { config as loadDotenv } from "dotenv";
import { defineConfig } from "vitest/config";

loadDotenv({ quiet: true });

export default defineConfig({
  test: {
    setupFiles: ["reflect-metadata"],
    globalSetup: ["./src/test-support/global-setup.ts"],
    // Integration tests share one database; running files in parallel would
    // let one file's cleanup wipe another's fixtures mid-test.
    fileParallelism: false,
  },
});
