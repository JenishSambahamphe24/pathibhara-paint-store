import { describe, expect, test } from "vitest";

import { SitemapHelper } from "./sitemap.helper";

describe("SitemapHelper.toXml", () => {
  test("writes loc and an optional lastmod per URL", () => {
    const xml = SitemapHelper.toXml([
      { loc: "https://example.com/" },
      {
        loc: "https://example.com/products/gloss",
        lastmod: "2026-11-01T10:00:00.000Z",
      },
    ]);

    expect(xml).toContain("<url><loc>https://example.com/</loc></url>");
    expect(xml).toContain(
      "<url><loc>https://example.com/products/gloss</loc><lastmod>2026-11-01T10:00:00.000Z</lastmod></url>",
    );
  });

  test("escapes characters that would break the XML", () => {
    const xml = SitemapHelper.toXml([
      { loc: "https://example.com/search?a=1&b=<2>" },
    ]);

    expect(xml).toContain(
      "<loc>https://example.com/search?a=1&amp;b=&lt;2&gt;</loc>",
    );
  });

  test("is a valid, empty urlset when nothing is indexed", () => {
    expect(SitemapHelper.toXml([])).toBe(
      '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</urlset>',
    );
  });
});
