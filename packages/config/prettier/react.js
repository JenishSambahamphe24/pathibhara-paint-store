import { baseConfig } from "./base.js";

/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
export const reactConfig = {
  ...baseConfig,
  plugins: [...(baseConfig.plugins ?? []), "prettier-plugin-tailwindcss"],
  importOrderParserPlugins: ["typescript", "jsx", "decorators-legacy"],
  importOrder: [
    "^.*\\.css$",
    "",
    "<TYPES>",
    "",
    "<BUILTIN_MODULES>",
    "",
    "<THIRD_PARTY_MODULES>",
    "",
    "^@repo/(.*)$",
    "",
    "^#/components/(.*)$",
    "",
    "^#/(utils|lib|features|paraglide|integrations|helpers)/(.*)$",
    "",
    "^#/(.*)$",
    "",
    "^[./]",
  ],
  tailwindFunctions: ["clsx", "cva", "cn"],
};

export default reactConfig;
