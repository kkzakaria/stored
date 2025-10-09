import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Package, User, Building2, FileText } from "lucide-react";
import { auth } from "@/lib/auth/config";
import { canRead } from "@/lib/auth/permissions";
import { movementRepository, userRepository } from "@/lib/db/repositories";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDateTime } from "@/lib/utils/formatters";
import {
  getMovementTypeLabel,
  getMovementTypeColor,
  getMovementSummary,
} from "@/lib/utils/movement";

interface MovementDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function MovementDetailPage({ params }: MovementDetailPageProps) {
  const session = await auth.api.getSession({
    headers: await import("next/headers").then((m) => m.headers()),
  });

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch user from database to get role
  const user = await userRepository.findById(session.user.id);
  if (!user) {
    redirect("/login");
  }

  if (!canRead(user, "movements")) {
    redirect("/dashboard");
  }

  const { id } = await params;

  const movement = await movementRepository.findById(id, {
    product: {
      select: {
        id: true,
        sku: true,
        name: true,
        unit: true,
      },
    },
    variant: {
      select: {
        id: true,
        sku: true,
        name: true,
      },
    },
    fromWarehouse: {
      select: {
        id: true,
        code: true,
        name: true,
        address: true,
      },
    },
    toWarehouse: {
      select: {
        id: true,
        code: true,
        name: true,
        address: true,
      },
    },
    user: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
  }) as Awaited<ReturnType<typeof movementRepository.findById>> & {
    product: { id: string; sku: string; name: string; unit: string };
    variant: { id: string; sku: string; name: string } | null;
    fromWarehouse: { id: string; code: string; name: string; address: string | null } | null;
    toWarehouse: { id: string; code: string; name: string; address: string | null } | null;
    user: { id: string; name: string; email: string };
  };

  if (!movement) {
    notFound();
  }

  const typeLabel = getMovementTypeLabel(movement.type);
  const typeColor = getMovementTypeColor(movement.type);
  const summary = getMovementSummary(
    movement.type,
    movement.quantity,
    movement.product.name,
    movement.product.unit,
    movement.fromWarehouse,
    movement.toWarehouse
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Détails du Mouvement"
        description={summary}
        actions={
          <Button variant="outline" asChild>
            <Link href="/movements">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à la liste
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Movement Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informations du Mouvement</CardTitle>
            <CardDescription>Type et quantité</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Type de mouvement</span>
              <Badge variant={typeColor as "default" | "destructive" | "secondary" | "outline"}>
                {typeLabel}
              </Badge>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Quantité</span>
              <div className="text-right">
                <p className="text-2xl font-bold">{movement.quantity}</p>
                <p className="text-xs text-muted-foreground">{movement.product.unit}</p>
              </div>
            </div>

            {movement.reference && (
              <>
                <Separator />
                <div>
                  <span className="text-sm text-muted-foreground">Référence</span>
                  <p className="mt-1 font-mono text-sm">{movement.reference}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Product Information */}
        <Card>
          <CardHeader>
            <CardTitle>Produit</CardTitle>
            <CardDescription>Informations sur le produit concerné</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="flex-1">
                <Link
                  href={`/products/${movement.product.id}`}
                  className="font-medium hover:underline"
                >
                  {movement.product.name}
                </Link>
                <p className="text-sm text-muted-foreground font-mono">SKU: {movement.product.sku}</p>
              </div>
            </div>

            {movement.variant && (
              <>
                <Separator />
                <div>
                  <span className="text-sm text-muted-foreground">Variante</span>
                  <p className="mt-1 font-medium">{movement.variant.name}</p>
                  <p className="text-sm text-muted-foreground font-mono">SKU: {movement.variant.sku}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Warehouse Information */}
        {movement.fromWarehouse && (
          <Card>
            <CardHeader>
              <CardTitle>Entrepôt Source</CardTitle>
              <CardDescription>D&apos;où provient le stock</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex-1">
                  <Link
                    href={`/warehouses/${movement.fromWarehouse.id}`}
                    className="font-medium hover:underline"
                  >
                    {movement.fromWarehouse.name}
                  </Link>
                  <p className="text-sm text-muted-foreground font-mono">
                    {movement.fromWarehouse.code}
                  </p>
                  {movement.fromWarehouse.address && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {movement.fromWarehouse.address}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {movement.toWarehouse && (
          <Card>
            <CardHeader>
              <CardTitle>Entrepôt Destination</CardTitle>
              <CardDescription>Où va le stock</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex-1">
                  <Link
                    href={`/warehouses/${movement.toWarehouse.id}`}
                    className="font-medium hover:underline"
                  >
                    {movement.toWarehouse.name}
                  </Link>
                  <p className="text-sm text-muted-foreground font-mono">
                    {movement.toWarehouse.code}
                  </p>
                  {movement.toWarehouse.address && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {movement.toWarehouse.address}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* User Information */}
        <Card>
          <CardHeader>
            <CardTitle>Créé par</CardTitle>
            <CardDescription>Utilisateur ayant effectué le mouvement</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{movement.user.name}</p>
                <p className="text-sm text-muted-foreground">{movement.user.email}</p>
              </div>
            </div>

            <Separator />

            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{formatDateTime(movement.createdAt)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {movement.notes && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Notes</CardTitle>
              <CardDescription>Informations complémentaires</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <FileText className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-sm whitespace-pre-wrap">{movement.notes}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
