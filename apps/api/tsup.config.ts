import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: "esm",
  target: "node24",
  outDir: "dist",
  clean: true,
  splitting: false,
  noExternal: [/@repo\/.*/],
  external: [/^[^.@/#]|^@(?!repo)/],
  esbuildOptions(options) {
    options.supported = { decorators: true };
  },
});
