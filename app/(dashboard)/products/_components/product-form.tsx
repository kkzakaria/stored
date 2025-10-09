"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { CategorySelector, CategoryWithChildren } from "./category-selector";
import { createProductSchema, type CreateProductInput } from "@/lib/validations/product.schema";
import { normalizeSKU } from "@/lib/utils/product";

type ProductFormData = CreateProductInput;

interface ProductFormProps {
  categories: CategoryWithChildren[];
  onSubmit: (data: ProductFormData) => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  defaultValues?: Partial<ProductFormData>;
  submitLabel?: string;
}

export function ProductForm({
  categories,
  onSubmit,
  onCancel,
  isLoading = false,
  defaultValues,
  submitLabel = "Créer le produit",
}: ProductFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    // Type assertion needed because Zod's .default() makes fields optional in inferred type
    // but we want them required in the form
    resolver: zodResolver(createProductSchema) as Resolver<ProductFormData>,
    defaultValues: {
      sku: defaultValues?.sku ?? "",
      name: defaultValues?.name ?? "",
      description: defaultValues?.description,
      categoryId: defaultValues?.categoryId ?? "",
      unit: defaultValues?.unit ?? "unité",
      minStock: defaultValues?.minStock ?? 0,
      active: defaultValues?.active ?? true,
    },
  });

  const [selectedCategoryId, setSelectedCategoryId] = useState(defaultValues?.categoryId || "");
  const active = watch("active");

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setValue("categoryId", categoryId, { shouldValidate: true });
  };

  const handleSKUChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const normalized = normalizeSKU(e.target.value);
    setValue("sku", normalized);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* SKU */}
      <div className="space-y-2">
        <Label htmlFor="sku">
          SKU <span className="text-destructive">*</span>
        </Label>
        <Input
          id="sku"
          placeholder="PROD-001"
          {...register("sku")}
          onChange={handleSKUChange}
          disabled={isLoading}
          className={errors.sku ? "border-destructive" : ""}
        />
        {errors.sku && <p className="text-sm text-destructive">{errors.sku.message}</p>}
        <p className="text-xs text-muted-foreground">
          Code unique (lettres majuscules, chiffres et tirets uniquement)
        </p>
      </div>

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Nom <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          placeholder="Nom du produit"
          {...register("name")}
          disabled={isLoading}
          className={errors.name ? "border-destructive" : ""}
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Description du produit (optionnel)"
          rows={3}
          {...register("description")}
          disabled={isLoading}
          className={errors.description ? "border-destructive" : ""}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      {/* Category */}
      <CategorySelector
        categories={categories}
        value={selectedCategoryId}
        onValueChange={handleCategoryChange}
        label="Catégorie"
        required
        error={errors.categoryId?.message}
      />

      {/* Unit */}
      <div className="space-y-2">
        <Label htmlFor="unit">Unité</Label>
        <Input
          id="unit"
          placeholder="unité, pièce, boîte, etc."
          {...register("unit")}
          disabled={isLoading}
          className={errors.unit ? "border-destructive" : ""}
        />
        {errors.unit && <p className="text-sm text-destructive">{errors.unit.message}</p>}
        <p className="text-xs text-muted-foreground">
          Unité de mesure pour le stock (singulier)
        </p>
      </div>

      {/* Min Stock */}
      <div className="space-y-2">
        <Label htmlFor="minStock">Stock minimum</Label>
        <Input
          id="minStock"
          type="number"
          min="0"
          step="1"
          {...register("minStock", { valueAsNumber: true })}
          disabled={isLoading}
          className={errors.minStock ? "border-destructive" : ""}
        />
        {errors.minStock && <p className="text-sm text-destructive">{errors.minStock.message}</p>}
        <p className="text-xs text-muted-foreground">
          Seuil d&apos;alerte de stock bas (0 = pas d&apos;alerte)
        </p>
      </div>

      {/* Active Switch */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label htmlFor="active" className="cursor-pointer">
            Produit actif
          </Label>
          <p className="text-sm text-muted-foreground">
            Les produits inactifs ne sont pas affichés dans les listes
          </p>
        </div>
        <Switch
          id="active"
          checked={active}
          onCheckedChange={(checked) => setValue("active", checked)}
          disabled={isLoading}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Annuler
          </Button>
        )}
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
