import { Card, CardContent } from "@/components/ui/card";
import { DashboardKPI } from "@/lib/utils/dashboard";
import { ArrowDown, ArrowUp } from "lucide-react";

interface StatsCardsProps {
  kpis: DashboardKPI[];
}

export function StatsCards({ kpis }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;

        return (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {kpi.label}
                  </p>
                  <h3 className="text-3xl font-bold mt-2 text-gray-900 dark:text-gray-100">
                    {kpi.value}
                  </h3>
                  {kpi.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {kpi.description}
                    </p>
                  )}

                  {kpi.trend && (
                    <div className="flex items-center gap-1 mt-3">
                      {kpi.trend.isPositive ? (
                        <ArrowUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowDown className="h-4 w-4 text-red-600" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          kpi.trend.isPositive
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {Math.abs(kpi.trend.value).toFixed(1)}%
                      </span>
                      <span className="text-xs text-gray-500">vs last period</span>
                    </div>
                  )}
                </div>

                <div
                  className={`p-3 rounded-lg ${kpi.color.replace(
                    "text-",
                    "bg-"
                  ).replace("600", "100")} dark:${kpi.color.replace(
                    "text-",
                    "bg-"
                  ).replace("400", "900")}`}
                >
                  <Icon className={`h-6 w-6 ${kpi.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
