import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, ArrowUpCircle, ArrowDownCircle, ArrowRightLeft, Settings } from "lucide-react";
import { formatDateTime, formatNumber } from "@/lib/utils/formatters";
import { ExportButton } from "./export-button";
import {
  formatMovementReportForExport,
  MOVEMENT_REPORT_HEADERS,
} from "@/lib/utils/report";
import { EmptyState } from "@/components/shared/empty-state";

interface MovementReportProps {
  data: Array<{
    id: string;
    type: "IN" | "OUT" | "TRANSFER" | "ADJUSTMENT";
    quantity: number;
    reference: string | null;
    createdAt: Date;
    product: {
      id: string;
      sku: string;
      name: string;
      unit: string;
    };
    variant: {
      id: string;
      sku: string;
      name: string;
    } | null;
    fromWarehouse: {
      id: string;
      code: string;
      name: string;
    } | null;
    toWarehouse: {
      id: string;
      code: string;
      name: string;
    } | null;
    user: {
      id: string;
      name: string | null;
      email: string;
    };
  }>;
}

export function MovementReport({ data }: MovementReportProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Rapport des Mouvements
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={TrendingUp}
            title="Aucun mouvement"
            description="Aucun mouvement ne correspond aux filtres sélectionnés."
          />
        </CardContent>
      </Card>
    );
  }

  // Calculate stats by type
  const statsByType = data.reduce(
    (acc, movement) => {
      acc[movement.type] = {
        count: (acc[movement.type]?.count || 0) + 1,
        quantity: (acc[movement.type]?.quantity || 0) + movement.quantity,
      };
      return acc;
    },
    {} as Record<string, { count: number; quantity: number }>
  );

  // Prepare export data
  const exportData = formatMovementReportForExport(data);

  // Get movement icon and color
  const getMovementDisplay = (type: string) => {
    switch (type) {
      case "IN":
        return {
          icon: ArrowUpCircle,
          color: "text-green-600 dark:text-green-400",
          bgColor: "bg-green-100 dark:bg-green-900/20",
          label: "Entrée",
        };
      case "OUT":
        return {
          icon: ArrowDownCircle,
          color: "text-red-600 dark:text-red-400",
          bgColor: "bg-red-100 dark:bg-red-900/20",
          label: "Sortie",
        };
      case "TRANSFER":
        return {
          icon: ArrowRightLeft,
          color: "text-blue-600 dark:text-blue-400",
          bgColor: "bg-blue-100 dark:bg-blue-900/20",
          label: "Transfert",
        };
      case "ADJUSTMENT":
        return {
          icon: Settings,
          color: "text-purple-600 dark:text-purple-400",
          bgColor: "bg-purple-100 dark:bg-purple-900/20",
          label: "Ajustement",
        };
      default:
        return {
          icon: TrendingUp,
          color: "text-gray-600 dark:text-gray-400",
          bgColor: "bg-gray-100 dark:bg-gray-900/20",
          label: type,
        };
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Rapport des Mouvements
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {data.length} mouvement{data.length > 1 ? "s" : ""} enregistré{data.length > 1 ? "s" : ""}
            </p>
          </div>
          <ExportButton
            data={exportData}
            headers={MOVEMENT_REPORT_HEADERS}
            filename={`rapport-mouvements-${new Date().toISOString().split("T")[0]}`}
            sheetName="Mouvements"
          />
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="rounded-lg border p-4 bg-green-50 dark:bg-green-950/20">
            <div className="flex items-center gap-2 mb-1">
              <ArrowUpCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <p className="text-xs font-medium text-green-900 dark:text-green-100">
                Entrées
              </p>
            </div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {statsByType.IN?.count || 0}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatNumber(statsByType.IN?.quantity || 0)} unités
            </p>
          </div>

          <div className="rounded-lg border p-4 bg-red-50 dark:bg-red-950/20">
            <div className="flex items-center gap-2 mb-1">
              <ArrowDownCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <p className="text-xs font-medium text-red-900 dark:text-red-100">
                Sorties
              </p>
            </div>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {statsByType.OUT?.count || 0}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatNumber(statsByType.OUT?.quantity || 0)} unités
            </p>
          </div>

          <div className="rounded-lg border p-4 bg-blue-50 dark:bg-blue-950/20">
            <div className="flex items-center gap-2 mb-1">
              <ArrowRightLeft className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <p className="text-xs font-medium text-blue-900 dark:text-blue-100">
                Transferts
              </p>
            </div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {statsByType.TRANSFER?.count || 0}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatNumber(statsByType.TRANSFER?.quantity || 0)} unités
            </p>
          </div>

          <div className="rounded-lg border p-4 bg-purple-50 dark:bg-purple-950/20">
            <div className="flex items-center gap-2 mb-1">
              <Settings className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <p className="text-xs font-medium text-purple-900 dark:text-purple-100">
                Ajustements
              </p>
            </div>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {statsByType.ADJUSTMENT?.count || 0}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatNumber(statsByType.ADJUSTMENT?.quantity || 0)} unités
            </p>
          </div>
        </div>

        {/* Movements Table */}
        <div className="rounded-md border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-12 px-4 text-left align-middle font-medium text-xs">
                    Date
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-xs">
                    Type
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
                  <th className="h-12 px-4 text-left align-middle font-medium text-xs">
                    Depuis
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-xs">
                    Vers
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-xs">
                    Utilisateur
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-xs">
                    Référence
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((movement) => {
                  const display = getMovementDisplay(movement.type);
                  const Icon = display.icon;

                  return (
                    <tr key={movement.id} className="border-b">
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {formatDateTime(movement.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded ${display.bgColor}`}>
                            <Icon className={`h-3.5 w-3.5 ${display.color}`} />
                          </div>
                          <span className="text-sm font-medium">{display.label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium">{movement.product.name}</div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {movement.product.sku}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {movement.variant?.name || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium">
                        {formatNumber(movement.quantity)} {movement.product.unit}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {movement.fromWarehouse ? (
                          <div>
                            <div className="font-medium">{movement.fromWarehouse.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {movement.fromWarehouse.code}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {movement.toWarehouse ? (
                          <div>
                            <div className="font-medium">{movement.toWarehouse.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {movement.toWarehouse.code}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium">
                          {movement.user.name || movement.user.email}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground font-mono">
                        {movement.reference || "—"}
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
