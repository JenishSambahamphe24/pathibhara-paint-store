import reactConfig from "@repo/config/eslint/react";

export default [
  ...reactConfig,
  {
    ignores: [
      "eslint.config.js",
      "prettier.config.js",
      "src/paraglide/**",
      ".output",
      "public/**",
    ],
  },
];
