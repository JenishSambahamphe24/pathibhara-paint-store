import "reflect-metadata";

import type { IPostContent } from "@repo/shared";

import { describe, expect, it } from "vitest";

import { ValidationException } from "@repo/http-kit";

import { PostHtmlRenderer } from "./post-html.renderer";

const renderer = new PostHtmlRenderer({
  storage: { publicBaseUrl: "http://localhost:4002/uploads" },
} as never);

function doc(...content: IPostContent["content"] & object): IPostContent {
  return { type: "doc", content };
}

describe("PostHtmlRenderer", () => {
  it("renders headings, marks, lists and alignment", () => {
    const html = renderer.render(
      doc(
        {
          type: "heading",
          attrs: { level: 2, textAlign: "center" },
          content: [{ type: "text", text: "Prep" }],
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "Sand first", marks: [{ type: "bold" }] } as never],
        },
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [{ type: "paragraph", content: [{ type: "text", text: "Primer" }] }],
            },
          ],
        },
      ),
      "contentJson",
    );
    expect(html).toBe(
      '<h2 style="text-align:center">Prep</h2><p><strong>Sand first</strong></p><ul><li><p>Primer</p></li></ul>',
    );
  });

  it("keeps our own images and drops anyone else's", () => {
    const html = renderer.render(
      doc(
        { type: "image", attrs: { src: "http://localhost:4002/uploads/posts/a.png", alt: "Wall" } },
        { type: "image", attrs: { src: "https://tracker.example/pixel.gif", alt: "" } },
      ),
      "contentJson",
    );
    expect(html).toContain('src="http://localhost:4002/uploads/posts/a.png"');
    expect(html).not.toContain("tracker.example");
  });

  it("forces rel on links and strips javascript: urls", () => {
    const html = renderer.render(
      doc({
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "shop",
            marks: [{ type: "link", attrs: { href: "https://example.com", target: "_blank" } }],
          } as never,
          {
            type: "text",
            text: " bad",
            marks: [{ type: "link", attrs: { href: "javascript:alert(1)" } }],
          } as never,
        ],
      }),
      "contentJson",
    );
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).not.toContain("javascript:");
  });

  it("rejects node types the editor can't produce", () => {
    expect(() =>
      renderer.render(doc({ type: "iframe", attrs: { src: "https://evil" } }), "contentJson"),
    ).toThrow(ValidationException);
  });
});
