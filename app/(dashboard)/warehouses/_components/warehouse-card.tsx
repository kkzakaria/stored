"use client";

import Link from "next/link";
import { Warehouse } from "@prisma/client";
import { Building2, MapPin, Package, TrendingUp, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getWarehouseStatusLabel } from "@/lib/utils/warehouse";

interface WarehouseCardProps {
  warehouse: Warehouse & {
    _count?: {
      stock: number;
      movementsFrom: number;
      movementsTo: number;
    };
  };
  stats?: {
    totalStockItems: number;
    lowStockItems: number;
    totalMovements: number;
  };
  showActions?: boolean;
  canEdit?: boolean;
}

export function WarehouseCard({ warehouse, stats, showActions = true, canEdit = false }: WarehouseCardProps) {
  const totalMovements = (warehouse._count?.movementsFrom || 0) + (warehouse._count?.movementsTo || 0);
  const stockCount = stats?.totalStockItems || warehouse._count?.stock || 0;
  const lowStockCount = stats?.lowStockItems || 0;
  const hasLowStock = lowStockCount > 0;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-lg">{warehouse.name}</CardTitle>
              <CardDescription className="font-mono text-sm">{warehouse.code}</CardDescription>
            </div>
          </div>
          <Badge variant={warehouse.active ? "default" : "secondary"}>
            {getWarehouseStatusLabel(warehouse.active)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {warehouse.address && (
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
            <p className="line-clamp-2">{warehouse.address}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">{stockCount}</p>
              <p className="text-xs text-muted-foreground">Produits en stock</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">{totalMovements}</p>
              <p className="text-xs text-muted-foreground">Mouvements</p>
            </div>
          </div>
        </div>

        {hasLowStock && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-destructive">
              {lowStockCount} produit{lowStockCount > 1 ? "s" : ""} en stock bas
            </span>
          </div>
        )}
      </CardContent>

      {showActions && (
        <CardFooter className="gap-2">
          <Button asChild variant="outline" className="flex-1">
            <Link href={`/warehouses/${warehouse.id}`}>Voir détails</Link>
          </Button>
          {canEdit && (
            <Button asChild variant="default" className="flex-1">
              <Link href={`/warehouses/${warehouse.id}/edit`}>Modifier</Link>
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
