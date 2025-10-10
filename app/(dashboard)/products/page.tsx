import { Suspense } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { productRepository } from "@/lib/db/repositories/product.repository";
import { categoryRepository } from "@/lib/db/repositories/category.repository";
import { userRepository } from "@/lib/db/repositories/user.repository";
import { auth } from "@/lib/auth/config";
import { canWrite } from "@/lib/auth/permissions";
import { ProductList } from "./_components/product-list";
import { ProductFilters } from "./_components/product-filters";
import { CreateProductDialog } from "./_components/create-product-dialog";
import { calculateTotalStock, hasLowStock } from "@/lib/utils/product";

interface ProductsPageProps {
  searchParams: Promise<{
    search?: string;
    categoryId?: string;
    activeOnly?: string;
    lowStockOnly?: string;
  }>;
}

// Force Node.js runtime for Prisma database queries
export const runtime = 'nodejs';

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const session = await auth.api.getSession({
    headers: await (async () => {
      const { headers } = await import("next/headers");
      return headers();
    })(),
  });
  const params = await searchParams;

  // Get user permissions
  const user = session?.user?.id
    ? await userRepository.findById(session.user.id, {
        warehouseAccess: {
          select: {
            warehouseId: true,
            canWrite: true,
          },
        },
      })
    : null;

  const canEditProducts = user ? canWrite(user, "products") : false;

  // Get all active categories for filter
  const categories = await categoryRepository.findMany({ active: true });

  // Build filter conditions
  const search = params.search || "";
  const categoryId = params.categoryId || "";
  const activeOnly = params.activeOnly !== "false";
  const lowStockOnly = params.lowStockOnly === "true";

  // Fetch products based on filters
  let products = await productRepository.findMany({
    where: {
      active: activeOnly ? true : undefined,
      ...(categoryId ? { categoryId } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { sku: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      category: true,
      stock: {
        include: {
          warehouse: true,
        },
      },
      _count: {
        select: {
          variants: true,
          attributes: true,
          stock: true,
        },
      },
    },
  });

  // Filter for low stock if requested (client-side filter since it's a computed value)
  if (lowStockOnly) {
    products = products.filter((product) => {
      // Type assertion needed because BaseRepository.findMany doesn't infer include types
      const productWithStock = product as typeof product & { stock?: Array<unknown> };
      const totalStock = calculateTotalStock((productWithStock.stock as never[]) || []);
      return hasLowStock(product, totalStock);
    });
  }

  // Sort by name
  products.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Produits</h1>
          <p className="text-muted-foreground">
            Gérez vos produits, variantes et attributs
          </p>
        </div>
        {canEditProducts && (
          <CreateProductDialog>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau produit
            </Button>
          </CreateProductDialog>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Filters Sidebar */}
        <aside>
          <Suspense fallback={<div className="rounded-lg border bg-card p-4">Chargement...</div>}>
            <ProductFilters categories={categories} />
          </Suspense>
        </aside>

        {/* Products List */}
        <main>
          <Suspense fallback={<div>Chargement des produits...</div>}>
            <ProductList products={products as never[]} canEdit={canEditProducts} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
