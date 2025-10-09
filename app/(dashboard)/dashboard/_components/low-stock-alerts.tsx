import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { AlertTriangle, Package, Building2, ArrowRight, TrendingUp } from "lucide-react";
import { getStockAlertSeverity, getStockAlertColor } from "@/lib/utils/dashboard";
import { formatNumber } from "@/lib/utils/formatters";

interface LowStockAlertsProps {
  items: Array<{
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
      name: string;
      sku: string;
      minStock: number;
      unit: string;
    };
    variant: {
      id: string;
      name: string;
      sku: string;
    } | null;
  }>;
}

export function LowStockAlerts({ items }: LowStockAlertsProps) {
  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-green-600" />
            Low Stock Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Package}
            title="No low stock alerts"
            description="All products are above their minimum stock levels."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Low Stock Alerts
          </CardTitle>
          <Badge variant="destructive">{items.length}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item) => {
            const availableQty = item.quantity - item.reservedQty;
            const severity = getStockAlertSeverity(availableQty, item.product.minStock);
            const severityColor = getStockAlertColor(severity);
            const percentage = ((availableQty / item.product.minStock) * 100).toFixed(0);

            return (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {/* Alert Icon */}
                <div
                  className={`p-2 rounded-lg ${
                    severity === "critical"
                      ? "bg-red-100 dark:bg-red-900"
                      : "bg-orange-100 dark:bg-orange-900"
                  }`}
                >
                  <AlertTriangle
                    className={`h-4 w-4 ${
                      severity === "critical"
                        ? "text-red-600 dark:text-red-400"
                        : "text-orange-600 dark:text-orange-400"
                    }`}
                  />
                </div>

                {/* Alert Details */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant={severity === "critical" ? "destructive" : "secondary"}
                          className={severityColor}
                        >
                          {severity === "critical" ? "Critical" : "Warning"}
                        </Badge>
                        <span className="font-medium text-sm truncate">
                          {item.product.name}
                          {item.variant && ` - ${item.variant.name}`}
                        </span>
                      </div>

                      {/* Product SKU */}
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <Package className="h-3 w-3 flex-shrink-0" />
                        <span>
                          SKU: {item.variant?.sku || item.product.sku}
                        </span>
                      </div>

                      {/* Warehouse */}
                      <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 mt-1">
                        <Building2 className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">
                          {item.warehouse.name} ({item.warehouse.code})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stock Levels */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Available: </span>
                        <span className={`font-semibold ${severityColor}`}>
                          {formatNumber(availableQty)} {item.product.unit}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Min: </span>
                        <span className="font-semibold">
                          {formatNumber(item.product.minStock)} {item.product.unit}
                        </span>
                      </div>
                      <div>
                        <span className={`text-xs font-medium ${severityColor}`}>
                          {percentage}% of min
                        </span>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/movements/new?productId=${item.product.id}&warehouseId=${item.warehouse.id}&type=IN`}>
                          <TrendingUp className="h-3.5 w-3.5 mr-1" />
                          Restock
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/products/${item.product.id}`}>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* View All Link */}
          {items.length > 5 && (
            <div className="pt-2 text-center">
              <Button asChild variant="link">
                <Link href="/stock?lowStock=true">
                  View all {items.length} low stock items
                </Link>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
