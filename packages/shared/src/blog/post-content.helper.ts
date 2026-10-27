// The editor's JSON (a ProseMirror document). Only the shape the API relies on
// is typed; the renderer validates node types against its own extensions.
export interface IPostContentNode {
  type: string;
  text?: string;
  attrs?: Record<string, unknown>;
  content?: Array<IPostContentNode>;
}

export interface IPostContent extends IPostContentNode {
  type: "doc";
}

export class PostContentHelper {
  static empty(): IPostContent {
    return { type: "doc", content: [{ type: "paragraph" }] };
  }

  // An empty editor still holds an empty paragraph, so "has content" means
  // some visible text or an image somewhere in the tree.
  static hasContent(node: IPostContentNode | undefined): boolean {
    if (!node) return false;
    if (node.type === "image") return true;
    if (node.type === "text" && node.text?.trim()) return true;
    return node.content?.some((child) => PostContentHelper.hasContent(child)) ?? false;
  }

  static imageSources(node: IPostContentNode | undefined, found: Array<string> = []): Array<string> {
    if (!node) return found;
    if (node.type === "image" && typeof node.attrs?.src === "string") found.push(node.attrs.src);
    node.content?.forEach((child) => PostContentHelper.imageSources(child, found));
    return found;
  }
}
