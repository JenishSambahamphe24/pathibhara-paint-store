import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

// Kept apart from vite.config.ts: the devtools event bus and Nitro plugins
// hold the process open, so a test run would hang after finishing.
export default defineConfig({
  plugins: [tsconfigPaths({ projects: ["./tsconfig.json"] })],
});
