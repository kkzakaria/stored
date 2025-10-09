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

  // Build filter conditions
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

  // Fetch warehouses with stats
  const warehouses = await warehouseRepository.findMany(where, {
    _count: {
      select: {
        stock: true,
        movementsFrom: true,
        movementsTo: true,
      },
    },
  });

  // Fetch detailed stats for each warehouse
  const warehouseStatsMap = new Map();
  await Promise.all(
    warehouses.map(async (warehouse) => {
      const stats = await warehouseRepository.getWarehouseStats(warehouse.id);
      warehouseStatsMap.set(warehouse.id, stats);
    })
  );

  // Fetch user from database
  let canEdit = false;
  if (session?.user?.id) {
    const user = await userRepository.findById(session.user.id);
    if (user) {
      canEdit = canWrite(user, "warehouses");
    }
  }

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
