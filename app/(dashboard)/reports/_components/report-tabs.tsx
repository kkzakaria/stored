"use client";

import { useQueryState, parseAsString } from "nuqs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Package, TrendingUp, AlertTriangle } from "lucide-react";

interface ReportTabsProps {
  stockReport: React.ReactNode;
  movementReport: React.ReactNode;
  warehouseReport: React.ReactNode;
  lowStockReport: React.ReactNode;
}

export function ReportTabs({
  stockReport,
  movementReport,
  warehouseReport,
  lowStockReport,
}: ReportTabsProps) {
  const [activeTab, setActiveTab] = useQueryState(
    "tab",
    parseAsString.withDefault("stock").withOptions({ shallow: false })
  );

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto">
        <TabsTrigger value="stock" className="flex items-center gap-2 py-2">
          <Package className="h-4 w-4" />
          <span className="hidden sm:inline">Stock</span>
        </TabsTrigger>
        <TabsTrigger value="movements" className="flex items-center gap-2 py-2">
          <TrendingUp className="h-4 w-4" />
          <span className="hidden sm:inline">Mouvements</span>
        </TabsTrigger>
        <TabsTrigger value="warehouses" className="flex items-center gap-2 py-2">
          <Building2 className="h-4 w-4" />
          <span className="hidden sm:inline">Entrepôts</span>
        </TabsTrigger>
        <TabsTrigger value="alerts" className="flex items-center gap-2 py-2">
          <AlertTriangle className="h-4 w-4" />
          <span className="hidden sm:inline">Alertes</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="stock" className="mt-6">
        {stockReport}
      </TabsContent>

      <TabsContent value="movements" className="mt-6">
        {movementReport}
      </TabsContent>

      <TabsContent value="warehouses" className="mt-6">
        {warehouseReport}
      </TabsContent>

      <TabsContent value="alerts" className="mt-6">
        {lowStockReport}
      </TabsContent>
    </Tabs>
  );
}
