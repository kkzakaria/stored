import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import {
  userRepository,
  warehouseRepository,
  productRepository,
  stockRepository,
  movementRepository,
} from "@/lib/db/repositories";
import { PageHeader } from "@/components/shared/page-header";
import { StatsCards } from "./_components/stats-cards";
import { StockChart } from "./_components/stock-chart";
import { RecentMovements } from "./_components/recent-movements";
import { LowStockAlerts } from "./_components/low-stock-alerts";
import { WarehouseOverview } from "./_components/warehouse-overview";
import { QuickActions } from "./_components/quick-actions";
import {
  getWarehouseKPI,
  getProductKPI,
  getDailyMovementsKPI,
  getTodayDateRange,
  getLastNDaysRange,
  groupMovementsByDate,
} from "@/lib/utils/dashboard";
import { AlertTriangle } from "lucide-react";

export default async function DashboardPage() {
  // Check authentication
  const session = await auth.api.getSession({
    headers: await import("next/headers").then((m) => m.headers()),
  });

  if (!session?.user) {
    redirect("/login");
  }

  // Get current user
  const currentUser = await userRepository.findById(session.user.id);

  if (!currentUser) {
    redirect("/login");
  }

  // Determine accessible warehouses based on role
  const isAdmin = currentUser.role === "ADMINISTRATOR";
  const isVisitorAdmin = currentUser.role === "VISITOR_ADMIN";
  const hasGlobalAccess = isAdmin || isVisitorAdmin;

  // Get warehouses (all for admins, assigned for others)
  let warehouses;
  if (hasGlobalAccess) {
    warehouses = await warehouseRepository.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    });
  } else {
    // Get user's warehouse access
    const userAccess = await warehouseRepository.getUserWarehouses(session.user.id);
    warehouses = userAccess
      .filter((wa) => wa.warehouse.active)
      .map((wa) => wa.warehouse);
  }

  const warehouseIds = warehouses.map((w) => w.id);

  // Get KPI data
  const totalWarehouses = warehouses.length;
  const totalProducts = await productRepository.count({ active: true });

  // Get today's movements count (aggregate from all accessible warehouses)
  const todayRange = getTodayDateRange();
  const todayMovements = await movementRepository.findMany({
    where: {
      createdAt: {
        gte: todayRange.from,
        lte: todayRange.to,
      },
      ...(hasGlobalAccess
        ? {}
        : {
            OR: [
              { fromWarehouseId: { in: warehouseIds } },
              { toWarehouseId: { in: warehouseIds } },
            ],
          }),
    },
  });
  const todayMovementsStats = {
    total: todayMovements.length,
  };

  // Get warehouse statistics
  const warehousesWithStats = await Promise.all(
    warehouses.map(async (warehouse) => {
      const stats = await stockRepository.getWarehouseSummary(warehouse.id);
      return {
        id: warehouse.id,
        name: warehouse.name,
        code: warehouse.code,
        location: warehouse.address,
        active: warehouse.active,
        stats,
      };
    })
  );

  // Get low stock items across accessible warehouses
  const lowStockItemsByWarehouse = await Promise.all(
    warehouseIds.map((id) => stockRepository.getLowStockItems(id))
  );
  const lowStockItems = lowStockItemsByWarehouse.flat();

  // Get recent movements (last 10)
  const recentMovements = await movementRepository.getRecentMovements(10);

  // Filter movements by accessible warehouses if not admin
  const filteredRecentMovements = hasGlobalAccess
    ? recentMovements
    : recentMovements.filter(
        (movement) =>
          (movement.fromWarehouse &&
            warehouseIds.includes(movement.fromWarehouse.id)) ||
          (movement.toWarehouse && warehouseIds.includes(movement.toWarehouse.id))
      );

  // Get movement data for chart (last 7 days)
  const last7Days = getLastNDaysRange(7);
  const allMovements = await movementRepository.findMany({
    where: {
      createdAt: {
        gte: last7Days.from,
        lte: last7Days.to,
      },
      ...(hasGlobalAccess
        ? {}
        : {
            OR: [
              { fromWarehouseId: { in: warehouseIds } },
              { toWarehouseId: { in: warehouseIds } },
            ],
          }),
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const chartData = groupMovementsByDate(allMovements);

  // Prepare KPIs
  const kpis = [
    getWarehouseKPI(totalWarehouses),
    getProductKPI(totalProducts),
    getDailyMovementsKPI(todayMovementsStats.total),
    {
      label: "Low Stock Items",
      value: lowStockItems.length,
      description: "Products below minimum",
      icon: AlertTriangle,
      color:
        lowStockItems.length > 0
          ? "text-orange-600 dark:text-orange-400"
          : "text-green-600 dark:text-green-400",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${currentUser.name || currentUser.email}`}
      />

      {/* KPI Stats Cards */}
      <StatsCards kpis={kpis} />

      {/* Quick Actions */}
      <QuickActions userRole={currentUser.role} />

      {/* Stock Movement Chart */}
      <StockChart data={chartData} />

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Movements */}
        <RecentMovements movements={filteredRecentMovements} />

        {/* Low Stock Alerts */}
        <LowStockAlerts items={lowStockItems.slice(0, 5)} />
      </div>

      {/* Warehouse Overview */}
      <WarehouseOverview warehouses={warehousesWithStats} />
    </div>
  );
}
