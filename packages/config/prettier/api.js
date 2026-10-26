import { baseConfig } from "./base.js";

/** @type {import('prettier').Config} */
export const apiConfig = {
  ...baseConfig,
  printWidth: 100,
  tabWidth: 2,
  importOrderParserPlugins: ["typescript", "decorators-legacy"],
};

export default apiConfig;
