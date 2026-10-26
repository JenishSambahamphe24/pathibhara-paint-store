import type { IFile } from "#/types/content.types";

import { ArrowLeft, ArrowRight, ImagePlus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";

import { MAX_PRODUCT_IMAGES } from "@repo/shared";

import { ActionButton } from "#/components/ActionButton/ActionButton";
import { Button } from "#/components/Button/Button";
import { Chip } from "#/components/Chip/Chip";

import { FileApi } from "#/features/files/api";
import { ApiErrorHelper } from "#/lib/helpers/apiError.helper";
import { toaster } from "#/lib/toaster";
import { m } from "#/paraglide/messages";

interface ProductImagesFieldProps {
  value: Array<string>;
  onChange: (ids: Array<string>) => void;
  initialFiles: Array<IFile>;
  error?: string;
}

// Uploads happen immediately (the API stores the file and returns its id);
// the product only records which ids to show, in order, when saved.
export function ProductImagesField({
  value,
  onChange,
  initialFiles,
  error,
}: ProductImagesFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [known, setKnown] = useState<Map<string, IFile>>(
    () => new Map(initialFiles.map((f) => [f.id, f])),
  );
  const [uploading, setUploading] = useState(0);

  async function upload(files: FileList | null) {
    if (!files) return;
    const room = MAX_PRODUCT_IMAGES - value.length;
    const picked = Array.from(files).slice(0, room);
    if (picked.length < files.length)
      toaster.error({
        description: m.products_images_limit({ max: MAX_PRODUCT_IMAGES }),
      });

    const added: Array<string> = [];
    for (const file of picked) {
      setUploading((n) => n + 1);
      try {
        const uploaded = await FileApi.uploadImage(file, "products");
        setKnown((prev) => new Map(prev).set(uploaded.id, uploaded));
        added.push(uploaded.id);
      } catch (err) {
        toaster.error({
          description: `${file.name}: ${ApiErrorHelper.describe(err)}`,
        });
      } finally {
        setUploading((n) => n - 1);
      }
    }
    if (added.length > 0) onChange([...value, ...added]);
  }

  function move(index: number, direction: -1 | 1) {
    const next = [...value];
    [next[index], next[index + direction]] = [
      next[index + direction],
      next[index],
    ];
    onChange(next);
  }

  return (
    <div className="space-y-3">
      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {value.map((id, index) => {
            const file = known.get(id);
            return (
              <div
                key={id}
                className="overflow-hidden rounded-lg border border-border bg-surface-muted"
              >
                <div className="relative aspect-square">
                  {file && (
                    <img
                      src={file.url}
                      alt={file.altText ?? ""}
                      width={file.width ?? undefined}
                      height={file.height ?? undefined}
                      className="size-full object-contain"
                    />
                  )}
                  {index === 0 && (
                    <Chip variant="primary" className="absolute top-2 left-2">
                      {m.products_images_cover()}
                    </Chip>
                  )}
                </div>
                <div className="flex justify-between border-t border-border px-1 py-1">
                  <div className="flex">
                    <ActionButton
                      icon={<ArrowLeft size={14} />}
                      tooltip={m.products_images_earlier()}
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                    />
                    <ActionButton
                      icon={<ArrowRight size={14} />}
                      tooltip={m.products_images_later()}
                      onClick={() => move(index, 1)}
                      disabled={index === value.length - 1}
                    />
                  </div>
                  <ActionButton
                    icon={<Trash2 size={14} />}
                    tooltip={m.products_images_remove()}
                    variant="danger"
                    onClick={() =>
                      onChange(value.filter((other) => other !== id))
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        className="hidden"
        onChange={(event) => {
          void upload(event.target.files);
          event.target.value = "";
        }}
      />
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          startIcon={<ImagePlus size={16} />}
          disabled={uploading > 0 || value.length >= MAX_PRODUCT_IMAGES}
          onClick={() => inputRef.current?.click()}
        >
          {uploading > 0
            ? m.products_images_uploading()
            : m.products_images_add()}
        </Button>
        <p className="text-xs text-foreground-subtle">
          {m.products_images_hint({ max: MAX_PRODUCT_IMAGES })}
        </p>
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
