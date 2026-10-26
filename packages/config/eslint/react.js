import { tanstackConfig } from "@tanstack/eslint-config";

import { baseConfig } from "./base.js";

export const reactConfig = [...tanstackConfig, ...baseConfig];

export default reactConfig;
