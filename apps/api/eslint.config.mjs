import baseConfig from "@repo/config/eslint/api";

export default [
  ...baseConfig,
  {
    ignores: ["tsup.config.ts", "vitest.config.ts", "scripts/**"],
  },
];
