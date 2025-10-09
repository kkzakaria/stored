import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Package, TrendingUp, AlertTriangle, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { formatNumber } from "@/lib/utils/formatters";
import { ExportButton } from "./export-button";
import {
  formatWarehouseReportForExport,
  WAREHOUSE_REPORT_HEADERS,
} from "@/lib/utils/report";
import { EmptyState } from "@/components/shared/empty-state";

interface WarehouseReportProps {
  data: Array<{
    id: string;
    name: string;
    code: string;
    location: string | null;
    active: boolean;
    stats: {
      totalItems: number;
      totalQuantity: number;
      reservedQuantity: number;
      availableQuantity: number;
      lowStockItems: number;
    };
    movements: {
      totalQuantityIn: number;
      totalQuantityOut: number;
    };
  }>;
}

export function WarehouseReport({ data }: WarehouseReportProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Rapport par Entrepôt
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Building2}
            title="Aucun entrepôt"
            description="Aucun entrepôt ne correspond aux filtres sélectionnés."
          />
        </CardContent>
      </Card>
    );
  }

  // Calculate global totals
  const globalStats = data.reduce(
    (acc, warehouse) => ({
      totalItems: acc.totalItems + warehouse.stats.totalItems,
      totalQuantity: acc.totalQuantity + warehouse.stats.totalQuantity,
      reservedQuantity: acc.reservedQuantity + warehouse.stats.reservedQuantity,
      availableQuantity: acc.availableQuantity + warehouse.stats.availableQuantity,
      lowStockItems: acc.lowStockItems + warehouse.stats.lowStockItems,
      totalQuantityIn: acc.totalQuantityIn + warehouse.movements.totalQuantityIn,
      totalQuantityOut: acc.totalQuantityOut + warehouse.movements.totalQuantityOut,
    }),
    {
      totalItems: 0,
      totalQuantity: 0,
      reservedQuantity: 0,
      availableQuantity: 0,
      lowStockItems: 0,
      totalQuantityIn: 0,
      totalQuantityOut: 0,
    }
  );

  // Prepare export data
  const exportData = formatWarehouseReportForExport(data);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Rapport par Entrepôt
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {data.length} entrepôt{data.length > 1 ? "s" : ""}
            </p>
          </div>
          <ExportButton
            data={exportData}
            headers={WAREHOUSE_REPORT_HEADERS}
            filename={`rapport-entrepots-${new Date().toISOString().split("T")[0]}`}
            sheetName="Entrepôts"
          />
        </div>
      </CardHeader>
      <CardContent>
        {/* Global Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 mb-1">
              <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <p className="text-xs font-medium text-muted-foreground">
                Total Articles
              </p>
            </div>
            <p className="text-2xl font-bold">{formatNumber(globalStats.totalItems)}</p>
          </div>

          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              <p className="text-xs font-medium text-muted-foreground">
                Stock Total
              </p>
            </div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatNumber(globalStats.totalQuantity)}
            </p>
          </div>

          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 mb-1">
              <ArrowUpCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <p className="text-xs font-medium text-muted-foreground">
                Entrées
              </p>
            </div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatNumber(globalStats.totalQuantityIn)}
            </p>
          </div>

          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 mb-1">
              <ArrowDownCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <p className="text-xs font-medium text-muted-foreground">
                Sorties
              </p>
            </div>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatNumber(globalStats.totalQuantityOut)}
            </p>
          </div>
        </div>

        {/* Warehouses Table */}
        <div className="rounded-md border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-12 px-4 text-left align-middle font-medium text-xs">
                    Entrepôt
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-xs">
                    Localisation
                  </th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-xs">
                    Articles
                  </th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-xs">
                    Stock total
                  </th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-xs">
                    Réservé
                  </th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-xs">
                    Disponible
                  </th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-xs">
                    Alertes
                  </th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-xs">
                    Entrées
                  </th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-xs">
                    Sorties
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((warehouse) => (
                  <tr key={warehouse.id} className="border-b">
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium">{warehouse.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {warehouse.code}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {warehouse.location || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium">
                      {formatNumber(warehouse.stats.totalItems)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium">
                      {formatNumber(warehouse.stats.totalQuantity)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-orange-600 dark:text-orange-400">
                      {formatNumber(warehouse.stats.reservedQuantity)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-green-600 dark:text-green-400">
                      {formatNumber(warehouse.stats.availableQuantity)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {warehouse.stats.lowStockItems > 0 ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <AlertTriangle className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                          <span className="font-medium text-red-600 dark:text-red-400">
                            {formatNumber(warehouse.stats.lowStockItems)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-green-600 dark:text-green-400">
                      {formatNumber(warehouse.movements.totalQuantityIn)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-red-600 dark:text-red-400">
                      {formatNumber(warehouse.movements.totalQuantityOut)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Warehouse Cards (Mobile-friendly alternative view) */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:hidden">
          {data.map((warehouse) => (
            <Card key={warehouse.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">{warehouse.name}</h4>
                    <p className="text-xs text-muted-foreground font-mono mt-1">
                      {warehouse.code}
                    </p>
                    {warehouse.location && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        📍 {warehouse.location}
                      </p>
                    )}
                  </div>
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                    <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Articles</p>
                    <p className="text-lg font-semibold mt-1">
                      {formatNumber(warehouse.stats.totalItems)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Stock total</p>
                    <p className="text-lg font-semibold mt-1">
                      {formatNumber(warehouse.stats.totalQuantity)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Disponible</p>
                    <p className="text-lg font-semibold mt-1 text-green-600 dark:text-green-400">
                      {formatNumber(warehouse.stats.availableQuantity)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Alertes</p>
                    <p className="text-lg font-semibold mt-1 text-red-600 dark:text-red-400">
                      {warehouse.stats.lowStockItems > 0
                        ? formatNumber(warehouse.stats.lowStockItems)
                        : "—"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
