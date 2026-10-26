import { baseConfig } from "./base.js";

/** ESLint config for Node-only workspaces (no React, no JSX). */
export const nodeConfig = [...baseConfig];

export default nodeConfig;
