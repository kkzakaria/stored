"use client";

import { MovementType } from "@prisma/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  getMovementTypeIcon,
  getMovementTypeLabel,
  getMovementTypeDescription,
  canCreateMovementType,
} from "@/lib/utils/movement";

interface MovementTypeSelectorProps {
  selectedType: MovementType | null;
  onSelectType: (type: MovementType) => void;
  userRole: string;
}

export function MovementTypeSelector({
  selectedType,
  onSelectType,
  userRole,
}: MovementTypeSelectorProps) {
  const movementTypes: MovementType[] = ["IN", "OUT", "TRANSFER", "ADJUSTMENT"];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {movementTypes.map((type) => {
        const Icon = getMovementTypeIcon(type);
        const label = getMovementTypeLabel(type);
        const description = getMovementTypeDescription(type);
        const canCreate = canCreateMovementType(type, userRole);
        const isSelected = selectedType === type;

        return (
          <Card
            key={type}
            className={cn(
              "cursor-pointer transition-all hover:shadow-lg",
              isSelected && "ring-2 ring-primary shadow-lg",
              !canCreate && "opacity-50 cursor-not-allowed"
            )}
            onClick={() => canCreate && onSelectType(type)}
          >
            <CardHeader className="pb-3">
              <div
                className={cn(
                  "mb-3 flex h-12 w-12 items-center justify-center rounded-lg",
                  type === "IN" && "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
                  type === "OUT" && "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
                  type === "TRANSFER" && "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
                  type === "ADJUSTMENT" && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                )}
              >
                <Icon className="h-6 w-6" />
              </div>
              <CardTitle className="text-lg">{label}</CardTitle>
              <CardDescription className="text-sm">{description}</CardDescription>
            </CardHeader>

            {!canCreate && (
              <CardContent className="pt-0">
                <p className="text-xs text-destructive font-medium">
                  Réservé aux administrateurs et gestionnaires
                </p>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
