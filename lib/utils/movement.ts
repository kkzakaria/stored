/**
 * Movement utility functions
 *
 * Helper functions for stock movement operations including
 * type formatting, icons, direction detection, and descriptions.
 */

import { MovementType } from "@prisma/client";
import {
  ArrowDown,
  ArrowUp,
  ArrowLeftRight,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { MOVEMENT_TYPE_LABELS, MOVEMENT_TYPE_COLORS } from "./constants";

/**
 * Get icon for movement type
 */
export function getMovementTypeIcon(type: MovementType): LucideIcon {
  const icons: Record<MovementType, LucideIcon> = {
    IN: ArrowDown,
    OUT: ArrowUp,
    TRANSFER: ArrowLeftRight,
    ADJUSTMENT: Settings,
  };
  return icons[type];
}

/**
 * Get label for movement type
 */
export function getMovementTypeLabel(type: MovementType): string {
  return MOVEMENT_TYPE_LABELS[type];
}

/**
 * Get color variant for movement type
 */
export function getMovementTypeColor(type: MovementType): string {
  return MOVEMENT_TYPE_COLORS[type];
}

/**
 * Check if movement is inbound (increases stock)
 */
export function isInboundMovement(type: MovementType): boolean {
  return type === "IN";
}

/**
 * Check if movement is outbound (decreases stock)
 */
export function isOutboundMovement(type: MovementType): boolean {
  return type === "OUT";
}

/**
 * Check if movement is a transfer
 */
export function isTransferMovement(type: MovementType): boolean {
  return type === "TRANSFER";
}

/**
 * Check if movement is an adjustment
 */
export function isAdjustmentMovement(type: MovementType): boolean {
  return type === "ADJUSTMENT";
}

/**
 * Get description for movement type
 */
export function getMovementTypeDescription(type: MovementType): string {
  const descriptions: Record<MovementType, string> = {
    IN: "Réception de stock dans un entrepôt",
    OUT: "Sortie de stock d'un entrepôt",
    TRANSFER: "Transfert de stock entre deux entrepôts",
    ADJUSTMENT: "Ajustement d'inventaire (correction de stock)",
  };
  return descriptions[type];
}

/**
 * Format movement direction for display
 */
export function formatMovementDirection(
  type: MovementType,
  fromWarehouse?: { name: string; code: string } | null,
  toWarehouse?: { name: string; code: string } | null
): string {
  switch (type) {
    case "IN":
      return `→ ${toWarehouse?.name || "Entrepôt inconnu"}`;
    case "OUT":
      return `${fromWarehouse?.name || "Entrepôt inconnu"} →`;
    case "TRANSFER":
      return `${fromWarehouse?.name || "Source"} → ${toWarehouse?.name || "Destination"}`;
    case "ADJUSTMENT":
      return toWarehouse?.name || "Entrepôt";
    default:
      return "Direction inconnue";
  }
}

/**
 * Get CSS class for movement type indicator
 */
export function getMovementTypeClass(type: MovementType): string {
  const classes: Record<MovementType, string> = {
    IN: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    OUT: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    TRANSFER: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    ADJUSTMENT: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  };
  return classes[type];
}

/**
 * Check if user can create movement of specific type
 */
export function canCreateMovementType(
  type: MovementType,
  userRole: string
): boolean {
  // ADJUSTMENT requires ADMINISTRATOR or MANAGER
  if (type === "ADJUSTMENT") {
    return userRole === "ADMINISTRATOR" || userRole === "MANAGER";
  }

  // Other movement types available to USER and above
  return ["ADMINISTRATOR", "MANAGER", "USER"].includes(userRole);
}

/**
 * Get placeholder text for movement notes based on type
 */
export function getMovementNotesPlaceholder(type: MovementType): string {
  const placeholders: Record<MovementType, string> = {
    IN: "Ex: Réception fournisseur #12345, Livraison du 09/10/2025",
    OUT: "Ex: Commande client #98765, Expédition DHL",
    TRANSFER: "Ex: Rééquilibrage stock, Transfert pour commande urgente",
    ADJUSTMENT: "Justification obligatoire: Ex: Inventaire physique, Casse, Perte",
  };
  return placeholders[type];
}

/**
 * Format movement quantity with sign based on context
 */
export function formatMovementQuantity(
  type: MovementType,
  quantity: number,
  contextWarehouseId?: string,
  fromWarehouseId?: string | null,
  toWarehouseId?: string | null
): string {
  let sign = "";

  if (type === "IN") {
    sign = "+";
  } else if (type === "OUT") {
    sign = "-";
  } else if (type === "TRANSFER" && contextWarehouseId) {
    // For transfers, show + for destination warehouse, - for source
    if (contextWarehouseId === toWarehouseId) {
      sign = "+";
    } else if (contextWarehouseId === fromWarehouseId) {
      sign = "-";
    }
  }

  return `${sign}${quantity}`;
}

/**
 * Get movement summary text
 */
export function getMovementSummary(
  type: MovementType,
  quantity: number,
  productName: string,
  unit: string,
  fromWarehouse?: { name: string } | null,
  toWarehouse?: { name: string } | null
): string {
  const formattedQty = `${quantity} ${unit}`;

  switch (type) {
    case "IN":
      return `Réception de ${formattedQty} de ${productName} vers ${toWarehouse?.name || "entrepôt"}`;
    case "OUT":
      return `Sortie de ${formattedQty} de ${productName} depuis ${fromWarehouse?.name || "entrepôt"}`;
    case "TRANSFER":
      return `Transfert de ${formattedQty} de ${productName} de ${fromWarehouse?.name || "source"} vers ${toWarehouse?.name || "destination"}`;
    case "ADJUSTMENT":
      return `Ajustement de ${formattedQty} de ${productName} dans ${toWarehouse?.name || "entrepôt"}`;
    default:
      return `Mouvement de ${formattedQty} de ${productName}`;
  }
}
