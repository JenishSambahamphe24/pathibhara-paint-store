/** Shared ESLint config — rules common to every workspace. */
export const baseConfig = [
  {
    ignores: [
      "**/dist/**",
      "**/build/**",
      "**/.output/**",
      "**/.turbo/**",
      "**/coverage/**",
      "**/.expo/**",
    ],
  },
  {
    rules: {
      "import/no-cycle": "off",
      "import/order": "off",
      "sort-imports": "off",
      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/require-await": "off",
      "pnpm/json-enforce-catalog": "off",
    },
  },
];

export default baseConfig;
