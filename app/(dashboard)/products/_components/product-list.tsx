"use client";

import { Product, Category, Stock, Warehouse } from "@prisma/client";
import { ProductCard } from "./product-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Package } from "lucide-react";

interface ProductListProps {
  products: (Product & {
    category: Category;
    stock?: (Stock & { warehouse: Warehouse })[];
    _count?: {
      variants: number;
      attributes: number;
      stock: number;
    };
  })[];
  canEdit?: boolean;
}

export function ProductList({ products, canEdit = false }: ProductListProps) {
  if (products.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="Aucun produit trouvé"
        description="Aucun produit ne correspond à vos critères de recherche."
      />
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} canEdit={canEdit} />
      ))}
    </div>
  );
}
