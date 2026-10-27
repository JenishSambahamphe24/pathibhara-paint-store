import type { IDashboardDay } from "../types";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { CurrencyHelper } from "#/lib/helpers/currency.helper";
import { DateHelper } from "#/lib/helpers/date.helper";
import { m } from "#/paraglide/messages";

interface SalesChartProps {
  days: Array<IDashboardDay>;
}

const AXIS_TICK = { fill: "var(--color-foreground-subtle)", fontSize: 12 };

export function SalesChart({ days }: SalesChartProps) {
  // 90 one-day columns would be hairlines with unreadable ticks; thin the
  // labels instead of the data.
  const tickInterval = days.length > 31 ? 13 : days.length > 7 ? 4 : 0;

  return (
    <div className="h-72" role="img" aria-label={m.dashboard_sales_chart_label()}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={days} margin={{ top: 8, right: 4, bottom: 0, left: 4 }} barCategoryGap={2}>
          <CartesianGrid vertical={false} stroke="var(--color-chart-grid)" />
          <XAxis
            dataKey="date"
            tickFormatter={(date: string) => DateHelper.formatCalendarDate(date, "D MMM")}
            interval={tickInterval}
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={{ stroke: "var(--color-border)" }}
          />
          <YAxis
            tickFormatter={(paisa: number) => CurrencyHelper.formatCompactNpr(paisa)}
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            width={76}
            allowDecimals={false}
          />
          <Tooltip cursor={{ fill: "var(--color-surface-subtle)" }} content={({ active, payload }) => <SalesChartTooltip active={active} day={payload[0]?.payload as IDashboardDay | undefined} />} />
          <Bar dataKey="revenuePaisa" fill="var(--color-chart-series)" radius={[4, 4, 0, 0]} maxBarSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface SalesChartTooltipProps {
  active?: boolean;
  day?: IDashboardDay;
}

function SalesChartTooltip({ active, day }: SalesChartTooltipProps) {
  if (!active || !day) return null;
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 text-sm shadow-md">
      <p className="font-medium text-foreground">{DateHelper.formatCalendarDate(day.date, "ddd, D MMM YYYY")}</p>
      <p className="mt-1 text-foreground-muted">{CurrencyHelper.formatNpr(day.revenuePaisa)}</p>
      <p className="text-foreground-subtle">{m.dashboard_units({ count: day.units })}</p>
    </div>
  );
}
