import { Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "#/components/Button/Button";
import { ImagePreview } from "#/components/ImagePreview/ImagePreview";

import { m } from "#/paraglide/messages";

interface FilePickerProps {
  label: string;
  required?: boolean;
  defaultPreviewUrl?: string | null;
  defaultPreviewMimeType?: string | null;
  accept?: string;
  value: File | null;
  onChange: (file: File | null) => void;
  errorMessage?: string;
}

export function FilePicker({
  label,
  required = false,
  defaultPreviewUrl,
  defaultPreviewMimeType,
  accept = "image/*",
  value,
  onChange,
  errorMessage,
}: FilePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  // The picked file is mirrored locally because `value` can't be trusted to
  // arrive: TanStack Form's field subscription compares its slice with a
  // shallow equality that walks own enumerable keys, and a File has none — so
  // replacing one File with another looks unchanged, the field skips its
  // re-render, and the prop stays stuck on the first pick. The form's own state
  // is correct throughout; only the render is missed.
  const [picked, setPicked] = useState<File | null>(value);
  const [lastValue, setLastValue] = useState<File | null>(value);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  // `lastValue` tracks the prop alone, never the local pick: a parent that
  // really does hand over a different file — a form reset, an edit dialog
  // switching records — still wins over the mirror, while a prop that simply
  // never caught up leaves the mirror standing.
  if (value !== lastValue) {
    setLastValue(value);
    setPicked(value);
  }

  useEffect(() => {
    if (!picked) {
      setObjectUrl(null);
      return;
    }
    const url = URL.createObjectURL(picked);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [picked]);

  const previewUrl = objectUrl ?? defaultPreviewUrl ?? "";
  const previewMimeType = picked ? picked.type : defaultPreviewMimeType;
  const previewIsVideo =
    !!previewUrl && !!previewMimeType?.startsWith("video/");

  function handlePickClick() {
    inputRef.current?.click();
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setPicked(file);
    onChange(file);
    event.target.value = "";
  }

  function handleClear() {
    setPicked(null);
    onChange(null);
  }

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-foreground-muted">
        {label}
        {required && <span className="ml-0.5 text-danger">*</span>}
      </span>

      <div className="flex items-center gap-3">
        {previewIsVideo ? (
          <video
            src={previewUrl}
            aria-label={label}
            muted
            loop
            autoPlay
            playsInline
            className="size-16 shrink-0 rounded-md bg-surface-subtle object-cover"
          />
        ) : (
          <ImagePreview
            src={previewUrl || null}
            alt={label}
            size="md"
            previewClassName="max-h-128 max-w-3xl"
          />
        )}

        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePickClick}
              startIcon={<Upload size={14} />}
            >
              {picked ? m.file_picker_change() : m.file_picker_choose()}
            </Button>
            {picked && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClear}
                startIcon={<X size={14} />}
              >
                {m.file_picker_clear()}
              </Button>
            )}
          </div>
          {picked && (
            <span className="truncate text-xs text-foreground-subtle">
              {picked.name}
            </span>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleInputChange}
        />
      </div>

      {errorMessage && <p className="text-xs text-danger">{errorMessage}</p>}
    </div>
  );
}
