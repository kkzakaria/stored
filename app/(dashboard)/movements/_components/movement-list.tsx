"use client";

import { Movement, Product, ProductVariant, Warehouse, User } from "@prisma/client";
import { EmptyState } from "@/components/shared/empty-state";
import { MovementCard } from "./movement-card";
import { ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";

type MovementWithRelations = Movement & {
  product: Pick<Product, "id" | "sku" | "name" | "unit">;
  variant?: Pick<ProductVariant, "id" | "sku" | "name"> | null;
  fromWarehouse?: Pick<Warehouse, "id" | "code" | "name"> | null;
  toWarehouse?: Pick<Warehouse, "id" | "code" | "name"> | null;
  user: Pick<User, "id" | "name" | "email">;
};

interface MovementListProps {
  movements: MovementWithRelations[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function MovementList({ movements, total, page, totalPages }: MovementListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/movements?${params.toString()}`);
  };

  if (movements.length === 0) {
    return (
      <EmptyState
        icon={ArrowLeftRight}
        title="Aucun mouvement trouvé"
        description="Il n'y a pas encore de mouvements de stock enregistrés, ou aucun ne correspond aux filtres appliqués."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {total} mouvement{total > 1 ? "s" : ""} au total
          {totalPages > 1 && ` • Page ${page} sur ${totalPages}`}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {movements.map((movement) => (
          <MovementCard key={movement.id} movement={movement} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
          >
            Précédent
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum: number;

              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
          >
            Suivant
          </Button>
        </div>
      )}
    </div>
  );
}
