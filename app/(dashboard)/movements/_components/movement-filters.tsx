"use client";

import { useQueryStates, parseAsString, parseAsIsoDateTime } from "nuqs";
import { MovementType, Warehouse, Product } from "@prisma/client";
import { X, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MOVEMENT_TYPE_LABELS } from "@/lib/utils/constants";

interface MovementFiltersProps {
  warehouses: Warehouse[];
  products: Product[];
}

export function MovementFilters({ warehouses, products }: MovementFiltersProps) {
  const [filters, setFilters] = useQueryStates(
    {
      type: parseAsString,
      warehouseId: parseAsString,
      productId: parseAsString,
      dateFrom: parseAsIsoDateTime,
      dateTo: parseAsIsoDateTime,
    },
    {
      shallow: false, // Trigger server component re-render
    }
  );

  const hasActiveFilters =
    filters.type || filters.warehouseId || filters.productId || filters.dateFrom || filters.dateTo;

  const handleClearFilters = () => {
    setFilters({
      type: null,
      warehouseId: null,
      productId: null,
      dateFrom: null,
      dateTo: null,
    });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Filtres</h3>
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-8 px-2 lg:px-3"
              >
                <X className="h-4 w-4 mr-2" />
                Effacer les filtres
              </Button>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Type filter */}
            <div className="space-y-2">
              <Label htmlFor="type">Type de mouvement</Label>
              <Select
                value={filters.type || "all"}
                onValueChange={(value) =>
                  setFilters({ type: value === "all" ? null : (value as MovementType) })
                }
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  {Object.entries(MOVEMENT_TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Warehouse filter */}
            <div className="space-y-2">
              <Label htmlFor="warehouse">Entrepôt</Label>
              <Select
                value={filters.warehouseId || "all"}
                onValueChange={(value) =>
                  setFilters({ warehouseId: value === "all" ? null : value })
                }
              >
                <SelectTrigger id="warehouse">
                  <SelectValue placeholder="Tous les entrepôts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les entrepôts</SelectItem>
                  {warehouses.map((warehouse) => (
                    <SelectItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.name} ({warehouse.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Product filter */}
            <div className="space-y-2">
              <Label htmlFor="product">Produit</Label>
              <Select
                value={filters.productId || "all"}
                onValueChange={(value) =>
                  setFilters({ productId: value === "all" ? null : value })
                }
              >
                <SelectTrigger id="product">
                  <SelectValue placeholder="Tous les produits" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les produits</SelectItem>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} ({product.sku})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date range filter */}
            <div className="space-y-2">
              <Label>Période</Label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={
                    filters.dateFrom
                      ? new Date(filters.dateFrom).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setFilters({
                      dateFrom: e.target.value ? new Date(e.target.value) : null,
                    })
                  }
                  placeholder="Du"
                  className="flex-1"
                />
                <Input
                  type="date"
                  value={
                    filters.dateTo
                      ? new Date(filters.dateTo).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setFilters({
                      dateTo: e.target.value ? new Date(e.target.value) : null,
                    })
                  }
                  placeholder="Au"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 pt-2">
              {filters.type && (
                <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm">
                  Type: {MOVEMENT_TYPE_LABELS[filters.type as MovementType]}
                  <button
                    onClick={() => setFilters({ type: null })}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {filters.warehouseId && (
                <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm">
                  Entrepôt:{" "}
                  {warehouses.find((w) => w.id === filters.warehouseId)?.code || "Inconnu"}
                  <button
                    onClick={() => setFilters({ warehouseId: null })}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {filters.productId && (
                <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm">
                  Produit:{" "}
                  {products.find((p) => p.id === filters.productId)?.sku || "Inconnu"}
                  <button
                    onClick={() => setFilters({ productId: null })}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {filters.dateFrom && (
                <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm">
                  Du: {new Date(filters.dateFrom).toLocaleDateString()}
                  <button
                    onClick={() => setFilters({ dateFrom: null })}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {filters.dateTo && (
                <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm">
                  Au: {new Date(filters.dateTo).toLocaleDateString()}
                  <button
                    onClick={() => setFilters({ dateTo: null })}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
