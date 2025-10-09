"use client";

import Link from "next/link";
import { Package, AlertCircle } from "lucide-react";
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
import { getStockLevelVariant, getStockLevelLabel } from "@/lib/utils/warehouse";

interface StockItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    sku: string;
    name: string;
    minStock: number;
  };
  variant: {
    id: string;
    name: string;
    sku: string;
  } | null;
}

interface StockOverviewProps {
  stock: StockItem[];
  showLowStockOnly?: boolean;
}

export function StockOverview({ stock, showLowStockOnly = false }: StockOverviewProps) {
  // Filter for low stock items if requested
  const filteredStock = showLowStockOnly
    ? stock.filter((item) => item.quantity < item.product.minStock && item.product.minStock > 0)
    : stock;

  if (filteredStock.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title={showLowStockOnly ? "Aucun produit en stock bas" : "Aucun produit en stock"}
        description={
          showLowStockOnly
            ? "Tous les produits ont un niveau de stock adéquat."
            : "Cet entrepôt ne contient aucun produit pour le moment."
        }
      />
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produit</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Variante</TableHead>
            <TableHead className="text-right">Quantité</TableHead>
            <TableHead className="text-right">Min. Stock</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredStock.map((item) => {
            const variant = getStockLevelVariant(item.quantity, item.product.minStock);
            const label = getStockLevelLabel(item.quantity, item.product.minStock);
            const isLowStock = item.quantity < item.product.minStock && item.product.minStock > 0;

            return (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {isLowStock && <AlertCircle className="h-4 w-4 text-destructive" />}
                    {item.product.name}
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {item.product.sku}
                </TableCell>
                <TableCell>
                  {item.variant ? (
                    <div>
                      <p className="text-sm">{item.variant.name}</p>
                      <p className="font-mono text-xs text-muted-foreground">{item.variant.sku}</p>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right font-medium">{item.quantity}</TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {item.product.minStock}
                </TableCell>
                <TableCell>
                  <Badge variant={variant}>{label}</Badge>
                </TableCell>
                <TableCell>
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/products/${item.product.id}`}>Voir</Link>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
