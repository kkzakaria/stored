import { utils, write } from "xlsx";
import { formatDateTime } from "./formatters";

/**
 * Report Utility Functions
 * Helper functions for report data formatting and export functionality
 */

// ============================================================================
// Date Range Helpers
// ============================================================================

/**
 * Get date range for last N days
 */
export function getLastNDaysRange(days: number): { from: Date; to: Date } {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);
  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);
  return { from, to };
}

/**
 * Get date range for current month
 */
export function getCurrentMonthRange(): { from: Date; to: Date } {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { from, to };
}

/**
 * Get date range for last month
 */
export function getLastMonthRange(): { from: Date; to: Date } {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
  const to = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  return { from, to };
}

/**
 * Get date range for current year
 */
export function getCurrentYearRange(): { from: Date; to: Date } {
  const now = new Date();
  const from = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
  const to = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
  return { from, to };
}

// ============================================================================
// CSV Export
// ============================================================================

/**
 * Escape CSV value
 */
function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) return "";

  const str = String(value);

  // If value contains comma, newline, or quote, wrap in quotes and escape internal quotes
  if (str.includes(",") || str.includes("\n") || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

/**
 * Convert data array to CSV string
 */
export function convertToCSV<T extends Record<string, unknown>>(
  data: T[],
  headers: { key: keyof T; label: string }[]
): string {
  if (data.length === 0) {
    return headers.map((h) => escapeCsvValue(h.label)).join(",");
  }

  // Header row
  const headerRow = headers.map((h) => escapeCsvValue(h.label)).join(",");

  // Data rows
  const dataRows = data.map((row) =>
    headers.map((h) => escapeCsvValue(row[h.key])).join(",")
  );

  return [headerRow, ...dataRows].join("\n");
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob(["\ufeff" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

// ============================================================================
// Excel Export
// ============================================================================

/**
 * Convert data array to Excel and download
 */
export function downloadExcel<T extends Record<string, unknown>>(
  data: T[],
  headers: { key: keyof T; label: string }[],
  filename: string,
  sheetName: string = "Rapport"
): void {
  // Prepare data for Excel
  const excelData = [
    // Header row
    headers.map((h) => h.label),
    // Data rows
    ...data.map((row) => headers.map((h) => row[h.key])),
  ];

  // Create worksheet
  const worksheet = utils.aoa_to_sheet(excelData);

  // Set column widths
  const columnWidths = headers.map((h) => {
    const maxLength = Math.max(
      h.label.length,
      ...data.map((row) => String(row[h.key] ?? "").length)
    );
    return { wch: Math.min(maxLength + 2, 50) };
  });
  worksheet["!cols"] = columnWidths;

  // Create workbook
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, sheetName);

  // Generate Excel file
  const excelBuffer = write(workbook, { bookType: "xlsx", type: "array" });

  // Download
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

// ============================================================================
// Report Data Formatters
// ============================================================================

/**
 * Format stock report data for export
 */
export interface StockReportRow extends Record<string, unknown> {
  warehouse: string;
  sku: string;
  product: string;
  variant: string;
  quantity: number;
  reserved: number;
  available: number;
  unit: string;
  minStock: number;
  status: string;
}

export function formatStockReportForExport(
  stocks: Array<{
    warehouse: { name: string };
    product: { sku: string; name: string; unit: string; minStock: number };
    variant: { name: string } | null;
    quantity: number;
    reservedQty: number;
  }>
): StockReportRow[] {
  return stocks.map((stock) => {
    const available = stock.quantity - stock.reservedQty;
    const isLowStock = stock.quantity < stock.product.minStock;

    return {
      warehouse: stock.warehouse.name,
      sku: stock.product.sku,
      product: stock.product.name,
      variant: stock.variant?.name || "—",
      quantity: stock.quantity,
      reserved: stock.reservedQty,
      available,
      unit: stock.product.unit,
      minStock: stock.product.minStock,
      status: isLowStock ? "Stock faible" : "OK",
    };
  });
}

/**
 * Format movement report data for export
 */
export interface MovementReportRow extends Record<string, unknown> {
  date: string;
  type: string;
  product: string;
  variant: string;
  quantity: string;
  fromWarehouse: string;
  toWarehouse: string;
  user: string;
  reference: string;
}

export function formatMovementReportForExport(
  movements: Array<{
    createdAt: Date;
    type: string;
    product: { name: string };
    variant: { name: string } | null;
    quantity: number;
    fromWarehouse: { name: string } | null;
    toWarehouse: { name: string } | null;
    user: { name: string | null };
    reference: string | null;
  }>
): MovementReportRow[] {
  return movements.map((movement) => ({
    date: formatDateTime(movement.createdAt),
    type: formatMovementType(movement.type),
    product: movement.product.name,
    variant: movement.variant?.name || "—",
    quantity: String(movement.quantity),
    fromWarehouse: movement.fromWarehouse?.name || "—",
    toWarehouse: movement.toWarehouse?.name || "—",
    user: movement.user.name || "—",
    reference: movement.reference || "—",
  }));
}

/**
 * Format movement type for display
 */
export function formatMovementType(type: string): string {
  const types: Record<string, string> = {
    IN: "Entrée",
    OUT: "Sortie",
    TRANSFER: "Transfert",
    ADJUSTMENT: "Ajustement",
  };
  return types[type] || type;
}

/**
 * Format warehouse report data for export
 */
export interface WarehouseReportRow extends Record<string, unknown> {
  warehouse: string;
  code: string;
  location: string;
  totalItems: number;
  totalQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lowStockItems: number;
  movementsIn: number;
  movementsOut: number;
}

export function formatWarehouseReportForExport(
  warehouses: Array<{
    name: string;
    code: string;
    location: string | null;
    stats: {
      totalItems: number;
      totalQuantity: number;
      reservedQuantity: number;
      availableQuantity: number;
      lowStockItems: number;
    };
    movements: {
      totalQuantityIn: number;
      totalQuantityOut: number;
    };
  }>
): WarehouseReportRow[] {
  return warehouses.map((warehouse) => ({
    warehouse: warehouse.name,
    code: warehouse.code,
    location: warehouse.location || "—",
    totalItems: warehouse.stats.totalItems,
    totalQuantity: warehouse.stats.totalQuantity,
    reservedQuantity: warehouse.stats.reservedQuantity,
    availableQuantity: warehouse.stats.availableQuantity,
    lowStockItems: warehouse.stats.lowStockItems,
    movementsIn: warehouse.movements.totalQuantityIn,
    movementsOut: warehouse.movements.totalQuantityOut,
  }));
}

/**
 * Format low stock alert data for export
 */
export interface LowStockReportRow extends Record<string, unknown> {
  warehouse: string;
  sku: string;
  product: string;
  variant: string;
  currentStock: number;
  minStock: number;
  deficit: number;
  unit: string;
  severity: string;
}

export function formatLowStockReportForExport(
  stocks: Array<{
    warehouse: { name: string };
    product: { sku: string; name: string; minStock: number; unit: string };
    variant: { name: string } | null;
    quantity: number;
  }>
): LowStockReportRow[] {
  return stocks.map((stock) => {
    const deficit = stock.product.minStock - stock.quantity;
    const percentage = (stock.quantity / stock.product.minStock) * 100;
    const severity = percentage === 0 ? "Critique" : percentage < 50 ? "Urgent" : "Attention";

    return {
      warehouse: stock.warehouse.name,
      sku: stock.product.sku,
      product: stock.product.name,
      variant: stock.variant?.name || "—",
      currentStock: stock.quantity,
      minStock: stock.product.minStock,
      deficit,
      unit: stock.product.unit,
      severity,
    };
  });
}

// ============================================================================
// Export Headers Configuration
// ============================================================================

export const STOCK_REPORT_HEADERS = [
  { key: "warehouse" as const, label: "Entrepôt" },
  { key: "sku" as const, label: "SKU" },
  { key: "product" as const, label: "Produit" },
  { key: "variant" as const, label: "Variante" },
  { key: "quantity" as const, label: "Quantité" },
  { key: "reserved" as const, label: "Réservé" },
  { key: "available" as const, label: "Disponible" },
  { key: "unit" as const, label: "Unité" },
  { key: "minStock" as const, label: "Stock min" },
  { key: "status" as const, label: "Statut" },
];

export const MOVEMENT_REPORT_HEADERS = [
  { key: "date" as const, label: "Date" },
  { key: "type" as const, label: "Type" },
  { key: "product" as const, label: "Produit" },
  { key: "variant" as const, label: "Variante" },
  { key: "quantity" as const, label: "Quantité" },
  { key: "fromWarehouse" as const, label: "Depuis" },
  { key: "toWarehouse" as const, label: "Vers" },
  { key: "user" as const, label: "Utilisateur" },
  { key: "reference" as const, label: "Référence" },
];

export const WAREHOUSE_REPORT_HEADERS = [
  { key: "warehouse" as const, label: "Entrepôt" },
  { key: "code" as const, label: "Code" },
  { key: "location" as const, label: "Localisation" },
  { key: "totalItems" as const, label: "Produits" },
  { key: "totalQuantity" as const, label: "Stock total" },
  { key: "reservedQuantity" as const, label: "Réservé" },
  { key: "availableQuantity" as const, label: "Disponible" },
  { key: "lowStockItems" as const, label: "Alertes" },
  { key: "movementsIn" as const, label: "Entrées" },
  { key: "movementsOut" as const, label: "Sorties" },
];

export const LOW_STOCK_REPORT_HEADERS = [
  { key: "warehouse" as const, label: "Entrepôt" },
  { key: "sku" as const, label: "SKU" },
  { key: "product" as const, label: "Produit" },
  { key: "variant" as const, label: "Variante" },
  { key: "currentStock" as const, label: "Stock actuel" },
  { key: "minStock" as const, label: "Stock min" },
  { key: "deficit" as const, label: "Déficit" },
  { key: "unit" as const, label: "Unité" },
  { key: "severity" as const, label: "Gravité" },
];
