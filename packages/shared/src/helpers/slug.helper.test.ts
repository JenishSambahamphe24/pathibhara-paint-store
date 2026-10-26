import { describe, expect, it } from "vitest";

import { SlugHelper } from "./slug.helper";

describe("SlugHelper.fromText", () => {
  it("lowercases and hyphenates", () => {
    expect(SlugHelper.fromText("Apex Royal  Emulsion")).toBe("apex-royal-emulsion");
  });

  it("strips accents and symbols", () => {
    expect(SlugHelper.fromText("  Damp-proof / Primér (20L) ")).toBe("damp-proof-primer-20l");
  });

  it("returns empty for symbol-only input", () => {
    expect(SlugHelper.fromText("---")).toBe("");
  });

  it("produces values matching PATTERN", () => {
    expect(SlugHelper.PATTERN.test(SlugHelper.fromText("Tractor Emulsion 1L"))).toBe(true);
  });
});
