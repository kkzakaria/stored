import { Suspense } from "react";
import { auth } from "@/lib/auth/config";
import { warehouseRepository, userRepository } from "@/lib/db/repositories";
import { canWrite } from "@/lib/auth/permissions";
import { LoadingState } from "@/components/shared/loading-state";
import { WarehouseList } from "./_components/warehouse-list";
import { WarehouseFilters } from "./_components/warehouse-filters";
import { CreateWarehouseDialog } from "./_components/create-warehouse-dialog";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    activeOnly?: string;
  }>;
}

async function WarehousesContent({ searchParams }: PageProps) {
  const session = await auth.api.getSession({
    headers: await (async () => {
      const { headers } = await import("next/headers");
      return headers();
    })(),
  });

  const params = await searchParams;
  const search = params.search || "";
  const activeOnly = params.activeOnly !== "false";

  // Get current user with warehouse access
  const currentUser = session?.user?.id
    ? await userRepository.findById(session.user.id)
    : null;

  // Determine accessible warehouses based on role
  const isAdmin = currentUser?.role === "ADMINISTRATOR";
  const isVisitorAdmin = currentUser?.role === "VISITOR_ADMIN";
  const hasGlobalAccess = isAdmin || isVisitorAdmin;

  // Get warehouses (all for admins, assigned for others)
  let warehouses: Awaited<ReturnType<typeof warehouseRepository.findMany>>;
  if (hasGlobalAccess) {
    // Build filter conditions for global access
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
      ];
    }

    if (activeOnly) {
      where.active = true;
    }

    warehouses = await warehouseRepository.findMany({
      where,
      include: {
        _count: {
          select: {
            stock: true,
            movementsFrom: true,
            movementsTo: true,
          },
        },
      },
    });
  } else if (currentUser) {
    // Get user's warehouse access
    const userAccess = await warehouseRepository.getUserWarehouses(currentUser.id);
    const accessibleWarehouseIds = userAccess.map(wa => wa.warehouseId);

    // Build filter conditions for limited access
    const where: Record<string, unknown> = {
      id: { in: accessibleWarehouseIds },
    };

    if (search) {
      where.AND = [
        {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { code: { contains: search, mode: "insensitive" } },
          ],
        },
      ];
    }

    if (activeOnly) {
      where.active = true;
    }

    warehouses = await warehouseRepository.findMany({
      where,
      include: {
        _count: {
          select: {
            stock: true,
            movementsFrom: true,
            movementsTo: true,
          },
        },
      },
    });
  } else {
    warehouses = [];
  }

  // Fetch detailed stats for each warehouse
  const warehouseStatsMap = new Map();
  await Promise.all(
    warehouses.map(async (warehouse) => {
      const stats = await warehouseRepository.getWarehouseStats(warehouse.id);
      warehouseStatsMap.set(warehouse.id, stats);
    })
  );

  // Check if user can edit
  const canEdit = currentUser ? canWrite(currentUser, "warehouses") : false;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex-1">
          <WarehouseFilters />
        </div>
        {canEdit && (
          <div className="shrink-0">
            <CreateWarehouseDialog />
          </div>
        )}
      </div>

      <WarehouseList warehouses={warehouses} warehouseStats={warehouseStatsMap} canEdit={canEdit} />
    </div>
  );
}

export default async function WarehousesPage(props: PageProps) {
  return (
    <div className="container space-y-6 py-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Entrepôts</h1>
        <p className="text-muted-foreground">Gérez vos entrepôts et leurs stocks</p>
      </div>

      <Suspense fallback={<LoadingState variant="skeleton" />}>
        <WarehousesContent searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}
