import type { IFile } from "#/types/content.types";

import { ImagePlus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "#/components/Button/Button";

import { FileApi } from "#/features/files/api";
import { ApiErrorHelper } from "#/lib/helpers/apiError.helper";
import { toaster } from "#/lib/toaster";
import { m } from "#/paraglide/messages";

interface PostCoverFieldProps {
  value: string | null;
  initialFile: IFile | null;
  onChange: (fileId: string | null) => void;
}

export function PostCoverField({
  value,
  initialFile,
  onChange,
}: PostCoverFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<IFile | null>(initialFile);
  const [isUploading, setIsUploading] = useState(false);
  const shown = value && file?.id === value ? file : null;

  async function upload(picked: File) {
    setIsUploading(true);
    try {
      const uploaded = await FileApi.uploadImage(picked, "posts");
      setFile(uploaded);
      onChange(uploaded.id);
    } catch (error) {
      toaster.error({ description: ApiErrorHelper.describe(error) });
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      {shown && (
        <img
          src={shown.url}
          alt={shown.altText ?? ""}
          width={shown.width ?? undefined}
          height={shown.height ?? undefined}
          className="aspect-video w-full max-w-md rounded-lg border border-border object-cover"
        />
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={(event) => {
          const picked = event.target.files?.[0];
          if (picked) void upload(picked);
          event.target.value = "";
        }}
      />
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          startIcon={<ImagePlus size={16} />}
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
        >
          {isUploading
            ? m.products_images_uploading()
            : shown
              ? m.blog_cover_replace()
              : m.blog_cover_add()}
        </Button>
        {shown && (
          <Button
            variant="outline"
            startIcon={<Trash2 size={16} />}
            onClick={() => onChange(null)}
          >
            {m.blog_cover_remove()}
          </Button>
        )}
      </div>
      <p className="text-xs text-foreground-subtle">{m.blog_cover_hint()}</p>
    </div>
  );
}
