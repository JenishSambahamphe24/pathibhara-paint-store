import { Switch } from "#/components/Switch/Switch";

import { useFieldContext } from "#/lib/formContext";

interface FormSwitchProps {
  label: string;
  hint?: string;
  disabled?: boolean;
}

export function FormSwitch({ label, hint, disabled }: FormSwitchProps) {
  const field = useFieldContext<boolean>();
  return (
    <div className="space-y-1">
      <Switch
        checked={field.state.value}
        onCheckedChange={field.handleChange}
        label={label}
        disabled={disabled}
      />
      {hint && <p className="text-xs text-foreground-subtle">{hint}</p>}
    </div>
  );
}
