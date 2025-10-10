import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth/config";
import { warehouseRepository, userRepository } from "@/lib/db/repositories";
import { canWrite } from "@/lib/auth/permissions";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { WarehouseEditForm } from "./_components/warehouse-edit-form";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

// Force Node.js runtime for Prisma database queries
export const runtime = 'nodejs';

async function WarehouseEditContent({ params }: PageProps) {
  const { id } = await params;

  const session = await auth.api.getSession({
    headers: await (async () => {
      const { headers } = await import("next/headers");
      return headers();
    })(),
  });

  // Fetch user and check permissions
  if (session?.user?.id) {
    const user = await userRepository.findById(session.user.id);
    if (!user || !canWrite(user, "warehouses")) {
      redirect("/warehouses");
    }
  } else {
    redirect("/warehouses");
  }

  // Fetch warehouse
  const warehouse = await warehouseRepository.findById(id);
  if (!warehouse) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <WarehouseEditForm warehouse={warehouse} />
    </div>
  );
}

export default async function WarehouseEditPage(props: PageProps) {
  const { id } = await props.params;

  return (
    <div className="container space-y-6 py-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/warehouses" className="hover:text-foreground">
          Entrepôts
        </Link>
        <span>/</span>
        <Link href={`/warehouses/${id}`} className="hover:text-foreground">
          Détails
        </Link>
        <span>/</span>
        <span>Modifier</span>
      </div>

      <PageHeader title="Modifier l'entrepôt" description="Mettez à jour les informations de l'entrepôt" />

      <Suspense fallback={<LoadingState variant="skeleton" />}>
        <WarehouseEditContent params={props.params} />
      </Suspense>
    </div>
  );
}
