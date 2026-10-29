import { describe, expect, it } from "vitest";

import { colourSetInputSchema } from "./colour-set.schemas";
import { shadeInputSchema } from "./shade.schemas";

const SHADE_ID = "0190a0b4-6c3e-7d2a-8f00-000000000001";

describe("shadeInputSchema", () => {
  const base = {
    code: " smp-1001 ",
    hex: "#F3E5C0",
    productId: null,
    isActive: true,
    name: " Ivory Cream ",
  };

  it("normalises the code to upper case and the colour to lower case", () => {
    const parsed = shadeInputSchema.parse(base);
    expect(parsed.code).toBe("SMP-1001");
    expect(parsed.hex).toBe("#f3e5c0");
    expect(parsed.name).toBe("Ivory Cream");
  });

  it("rejects colours that aren't #rrggbb", () => {
    for (const hex of ["#fff", "f3e5c0", "#f3e5c0ff", "rgb(0,0,0)"]) {
      expect(shadeInputSchema.safeParse({ ...base, hex }).success).toBe(false);
    }
  });
});

describe("colourSetInputSchema", () => {
  const shades = {
    main_surface: SHADE_ID,
    columns: SHADE_ID,
    doors_windows: SHADE_ID,
    roof_edge: SHADE_ID,
  };
  const base = {
    slug: "",
    isActive: true,
    name: "Classic",
    description: "",
    shades,
  };

  it("accepts one shade per component, reusing a shade across components", () => {
    expect(colourSetInputSchema.safeParse(base).success).toBe(true);
  });

  it("stores an empty description as null", () => {
    expect(colourSetInputSchema.parse(base).description).toBeNull();
  });

  it("asks for each missing shade on its own field", () => {
    const result = colourSetInputSchema.safeParse({
      ...base,
      shades: { ...shades, roof_edge: "" },
    });
    expect(result.error?.issues).toMatchObject([
      { path: ["shades", "roof_edge"], message: "Pick a shade" },
    ]);
  });
});
