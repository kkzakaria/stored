"use client";

import { useQueryStates, parseAsString, parseAsBoolean } from "nuqs";
import { Search, X, Tag } from "lucide-react";
import { Category } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductFiltersProps {
  categories: Category[];
}

export function ProductFilters({ categories }: ProductFiltersProps) {
  const [filters, setFilters] = useQueryStates(
    {
      search: parseAsString.withDefault(""),
      categoryId: parseAsString.withDefault(""),
      activeOnly: parseAsBoolean.withDefault(true),
      lowStockOnly: parseAsBoolean.withDefault(false),
    },
    {
      shallow: false, // Trigger Server Component re-render
    }
  );

  const hasActiveFilters =
    filters.search !== "" ||
    filters.categoryId !== "" ||
    !filters.activeOnly ||
    filters.lowStockOnly;

  const handleClearFilters = () => {
    setFilters({
      search: "",
      categoryId: "",
      activeOnly: true,
      lowStockOnly: false,
    });
  };

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filtres</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleClearFilters}>
            <X className="mr-2 h-4 w-4" />
            Réinitialiser
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {/* Search filter */}
        <div className="space-y-2">
          <Label htmlFor="search">Rechercher</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Nom, SKU ou description..."
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
              className="pl-9"
            />
          </div>
        </div>

        {/* Category filter */}
        <div className="space-y-2">
          <Label htmlFor="category">Catégorie</Label>
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
            <Select
              value={filters.categoryId || "all"}
              onValueChange={(value) => setFilters({ categoryId: value === "all" ? "" : value })}
            >
              <SelectTrigger id="category" className="pl-9">
                <SelectValue placeholder="Toutes les catégories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active only filter */}
        <div className="flex items-center justify-between">
          <Label htmlFor="activeOnly" className="cursor-pointer">
            Afficher uniquement les produits actifs
          </Label>
          <Switch
            id="activeOnly"
            checked={filters.activeOnly}
            onCheckedChange={(checked) => setFilters({ activeOnly: checked })}
          />
        </div>

        {/* Low stock only filter */}
        <div className="flex items-center justify-between">
          <Label htmlFor="lowStockOnly" className="cursor-pointer">
            Afficher uniquement les produits en stock bas
          </Label>
          <Switch
            id="lowStockOnly"
            checked={filters.lowStockOnly}
            onCheckedChange={(checked) => setFilters({ lowStockOnly: checked })}
          />
        </div>
      </div>

      {hasActiveFilters && (
        <div className="pt-2 text-xs text-muted-foreground space-y-1">
          {filters.search && (
            <p>
              Recherche: <span className="font-medium">{filters.search}</span>
            </p>
          )}
          {filters.categoryId && (
            <p>
              Catégorie:{" "}
              <span className="font-medium">
                {categories.find((c) => c.id === filters.categoryId)?.name || "Inconnue"}
              </span>
            </p>
          )}
          {!filters.activeOnly && <p>Affichage: Tous les produits</p>}
          {filters.lowStockOnly && <p>Affichage: Stock bas uniquement</p>}
        </div>
      )}
    </div>
  );
}
