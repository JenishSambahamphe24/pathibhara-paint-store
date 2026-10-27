import type { DashboardQuery } from "@repo/shared";

import { DASHBOARD_RANGE_DAYS } from "@repo/shared";
import { Link } from "@tanstack/react-router";

import { BreadCrumb } from "#/components/Breadcrumb/Breadcrumb";
import { PageHeader } from "#/components/PageHeader/PageHeader";

import { useAuth } from "#/features/auth/hooks/useAuth";
import { CurrencyHelper } from "#/lib/helpers/currency.helper";
import { DateHelper } from "#/lib/helpers/date.helper";
import { m } from "#/paraglide/messages";

import { useDashboard } from "../hooks/useDashboard";
import { DashboardCard } from "./DashboardCard";
import { DashboardRangeToggle } from "./DashboardRangeToggle";
import { LowStockCard } from "./LowStockCard";
import { SalesChart } from "./SalesChart";
import { SlowMoversCard } from "./SlowMoversCard";
import { StatTile } from "./StatTile";
import { TopSellersCard } from "./TopSellersCard";

interface DashboardPageProps {
  search: DashboardQuery;
  onSearchChange: (patch: Partial<DashboardQuery>) => void;
}

function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

export function DashboardPage({ search, onSearchChange }: DashboardPageProps) {
  const { admin } = useAuth();
  const { data } = useDashboard(search);
  const days = DASHBOARD_RANGE_DAYS[search.range];

  return (
    <>
      <BreadCrumb items={[{ title: m.sidebar_dashboard() }]} />
      <PageHeader
        title={m.dashboard_welcome({ name: admin?.name ?? "" })}
        description={
          data
            ? m.dashboard_period({
                from: DateHelper.formatCalendarDate(data.from),
                to: DateHelper.formatCalendarDate(data.to),
              })
            : undefined
        }
        actions={<DashboardRangeToggle value={search.range} onChange={(range) => onSearchChange({ range })} />}
      />

      {!data ? (
        <DashboardSkeleton />
      ) : (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile
              label={m.dashboard_today()}
              value={data.sales.todayRecorded ? CurrencyHelper.formatNpr(data.sales.todayRevenuePaisa) : m.dashboard_not_recorded()}
              footer={
                data.sales.todayRecorded ? (
                  m.dashboard_units({ count: data.sales.todayUnits })
                ) : (
                  <Link to="/stock/sales/$date" params={{ date: data.today }} className="font-medium text-info-strong hover:underline">
                    {m.dashboard_record_today()}
                  </Link>
                )
              }
            />
            <StatTile
              label={m.dashboard_revenue({ days })}
              value={CurrencyHelper.formatNpr(data.sales.revenuePaisa)}
              delta={deltaOf(data.sales.revenuePaisa, data.sales.previousRevenuePaisa, days)}
              footer={data.sales.previousRevenuePaisa === 0 ? m.dashboard_no_previous({ days }) : undefined}
            />
            <StatTile
              label={m.dashboard_units_sold({ days })}
              value={CurrencyHelper.toLocaleString(data.sales.units)}
              delta={deltaOf(data.sales.units, data.sales.previousUnits, days)}
            />
            <StatTile
              label={m.dashboard_low_stock()}
              value={CurrencyHelper.toLocaleString(data.stock.lowStockCount)}
              tone={data.stock.lowStockCount > 0 ? "warning" : "default"}
              footer={
                <>
                  {m.dashboard_out_of_stock_count({ count: data.stock.outOfStockCount })}
                  <span className="block">{m.dashboard_stock_value({ value: CurrencyHelper.formatNpr(data.stock.valuePaisa) })}</span>
                </>
              }
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <DashboardCard
              title={m.dashboard_daily_sales()}
              description={m.dashboard_daily_sales_description()}
              className="lg:col-span-2"
            >
              <SalesChart days={data.salesByDay} />
            </DashboardCard>
            <TopSellersCard rows={data.topSellers} />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <LowStockCard rows={data.lowStock} total={data.stock.lowStockCount} />
            <SlowMoversCard rows={data.slowMovers} />
          </div>
        </div>
      )}
    </>
  );
}

function deltaOf(current: number, previous: number, days: number) {
  const percent = percentChange(current, previous);
  return percent === null ? null : { percent, label: m.dashboard_vs_previous({ days }) };
}

function DashboardSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-surface-subtle" />
        ))}
      </div>
      <div className="h-80 animate-pulse rounded-xl bg-surface-subtle" />
    </div>
  );
}
