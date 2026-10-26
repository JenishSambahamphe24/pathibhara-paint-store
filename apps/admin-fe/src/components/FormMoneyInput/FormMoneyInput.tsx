import { MoneyHelper } from "@repo/shared";

import { FormParsedInput } from "#/components/FormParsedInput/FormParsedInput";

interface FormMoneyInputProps {
  label: string;
  required?: boolean;
  disabled?: boolean;
  hint?: string;
  placeholder?: string;
  hideLabel?: boolean;
}

export function FormMoneyInput(props: FormMoneyInputProps) {
  return (
    <FormParsedInput
      {...props}
      prefix="Rs"
      parse={(text) =>
        text.trim() === ""
          ? null
          : (MoneyHelper.parseRupees(text) ?? Number.NaN)
      }
      format={MoneyHelper.toRupeesString}
    />
  );
}
