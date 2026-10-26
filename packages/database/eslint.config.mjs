import baseConfig from "@repo/config/eslint/api";

export default [
  ...baseConfig,
  {
    ignores: ["drizzle.config.ts"],
  },
];
