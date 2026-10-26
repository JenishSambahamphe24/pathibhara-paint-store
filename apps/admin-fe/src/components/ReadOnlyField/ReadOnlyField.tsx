interface ReadOnlyFieldProps {
  label: string;
  value: string;
  /** Shown under the value — say why it can't be changed. */
  hint?: string;
}

/**
 * A labelled value that sits in a form but isn't editable and isn't form state.
 * Styled to match a disabled FormInput so it reads as part of the same form
 * rather than as stray text.
 */
export function ReadOnlyField({ label, value, hint }: ReadOnlyFieldProps) {
  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-foreground-muted">{label}</span>
      <p className="w-full cursor-not-allowed rounded-lg border border-border-strong bg-surface-subtle px-3 py-2.5 text-sm text-foreground-subtle">
        {value}
      </p>
      {hint && <p className="text-xs text-foreground-subtle">{hint}</p>}
    </div>
  );
}
