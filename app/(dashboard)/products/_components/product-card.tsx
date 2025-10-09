"use client";

import Link from "next/link";
import { Product, Category, Stock, Warehouse } from "@prisma/client";
import { Package, Tag, AlertCircle, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getProductStatusLabel,
  calculateTotalStock,
  hasLowStock,
  getLowStockCount,
  getStockStatusLabel,
  getStockStatusVariant,
  formatUnit,
} from "@/lib/utils/product";

interface ProductCardProps {
  product: Product & {
    category: Category;
    stock?: (Stock & { warehouse: Warehouse })[];
    _count?: {
      variants: number;
      attributes: number;
      stock: number;
    };
  };
  showActions?: boolean;
  canEdit?: boolean;
}

export function ProductCard({ product, showActions = true, canEdit = false }: ProductCardProps) {
  const totalStock = product.stock ? calculateTotalStock(product.stock) : 0;
  const isLowStock = hasLowStock(product, totalStock);
  const lowStockCount = getLowStockCount(product, totalStock);
  const stockStatusLabel = getStockStatusLabel(product, totalStock);
  const stockStatusVariant = getStockStatusVariant(product, totalStock);

  const variantCount = product._count?.variants || 0;
  const attributeCount = product._count?.attributes || 0;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-lg">{product.name}</CardTitle>
              <CardDescription className="font-mono text-sm">{product.sku}</CardDescription>
            </div>
          </div>
          <Badge variant={product.active ? "default" : "secondary"}>
            {getProductStatusLabel(product.active)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Category */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Tag className="h-4 w-4 shrink-0" />
          <p className="line-clamp-1">{product.category.name}</p>
        </div>

        {/* Stock Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-2xl font-bold">{totalStock}</p>
            <p className="text-xs text-muted-foreground">
              {formatUnit(product.unit, totalStock)}
            </p>
          </div>

          <div>
            <Badge variant={stockStatusVariant} className="mb-1">
              {stockStatusLabel}
            </Badge>
            <p className="text-xs text-muted-foreground">
              Min: {product.minStock} {product.unit}
            </p>
          </div>
        </div>

        {/* Low Stock Alert */}
        {isLowStock && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm">
            <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
            <span className="text-destructive">
              {totalStock === 0
                ? "Rupture de stock"
                : `${lowStockCount} ${formatUnit(product.unit, lowStockCount)} manquant${lowStockCount > 1 ? "s" : ""}`}
            </span>
          </div>
        )}

        {/* Variants & Attributes Count */}
        {(variantCount > 0 || attributeCount > 0) && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {variantCount > 0 && (
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                <span>
                  {variantCount} variant{variantCount > 1 ? "s" : ""}
                </span>
              </div>
            )}
            {attributeCount > 0 && (
              <div className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                <span>
                  {attributeCount} attribut{attributeCount > 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>

      {showActions && (
        <CardFooter className="gap-2">
          <Button asChild variant="outline" className="flex-1">
            <Link href={`/products/${product.id}`}>Voir détails</Link>
          </Button>
          {canEdit && (
            <Button asChild variant="default" className="flex-1">
              <Link href={`/products/${product.id}/edit`}>Modifier</Link>
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
