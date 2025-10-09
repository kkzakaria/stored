import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";
import { formatNumber } from "@/lib/utils/formatters";
import { ExportButton } from "./export-button";
import {
  formatStockReportForExport,
  STOCK_REPORT_HEADERS,
} from "@/lib/utils/report";
import { EmptyState } from "@/components/shared/empty-state";

interface StockReportProps {
  data: Array<{
    id: string;
    quantity: number;
    reservedQty: number;
    warehouse: {
      id: string;
      name: string;
      code: string;
    };
    product: {
      id: string;
      sku: string;
      name: string;
      minStock: number;
      unit: string;
    };
    variant: {
      id: string;
      sku: string;
      name: string;
    } | null;
  }>;
}

export function StockReport({ data }: StockReportProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Rapport de Stock
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Package}
            title="Aucun stock disponible"
            description="Aucune donnée de stock ne correspond aux filtres sélectionnés."
          />
        </CardContent>
      </Card>
    );
  }

  // Calculate totals
  const totalQuantity = data.reduce((sum, item) => sum + item.quantity, 0);
  const totalReserved = data.reduce((sum, item) => sum + item.reservedQty, 0);
  const totalAvailable = totalQuantity - totalReserved;
  const lowStockCount = data.filter((item) => item.quantity < item.product.minStock).length;

  // Prepare export data
  const exportData = formatStockReportForExport(data);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Rapport de Stock
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {data.length} article{data.length > 1 ? "s" : ""} en stock
            </p>
          </div>
          <ExportButton
            data={exportData}
            headers={STOCK_REPORT_HEADERS}
            filename={`rapport-stock-${new Date().toISOString().split("T")[0]}`}
            sheetName="Stock"
          />
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="rounded-lg border p-4">
            <p className="text-xs font-medium text-muted-foreground">Total Stock</p>
            <p className="text-2xl font-bold mt-1">{formatNumber(totalQuantity)}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-xs font-medium text-muted-foreground">Réservé</p>
            <p className="text-2xl font-bold mt-1 text-orange-600 dark:text-orange-400">
              {formatNumber(totalReserved)}
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-xs font-medium text-muted-foreground">Disponible</p>
            <p className="text-2xl font-bold mt-1 text-green-600 dark:text-green-400">
              {formatNumber(totalAvailable)}
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-xs font-medium text-muted-foreground">Stock faible</p>
            <p className="text-2xl font-bold mt-1 text-red-600 dark:text-red-400">
              {formatNumber(lowStockCount)}
            </p>
          </div>
        </div>

        {/* Stock Table */}
        <div className="rounded-md border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-12 px-4 text-left align-middle font-medium text-xs">
                    Entrepôt
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-xs">
                    SKU
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-xs">
                    Produit
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-xs">
                    Variante
                  </th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-xs">
                    Quantité
                  </th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-xs">
                    Réservé
                  </th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-xs">
                    Disponible
                  </th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-xs">
                    Stock min
                  </th>
                  <th className="h-12 px-4 text-center align-middle font-medium text-xs">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => {
                  const available = item.quantity - item.reservedQty;
                  const isLowStock = item.quantity < item.product.minStock;

                  return (
                    <tr key={item.id} className="border-b">
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium">{item.warehouse.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.warehouse.code}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono">
                        {item.product.sku}
                      </td>
                      <td className="px-4 py-3 text-sm">{item.product.name}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {item.variant?.name || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium">
                        {formatNumber(item.quantity)} {item.product.unit}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-orange-600 dark:text-orange-400">
                        {formatNumber(item.reservedQty)} {item.product.unit}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-green-600 dark:text-green-400">
                        {formatNumber(available)} {item.product.unit}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-muted-foreground">
                        {formatNumber(item.product.minStock)} {item.product.unit}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isLowStock ? (
                          <Badge variant="destructive">Stock faible</Badge>
                        ) : (
                          <Badge variant="outline">OK</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
