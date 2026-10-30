import type { IPostContent } from "@repo/shared";

import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { generateHTML } from "@tiptap/html/server";
import StarterKit from "@tiptap/starter-kit";
import sanitizeHtml from "sanitize-html";
import { injectable } from "tsyringe";

import { ValidationException } from "@repo/http-kit";

import { ConfigService } from "#config";
import { tk } from "#i18n/tk";

// Must match the editor in admin-fe (components/RichTextEditor): a node the
// server doesn't know can't be rendered, and the save is rejected.
const EXTENSIONS = [
  StarterKit.configure({
    heading: { levels: [2, 3] },
    link: { openOnClick: false, autolink: true },
  }),
  Image,
  TextAlign.configure({ types: ["heading", "paragraph"] }),
];

const ALLOWED_TAGS = [
  "p",
  "h2",
  "h3",
  "strong",
  "em",
  "u",
  "s",
  "code",
  "pre",
  "blockquote",
  "ul",
  "ol",
  "li",
  "br",
  "hr",
  "a",
  "img",
];

@injectable()
export class PostHtmlRenderer {
  constructor(private readonly configService: ConfigService) {}

  // Renders once at save time, so the public site serves stored HTML and never
  // trusts what the browser sent.
  render(content: IPostContent, field: string): string {
    let html: string;
    try {
      html = generateHTML(content, EXTENSIONS);
    } catch {
      throw new ValidationException({ [field]: tk("post.unsupportedContent") });
    }
    return this.sanitize(html);
  }

  private sanitize(html: string): string {
    const imageBase = `${this.configService.storage.publicBaseUrl.replace(/\/$/, "")}/`;
    return sanitizeHtml(html, {
      allowedTags: ALLOWED_TAGS,
      allowedAttributes: {
        a: ["href", "target", "rel"],
        img: ["src", "alt", "title", "width", "height"],
        "*": ["style"],
      },
      allowedStyles: { "*": { "text-align": [/^(left|right|center|justify)$/] } },
      allowedSchemes: ["http", "https", "mailto", "tel"],
      allowedSchemesByTag: { img: ["http", "https"] },
      // Only images we host: a pasted external URL could be a tracking pixel
      // or disappear later.
      exclusiveFilter: (frame) => frame.tag === "img" && !frame.attribs.src?.startsWith(imageBase),
      transformTags: {
        a: (tagName, attribs) => ({ tagName, attribs: { ...attribs, rel: "noopener noreferrer" } }),
      },
    });
  }
}
