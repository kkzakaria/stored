/**
 * Warehouse Utility Functions
 *
 * Helper functions for warehouse status, stock levels, and formatting
 */

/**
 * Get color class for warehouse status badge
 */
export function getWarehouseStatusColor(active: boolean): string {
  return active ? "bg-green-500" : "bg-gray-400";
}

/**
 * Get warehouse status label
 */
export function getWarehouseStatusLabel(active: boolean): string {
  return active ? "Actif" : "Inactif";
}

/**
 * Get color variant for stock level badge
 */
export function getStockLevelVariant(
  quantity: number,
  minStock: number
): "default" | "secondary" | "destructive" | "outline" {
  if (minStock === 0) return "secondary";

  const ratio = quantity / minStock;

  if (ratio >= 1) return "default"; // OK - green
  if (ratio >= 0.5) return "secondary"; // Warning - orange
  return "destructive"; // Critical - red
}

/**
 * Get stock level label
 */
export function getStockLevelLabel(quantity: number, minStock: number): string {
  if (minStock === 0) return "Normal";

  const ratio = quantity / minStock;

  if (ratio >= 1) return "Stock OK";
  if (ratio >= 0.5) return "Stock bas";
  return "Stock critique";
}

/**
 * Format warehouse statistics
 */
export function formatWarehouseStats(stats: {
  totalStockItems: number;
  lowStockItems: number;
  totalMovements: number;
}) {
  return {
    stockItems: stats.totalStockItems,
    lowStock: stats.lowStockItems,
    movements: stats.totalMovements,
    hasLowStock: stats.lowStockItems > 0,
  };
}

/**
 * Get warehouse initials for avatar
 */
export function getWarehouseInitials(code: string): string {
  return code.substring(0, 2).toUpperCase();
}

/**
 * Validate warehouse code format
 */
export function isValidWarehouseCode(code: string): boolean {
  return /^[A-Z0-9-]+$/.test(code);
}
