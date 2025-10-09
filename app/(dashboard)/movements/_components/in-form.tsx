"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAction } from "next-safe-action/hooks";
import { Warehouse, Product, ProductVariant } from "@prisma/client";
import { ArrowDown, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createInMovement } from "@/lib/actions/movement.actions";
import { getMovementNotesPlaceholder } from "@/lib/utils/movement";

type ProductWithVariants = Product & {
  variants: ProductVariant[];
};

interface InFormProps {
  warehouses: Warehouse[];
  products: ProductWithVariants[];
}

export function InForm({ warehouses, products }: InFormProps) {
  const router = useRouter();
  const [productId, setProductId] = useState("");
  const [variantId, setVariantId] = useState<string | null>(null);
  const [warehouseId, setWarehouseId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");

  const selectedProduct = products.find((p) => p.id === productId);
  const hasVariants = selectedProduct && selectedProduct.variants.length > 0;

  const { execute, isExecuting } = useAction(createInMovement, {
    onSuccess: ({ data }) => {
      if (data?.movement) {
        toast.success("Entrée de stock enregistrée avec succès");
        router.push("/movements");
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erreur lors de l'enregistrement du mouvement");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!productId || !warehouseId || !quantity) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    execute({
      type: "IN",
      productId,
      variantId: variantId || undefined,
      toWarehouseId: warehouseId,
      quantity: parseInt(quantity),
      reference: reference || undefined,
      notes: notes || undefined,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
            <ArrowDown className="h-6 w-6" />
          </div>
          <div>
            <CardTitle>Entrée de Stock</CardTitle>
            <CardDescription>Réception de stock dans un entrepôt</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product selection */}
          <div className="space-y-2">
            <Label htmlFor="product">
              Produit <span className="text-destructive">*</span>
            </Label>
            <Select value={productId} onValueChange={(value) => {
              setProductId(value);
              setVariantId(null); // Reset variant when product changes
            }}>
              <SelectTrigger id="product">
                <SelectValue placeholder="Sélectionner un produit" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name} ({product.sku})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Variant selection (conditional) */}
          {hasVariants && (
            <div className="space-y-2">
              <Label htmlFor="variant">Variante</Label>
              <Select value={variantId || "none"} onValueChange={(value) => setVariantId(value === "none" ? null : value)}>
                <SelectTrigger id="variant">
                  <SelectValue placeholder="Sélectionner une variante (optionnel)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune variante</SelectItem>
                  {selectedProduct.variants.map((variant) => (
                    <SelectItem key={variant.id} value={variant.id}>
                      {variant.name} ({variant.sku})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Warehouse selection */}
          <div className="space-y-2">
            <Label htmlFor="warehouse">
              Entrepôt destination <span className="text-destructive">*</span>
            </Label>
            <Select value={warehouseId} onValueChange={setWarehouseId}>
              <SelectTrigger id="warehouse">
                <SelectValue placeholder="Sélectionner un entrepôt" />
              </SelectTrigger>
              <SelectContent>
                {warehouses.map((warehouse) => (
                  <SelectItem key={warehouse.id} value={warehouse.id}>
                    {warehouse.name} ({warehouse.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity">
              Quantité <span className="text-destructive">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="quantity"
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Ex: 100"
                className="flex-1"
              />
              {selectedProduct && (
                <div className="flex items-center px-3 rounded-md border bg-muted text-sm">
                  {selectedProduct.unit}
                </div>
              )}
            </div>
          </div>

          {/* Reference (optional) */}
          <div className="space-y-2">
            <Label htmlFor="reference">Référence (optionnel)</Label>
            <Input
              id="reference"
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Ex: BC-2025-001, Livraison #12345"
            />
          </div>

          {/* Notes (optional) */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={getMovementNotesPlaceholder("IN")}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isExecuting}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isExecuting} className="flex-1">
              {isExecuting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer l&apos;entrée
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
