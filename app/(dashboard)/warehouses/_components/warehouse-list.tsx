"use client";

import { Warehouse } from "@prisma/client";
import { WarehouseCard } from "./warehouse-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Building2 } from "lucide-react";

interface WarehouseListProps {
  warehouses: (Warehouse & {
    _count?: {
      stock: number;
      movementsFrom: number;
      movementsTo: number;
    };
  })[];
  warehouseStats?: Map<
    string,
    {
      totalStockItems: number;
      lowStockItems: number;
      totalMovements: number;
    }
  >;
  canEdit?: boolean;
}

export function WarehouseList({ warehouses, warehouseStats, canEdit = false }: WarehouseListProps) {
  if (warehouses.length === 0) {
    return (
      <EmptyState
        icon={Building2}
        title="Aucun entrepôt trouvé"
        description="Aucun entrepôt ne correspond à vos critères de recherche."
      />
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {warehouses.map((warehouse) => (
        <WarehouseCard
          key={warehouse.id}
          warehouse={warehouse}
          stats={warehouseStats?.get(warehouse.id)}
          canEdit={canEdit}
        />
      ))}
    </div>
  );
}
