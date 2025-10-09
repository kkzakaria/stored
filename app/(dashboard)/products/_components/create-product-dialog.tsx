"use client";

import { useState, useEffect } from "react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProductForm } from "./product-form";
import { CategoryWithChildren } from "./category-selector";
import { createProduct } from "@/lib/actions/product.actions";

interface CreateProductDialogProps {
  children: React.ReactNode;
}

export function CreateProductDialog({ children }: CreateProductDialogProps) {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryWithChildren[]>([]);

  // Fetch categories when dialog opens
  useEffect(() => {
    if (open) {
      fetchCategories();
    }
  }, [open]);

  const fetchCategories = async () => {
    try {
      // Fetch category tree from server
      const response = await fetch("/api/categories/tree");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        // Fallback: use flat categories if tree endpoint doesn't exist
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

  const { execute, status } = useAction(createProduct, {
    onSuccess: ({ data }) => {
      toast.success("Produit créé", {
        description: `Le produit "${data?.product.name}" a été créé avec succès`,
      });
      setOpen(false);
    },
    onError: ({ error }) => {
      toast.error("Erreur", {
        description: error.serverError || "Impossible de créer le produit",
      });
    },
  });

  const isLoading = status === "executing";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer un nouveau produit</DialogTitle>
          <DialogDescription>
            Ajoutez un nouveau produit à votre catalogue. Vous pourrez ajouter des variantes et
            des attributs après la création.
          </DialogDescription>
        </DialogHeader>

        <ProductForm
          categories={categories}
          onSubmit={(data) => execute(data)}
          onCancel={() => setOpen(false)}
          isLoading={isLoading}
          submitLabel="Créer le produit"
        />
      </DialogContent>
    </Dialog>
  );
}
