import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Package, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { productRepository } from "@/lib/db/repositories/product.repository";
import { userRepository } from "@/lib/db/repositories/user.repository";
import { auth } from "@/lib/auth/config";
import { canWrite } from "@/lib/auth/permissions";
import { VariantManager } from "../_components/variant-manager";
import { AttributeManager } from "../_components/attribute-manager";
import { StockByWarehouse } from "../_components/stock-by-warehouse";
import {
  getProductStatusLabel,
  calculateTotalStock,
  getStockStatusLabel,
  getStockStatusVariant,
  formatUnit,
} from "@/lib/utils/product";

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const session = await auth.api.getSession({
    headers: await (async () => {
      const { headers } = await import("next/headers");
      return headers();
    })(),
  });

  // Get user permissions
  const user = session?.user?.id
    ? await userRepository.findById(session.user.id, {
        warehouses: {
          select: {
            warehouseId: true,
            canWrite: true,
          },
        },
      })
    : null;

  const canEditProduct = user ? canWrite(user, "products") : false;

  // Fetch product with all details
  const product = await productRepository.findWithDetails(id);

  if (!product) {
    notFound();
  }

  const totalStock = calculateTotalStock(product.stock);
  const stockStatusLabel = getStockStatusLabel(product, totalStock);
  const stockStatusVariant = getStockStatusVariant(product, totalStock);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/products">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
            <p className="text-muted-foreground font-mono">{product.sku}</p>
          </div>
        </div>
        {canEditProduct && (
          <Button asChild>
            <Link href={`/products/${product.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Link>
          </Button>
        )}
      </div>

      {/* Product Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Informations du produit</CardTitle>
            <Badge variant={product.active ? "default" : "secondary"}>
              {getProductStatusLabel(product.active)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Info */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Catégorie</p>
              <div className="flex items-center gap-2 mt-1">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <p className="text-lg">{product.category.name}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Unité</p>
              <p className="text-lg mt-1">{product.unit}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Stock total</p>
              <div className="flex items-center gap-2 mt-1">
                <Package className="h-4 w-4 text-muted-foreground" />
                <p className="text-2xl font-bold">{totalStock}</p>
                <span className="text-muted-foreground">
                  {formatUnit(product.unit, totalStock)}
                </span>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Statut du stock</p>
              <div className="mt-1">
                <Badge variant={stockStatusVariant}>{stockStatusLabel}</Badge>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Stock minimum</p>
              <p className="text-lg mt-1">
                {product.minStock} {product.unit}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Créé par</p>
              <p className="text-lg mt-1">{product.creator.name || product.creator.email}</p>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                <p className="text-base leading-relaxed">{product.description}</p>
              </div>
            </>
          )}

          {/* Timestamps */}
          <Separator />
          <div className="grid gap-4 sm:grid-cols-2 text-sm text-muted-foreground">
            <div>
              <span className="font-medium">Créé le:</span>{" "}
              {new Date(product.createdAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
            <div>
              <span className="font-medium">Modifié le:</span>{" "}
              {new Date(product.updatedAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stock by Warehouse */}
      <Card>
        <CardContent className="pt-6">
          <StockByWarehouse
            stock={product.stock}
            productUnit={product.unit}
            minStock={product.minStock}
          />
        </CardContent>
      </Card>

      {/* Variants */}
      {canEditProduct && (
        <Card>
          <CardContent className="pt-6">
            <VariantManager productId={product.id} variants={product.variants} />
          </CardContent>
        </Card>
      )}

      {/* Attributes */}
      {canEditProduct ? (
        <Card>
          <CardContent className="pt-6">
            <AttributeManager productId={product.id} attributes={product.attributes} />
          </CardContent>
        </Card>
      ) : (
        product.attributes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Attributs</CardTitle>
              <CardDescription>Caractéristiques techniques du produit</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {product.attributes.map((attr) => (
                  <div key={attr.id}>
                    <p className="text-sm font-medium text-muted-foreground">{attr.name}</p>
                    <p className="text-base mt-1">{attr.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
}
