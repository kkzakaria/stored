"use client";

import Link from "next/link";
import { Movement, Product, ProductVariant, Warehouse, User } from "@prisma/client";
import { Calendar, Package, User as UserIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils/formatters";
import {
  getMovementTypeIcon,
  getMovementTypeLabel,
  getMovementTypeColor,
  formatMovementDirection,
  getMovementTypeClass,
} from "@/lib/utils/movement";

type MovementWithRelations = Movement & {
  product: Pick<Product, "id" | "sku" | "name" | "unit">;
  variant?: Pick<ProductVariant, "id" | "sku" | "name"> | null;
  fromWarehouse?: Pick<Warehouse, "id" | "code" | "name"> | null;
  toWarehouse?: Pick<Warehouse, "id" | "code" | "name"> | null;
  user: Pick<User, "id" | "name" | "email">;
};

interface MovementCardProps {
  movement: MovementWithRelations;
  showActions?: boolean;
}

export function MovementCard({ movement, showActions = true }: MovementCardProps) {
  const Icon = getMovementTypeIcon(movement.type);
  const typeLabel = getMovementTypeLabel(movement.type);
  const typeColor = getMovementTypeColor(movement.type);
  const typeClass = getMovementTypeClass(movement.type);
  const direction = formatMovementDirection(
    movement.type,
    movement.fromWarehouse,
    movement.toWarehouse
  );

  const productDisplay = movement.variant
    ? `${movement.product.name} - ${movement.variant.name}`
    : movement.product.name;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${typeClass}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-base">
                  {typeLabel}
                </CardTitle>
                <Badge variant={typeColor as "default" | "destructive" | "secondary" | "outline"}>
                  {movement.type}
                </Badge>
              </div>
              <CardDescription className="mt-1">
                {direction}
              </CardDescription>
            </div>
          </div>

          <div className="text-right shrink-0">
            <p className="text-2xl font-bold">
              {movement.quantity}
            </p>
            <p className="text-xs text-muted-foreground">
              {movement.product.unit}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Package className="h-4 w-4 text-muted-foreground shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{productDisplay}</p>
            <p className="text-xs text-muted-foreground font-mono">SKU: {movement.product.sku}</p>
          </div>
        </div>

        {movement.variant && (
          <p className="text-xs text-muted-foreground pl-6">
            Variante: {movement.variant.name} ({movement.variant.sku})
          </p>
        )}

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <UserIcon className="h-4 w-4 shrink-0" />
          <span className="truncate">{movement.user.name}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 shrink-0" />
          <span>{formatDateTime(movement.createdAt)}</span>
        </div>

        {movement.reference && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              Référence: <span className="font-medium">{movement.reference}</span>
            </p>
          </div>
        )}

        {movement.notes && (
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {movement.notes}
            </p>
          </div>
        )}

        {showActions && (
          <div className="pt-3 border-t">
            <Link
              href={`/movements/${movement.id}`}
              className="text-sm font-medium text-primary hover:underline"
            >
              Voir les détails →
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
