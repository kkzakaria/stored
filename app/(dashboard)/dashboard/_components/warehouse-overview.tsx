import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { Building2, Package, AlertTriangle, TrendingUp, ArrowRight } from "lucide-react";
import { formatNumber } from "@/lib/utils/formatters";

interface WarehouseOverviewProps {
  warehouses: Array<{
    id: string;
    name: string;
    code: string;
    location: string | null;
    active: boolean;
    stats: {
      totalItems: number;
      lowStockItems: number;
      totalQuantity: number;
      availableQuantity: number;
    };
  }>;
}

export function WarehouseOverview({ warehouses }: WarehouseOverviewProps) {
  if (warehouses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Warehouse Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Building2}
            title="No warehouses"
            description="No warehouses are available or assigned to you."
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
            <Building2 className="h-5 w-5" />
            Warehouse Overview
          </CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href="/warehouses">
              View All
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {warehouses.map((warehouse) => (
            <Link
              key={warehouse.id}
              href={`/warehouses/${warehouse.id}`}
              className="block"
            >
              <Card className="hover:shadow-md transition-shadow h-full">
                <CardContent className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">
                        {warehouse.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {warehouse.code}
                        </Badge>
                        {!warehouse.active && (
                          <Badge variant="secondary" className="text-xs">
                            Inactive
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                      <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>

                  {/* Location */}
                  {warehouse.location && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 truncate">
                      📍 {warehouse.location}
                    </p>
                  )}

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                    {/* Total Items */}
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 mb-1">
                        <Package className="h-3 w-3" />
                        <span>Items</span>
                      </div>
                      <p className="text-lg font-semibold">
                        {formatNumber(warehouse.stats.totalItems)}
                      </p>
                    </div>

                    {/* Available Quantity */}
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 mb-1">
                        <TrendingUp className="h-3 w-3" />
                        <span>Available</span>
                      </div>
                      <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                        {formatNumber(warehouse.stats.availableQuantity)}
                      </p>
                    </div>

                    {/* Total Quantity */}
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 mb-1">
                        <span>Total Stock</span>
                      </div>
                      <p className="text-sm font-medium">
                        {formatNumber(warehouse.stats.totalQuantity)}
                      </p>
                    </div>

                    {/* Low Stock Alerts */}
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 mb-1">
                        <AlertTriangle className="h-3 w-3" />
                        <span>Low Stock</span>
                      </div>
                      <p
                        className={`text-sm font-medium ${
                          warehouse.stats.lowStockItems > 0
                            ? "text-orange-600 dark:text-orange-400"
                            : "text-green-600 dark:text-green-400"
                        }`}
                      >
                        {warehouse.stats.lowStockItems === 0
                          ? "None"
                          : formatNumber(warehouse.stats.lowStockItems)}
                      </p>
                    </div>
                  </div>

                  {/* Low Stock Warning */}
                  {warehouse.stats.lowStockItems > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400">
                        <AlertTriangle className="h-3 w-3" />
                        <span>
                          {warehouse.stats.lowStockItems} item
                          {warehouse.stats.lowStockItems !== 1 ? "s" : ""} below
                          minimum stock
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
