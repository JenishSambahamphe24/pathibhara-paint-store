import { describe, expect, it } from "vitest";

import { VolumeHelper } from "./volume.helper";

describe("VolumeHelper", () => {
  it("parses litres to whole millilitres", () => {
    expect(VolumeHelper.parseLitres("0.5")).toBe(500);
    expect(VolumeHelper.parseLitres("20")).toBe(20000);
    expect(VolumeHelper.parseLitres("1.25")).toBe(1250);
  });

  it("rejects zero, negatives and junk", () => {
    expect(VolumeHelper.parseLitres("0")).toBeNull();
    expect(VolumeHelper.parseLitres("-1")).toBeNull();
    expect(VolumeHelper.parseLitres("1.2345")).toBeNull();
    expect(VolumeHelper.parseLitres("abc")).toBeNull();
  });

  it("formats millilitres as litres", () => {
    expect(VolumeHelper.label(500)).toBe("0.5 L");
    expect(VolumeHelper.label(1000)).toBe("1 L");
    expect(VolumeHelper.label(1250)).toBe("1.25 L");
    expect(VolumeHelper.toLitresString(20000)).toBe("20");
  });
});
