import { UserRole, MovementType } from "@prisma/client";
import {
  USER_ROLE_COLORS,
  MOVEMENT_TYPE_COLORS,
  MOVEMENT_TYPE_LABELS,
} from "./constants";
import {
  PackagePlus,
  PackageMinus,
  ArrowRightLeft,
  Settings,
  type LucideIcon,
} from "lucide-react";

/**
 * Generate a URL-friendly slug from text
 * @example generateSlug("Mon Produit 123") => "mon-produit-123"
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-"); // Replace multiple hyphens with single hyphen
}

/**
 * Get initials from a name
 * @example getInitials("Jean Dupont") => "JD"
 * @example getInitials("Jean-Pierre Martin") => "JM"
 */
export function getInitials(name: string | null | undefined): string {
  if (!name) return "?";

  const parts = name
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) return "?";

  return parts.map((part) => part[0]?.toUpperCase() || "").join("");
}

/**
 * Get badge variant color for a user role
 */
export function getColorForRole(role: UserRole): string {
  return USER_ROLE_COLORS[role] || "default";
}

/**
 * Get badge variant color for a movement type
 */
export function getColorForMovementType(type: MovementType): string {
  return MOVEMENT_TYPE_COLORS[type] || "default";
}

/**
 * Get icon component for movement type
 */
export function getIconForMovementType(type: MovementType): LucideIcon {
  const icons: Record<MovementType, LucideIcon> = {
    [MovementType.IN]: PackagePlus,
    [MovementType.OUT]: PackageMinus,
    [MovementType.TRANSFER]: ArrowRightLeft,
    [MovementType.ADJUSTMENT]: Settings,
  };

  return icons[type] || PackagePlus;
}

/**
 * Get label for movement type
 */
export function getLabelForMovementType(type: MovementType): string {
  return MOVEMENT_TYPE_LABELS[type] || type;
}

/**
 * Check if a value is empty (null, undefined, empty string, empty array)
 */
export function isEmpty(
  value: unknown
): value is null | undefined | "" | never[] {
  if (value === null || value === undefined) return true;
  if (typeof value === "string" && value.trim() === "") return true;
  if (Array.isArray(value) && value.length === 0) return true;
  return false;
}

/**
 * Safely parse JSON with fallback
 */
export function safeJSONParse<T>(
  json: string | null | undefined,
  fallback: T
): T {
  if (!json) return fallback;

  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Debounce a function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Create a range of numbers
 * @example range(1, 5) => [1, 2, 3, 4, 5]
 */
export function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

/**
 * Group array items by a key
 */
export function groupBy<T>(
  array: T[],
  key: keyof T
): Record<string, T[]> {
  return array.reduce(
    (result, item) => {
      const groupKey = String(item[key]);
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(item);
      return result;
    },
    {} as Record<string, T[]>
  );
}

/**
 * Calculate stock status based on current quantity and minimum stock
 */
export function calculateStockStatus(
  currentQuantity: number,
  minStock: number | null
): "ok" | "low" | "out" {
  if (currentQuantity === 0) return "out";
  if (minStock && currentQuantity <= minStock) return "low";
  return "ok";
}

/**
 * Get color class for stock status
 */
export function getStockStatusColor(
  status: "ok" | "low" | "out"
): string {
  const colors = {
    ok: "text-green-600 dark:text-green-400",
    low: "text-orange-600 dark:text-orange-400",
    out: "text-red-600 dark:text-red-400",
  };

  return colors[status] || colors.ok;
}

/**
 * Get badge variant for stock status
 */
export function getStockStatusBadge(
  status: "ok" | "low" | "out"
): "default" | "secondary" | "destructive" {
  const variants = {
    ok: "default" as const,
    low: "secondary" as const,
    out: "destructive" as const,
  };

  return variants[status] || variants.ok;
}

/**
 * Format SKU with prefix
 * @example formatSKU("123", "PROD") => "PROD-123"
 */
export function formatSKU(sku: string, prefix?: string): string {
  if (!prefix) return sku;
  return `${prefix}-${sku}`;
}

/**
 * Generate a random color (for charts, avatars, etc.)
 */
export function generateColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`;
}
