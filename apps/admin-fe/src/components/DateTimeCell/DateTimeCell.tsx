import { DateHelper } from "#/lib/helpers/date.helper";

interface DateTimeCellProps {
  value: string | null | undefined;
}

export function DateTimeCell({ value }: DateTimeCellProps) {
  return (
    <div className="flex flex-col leading-tight">
      <span>{DateHelper.formatDateTime(value)}</span>
      <span className="text-xs text-foreground-subtle">
        {DateHelper.fromNow(value)}
      </span>
    </div>
  );
}
