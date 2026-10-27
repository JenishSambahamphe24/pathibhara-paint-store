import type { Editor } from "@tiptap/react";

import { useEditorState } from "@tiptap/react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  ImagePlus,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Undo2,
} from "lucide-react";
import { useRef, useState } from "react";

import { m } from "#/paraglide/messages";

import { RichTextEditorToolbarButton } from "./RichTextEditorToolbarButton";

type TBlockValue = "paragraph" | "h2" | "h3";

interface RichTextEditorToolbarProps {
  editor: Editor;
  onPickImage?: (file: File) => void;
  isUploading?: boolean;
}

export function RichTextEditorToolbar({ editor, onPickImage, isUploading = false }: RichTextEditorToolbarProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [linkDraft, setLinkDraft] = useState<string | null>(null);

  // Re-render on selection changes so active states follow the caret.
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      block: (e.isActive("heading", { level: 2 }) ? "h2" : e.isActive("heading", { level: 3 }) ? "h3" : "paragraph") as TBlockValue,
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      bulletList: e.isActive("bulletList"),
      orderedList: e.isActive("orderedList"),
      blockquote: e.isActive("blockquote"),
      link: e.isActive("link"),
      left: e.isActive({ textAlign: "left" }),
      center: e.isActive({ textAlign: "center" }),
      right: e.isActive({ textAlign: "right" }),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  function setBlock(value: TBlockValue) {
    if (value === "paragraph") editor.chain().focus().setParagraph().run();
    else editor.chain().focus().setHeading({ level: value === "h2" ? 2 : 3 }).run();
  }

  function applyLink() {
    const href = linkDraft?.trim();
    if (href) editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
    setLinkDraft(null);
  }

  return (
    <div className="border-b border-border-muted bg-surface-subtle">
      <div className="flex flex-wrap items-center gap-1 px-2 py-2">
        <select
          value={state.block}
          onChange={(event) => setBlock(event.target.value as TBlockValue)}
          aria-label={m.rich_text_block()}
          className="min-w-32 cursor-pointer rounded-md border border-border-strong bg-surface py-1 pr-7 pl-2 text-sm text-foreground-muted focus:outline-none"
        >
          <option value="paragraph">{m.rich_text_paragraph()}</option>
          <option value="h2">{m.rich_text_heading_2()}</option>
          <option value="h3">{m.rich_text_heading_3()}</option>
        </select>
        <span className="mx-1 h-5 w-px bg-border-muted" />
        <RichTextEditorToolbarButton title={m.rich_text_bold()} active={state.bold} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold size={15} />
        </RichTextEditorToolbarButton>
        <RichTextEditorToolbarButton title={m.rich_text_italic()} active={state.italic} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic size={15} />
        </RichTextEditorToolbarButton>
        <span className="mx-1 h-5 w-px bg-border-muted" />
        <RichTextEditorToolbarButton title={m.rich_text_align_left()} active={state.left} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
          <AlignLeft size={15} />
        </RichTextEditorToolbarButton>
        <RichTextEditorToolbarButton title={m.rich_text_align_center()} active={state.center} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
          <AlignCenter size={15} />
        </RichTextEditorToolbarButton>
        <RichTextEditorToolbarButton title={m.rich_text_align_right()} active={state.right} onClick={() => editor.chain().focus().setTextAlign("right").run()}>
          <AlignRight size={15} />
        </RichTextEditorToolbarButton>
        <span className="mx-1 h-5 w-px bg-border-muted" />
        <RichTextEditorToolbarButton title={m.rich_text_bullet_list()} active={state.bulletList} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List size={15} />
        </RichTextEditorToolbarButton>
        <RichTextEditorToolbarButton title={m.rich_text_ordered_list()} active={state.orderedList} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered size={15} />
        </RichTextEditorToolbarButton>
        <RichTextEditorToolbarButton title={m.rich_text_quote()} active={state.blockquote} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote size={15} />
        </RichTextEditorToolbarButton>
        <span className="mx-1 h-5 w-px bg-border-muted" />
        <RichTextEditorToolbarButton
          title={state.link ? m.rich_text_remove_link() : m.rich_text_link()}
          active={state.link}
          onClick={() => {
            if (state.link) editor.chain().focus().unsetLink().run();
            else setLinkDraft("https://");
          }}
        >
          <LinkIcon size={15} />
        </RichTextEditorToolbarButton>
        {onPickImage && (
          <>
            <RichTextEditorToolbarButton title={m.rich_text_image()} disabled={isUploading} onClick={() => fileRef.current?.click()}>
              <ImagePlus size={15} />
            </RichTextEditorToolbarButton>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) onPickImage(file);
                event.target.value = "";
              }}
            />
          </>
        )}
        <span className="mx-1 h-5 w-px bg-border-muted" />
        <RichTextEditorToolbarButton title={m.rich_text_undo()} disabled={!state.canUndo} onClick={() => editor.chain().focus().undo().run()}>
          <Undo2 size={15} />
        </RichTextEditorToolbarButton>
        <RichTextEditorToolbarButton title={m.rich_text_redo()} disabled={!state.canRedo} onClick={() => editor.chain().focus().redo().run()}>
          <Redo2 size={15} />
        </RichTextEditorToolbarButton>
        {isUploading && <span className="ml-2 text-xs text-foreground-subtle">{m.rich_text_uploading()}</span>}
      </div>
      {linkDraft !== null && (
        <div className="flex items-center gap-2 border-t border-border-muted px-2 py-2">
          <input
            autoFocus
            value={linkDraft}
            onChange={(event) => setLinkDraft(event.target.value)}
            onKeyDown={(event) => {
              // Enter here must apply the link, not submit the surrounding form.
              if (event.key === "Enter") {
                event.preventDefault();
                applyLink();
              }
              if (event.key === "Escape") setLinkDraft(null);
            }}
            aria-label={m.rich_text_link_url()}
            className="grow rounded-md border border-border-strong px-2 py-1 text-sm text-foreground focus:outline-none"
          />
          <button type="button" onClick={applyLink} className="cursor-pointer rounded-md bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
            {m.rich_text_link_apply()}
          </button>
          <button type="button" onClick={() => setLinkDraft(null)} className="cursor-pointer text-xs text-foreground-subtle hover:text-foreground">
            {m.generic_cancel()}
          </button>
        </div>
      )}
    </div>
  );
}
