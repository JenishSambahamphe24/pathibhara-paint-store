import { Config } from "#/lib/config";

interface ISeoPage {
  title: string;
  description: string;
  path: string;
  image?: string;
  noIndex?: boolean;
}

interface ISeoHead {
  meta: Array<Record<string, string>>;
  links: Array<Record<string, string>>;
}

export class SeoHelper {
  // Per-page <head>: title, description, canonical, Open Graph and Twitter.
  // Routes spread it into their head(); TanStack dedupes by name/property, so
  // these replace the root defaults.
  static page({
    title,
    description,
    path,
    image,
    noIndex,
  }: ISeoPage): ISeoHead {
    const { name } = Config.site;
    const url = SeoHelper.absoluteUrl(path);
    const fullTitle = title === name ? name : `${title} · ${name}`;

    const meta: Array<Record<string, string>> = [
      { title: fullTitle },
      { name: "description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: name },
      { property: "og:title", content: fullTitle },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      {
        name: "twitter:card",
        content: image ? "summary_large_image" : "summary",
      },
    ];
    if (image) {
      meta.push({
        property: "og:image",
        content: SeoHelper.absoluteUrl(image),
      });
    }
    if (noIndex) meta.push({ name: "robots", content: "noindex" });

    return { meta, links: [{ rel: "canonical", href: url }] };
  }

  static absoluteUrl(path: string): string {
    return new URL(path, Config.site.url).toString();
  }
}
