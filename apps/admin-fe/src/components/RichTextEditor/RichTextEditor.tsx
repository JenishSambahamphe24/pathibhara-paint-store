import type { JSONContent } from "@tiptap/react";

import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import clsx from "clsx";
import { useState } from "react";

import { RichTextEditorToolbar } from "./RichTextEditorToolbar";

export interface IUploadedImage {
  src: string;
  alt: string;
}

interface RichTextEditorProps {
  value: JSONContent;
  onChange: (value: JSONContent) => void;
  placeholder?: string;
  invalid?: boolean;
  onUploadImage?: (file: File) => Promise<IUploadedImage>;
}

// Same extensions as the API's PostHtmlRenderer: the server renders and
// sanitizes this JSON, and rejects any node it doesn't know.
// Only mounts with its initial value; remount (key) to load other content.
export function RichTextEditor({ value, onChange, placeholder, invalid = false, onUploadImage }: RichTextEditorProps) {
  const [isUploading, setIsUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, autolink: true },
      }),
      Image,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: placeholder ?? "" }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor: instance }) => onChange(instance.getJSON()),
  });

  if (!editor) return null;

  async function handleImage(file: File) {
    if (!onUploadImage || !editor) return;
    setIsUploading(true);
    try {
      const image = await onUploadImage(file);
      editor.chain().focus().setImage({ src: image.src, alt: image.alt }).run();
    } finally {
      setIsUploading(false);
    }
  }

  return (
    // overflow-clip, not hidden: a hidden wrapper becomes the sticky
    // toolbar's scroll container and it would never stick.
    <div className={clsx("rich-text overflow-clip rounded-lg border bg-surface", invalid ? "border-danger" : "border-border-strong")}>
      <div className="sticky top-0 z-10">
        <RichTextEditorToolbar
          editor={editor}
          isUploading={isUploading}
          onPickImage={onUploadImage ? (file) => void handleImage(file) : undefined}
        />
      </div>
      <EditorContent editor={editor} className="prose prose-sm max-w-none p-4 text-foreground" />
    </div>
  );
}
