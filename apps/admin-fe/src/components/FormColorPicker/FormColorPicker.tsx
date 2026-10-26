import { ColorPicker, Field, parseColor } from "@ark-ui/react";
import clsx from "clsx";
import { Pipette } from "lucide-react";
import { useMemo, useState } from "react";

import { useFieldContext } from "#/lib/formContext";
import { FormHelper } from "#/lib/helpers/form.helper";

interface FormColorPickerProps {
  label: string;
  required?: boolean;
  presets?: Array<string>;
}

const DEFAULT_PRESETS = [
  "#7C3AED",
  "#2563EB",
  "#0891B2",
  "#059669",
  "#CA8A04",
  "#EA580C",
  "#DC2626",
  "#DB2777",
  "#4B5563",
  "#111827",
];

const FALLBACK_COLOR = "#7C3AED";

function toColor(value: string) {
  try {
    return parseColor(value || FALLBACK_COLOR);
  } catch {
    return parseColor(FALLBACK_COLOR);
  }
}

export function FormColorPicker({
  label,
  required = false,
  presets = DEFAULT_PRESETS,
}: FormColorPickerProps) {
  const field = useFieldContext<string>();
  const error = FormHelper.getFieldError(field.state.meta.errors);
  const [isOpen, setIsOpen] = useState(false);

  const color = useMemo(() => toColor(field.state.value), [field.state.value]);
  const swatchItems = useMemo(
    () => presets.map((p) => parseColor(p)),
    [presets],
  );

  return (
    <Field.Root
      invalid={!!error}
      className={clsx("relative", isOpen && "z-50")}
    >
      <Field.Label className="text-sm font-medium text-foreground-muted">
        {label}
        {required && <span className="ml-0.5 text-danger">*</span>}
      </Field.Label>

      <ColorPicker.Root
        value={color}
        open={isOpen}
        onOpenChange={(details) => setIsOpen(details.open)}
        onValueChange={(details) => {
          field.handleChange(details.value.toString("hex"));
          if (field.state.meta.errorMap.onServer) {
            field.setMeta((meta) => ({
              ...meta,
              errorMap: { ...meta.errorMap, onServer: undefined },
            }));
          }
        }}
        onValueChangeEnd={() => field.handleBlur()}
        positioning={{ placement: "bottom-start", gutter: 4 }}
      >
        <ColorPicker.Control className="mt-1">
          <ColorPicker.Trigger
            className={clsx(
              "inline-flex w-full items-center gap-3 rounded-lg border bg-surface px-3 py-2.5",
              "text-sm text-foreground transition-colors",
              "border-border-strong focus:border-foreground focus:ring-2 focus:ring-foreground/10",
              "data-invalid:border-danger data-invalid:focus:border-danger data-invalid:focus:ring-danger/10",
              "cursor-pointer focus:outline-none",
            )}
          >
            <ColorPicker.ValueSwatch className="size-6 shrink-0 rounded-md border border-border" />
            <span className="font-mono uppercase">{field.state.value}</span>
          </ColorPicker.Trigger>
        </ColorPicker.Control>

        <ColorPicker.Positioner className="z-50">
          <ColorPicker.Content
            className={clsx(
              "flex w-64 flex-col gap-3 rounded-lg border border-border bg-surface p-3 shadow-lg",
              "focus:outline-none",
            )}
          >
            <ColorPicker.Area className="h-32 overflow-hidden rounded-md">
              <ColorPicker.AreaBackground className="size-full" />
              <ColorPicker.AreaThumb className="size-3 rounded-full border-2 border-surface shadow" />
            </ColorPicker.Area>

            <div className="flex items-center gap-2">
              <ColorPicker.EyeDropperTrigger
                className={clsx(
                  "inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-border-strong",
                  "text-foreground-subtle transition-colors hover:bg-surface-subtle focus:outline-none",
                )}
              >
                <Pipette size={15} />
              </ColorPicker.EyeDropperTrigger>

              <div className="flex-1">
                <ColorPicker.ChannelSlider
                  channel="hue"
                  className="h-4 rounded-full"
                >
                  <ColorPicker.ChannelSliderTrack className="h-full rounded-full" />
                  <ColorPicker.ChannelSliderThumb className="size-4 rounded-full border-2 border-surface shadow" />
                </ColorPicker.ChannelSlider>
              </div>
            </div>

            <ColorPicker.ChannelInput
              channel="hex"
              className={clsx(
                "w-full rounded-md border border-border-strong bg-surface px-3 py-2",
                "font-mono text-sm text-foreground uppercase focus:border-foreground focus:outline-none",
              )}
            />

            <ColorPicker.SwatchGroup className="grid grid-cols-5 gap-2">
              {swatchItems.map((swatch, index) => (
                <ColorPicker.SwatchTrigger
                  key={presets[index]}
                  value={swatch}
                  className="rounded-md focus:outline-none"
                >
                  <ColorPicker.Swatch
                    value={swatch}
                    className="size-8 rounded-md border border-border data-[state=checked]:ring-2 data-[state=checked]:ring-foreground"
                  />
                </ColorPicker.SwatchTrigger>
              ))}
            </ColorPicker.SwatchGroup>
          </ColorPicker.Content>
        </ColorPicker.Positioner>

        <ColorPicker.HiddenInput />
      </ColorPicker.Root>

      {error && (
        <Field.ErrorText className="mt-1 text-xs text-danger">
          {error}
        </Field.ErrorText>
      )}
    </Field.Root>
  );
}
