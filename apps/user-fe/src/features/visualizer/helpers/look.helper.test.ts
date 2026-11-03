import { describe, expect, test } from "vitest";

import { LookHelper } from "./look.helper";

const index = LookHelper.index([
  { code: "S-0207", name: "Sandstone", hex: "#d8b98c" },
  { code: "S-0318", name: "Terracotta", hex: "#b5573a" },
  { code: "S-0702", name: "Charcoal", hex: "#2b2a28" },
]);

const look = {
  main_surface: "S-0207",
  columns: "S-0318",
  doors_windows: "S-0702",
  roof_edge: null,
};

describe("LookHelper search params", () => {
  test("round-trips a look through the URL", () => {
    const search = LookHelper.toSearch(look);

    expect(search).toEqual({ w: "S-0207", c: "S-0318", d: "S-0702" });
    expect(LookHelper.fromSearch(search, index)).toEqual(look);
  });

  test("matches codes without case and drops unknown ones", () => {
    expect(LookHelper.fromSearch({ w: "s-0207", c: "S-9999" }, index)).toEqual({
      ...LookHelper.EMPTY,
      main_surface: "S-0207",
    });
  });
});

describe("LookHelper.colours", () => {
  test("gives a hex per painted part and leaves unpainted parts out", () => {
    expect(LookHelper.colours(look, index)).toEqual({
      main_surface: "#d8b98c",
      columns: "#b5573a",
      doors_windows: "#2b2a28",
    });
  });
});

describe("LookHelper.message", () => {
  test("lists every part, then the link", () => {
    expect(LookHelper.message(look, index, "https://example.com/v")).toBe(
      [
        "Hello, I'd like these colours for my house:",
        "Walls: S-0207 Sandstone",
        "Columns: S-0318 Terracotta",
        "Doors & windows: S-0702 Charcoal",
        "Roof edge: Original colour",
        "https://example.com/v",
      ].join("\n"),
    );
  });
});
