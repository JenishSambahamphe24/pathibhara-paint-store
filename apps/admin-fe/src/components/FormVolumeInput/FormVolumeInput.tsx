import { COMMON_VOLUMES_ML, VolumeHelper } from "@repo/shared";

import { FormParsedInput } from "#/components/FormParsedInput/FormParsedInput";

interface FormVolumeInputProps {
  label: string;
  required?: boolean;
  disabled?: boolean;
  hint?: string;
  hideLabel?: boolean;
}

const SUGGESTIONS = COMMON_VOLUMES_ML.map(VolumeHelper.toLitresString);

export function FormVolumeInput(props: FormVolumeInputProps) {
  return (
    <FormParsedInput
      {...props}
      suffix="L"
      suggestions={SUGGESTIONS}
      parse={(text) =>
        text.trim() === ""
          ? null
          : (VolumeHelper.parseLitres(text) ?? Number.NaN)
      }
      format={VolumeHelper.toLitresString}
    />
  );
}
