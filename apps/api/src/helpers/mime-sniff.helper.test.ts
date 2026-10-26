import { describe, expect, it } from "vitest";

import { MimeSniffHelper } from "./mime-sniff.helper";

describe("MimeSniffHelper.imageType", () => {
  it("recognises PNG and JPEG signatures", () => {
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
    const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]);
    expect(MimeSniffHelper.imageType(png)).toBe("image/png");
    expect(MimeSniffHelper.imageType(jpeg)).toBe("image/jpeg");
  });

  it("rejects HTML pretending to be an image", () => {
    expect(MimeSniffHelper.imageType(Buffer.from("<html><script>alert(1)</script>"))).toBeNull();
  });
});
