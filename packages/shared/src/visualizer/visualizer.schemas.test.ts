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
    translations: { en: { name: "Ivory Cream" }, ne: { name: "" } },
  };

  it("normalises the code to upper case and the colour to lower case", () => {
    const parsed = shadeInputSchema.parse(base);
    expect(parsed.code).toBe("SMP-1001");
    expect(parsed.hex).toBe("#f3e5c0");
    expect(parsed.translations.ne.name).toBeNull();
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
    translations: {
      en: { name: "Classic", description: "" },
      ne: { name: "", description: "" },
    },
    shades,
  };

  it("accepts one shade per component, reusing a shade across components", () => {
    expect(colourSetInputSchema.safeParse(base).success).toBe(true);
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

  it("needs a Nepali name before a Nepali description", () => {
    const result = colourSetInputSchema.safeParse({
      ...base,
      translations: { ...base.translations, ne: { name: "", description: "रातो" } },
    });
    expect(result.error?.issues[0]?.path).toEqual(["translations", "ne", "name"]);
  });
});
