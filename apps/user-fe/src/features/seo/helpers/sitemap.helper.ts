import type { ISitemapUrl } from "../types";

const XML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
};

export class SitemapHelper {
  static toXml(urls: ReadonlyArray<ISitemapUrl>): string {
    const entries = urls.map(({ loc, lastmod }) => {
      const lastmodTag = lastmod
        ? `<lastmod>${SitemapHelper.escape(lastmod)}</lastmod>`
        : "";
      return `<url><loc>${SitemapHelper.escape(loc)}</loc>${lastmodTag}</url>`;
    });
    return [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...entries,
      "</urlset>",
    ].join("\n");
  }

  private static escape(value: string): string {
    return value.replace(/[&<>"']/g, (char) => XML_ESCAPES[char]);
  }
}
