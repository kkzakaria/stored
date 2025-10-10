import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Package, TrendingUp, Users, Pencil, AlertCircle } from "lucide-react";
import { auth } from "@/lib/auth/config";
import { warehouseRepository, userRepository } from "@/lib/db/repositories";
import { canWrite } from "@/lib/auth/permissions";
import { LoadingState } from "@/components/shared/loading-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StockOverview } from "../_components/stock-overview";
import { WarehouseAccessManager } from "../_components/warehouse-access-manager";
import { getWarehouseStatusLabel } from "@/lib/utils/warehouse";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

async function WarehouseDetailContent({ params }: PageProps) {
  const { id } = await params;

  const session = await auth.api.getSession({
    headers: await (async () => {
      const { headers } = await import("next/headers");
      return headers();
    })(),
  });

  // Fetch warehouse with all details
  const warehouse = await warehouseRepository.findWithDetails(id);
  if (!warehouse) {
    notFound();
  }

  // Fetch stats
  const stats = await warehouseRepository.getWarehouseStats(id);

  // Fetch all users for access management
  const allUsers = await userRepository.findMany({ where: { active: true } });

  // Fetch user and check permissions
  let canEdit = false;
  let canManageAccess = false;
  if (session?.user?.id) {
    const user = await userRepository.findById(session.user.id);
    if (user) {
      canEdit = canWrite(user, "warehouses");
      canManageAccess = canWrite(user, "warehouses");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with edit button */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{warehouse.name}</h1>
            <Badge variant={warehouse.active ? "default" : "secondary"}>
              {getWarehouseStatusLabel(warehouse.active)}
            </Badge>
          </div>
          <p className="mt-1 font-mono text-lg text-muted-foreground">{warehouse.code}</p>
        </div>
        {canEdit && (
          <Button asChild>
            <Link href={`/warehouses/${warehouse.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Modifier
            </Link>
          </Button>
        )}
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produits en stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStockItems}</div>
            <p className="text-xs text-muted-foreground">
              Articles différents dans cet entrepôt
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mouvements</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMovements}</div>
            <p className="text-xs text-muted-foreground">Total des mouvements de stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertes stock</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowStockItems}</div>
            <p className="text-xs text-muted-foreground">Produits en stock bas</p>
          </CardContent>
        </Card>
      </div>

      {/* Information card */}
      {warehouse.address && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Adresse
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{warehouse.address}</p>
          </CardContent>
        </Card>
      )}

      {/* Tabs for stock and access */}
      <Tabs defaultValue="stock" className="space-y-4">
        <TabsList>
          <TabsTrigger value="stock" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Stock ({stats.totalStockItems})
          </TabsTrigger>
          {canManageAccess && (
            <TabsTrigger value="access" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Accès ({warehouse.access.length})
            </TabsTrigger>
          )}
          {stats.lowStockItems > 0 && (
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Alertes ({stats.lowStockItems})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="stock" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Produits en stock</CardTitle>
              <CardDescription>
                Liste complète des produits disponibles dans cet entrepôt
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StockOverview stock={warehouse.stock} />
            </CardContent>
          </Card>
        </TabsContent>

        {canManageAccess && (
          <TabsContent value="access" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des accès</CardTitle>
                <CardDescription>
                  Contrôlez qui peut accéder à cet entrepôt et leurs permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WarehouseAccessManager
                  warehouseId={warehouse.id}
                  access={warehouse.access}
                  availableUsers={allUsers}
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {stats.lowStockItems > 0 && (
          <TabsContent value="alerts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Alertes stock bas</CardTitle>
                <CardDescription>
                  Produits dont le niveau de stock est inférieur au minimum recommandé
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StockOverview stock={warehouse.stock} showLowStockOnly />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

export default async function WarehouseDetailPage(props: PageProps) {

  return (
    <div className="container space-y-6 py-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/warehouses" className="hover:text-foreground">
          Entrepôts
        </Link>
        <span>/</span>
        <span>Détails</span>
      </div>

      <Suspense fallback={<LoadingState variant="skeleton" />}>
        <WarehouseDetailContent params={props.params} />
      </Suspense>
    </div>
  );
}
