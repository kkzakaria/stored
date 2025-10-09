import { Suspense } from "react";
import { FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ReportTabs } from "./_components/report-tabs";
import { ReportFilters } from "./_components/report-filters";
import { StockReport } from "./_components/stock-report";
import { MovementReport } from "./_components/movement-report";
import { WarehouseReport } from "./_components/warehouse-report";
import { LowStockReport } from "./_components/low-stock-report";
import { stockRepository } from "@/lib/db/repositories/stock.repository";
import { movementRepository, MovementFilters } from "@/lib/db/repositories/movement.repository";
import { warehouseRepository } from "@/lib/db/repositories/warehouse.repository";
import { categoryRepository } from "@/lib/db/repositories/category.repository";
import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { hasPermission } from "@/lib/auth/permissions";
import { UserRole } from "@prisma/client";

interface ReportsPageProps {
  searchParams: Promise<{
    tab?: string;
    warehouseId?: string;
    categoryId?: string;
    movementType?: string;
    dateFrom?: string;
    dateTo?: string;
  }>;
}

async function ReportsContent({
  searchParams,
}: {
  searchParams: {
    tab?: string;
    warehouseId?: string;
    categoryId?: string;
    movementType?: string;
    dateFrom?: string;
    dateTo?: string;
  };
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  const user = session.user as unknown as {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  };

  // Check permissions - all roles can view reports
  const canViewReports = hasPermission(
    { ...user, active: true },
    "reports:read"
  );
  if (!canViewReports) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-lg font-medium">Accès refusé</p>
          <p className="text-sm text-muted-foreground mt-2">
            Vous n&apos;avez pas la permission de consulter les rapports.
          </p>
        </div>
      </div>
    );
  }

  // Get user's accessible warehouses
  const userWarehouses =
    user.role === UserRole.ADMINISTRATOR || user.role === UserRole.VISITOR_ADMIN
      ? await warehouseRepository.findMany()
      : await warehouseRepository.findAllByUser(user.id);

  const warehouseIds = userWarehouses.map((w: { id: string }) => w.id);

  // Apply warehouse filter from URL
  const selectedWarehouseId = searchParams.warehouseId || "";
  const effectiveWarehouseIds =
    selectedWarehouseId && warehouseIds.includes(selectedWarehouseId)
      ? [selectedWarehouseId]
      : warehouseIds;

  // Get all categories for filter
  const categories = await categoryRepository.findMany();

  // Fetch stock data
  const allStocks = await Promise.all(
    effectiveWarehouseIds.map((warehouseId: string) =>
      stockRepository.findByWarehouse(warehouseId)
    )
  );
  const stocks = allStocks.flat();

  // Apply category filter if specified - Note: category filtering would need product.categoryId
  // Since findByWarehouse doesn't include categoryId, we skip this filter for now
  const filteredStocks = stocks;

  // Fetch movement data with filters
  const movementFilters: MovementFilters = {};

  if (effectiveWarehouseIds.length > 0) {
    // For movements, we need to check both from and to warehouses
    // This is handled in the repository by OR condition
    movementFilters.fromWarehouseId = effectiveWarehouseIds[0];
  }

  if (searchParams.movementType) {
    movementFilters.type = searchParams.movementType as "IN" | "OUT" | "TRANSFER" | "ADJUSTMENT";
  }

  if (searchParams.dateFrom) {
    movementFilters.dateFrom = new Date(searchParams.dateFrom);
  }

  if (searchParams.dateTo) {
    movementFilters.dateTo = new Date(searchParams.dateTo);
  }

  // Fetch movements - we'll filter by accessible warehouses
  const allMovements = await movementRepository.findByFilters(movementFilters, 1000);

  // Filter movements to only include those in accessible warehouses
  const movements = allMovements.filter(
    (movement) =>
      (movement.fromWarehouseId && effectiveWarehouseIds.includes(movement.fromWarehouseId)) ||
      (movement.toWarehouseId && effectiveWarehouseIds.includes(movement.toWarehouseId))
  );

  // Get low stock items
  const lowStockItems = await stockRepository.getLowStockItems();

  // Filter low stock items by accessible warehouses
  const filteredLowStockItems = lowStockItems.filter((item) =>
    effectiveWarehouseIds.includes(item.warehouseId)
  );

  // Get warehouse stats
  const warehousesWithStats = await Promise.all(
    userWarehouses
      .filter((w: { id: string }) => !selectedWarehouseId || w.id === selectedWarehouseId)
      .map(async (warehouse) => {
        const stats = await stockRepository.getWarehouseSummary(warehouse.id);
        const movementStats = await movementRepository.getMovementStats(
          warehouse.id,
          movementFilters.dateFrom,
          movementFilters.dateTo
        );

        return {
          id: warehouse.id,
          name: warehouse.name,
          code: warehouse.code,
          location: warehouse.address,
          active: warehouse.active,
          stats: {
            totalItems: stats.totalItems,
            totalQuantity: stats.totalQuantity,
            reservedQuantity: stats.totalReserved,
            availableQuantity: stats.availableQuantity,
            lowStockItems: stats.lowStockItems,
          },
          movements: {
            totalQuantityIn: movementStats.totalQuantityIn,
            totalQuantityOut: movementStats.totalQuantityOut,
          },
        };
      })
  );

  return (
    <div className="space-y-6">
      {/* Filters */}
      <ReportFilters
        warehouses={userWarehouses}
        categories={categories}
        showWarehouseFilter={true}
        showCategoryFilter={true}
        showDateFilter={true}
        showMovementTypeFilter={true}
      />

      {/* Report Tabs */}
      <ReportTabs
        stockReport={<StockReport data={filteredStocks as unknown as Parameters<typeof StockReport>[0]["data"]} />}
        movementReport={<MovementReport data={movements} />}
        warehouseReport={<WarehouseReport data={warehousesWithStats} />}
        lowStockReport={<LowStockReport data={filteredLowStockItems} />}
      />
    </div>
  );
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const resolvedParams = await searchParams;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
            <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Rapports</h1>
            <p className="text-muted-foreground">
              Consultez et exportez vos rapports de stock, mouvements et entrepôts
            </p>
          </div>
        </div>
      </div>

      {/* Reports Content */}
      <Suspense
        fallback={
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        }
      >
        <ReportsContent searchParams={resolvedParams} />
      </Suspense>
    </div>
  );
}
