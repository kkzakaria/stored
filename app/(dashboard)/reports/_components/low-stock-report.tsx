import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Package } from "lucide-react";
import { formatNumber } from "@/lib/utils/formatters";
import { ExportButton } from "./export-button";
import {
  formatLowStockReportForExport,
  LOW_STOCK_REPORT_HEADERS,
} from "@/lib/utils/report";
import { EmptyState } from "@/components/shared/empty-state";

interface LowStockReportProps {
  data: Array<{
    id: string;
    quantity: number;
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

export function LowStockReport({ data }: LowStockReportProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alertes de Stock Minimum
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Package}
            title="Aucune alerte de stock"
            description="Tous les produits sont au-dessus du seuil minimum."
          />
        </CardContent>
      </Card>
    );
  }

  // Calculate severity for each item
  const itemsWithSeverity = data.map((item) => {
    const percentage = (item.quantity / item.product.minStock) * 100;
    const deficit = item.product.minStock - item.quantity;

    let severity: "critical" | "urgent" | "warning";
    let severityLabel: string;
    let severityColor: string;

    if (percentage === 0 || item.quantity === 0) {
      severity = "critical";
      severityLabel = "Critique";
      severityColor = "destructive";
    } else if (percentage < 50) {
      severity = "urgent";
      severityLabel = "Urgent";
      severityColor = "destructive";
    } else {
      severity = "warning";
      severityLabel = "Attention";
      severityColor = "default";
    }

    return {
      ...item,
      percentage,
      deficit,
      severity,
      severityLabel,
      severityColor,
    };
  });

  // Sort by severity (critical first)
  const sortedData = itemsWithSeverity.sort((a, b) => {
    const severityOrder = { critical: 0, urgent: 1, warning: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  // Prepare export data
  const exportData = formatLowStockReportForExport(data);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alertes de Stock Minimum
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {data.length} produit{data.length > 1 ? "s" : ""} sous le seuil minimum
            </p>
          </div>
          <ExportButton
            data={exportData}
            headers={LOW_STOCK_REPORT_HEADERS}
            filename={`alertes-stock-${new Date().toISOString().split("T")[0]}`}
            sheetName="Alertes Stock"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-12 px-4 text-left align-middle font-medium text-xs">
                    Gravité
                  </th>
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
                    Stock actuel
                  </th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-xs">
                    Stock min
                  </th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-xs">
                    Déficit
                  </th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-xs">
                    Niveau
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="px-4 py-3">
                      <Badge variant={item.severityColor as "destructive" | "default"}>
                        {item.severityLabel}
                      </Badge>
                    </td>
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
                    <td className="px-4 py-3 text-sm text-right">
                      <span
                        className={
                          item.quantity === 0
                            ? "text-red-600 dark:text-red-400 font-semibold"
                            : "text-orange-600 dark:text-orange-400"
                        }
                      >
                        {formatNumber(item.quantity)} {item.product.unit}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {formatNumber(item.product.minStock)} {item.product.unit}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-red-600 dark:text-red-400">
                      -{formatNumber(item.deficit)} {item.product.unit}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              item.percentage === 0
                                ? "bg-red-600"
                                : item.percentage < 50
                                  ? "bg-orange-600"
                                  : "bg-yellow-600"
                            }`}
                            style={{ width: `${Math.min(item.percentage, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium w-12 text-right">
                          {item.percentage.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border p-4 bg-red-50 dark:bg-red-950/20">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-red-600" />
              <p className="text-xs font-medium text-red-900 dark:text-red-100">
                Critique (0%)
              </p>
            </div>
            <p className="text-2xl font-bold mt-2 text-red-600 dark:text-red-400">
              {sortedData.filter((i) => i.severity === "critical").length}
            </p>
          </div>
          <div className="rounded-lg border p-4 bg-orange-50 dark:bg-orange-950/20">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-orange-600" />
              <p className="text-xs font-medium text-orange-900 dark:text-orange-100">
                Urgent (&lt;50%)
              </p>
            </div>
            <p className="text-2xl font-bold mt-2 text-orange-600 dark:text-orange-400">
              {sortedData.filter((i) => i.severity === "urgent").length}
            </p>
          </div>
          <div className="rounded-lg border p-4 bg-yellow-50 dark:bg-yellow-950/20">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-yellow-600" />
              <p className="text-xs font-medium text-yellow-900 dark:text-yellow-100">
                Attention (50-100%)
              </p>
            </div>
            <p className="text-2xl font-bold mt-2 text-yellow-600 dark:text-yellow-400">
              {sortedData.filter((i) => i.severity === "warning").length}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
