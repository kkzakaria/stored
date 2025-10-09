import Link from "next/link";
import { TrendingUp, Package, Building2, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { getMovementTypeIcon, getMovementTypeColor, getMovementTypeLabel } from "@/lib/utils/movement";
import { formatDate, formatNumber } from "@/lib/utils/formatters";

interface UserMovementsHistoryProps {
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
  }>;
  limit?: number;
}

export function UserMovementsHistory({ movements, limit = 10 }: UserMovementsHistoryProps) {
  const displayMovements = limit ? movements.slice(0, limit) : movements;

  if (movements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Movement History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={TrendingUp}
            title="No movements yet"
            description="This user has not created any stock movements."
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
            <TrendingUp className="h-5 w-5" />
            Movement History
          </CardTitle>
          <Badge variant="secondary">{movements.length} total</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayMovements.map((movement) => {
            const Icon = getMovementTypeIcon(movement.type);
            const color = getMovementTypeColor(movement.type);
            const label = getMovementTypeLabel(movement.type);

            return (
              <div
                key={movement.id}
                className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {/* Movement Type Icon */}
                <div className={`p-2 rounded-lg ${color.replace("text-", "bg-").replace("600", "100")} dark:${color.replace("text-", "bg-").replace("600", "900")}`}>
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
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/movements/${movement.id}`}>View</Link>
                    </Button>
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

                  {/* Date */}
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <Calendar className="h-3 w-3 flex-shrink-0" />
                    <span>{formatDate(movement.createdAt)}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Show All Link */}
          {limit && movements.length > limit && (
            <div className="pt-2 text-center">
              <Button asChild variant="link">
                <Link href={`/movements?userId=${movements[0].id}`}>
                  View all {movements.length} movements
                </Link>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
