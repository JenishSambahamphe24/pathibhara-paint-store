import type { DashboardRange } from "@repo/shared";

interface IDashboardVariantRef {
  variantId: string;
  productId: string;
  productName: string;
  volumeMl: number;
}

export interface IDashboardDay {
  date: string;
  revenuePaisa: number;
  units: number;
}

export interface IDashboardTopSeller extends IDashboardVariantRef {
  units: number;
  revenuePaisa: number;
}

export interface IDashboardLowStock extends IDashboardVariantRef {
  sku: string;
  currentStock: number;
  reorderLevel: number;
}

export interface IDashboardSlowMover extends IDashboardVariantRef {
  currentStock: number;
  stockValuePaisa: number;
  lastSoldOn: string | null;
}

export interface IDashboard {
  range: DashboardRange;
  today: string;
  from: string;
  to: string;
  sales: {
    revenuePaisa: number;
    units: number;
    previousRevenuePaisa: number;
    previousUnits: number;
    todayRevenuePaisa: number;
    todayUnits: number;
    todayRecorded: boolean;
  };
  stock: {
    lowStockCount: number;
    outOfStockCount: number;
    valuePaisa: number;
  };
  salesByDay: Array<IDashboardDay>;
  topSellers: Array<IDashboardTopSeller>;
  lowStock: Array<IDashboardLowStock>;
  slowMovers: Array<IDashboardSlowMover>;
}
