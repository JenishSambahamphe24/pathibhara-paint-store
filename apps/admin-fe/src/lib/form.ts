import { createFormHook } from "@tanstack/react-form";

import { FormColorPicker } from "#/components/FormColorPicker/FormColorPicker";
import { FormDateTimePicker } from "#/components/FormDateTimePicker/FormDateTimePicker";
import { FormInput } from "#/components/FormInput/FormInput";
import { FormMoneyInput } from "#/components/FormMoneyInput/FormMoneyInput";
import { FormMultiSelect } from "#/components/FormMultiSelect/FormMultiSelect";
import { FormRichText } from "#/components/FormRichText/FormRichText";
import { FormSelect } from "#/components/FormSelect/FormSelect";
import { FormSwitch } from "#/components/FormSwitch/FormSwitch";
import { FormTextarea } from "#/components/FormTextarea/FormTextarea";
import { FormVolumeInput } from "#/components/FormVolumeInput/FormVolumeInput";

import { fieldContext, formContext } from "#/lib/formContext";

export const { useAppForm, withForm, withFieldGroup } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    FormInput,
    FormSelect,
    FormTextarea,
    FormDateTimePicker,
    FormColorPicker,
    FormMultiSelect,
    FormMoneyInput,
    FormRichText,
    FormVolumeInput,
    FormSwitch,
  },
  formComponents: {},
});
