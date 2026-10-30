import type { IDashboardPeriod } from "./dashboard.repository";
import type { DashboardQuery } from "@repo/shared";

import { injectable } from "tsyringe";

import { DASHBOARD_RANGE_DAYS, StoreDateHelper } from "@repo/shared";

import { DashboardDto } from "./dashboard.dto";
import { DashboardRepository } from "./dashboard.repository";

const TOP_SELLER_LIMIT = 5;
const LOW_STOCK_LIMIT = 8;
const SLOW_MOVER_LIMIT = 5;

@injectable()
export class DashboardService {
  constructor(private readonly repository: DashboardRepository) {}

  static period(days: number, today: string): IDashboardPeriod {
    const from = StoreDateHelper.addDays(today, -(days - 1));
    return {
      today,
      from,
      to: today,
      previousFrom: StoreDateHelper.addDays(from, -days),
      previousTo: StoreDateHelper.addDays(from, -1),
    };
  }

  async get(query: DashboardQuery, now: Date = new Date()) {
    const period = DashboardService.period(
      DASHBOARD_RANGE_DAYS[query.range],
      StoreDateHelper.today(now),
    );
    const [sales, todayRecorded, stock, salesByDay, topSellers, lowStock, slowMovers] =
      await Promise.all([
        this.repository.salesSummary(period),
        this.repository.isDayRecorded(period.today),
        this.repository.stockSummary(),
        this.repository.salesByDay(period.from, period.to),
        this.repository.topSellers(period.from, period.to, TOP_SELLER_LIMIT),
        this.repository.lowStock(LOW_STOCK_LIMIT),
        this.repository.slowMovers(period.from, period.to, SLOW_MOVER_LIMIT),
      ]);

    return DashboardDto.parse({
      range: query.range,
      today: period.today,
      from: period.from,
      to: period.to,
      sales: { ...sales, todayRecorded },
      stock,
      salesByDay,
      topSellers,
      lowStock,
      slowMovers,
    });
  }
}
