"use client";

import { useEffect, useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { Product, Category } from "@prisma/client";
import { toast } from "sonner";
import { ProductForm } from "../../../_components/product-form";
import { CategoryWithChildren } from "../../../_components/category-selector";
import { updateProduct } from "@/lib/actions/product.actions";

interface ProductEditFormProps {
  product: Product & {
    category: Category;
  };
}

export function ProductEditForm({ product }: ProductEditFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryWithChildren[]>([]);

  // Fetch categories when component mounts
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories/tree");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        const flatResponse = await fetch("/api/categories");
        if (flatResponse.ok) {
          const data = await flatResponse.json();
          setCategories(data);
        }
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      toast.error("Erreur", {
        description: "Impossible de charger les catégories",
      });
    }
  };

  const { execute, status } = useAction(updateProduct, {
    onSuccess: ({ data }) => {
      toast.success("Produit mis à jour", {
        description: `Le produit "${data?.product.name}" a été mis à jour avec succès`,
      });
      router.push(`/products/${product.id}`);
    },
    onError: ({ error }) => {
      toast.error("Erreur", {
        description: error.serverError || "Impossible de mettre à jour le produit",
      });
    },
  });

  const isLoading = status === "executing";

  const handleSubmit = (data: {
    sku: string;
    name: string;
    description?: string;
    categoryId: string;
    unit: string;
    minStock: number;
    active: boolean;
  }) => {
    execute({
      id: product.id,
      ...data,
    });
  };

  const handleCancel = () => {
    router.push(`/products/${product.id}`);
  };

  return (
    <ProductForm
      categories={categories}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isLoading={isLoading}
      defaultValues={{
        sku: product.sku,
        name: product.name,
        description: product.description || undefined,
        categoryId: product.categoryId,
        unit: product.unit,
        minStock: product.minStock,
        active: product.active,
      }}
      submitLabel="Enregistrer les modifications"
    />
  );
}
