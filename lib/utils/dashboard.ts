import { LucideIcon, Package, Warehouse, TrendingUp, DollarSign } from "lucide-react";

/**
 * Dashboard Utility Functions
 * Helper functions for dashboard statistics and formatting
 */

// ============================================================================
// Dashboard KPI Types
// ============================================================================

export interface DashboardKPI {
  label: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

// ============================================================================
// KPI Helper Functions
// ============================================================================

/**
 * Create KPI configuration for total warehouses
 */
export function getWarehouseKPI(count: number): DashboardKPI {
  return {
    label: "Total Warehouses",
    value: count,
    description: "Active storage locations",
    icon: Warehouse,
    color: "text-blue-600 dark:text-blue-400",
  };
}

/**
 * Create KPI configuration for total products
 */
export function getProductKPI(count: number): DashboardKPI {
  return {
    label: "Total Products",
    value: count,
    description: "Unique SKUs in inventory",
    icon: Package,
    color: "text-green-600 dark:text-green-400",
  };
}

/**
 * Create KPI configuration for total stock value
 */
export function getStockValueKPI(value: number): DashboardKPI {
  return {
    label: "Stock Value",
    value: formatCurrency(value),
    description: "Total inventory value",
    icon: DollarSign,
    color: "text-purple-600 dark:text-purple-400",
  };
}

/**
 * Create KPI configuration for daily movements
 */
export function getDailyMovementsKPI(count: number): DashboardKPI {
  return {
    label: "Today's Movements",
    value: count,
    description: "Stock transactions today",
    icon: TrendingUp,
    color: "text-orange-600 dark:text-orange-400",
  };
}

// ============================================================================
// Formatting Functions
// ============================================================================

/**
 * Format currency value
 */
export function formatCurrency(value: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format percentage value
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Calculate percentage change
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

// ============================================================================
// Chart Data Preparation
// ============================================================================

/**
 * Prepare stock evolution data for charts
 */
export function prepareStockChartData(
  stockData: Array<{ date: Date; quantity: number; productName: string }>
): Array<{ date: string; quantity: number; name: string }> {
  return stockData.map((item) => ({
    date: new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(item.date),
    quantity: item.quantity,
    name: item.productName,
  }));
}

/**
 * Group movements by date for chart display
 */
export function groupMovementsByDate(
  movements: Array<{ createdAt: Date; quantity: number; type: string }>
): Array<{ date: string; in: number; out: number; total: number }> {
  const grouped = new Map<string, { in: number; out: number }>();

  movements.forEach((movement) => {
    const dateKey = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(movement.createdAt);

    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, { in: 0, out: 0 });
    }

    const data = grouped.get(dateKey)!;
    if (movement.type === "IN" || movement.type === "TRANSFER") {
      data.in += movement.quantity;
    }
    if (movement.type === "OUT" || movement.type === "TRANSFER") {
      data.out += movement.quantity;
    }
  });

  return Array.from(grouped.entries()).map(([date, data]) => ({
    date,
    in: data.in,
    out: data.out,
    total: data.in - data.out,
  }));
}

// ============================================================================
// Stock Alert Helpers
// ============================================================================

/**
 * Calculate stock alert severity
 */
export function getStockAlertSeverity(
  currentStock: number,
  minStock: number
): "critical" | "warning" | "normal" {
  const percentage = (currentStock / minStock) * 100;

  if (percentage <= 0) return "critical";
  if (percentage <= 50) return "critical";
  if (percentage <= 100) return "warning";
  return "normal";
}

/**
 * Get stock alert color based on severity
 */
export function getStockAlertColor(severity: "critical" | "warning" | "normal"): string {
  switch (severity) {
    case "critical":
      return "text-red-600 dark:text-red-400";
    case "warning":
      return "text-orange-600 dark:text-orange-400";
    case "normal":
      return "text-green-600 dark:text-green-400";
  }
}

// ============================================================================
// Date Range Helpers
// ============================================================================

/**
 * Get date range for today
 */
export function getTodayDateRange(): { from: Date; to: Date } {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  return { from, to };
}

/**
 * Get date range for last N days
 */
export function getLastNDaysRange(days: number): { from: Date; to: Date } {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);
  return { from, to };
}

/**
 * Get date range for current month
 */
export function getCurrentMonthRange(): { from: Date; to: Date } {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  return { from, to };
}
