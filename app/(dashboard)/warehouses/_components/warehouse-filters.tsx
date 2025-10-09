"use client";

import { useQueryStates, parseAsString, parseAsBoolean } from "nuqs";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export function WarehouseFilters() {
  const [filters, setFilters] = useQueryStates(
    {
      search: parseAsString.withDefault(""),
      activeOnly: parseAsBoolean.withDefault(true),
    },
    {
      shallow: false, // Trigger Server Component re-render
    }
  );

  const hasActiveFilters = filters.search !== "" || !filters.activeOnly;

  const handleClearFilters = () => {
    setFilters({
      search: "",
      activeOnly: true,
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
              placeholder="Nom ou code..."
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
              className="pl-9"
            />
          </div>
        </div>

        {/* Active only filter */}
        <div className="flex items-center justify-between">
          <Label htmlFor="activeOnly" className="cursor-pointer">
            Afficher uniquement les entrepôts actifs
          </Label>
          <Switch
            id="activeOnly"
            checked={filters.activeOnly}
            onCheckedChange={(checked) => setFilters({ activeOnly: checked })}
          />
        </div>
      </div>

      {hasActiveFilters && (
        <div className="pt-2 text-xs text-muted-foreground">
          {filters.search && (
            <p>
              Recherche: <span className="font-medium">{filters.search}</span>
            </p>
          )}
          {!filters.activeOnly && <p>Affichage: Tous les entrepôts</p>}
        </div>
      )}
    </div>
  );
}
