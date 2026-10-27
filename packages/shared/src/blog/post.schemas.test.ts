import { describe, expect, it } from "vitest";

import { PostContentHelper } from "./post-content.helper";
import { postInputSchema } from "./post.schemas";

const doc = (text: string) => ({ type: "doc" as const, content: [{ type: "paragraph", content: [{ type: "text", text }] }] });
const empty = { title: "", excerpt: "", contentJson: PostContentHelper.empty(), seoTitle: "", seoDescription: "" };

describe("postInputSchema", () => {
  it("accepts an English-only post", () => {
    const result = postInputSchema.safeParse({
      slug: "",
      coverImageFileId: null,
      translations: { en: { ...empty, title: "Choosing exterior paint", contentJson: doc("Hello") }, ne: empty },
    });
    expect(result.success).toBe(true);
  });

  it("rejects an English post with no content", () => {
    const result = postInputSchema.safeParse({
      slug: "",
      coverImageFileId: null,
      translations: { en: { ...empty, title: "Empty" }, ne: empty },
    });
    expect(result.error?.issues[0].path).toEqual(["translations", "en", "contentJson"]);
  });

  it("needs a Nepali title once Nepali content is written", () => {
    const result = postInputSchema.safeParse({
      slug: "",
      coverImageFileId: null,
      translations: { en: { ...empty, title: "T", contentJson: doc("x") }, ne: { ...empty, contentJson: doc("नमस्ते") } },
    });
    expect(result.error?.issues[0].path).toEqual(["translations", "ne", "title"]);
  });

  it("rejects unknown keys inside the document", () => {
    const result = postInputSchema.safeParse({
      slug: "",
      coverImageFileId: null,
      translations: {
        en: { ...empty, title: "T", contentJson: { type: "doc", content: [{ type: "paragraph", onclick: "x" }] } },
        ne: empty,
      },
    });
    expect(result.success).toBe(false);
  });
});

describe("PostContentHelper", () => {
  it("treats an empty editor as no content", () => {
    expect(PostContentHelper.hasContent(PostContentHelper.empty())).toBe(false);
    expect(PostContentHelper.hasContent(doc("   "))).toBe(false);
    expect(PostContentHelper.hasContent({ type: "doc", content: [{ type: "image", attrs: { src: "x" } }] })).toBe(true);
  });
});
