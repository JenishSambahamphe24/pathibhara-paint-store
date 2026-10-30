import type { JSONContent } from "@tiptap/react";
import type { IUploadedImage } from "#/components/RichTextEditor/RichTextEditor";

import { RichTextEditor } from "#/components/RichTextEditor/RichTextEditor";

import { useFieldContext } from "#/lib/formContext";
import { FormHelper } from "#/lib/helpers/form.helper";

interface FormRichTextProps {
  label: string;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  onUploadImage?: (file: File) => Promise<IUploadedImage>;
}

export function FormRichText({
  label,
  required = false,
  placeholder,
  hint,
  onUploadImage,
}: FormRichTextProps) {
  const field = useFieldContext<JSONContent>();
  const error = FormHelper.getFieldError(field.state.meta.errors);

  return (
    <div className="space-y-1.5">
      <span className="text-sm font-medium text-foreground-muted">
        {label}
        {required && <span className="ml-0.5 text-danger">*</span>}
      </span>
      <RichTextEditor
        value={field.state.value}
        placeholder={placeholder}
        invalid={!!error}
        onUploadImage={onUploadImage}
        onChange={(value) => {
          field.handleChange(value);
          FormHelper.clearServerError(field);
        }}
      />
      {error ? (
        <p className="text-xs text-danger">{error}</p>
      ) : (
        hint && <p className="text-xs text-foreground-subtle">{hint}</p>
      )}
    </div>
  );
}
