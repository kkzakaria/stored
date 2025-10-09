import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { productRepository } from "@/lib/db/repositories/product.repository";
import { userRepository } from "@/lib/db/repositories/user.repository";
import { auth } from "@/lib/auth/config";
import { canWrite } from "@/lib/auth/permissions";
import { ProductEditForm } from "./_components/product-edit-form";

interface ProductEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductEditPage({ params }: ProductEditPageProps) {
  const { id } = await params;
  const session = await auth.api.getSession({
    headers: await (async () => {
      const { headers } = await import("next/headers");
      return headers();
    })(),
  });

  // Check authentication and permissions
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await userRepository.findById(session.user.id, {
    warehouses: {
      select: {
        warehouseId: true,
        canWrite: true,
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const canEditProduct = canWrite(user, "products");

  if (!canEditProduct) {
    redirect("/products");
  }

  // Fetch product with category
  const product = await productRepository.findById(id, {
    category: true,
  });

  if (!product) {
    notFound();
  }

  // Type assertion needed because BaseRepository.findById doesn't infer include types
  const productWithCategory = product as typeof product & { category: { id: string; name: string; active: boolean; createdAt: Date; updatedAt: Date; description: string | null; parentId: string | null; } };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href={`/products/${product.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modifier le produit</h1>
          <p className="text-muted-foreground">{productWithCategory.name}</p>
        </div>
      </div>

      {/* Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>Informations du produit</CardTitle>
          <CardDescription>
            Modifiez les informations de base du produit. Le SKU ne peut pas être modifié.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductEditForm product={productWithCategory} />
        </CardContent>
      </Card>
    </div>
  );
}
