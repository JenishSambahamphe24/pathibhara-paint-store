import { readFileSync } from "node:fs";

import { describe, expect, test } from "vitest";

import { VISUALIZER_COMPONENTS } from "@repo/shared";

// The model is a build artefact (scripts/build-house-model.ts, or a Blender
// export later); the viewer finds paintable surfaces by material name.
function readGlbJson(path: string): { materials: Array<{ name?: string }> } {
  const file = readFileSync(path);
  expect(file.readUInt32LE(0)).toBe(0x46546c67);
  const jsonLength = file.readUInt32LE(12);
  return JSON.parse(file.subarray(20, 20 + jsonLength).toString("utf8"));
}

describe("public/models/house.glb", () => {
  const gltf = readGlbJson(
    new URL("../../../public/models/house.glb", import.meta.url).pathname,
  );
  const names = gltf.materials.map((material) => material.name);

  test("has one material per visualizer component", () => {
    for (const component of VISUALIZER_COMPONENTS) {
      expect(names.filter((name) => name === component)).toHaveLength(1);
    }
  });

  test("names every other material as fixed", () => {
    const others = names.filter(
      (name) => !VISUALIZER_COMPONENTS.some((c) => c === name),
    );
    expect(others.every((name) => name?.startsWith("fixed_"))).toBe(true);
  });
});
