import { describe, expect, it } from "vitest";

import { PostContentHelper } from "./post-content.helper";
import { postInputSchema } from "./post.schemas";

const doc = (text: string) => ({ type: "doc" as const, content: [{ type: "paragraph", content: [{ type: "text", text }] }] });
const empty = { title: "", excerpt: "", contentJson: PostContentHelper.empty(), seoTitle: "", seoDescription: "" };

describe("postInputSchema", () => {
  const base = { slug: "", coverImageFileId: null, ...empty };

  it("accepts a post with a title and content", () => {
    const result = postInputSchema.safeParse({ ...base, title: "Choosing exterior paint", contentJson: doc("Hello") });
    expect(result.success).toBe(true);
  });

  it("rejects a post with no content", () => {
    const result = postInputSchema.safeParse({ ...base, title: "Empty" });
    expect(result.error?.issues[0].path).toEqual(["contentJson"]);
  });

  it("rejects unknown keys inside the document", () => {
    const result = postInputSchema.safeParse({
      ...base,
      title: "T",
      contentJson: { type: "doc", content: [{ type: "paragraph", onclick: "x" }] },
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
