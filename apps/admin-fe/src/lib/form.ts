import { createFormHook } from "@tanstack/react-form";

import { FormColorPicker } from "#/components/FormColorPicker/FormColorPicker";
import { FormDateTimePicker } from "#/components/FormDateTimePicker/FormDateTimePicker";
import { FormInput } from "#/components/FormInput/FormInput";
import { FormMultiSelect } from "#/components/FormMultiSelect/FormMultiSelect";
import { FormSelect } from "#/components/FormSelect/FormSelect";
import { FormTextarea } from "#/components/FormTextarea/FormTextarea";

import { fieldContext, formContext } from "#/lib/formContext";

export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    FormInput,
    FormSelect,
    FormTextarea,
    FormDateTimePicker,
    FormColorPicker,
    FormMultiSelect,
  },
  formComponents: {},
});
