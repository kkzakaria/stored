"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAction } from "next-safe-action/hooks";
import { Warehouse, Product, ProductVariant } from "@prisma/client";
import { Settings, Loader2, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { createAdjustmentMovement } from "@/lib/actions/movement.actions";
import { getMovementNotesPlaceholder } from "@/lib/utils/movement";

type ProductWithVariants = Product & {
  variants: ProductVariant[];
};

interface AdjustmentFormProps {
  warehouses: Warehouse[];
  products: ProductWithVariants[];
}

export function AdjustmentForm({ warehouses, products }: AdjustmentFormProps) {
  const router = useRouter();
  const [productId, setProductId] = useState("");
  const [variantId, setVariantId] = useState<string | null>(null);
  const [warehouseId, setWarehouseId] = useState("");
  const [adjustmentType, setAdjustmentType] = useState<"increase" | "decrease">("increase");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");

  const selectedProduct = products.find((p) => p.id === productId);
  const hasVariants = selectedProduct && selectedProduct.variants.length > 0;

  const { execute, isExecuting } = useAction(createAdjustmentMovement, {
    onSuccess: ({ data }) => {
      if (data?.movement) {
        toast.success("Ajustement de stock enregistré avec succès");
        router.push("/movements");
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erreur lors de l'enregistrement du mouvement");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!productId || !warehouseId || !quantity || !notes.trim()) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    const qty = parseInt(quantity);
    const finalQuantity = adjustmentType === "increase" ? qty : -qty;

    execute({
      type: "ADJUSTMENT",
      productId,
      variantId: variantId || undefined,
      toWarehouseId: warehouseId,
      quantity: finalQuantity,
      notes: notes.trim(),
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
            <Settings className="h-6 w-6" />
          </div>
          <div>
            <CardTitle>Ajustement d&apos;Inventaire</CardTitle>
            <CardDescription>Correction de stock (réservé aux administrateurs et gestionnaires)</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Alert variant="default" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Les ajustements modifient directement les quantités en stock. Une justification est
            obligatoire pour chaque ajustement.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product selection */}
          <div className="space-y-2">
            <Label htmlFor="product">
              Produit <span className="text-destructive">*</span>
            </Label>
            <Select
              value={productId}
              onValueChange={(value) => {
                setProductId(value);
                setVariantId(null);
              }}
            >
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
              <Select
                value={variantId || "none"}
                onValueChange={(value) => setVariantId(value === "none" ? null : value)}
              >
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
              Entrepôt <span className="text-destructive">*</span>
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

          {/* Adjustment type */}
          <div className="space-y-2">
            <Label>
              Type d&apos;ajustement <span className="text-destructive">*</span>
            </Label>
            <RadioGroup value={adjustmentType} onValueChange={(value) => setAdjustmentType(value as "increase" | "decrease")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="increase" id="increase" />
                <Label htmlFor="increase" className="font-normal cursor-pointer">
                  Augmentation du stock (ajout de quantité)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="decrease" id="decrease" />
                <Label htmlFor="decrease" className="font-normal cursor-pointer">
                  Diminution du stock (retrait de quantité)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity">
              Quantité {adjustmentType === "increase" ? "à ajouter" : "à retirer"}{" "}
              <span className="text-destructive">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="quantity"
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Ex: 10"
                className="flex-1"
              />
              {selectedProduct && (
                <div className="flex items-center px-3 rounded-md border bg-muted text-sm">
                  {selectedProduct.unit}
                </div>
              )}
            </div>
          </div>

          {/* Notes (required for adjustments) */}
          <div className="space-y-2">
            <Label htmlFor="notes">
              Justification <span className="text-destructive">* (obligatoire)</span>
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={getMovementNotesPlaceholder("ADJUSTMENT")}
              rows={4}
              required
            />
            <p className="text-xs text-muted-foreground">
              Expliquez la raison de cet ajustement (ex: inventaire physique, casse, perte, erreur de saisie, etc.)
            </p>
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
            <Button
              type="submit"
              disabled={isExecuting || !notes.trim()}
              className="flex-1"
              variant={adjustmentType === "decrease" ? "destructive" : "default"}
            >
              {isExecuting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer l&apos;ajustement
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
