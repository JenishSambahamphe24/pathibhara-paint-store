import reactConfig from "@repo/config/prettier/react";

/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
export default {
  ...reactConfig,
  tailwindStylesheet: "./src/styles/global.css",
};
