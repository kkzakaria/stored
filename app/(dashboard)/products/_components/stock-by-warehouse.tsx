"use client";

import { Stock, Warehouse, ProductVariant } from "@prisma/client";
import { Building2, Package, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { groupStockByWarehouse, formatUnit } from "@/lib/utils/product";

interface StockByWarehouseProps {
  stock: (Stock & {
    warehouse: Warehouse;
    variant?: ProductVariant | null;
  })[];
  productUnit: string;
  minStock: number;
}

export function StockByWarehouse({ stock, productUnit, minStock }: StockByWarehouseProps) {
  if (stock.length === 0) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Stock par entrepôt</h3>
          <p className="text-sm text-muted-foreground">
            Répartition du stock dans les différents entrepôts
          </p>
        </div>
        <EmptyState
          icon={Package}
          title="Aucun stock"
          description="Ce produit n'a pas encore de stock dans les entrepôts"
        />
      </div>
    );
  }

  // Group stock by warehouse (aggregating all variants)
  const warehouseStock = groupStockByWarehouse(stock);

  // Also prepare detailed stock by variant (if variants exist)
  const stockByVariant = stock.reduce(
    (acc, item) => {
      const key = `${item.warehouseId}-${item.variantId || "base"}`;
      if (!acc[key]) {
        acc[key] = {
          warehouseId: item.warehouseId,
          warehouseName: item.warehouse.name,
          warehouseCode: item.warehouse.code,
          variantId: item.variantId,
          variantName: item.variant?.name || null,
          variantSku: item.variant?.sku || null,
          quantity: 0,
          active: item.warehouse.active,
        };
      }
      acc[key].quantity += item.quantity;
      return acc;
    },
    {} as Record<
      string,
      {
        warehouseId: string;
        warehouseName: string;
        warehouseCode: string;
        variantId: string | null;
        variantName: string | null;
        variantSku: string | null;
        quantity: number;
        active: boolean;
      }
    >
  );

  const hasVariants = stock.some((s) => s.variantId !== null);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Stock par entrepôt</h3>
        <p className="text-sm text-muted-foreground">
          Répartition du stock dans les différents entrepôts
        </p>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Entrepôt</TableHead>
              {hasVariants && <TableHead>Variante</TableHead>}
              <TableHead className="text-right">Quantité</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {hasVariants ? (
              // Show detailed stock with variants
              Object.values(stockByVariant)
                .sort((a, b) => {
                  // Sort by warehouse name, then variant name
                  const warehouseCmp = a.warehouseName.localeCompare(b.warehouseName);
                  if (warehouseCmp !== 0) return warehouseCmp;
                  return (a.variantName || "").localeCompare(b.variantName || "");
                })
                .map((item) => {
                  const isLowStock = item.quantity < minStock;
                  const isOutOfStock = item.quantity === 0;

                  return (
                    <TableRow key={`${item.warehouseId}-${item.variantId || "base"}`}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{item.warehouseName}</p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {item.warehouseCode}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.variantName ? (
                          <div>
                            <p className="font-medium">{item.variantName}</p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {item.variantSku}
                            </p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Produit de base</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isLowStock && (
                            <AlertCircle className="h-4 w-4 text-destructive" />
                          )}
                          <span className="text-lg font-bold">{item.quantity}</span>
                          <span className="text-sm text-muted-foreground">
                            {formatUnit(productUnit, item.quantity)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            isOutOfStock
                              ? "destructive"
                              : isLowStock
                                ? "secondary"
                                : "default"
                          }
                        >
                          {isOutOfStock
                            ? "Rupture"
                            : isLowStock
                              ? "Stock bas"
                              : "En stock"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.active && (
                          <Button asChild variant="ghost" size="sm">
                            <Link href={`/warehouses/${item.warehouseId}`}>
                              Voir entrepôt
                            </Link>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
            ) : (
              // Show aggregated stock by warehouse (no variants)
              Array.from(warehouseStock.values())
                .sort((a, b) => a.warehouseName.localeCompare(b.warehouseName))
                .map((item) => {
                  const isLowStock = item.quantity < minStock;
                  const isOutOfStock = item.quantity === 0;

                  return (
                    <TableRow key={item.warehouseId}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{item.warehouseName}</p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {item.warehouseCode}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isLowStock && (
                            <AlertCircle className="h-4 w-4 text-destructive" />
                          )}
                          <span className="text-lg font-bold">{item.quantity}</span>
                          <span className="text-sm text-muted-foreground">
                            {formatUnit(productUnit, item.quantity)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            isOutOfStock
                              ? "destructive"
                              : isLowStock
                                ? "secondary"
                                : "default"
                          }
                        >
                          {isOutOfStock
                            ? "Rupture"
                            : isLowStock
                              ? "Stock bas"
                              : "En stock"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.active && (
                          <Button asChild variant="ghost" size="sm">
                            <Link href={`/warehouses/${item.warehouseId}`}>
                              Voir entrepôt
                            </Link>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
