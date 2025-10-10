import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { auth } from "@/lib/auth/config";
import { canRead, canWrite } from "@/lib/auth/permissions";
import { movementRepository, warehouseRepository, productRepository, userRepository } from "@/lib/db/repositories";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/shared/loading-state";
import { MovementFilters } from "./_components/movement-filters";
import { MovementList } from "./_components/movement-list";
import Link from "next/link";
import { MovementType, Movement, Product, ProductVariant, Warehouse, User } from "@prisma/client";

type MovementWithRelations = Movement & {
  product: Pick<Product, "id" | "sku" | "name" | "unit">;
  variant?: Pick<ProductVariant, "id" | "sku" | "name"> | null;
  fromWarehouse?: Pick<Warehouse, "id" | "code" | "name"> | null;
  toWarehouse?: Pick<Warehouse, "id" | "code" | "name"> | null;
  user: Pick<User, "id" | "name" | "email">;
};

interface MovementsPageProps {
  searchParams: Promise<{
    page?: string;
    type?: MovementType;
    warehouseId?: string;
    productId?: string;
    dateFrom?: string;
    dateTo?: string;
  }>;
}

export default async function MovementsPage({ searchParams }: MovementsPageProps) {
  const session = await auth.api.getSession({ headers: await import("next/headers").then(m => m.headers()) });

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch user from database to get role
  const user = await userRepository.findById(session.user.id);
  if (!user) {
    redirect("/login");
  }

  // Check if user has permission to view movements
  if (!canRead(user, "movements")) {
    redirect("/dashboard");
  }

  const canCreate = canWrite(user, "movements");

  // Extract search params
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const pageSize = 20;

  // Build filters
  const filters = {
    type: params.type,
    fromWarehouseId: params.warehouseId,
    toWarehouseId: params.warehouseId,
    productId: params.productId,
    dateFrom: params.dateFrom ? new Date(params.dateFrom) : undefined,
    dateTo: params.dateTo ? new Date(params.dateTo) : undefined,
  };

  // Special handling: if warehouseId is set, search in both from and to
  const movementFilters = params.warehouseId
    ? {
        type: params.type,
        productId: params.productId,
        dateFrom: params.dateFrom ? new Date(params.dateFrom) : undefined,
        dateTo: params.dateTo ? new Date(params.dateTo) : undefined,
      }
    : filters;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mouvements de Stock"
        description="Historique complet des mouvements de stock (entrées, sorties, transferts et ajustements)"
        actions={
          canCreate ? (
            <Button asChild>
              <Link href="/movements/new">
                <Plus className="h-4 w-4 mr-2" />
                Nouveau mouvement
              </Link>
            </Button>
          ) : undefined
        }
      />

      <Suspense fallback={<LoadingState variant="skeleton" />}>
        <MovementsContent
          page={page}
          pageSize={pageSize}
          filters={movementFilters}
          warehouseIdFilter={params.warehouseId}
        />
      </Suspense>
    </div>
  );
}

async function MovementsContent({
  page,
  pageSize,
  filters,
  warehouseIdFilter,
}: {
  page: number;
  pageSize: number;
  filters: Parameters<typeof movementRepository.findPaginated>[2];
  warehouseIdFilter?: string;
}) {
  // Fetch data in parallel
  const [paginatedData, warehouses, products] = await Promise.all([
    movementRepository.findPaginated(page, pageSize, filters),
    warehouseRepository.findMany({ where: { active: true } }),
    productRepository.findMany({ where: { active: true } }),
  ]);

  // If warehouseId filter is set, manually filter movements
  let movements: typeof paginatedData.movements = paginatedData.movements;
  if (warehouseIdFilter) {
    movements = movements.filter(
      (m) => m.fromWarehouseId === warehouseIdFilter || m.toWarehouseId === warehouseIdFilter
    );
  }

  return (
    <>
      <MovementFilters
        warehouses={warehouses}
        products={products}
      />

      <MovementList
        movements={movements as unknown as MovementWithRelations[]}
        total={paginatedData.total}
        page={page}
        pageSize={pageSize}
        totalPages={paginatedData.totalPages}
      />
    </>
  );
}
