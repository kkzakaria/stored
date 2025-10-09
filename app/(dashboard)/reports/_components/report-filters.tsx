"use client";

import { useQueryStates, parseAsString } from "nuqs";
import { DayPicker, DateRange } from "react-day-picker";
import { fr } from "date-fns/locale";
import { Calendar, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils/formatters";
import {
  getLastNDaysRange,
  getCurrentMonthRange,
  getLastMonthRange,
  getCurrentYearRange,
} from "@/lib/utils/report";
import "react-day-picker/style.css";

interface ReportFiltersProps {
  warehouses?: Array<{ id: string; name: string; code: string }>;
  categories?: Array<{ id: string; name: string }>;
  showWarehouseFilter?: boolean;
  showCategoryFilter?: boolean;
  showDateFilter?: boolean;
  showMovementTypeFilter?: boolean;
}

export function ReportFilters({
  warehouses = [],
  categories = [],
  showWarehouseFilter = true,
  showCategoryFilter = false,
  showDateFilter = true,
  showMovementTypeFilter = false,
}: ReportFiltersProps) {
  const [filters, setFilters] = useQueryStates(
    {
      warehouseId: parseAsString.withDefault(""),
      categoryId: parseAsString.withDefault(""),
      movementType: parseAsString.withDefault(""),
      dateFrom: parseAsString,
      dateTo: parseAsString,
    },
    { shallow: false }
  );

  const dateRange: DateRange | undefined =
    filters.dateFrom && filters.dateTo
      ? {
          from: new Date(filters.dateFrom),
          to: new Date(filters.dateTo),
        }
      : undefined;

  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      setFilters({
        dateFrom: range.from.toISOString(),
        dateTo: range.to.toISOString(),
      });
    } else {
      setFilters({
        dateFrom: null,
        dateTo: null,
      });
    }
  };

  const handleQuickDateRange = (type: string) => {
    let range: { from: Date; to: Date };

    switch (type) {
      case "7days":
        range = getLastNDaysRange(7);
        break;
      case "30days":
        range = getLastNDaysRange(30);
        break;
      case "currentMonth":
        range = getCurrentMonthRange();
        break;
      case "lastMonth":
        range = getLastMonthRange();
        break;
      case "currentYear":
        range = getCurrentYearRange();
        break;
      default:
        return;
    }

    setFilters({
      dateFrom: range.from.toISOString(),
      dateTo: range.to.toISOString(),
    });
  };

  const handleClearFilters = () => {
    setFilters({
      warehouseId: "",
      categoryId: "",
      movementType: "",
      dateFrom: null,
      dateTo: null,
    });
  };

  const hasActiveFilters =
    filters.warehouseId ||
    filters.categoryId ||
    filters.movementType ||
    filters.dateFrom ||
    filters.dateTo;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Filtres</h3>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-8 px-2 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Réinitialiser
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Warehouse Filter */}
            {showWarehouseFilter && warehouses.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="warehouse-filter" className="text-xs">
                  Entrepôt
                </Label>
                <Select
                  value={filters.warehouseId}
                  onValueChange={(value) =>
                    setFilters({ warehouseId: value === "all" ? "" : value })
                  }
                >
                  <SelectTrigger id="warehouse-filter">
                    <SelectValue placeholder="Tous les entrepôts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les entrepôts</SelectItem>
                    {warehouses.map((warehouse) => (
                      <SelectItem key={warehouse.id} value={warehouse.id}>
                        {warehouse.code} - {warehouse.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Category Filter */}
            {showCategoryFilter && categories.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="category-filter" className="text-xs">
                  Catégorie
                </Label>
                <Select
                  value={filters.categoryId}
                  onValueChange={(value) =>
                    setFilters({ categoryId: value === "all" ? "" : value })
                  }
                >
                  <SelectTrigger id="category-filter">
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
            )}

            {/* Movement Type Filter */}
            {showMovementTypeFilter && (
              <div className="space-y-2">
                <Label htmlFor="movement-type-filter" className="text-xs">
                  Type de mouvement
                </Label>
                <Select
                  value={filters.movementType}
                  onValueChange={(value) =>
                    setFilters({ movementType: value === "all" ? "" : value })
                  }
                >
                  <SelectTrigger id="movement-type-filter">
                    <SelectValue placeholder="Tous les types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="IN">Entrée</SelectItem>
                    <SelectItem value="OUT">Sortie</SelectItem>
                    <SelectItem value="TRANSFER">Transfert</SelectItem>
                    <SelectItem value="ADJUSTMENT">Ajustement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Date Range Filter */}
            {showDateFilter && (
              <div className="space-y-2">
                <Label className="text-xs">Période</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {dateRange?.from && dateRange?.to ? (
                        <>
                          {formatDate(dateRange.from)} - {formatDate(dateRange.to)}
                        </>
                      ) : (
                        <span className="text-muted-foreground">
                          Sélectionner une période
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="flex flex-col gap-2 p-3 border-b">
                      <p className="text-xs font-medium">Raccourcis</p>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickDateRange("7days")}
                          className="text-xs h-8"
                        >
                          7 derniers jours
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickDateRange("30days")}
                          className="text-xs h-8"
                        >
                          30 derniers jours
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickDateRange("currentMonth")}
                          className="text-xs h-8"
                        >
                          Mois en cours
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickDateRange("lastMonth")}
                          className="text-xs h-8"
                        >
                          Mois dernier
                        </Button>
                      </div>
                    </div>
                    <DayPicker
                      mode="range"
                      selected={dateRange}
                      onSelect={handleDateRangeChange}
                      locale={fr}
                      numberOfMonths={2}
                      className="p-3"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
