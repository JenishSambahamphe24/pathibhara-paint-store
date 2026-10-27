import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { BreadCrumb } from "#/components/Breadcrumb/Breadcrumb";
import { BsDatePicker } from "#/components/BsDatePicker/BsDatePicker";
import { Button } from "#/components/Button/Button";
import { PageHeader } from "#/components/PageHeader/PageHeader";
import { SkeletonCell } from "#/components/Table/SkeletonCell";

import { DateHelper } from "#/lib/helpers/date.helper";
import { m } from "#/paraglide/messages";

import { useDailySale } from "../hooks/useDailySales";
import { DailySaleForm } from "./DailySaleForm";

interface DailySaleEntryPageProps {
  date: string;
  onDateChange: (date: string) => void;
}

export function DailySaleEntryPage({
  date,
  onDateChange,
}: DailySaleEntryPageProps) {
  const { data: sale, isLoading } = useDailySale(date);
  const today = DateHelper.todayInStore();

  return (
    <>
      <BreadCrumb
        items={[
          { title: m.sidebar_stock() },
          { title: m.sidebar_daily_sales(), url: "/stock/sales" },
          { title: DateHelper.formatCalendarDate(date) },
        ]}
      />
      <PageHeader
        title={m.sales_entry_title({
          date: DateHelper.formatCalendarDate(date),
        })}
        description={sale ? m.sales_entry_editing() : m.sales_entry_new()}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onDateChange(DateHelper.shiftCalendarDate(date, -1))
              }
              aria-label={m.sales_previous_day()}
            >
              <ChevronLeft size={16} />
            </Button>
            <div className="w-48">
              <BsDatePicker
                value={date}
                max={today}
                size="sm"
                onChange={onDateChange}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={date >= today}
              onClick={() =>
                onDateChange(DateHelper.shiftCalendarDate(date, 1))
              }
              aria-label={m.sales_next_day()}
            >
              <ChevronRight size={16} />
            </Button>
            <Link
              to="/stock/sales"
              className="text-sm text-foreground-subtle hover:text-foreground"
            >
              {m.common_back_to_list()}
            </Link>
          </div>
        }
      />
      {isLoading || sale === undefined ? (
        <SkeletonCell />
      ) : (
        // Remount per date and per saved version, so the form always starts
        // from what the server holds for that day.
        <DailySaleForm
          key={`${date}:${sale?.updatedAt ?? "new"}`}
          date={date}
          sale={sale}
        />
      )}
    </>
  );
}
