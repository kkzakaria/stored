"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAction } from "next-safe-action/hooks";
import { Warehouse, Product, ProductVariant } from "@prisma/client";
import { ArrowUp, Loader2, AlertCircle } from "lucide-react";
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
import { createOutMovement } from "@/lib/actions/movement.actions";
import { getMovementNotesPlaceholder } from "@/lib/utils/movement";

type ProductWithVariants = Product & {
  variants: ProductVariant[];
};

interface OutFormProps {
  warehouses: Warehouse[];
  products: ProductWithVariants[];
}

export function OutForm({ warehouses, products }: OutFormProps) {
  const router = useRouter();
  const [productId, setProductId] = useState("");
  const [variantId, setVariantId] = useState<string | null>(null);
  const [warehouseId, setWarehouseId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [availableStock, setAvailableStock] = useState<number | null>(null);
  const [checkingStock, setCheckingStock] = useState(false);

  const selectedProduct = products.find((p) => p.id === productId);
  const hasVariants = selectedProduct && selectedProduct.variants.length > 0;

  // Check available stock when product, variant, or warehouse changes
  useEffect(() => {
    const checkStock = async () => {
      if (!productId || !warehouseId) {
        setAvailableStock(null);
        return;
      }

      setCheckingStock(true);
      try {
        const response = await fetch(
          `/api/stock/available?warehouseId=${warehouseId}&productId=${productId}${variantId ? `&variantId=${variantId}` : ""}`
        );

        if (response.ok) {
          const data = await response.json();
          setAvailableStock(data.available);
        } else {
          setAvailableStock(0);
        }
      } catch (error) {
        console.error("Error checking stock:", error);
        setAvailableStock(null);
      } finally {
        setCheckingStock(false);
      }
    };

    checkStock();
  }, [productId, variantId, warehouseId]);

  const { execute, isExecuting } = useAction(createOutMovement, {
    onSuccess: ({ data }) => {
      if (data?.movement) {
        toast.success("Sortie de stock enregistrée avec succès");
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

    const qty = parseInt(quantity);
    if (availableStock !== null && qty > availableStock) {
      toast.error(`Stock insuffisant. Disponible: ${availableStock}`);
      return;
    }

    execute({
      type: "OUT",
      productId,
      variantId: variantId || undefined,
      fromWarehouseId: warehouseId,
      quantity: qty,
      reference: reference || undefined,
      notes: notes || undefined,
    });
  };

  const quantityNumber = parseInt(quantity) || 0;
  const isQuantityValid = availableStock !== null && quantityNumber <= availableStock;
  const showStockWarning = availableStock !== null && quantityNumber > availableStock;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
            <ArrowUp className="h-6 w-6" />
          </div>
          <div>
            <CardTitle>Sortie de Stock</CardTitle>
            <CardDescription>Sortie de stock d&apos;un entrepôt</CardDescription>
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
              Entrepôt source <span className="text-destructive">*</span>
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

          {/* Available stock indicator */}
          {availableStock !== null && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Stock disponible: <strong>{availableStock} {selectedProduct?.unit}</strong>
              </AlertDescription>
            </Alert>
          )}

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
                placeholder="Ex: 50"
                className="flex-1"
              />
              {selectedProduct && (
                <div className="flex items-center px-3 rounded-md border bg-muted text-sm">
                  {selectedProduct.unit}
                </div>
              )}
            </div>
          </div>

          {/* Stock warning */}
          {showStockWarning && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Stock insuffisant. Vous demandez {quantityNumber} mais seulement {availableStock}{" "}
                disponible.
              </AlertDescription>
            </Alert>
          )}

          {/* Reference (optional) */}
          <div className="space-y-2">
            <Label htmlFor="reference">Référence (optionnel)</Label>
            <Input
              id="reference"
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Ex: CMD-2025-001, Expédition #98765"
            />
          </div>

          {/* Notes (optional) */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={getMovementNotesPlaceholder("OUT")}
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
            <Button
              type="submit"
              disabled={isExecuting || checkingStock || !isQuantityValid}
              className="flex-1"
            >
              {isExecuting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer la sortie
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
