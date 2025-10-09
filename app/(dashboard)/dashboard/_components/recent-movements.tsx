import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { Clock, Package, Building2, ArrowRight } from "lucide-react";
import {
  getMovementTypeIcon,
  getMovementTypeColor,
  getMovementTypeLabel,
} from "@/lib/utils/movement";
import { formatDate, formatNumber } from "@/lib/utils/formatters";

interface RecentMovementsProps {
  movements: Array<{
    id: string;
    type: "IN" | "OUT" | "TRANSFER" | "ADJUSTMENT";
    quantity: number;
    createdAt: Date;
    product: {
      id: string;
      name: string;
      sku: string;
    };
    variant: {
      name: string;
    } | null;
    fromWarehouse: {
      id: string;
      name: string;
      code: string;
    } | null;
    toWarehouse: {
      id: string;
      name: string;
      code: string;
    } | null;
    user: {
      id: string;
      name: string | null;
      email: string;
    };
  }>;
}

export function RecentMovements({ movements }: RecentMovementsProps) {
  if (movements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Movements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Clock}
            title="No recent movements"
            description="Stock movements will appear here when created."
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
            <Clock className="h-5 w-5" />
            Recent Movements
          </CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href="/movements">
              View All
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {movements.map((movement) => {
            const Icon = getMovementTypeIcon(movement.type);
            const color = getMovementTypeColor(movement.type);
            const label = getMovementTypeLabel(movement.type);

            return (
              <Link
                key={movement.id}
                href={`/movements/${movement.id}`}
                className="block"
              >
                <div className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  {/* Movement Type Icon */}
                  <div
                    className={`p-2 rounded-lg ${color
                      .replace("text-", "bg-")
                      .replace("600", "100")} dark:${color
                      .replace("text-", "bg-")
                      .replace("600", "900")}`}
                  >
                    <Icon className={`h-4 w-4 ${color}`} />
                  </div>

                  {/* Movement Details */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={color}>
                          {label}
                        </Badge>
                        <span className="font-medium text-sm">
                          {formatNumber(movement.quantity)} units
                        </span>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                      <Package className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate">
                        {movement.product.name}
                        {movement.variant && ` - ${movement.variant.name}`}
                      </span>
                    </div>

                    {/* Warehouse Info */}
                    <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                      <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate">
                        {movement.type === "TRANSFER" ? (
                          <>
                            {movement.fromWarehouse?.name} → {movement.toWarehouse?.name}
                          </>
                        ) : movement.type === "IN" || movement.type === "ADJUSTMENT" ? (
                          movement.toWarehouse?.name
                        ) : (
                          movement.fromWarehouse?.name
                        )}
                      </span>
                    </div>

                    {/* Date & User */}
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span>{formatDate(movement.createdAt)}</span>
                      <span>•</span>
                      <span>{movement.user.name || movement.user.email}</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
