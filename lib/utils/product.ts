/**
 * Product utility functions
 * Helper functions for product display, formatting, and calculations
 */

import { Product, ProductVariant, Stock, Warehouse } from "@prisma/client";

/**
 * Get product status label for display
 */
export function getProductStatusLabel(active: boolean): string {
  return active ? "Actif" : "Inactif";
}

/**
 * Format variant name with SKU
 */
export function formatVariantName(variant: ProductVariant): string {
  return `${variant.name} (${variant.sku})`;
}

/**
 * Calculate total stock across all warehouses
 */
export function calculateTotalStock(stock: Stock[]): number {
  return stock.reduce((total, item) => total + item.quantity, 0);
}

/**
 * Calculate total stock for a specific variant across all warehouses
 */
export function calculateVariantStock(stock: Stock[], variantId: string | null): number {
  return stock
    .filter((item) => item.variantId === variantId)
    .reduce((total, item) => total + item.quantity, 0);
}

/**
 * Group stock by warehouse for display
 */
export function groupStockByWarehouse(
  stock: (Stock & { warehouse: Warehouse })[]
): Map<
  string,
  {
    warehouseId: string;
    warehouseName: string;
    warehouseCode: string;
    quantity: number;
    active: boolean;
  }
> {
  const grouped = new Map<
    string,
    {
      warehouseId: string;
      warehouseName: string;
      warehouseCode: string;
      quantity: number;
      active: boolean;
    }
  >();

  stock.forEach((item) => {
    const existing = grouped.get(item.warehouseId);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      grouped.set(item.warehouseId, {
        warehouseId: item.warehouseId,
        warehouseName: item.warehouse.name,
        warehouseCode: item.warehouse.code,
        quantity: item.quantity,
        active: item.warehouse.active,
      });
    }
  });

  return grouped;
}

/**
 * Check if product has low stock
 */
export function hasLowStock(product: Product, totalStock: number): boolean {
  return totalStock < product.minStock;
}

/**
 * Get low stock count (how many units below minimum)
 */
export function getLowStockCount(product: Product, totalStock: number): number {
  return Math.max(0, product.minStock - totalStock);
}

/**
 * Get stock status label
 */
export function getStockStatusLabel(product: Product, totalStock: number): string {
  if (totalStock === 0) return "Rupture de stock";
  if (hasLowStock(product, totalStock)) return "Stock bas";
  return "En stock";
}

/**
 * Get stock status variant for badge display
 */
export function getStockStatusVariant(
  product: Product,
  totalStock: number
): "default" | "secondary" | "destructive" {
  if (totalStock === 0) return "destructive";
  if (hasLowStock(product, totalStock)) return "secondary";
  return "default";
}

/**
 * Format unit display (singular/plural)
 */
export function formatUnit(unit: string, quantity: number): string {
  if (quantity === 0 || quantity === 1) return unit;

  // Simple French pluralization rules
  const pluralExceptions: Record<string, string> = {
    unité: "unités",
    pièce: "pièces",
    boîte: "boîtes",
    carton: "cartons",
    palette: "palettes",
  };

  return pluralExceptions[unit.toLowerCase()] || `${unit}s`;
}

/**
 * Get variant display name (fallback to product name if no variant name)
 */
export function getVariantDisplayName(
  product: Product,
  variant: ProductVariant | null
): string {
  if (!variant) return product.name;
  return variant.name || product.name;
}

/**
 * Check if SKU is valid format (uppercase alphanumeric with hyphens)
 */
export function isValidSKU(sku: string): boolean {
  return /^[A-Z0-9-]+$/.test(sku);
}

/**
 * Normalize SKU (uppercase and trim)
 */
export function normalizeSKU(sku: string): string {
  return sku.trim().toUpperCase();
}
