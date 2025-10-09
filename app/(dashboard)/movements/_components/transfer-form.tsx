"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAction } from "next-safe-action/hooks";
import { Warehouse, Product, ProductVariant } from "@prisma/client";
import { ArrowLeftRight, Loader2, AlertCircle } from "lucide-react";
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
import { createTransferMovement } from "@/lib/actions/movement.actions";
import { getMovementNotesPlaceholder } from "@/lib/utils/movement";

type ProductWithVariants = Product & {
  variants: ProductVariant[];
};

interface TransferFormProps {
  warehouses: Warehouse[];
  products: ProductWithVariants[];
}

export function TransferForm({ warehouses, products }: TransferFormProps) {
  const router = useRouter();
  const [productId, setProductId] = useState("");
  const [variantId, setVariantId] = useState<string | null>(null);
  const [fromWarehouseId, setFromWarehouseId] = useState("");
  const [toWarehouseId, setToWarehouseId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [availableStock, setAvailableStock] = useState<number | null>(null);
  const [checkingStock, setCheckingStock] = useState(false);

  const selectedProduct = products.find((p) => p.id === productId);
  const hasVariants = selectedProduct && selectedProduct.variants.length > 0;

  // Check available stock in source warehouse
  useEffect(() => {
    const checkStock = async () => {
      if (!productId || !fromWarehouseId) {
        setAvailableStock(null);
        return;
      }

      setCheckingStock(true);
      try {
        const response = await fetch(
          `/api/stock/available?warehouseId=${fromWarehouseId}&productId=${productId}${variantId ? `&variantId=${variantId}` : ""}`
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
  }, [productId, variantId, fromWarehouseId]);

  const { execute, isExecuting } = useAction(createTransferMovement, {
    onSuccess: ({ data }) => {
      if (data?.movement) {
        toast.success("Transfert de stock enregistré avec succès");
        router.push("/movements");
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erreur lors de l'enregistrement du mouvement");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!productId || !fromWarehouseId || !toWarehouseId || !quantity) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (fromWarehouseId === toWarehouseId) {
      toast.error("L'entrepôt source et destination doivent être différents");
      return;
    }

    const qty = parseInt(quantity);
    if (availableStock !== null && qty > availableStock) {
      toast.error(`Stock insuffisant. Disponible: ${availableStock}`);
      return;
    }

    execute({
      type: "TRANSFER",
      productId,
      variantId: variantId || undefined,
      fromWarehouseId,
      toWarehouseId,
      quantity: qty,
      reference: reference || undefined,
      notes: notes || undefined,
    });
  };

  const quantityNumber = parseInt(quantity) || 0;
  const isQuantityValid = availableStock !== null && quantityNumber <= availableStock;
  const showStockWarning = availableStock !== null && quantityNumber > availableStock;
  const sameWarehouse = Boolean(fromWarehouseId && toWarehouseId && fromWarehouseId === toWarehouseId);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
            <ArrowLeftRight className="h-6 w-6" />
          </div>
          <div>
            <CardTitle>Transfert de Stock</CardTitle>
            <CardDescription>Transfert de stock entre deux entrepôts</CardDescription>
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

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Source warehouse */}
            <div className="space-y-2">
              <Label htmlFor="fromWarehouse">
                Entrepôt source <span className="text-destructive">*</span>
              </Label>
              <Select value={fromWarehouseId} onValueChange={setFromWarehouseId}>
                <SelectTrigger id="fromWarehouse">
                  <SelectValue placeholder="Sélectionner" />
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

            {/* Destination warehouse */}
            <div className="space-y-2">
              <Label htmlFor="toWarehouse">
                Entrepôt destination <span className="text-destructive">*</span>
              </Label>
              <Select value={toWarehouseId} onValueChange={setToWarehouseId}>
                <SelectTrigger id="toWarehouse">
                  <SelectValue placeholder="Sélectionner" />
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
          </div>

          {/* Same warehouse warning */}
          {sameWarehouse && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                L&apos;entrepôt source et destination doivent être différents
              </AlertDescription>
            </Alert>
          )}

          {/* Available stock indicator */}
          {availableStock !== null && !sameWarehouse && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Stock disponible dans l&apos;entrepôt source:{" "}
                <strong>
                  {availableStock} {selectedProduct?.unit}
                </strong>
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
                placeholder="Ex: 25"
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
                Stock insuffisant dans l&apos;entrepôt source. Vous demandez {quantityNumber} mais
                seulement {availableStock} disponible.
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
              placeholder="Ex: TRF-2025-001"
            />
          </div>

          {/* Notes (optional) */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={getMovementNotesPlaceholder("TRANSFER")}
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
              disabled={isExecuting || checkingStock || !isQuantityValid || sameWarehouse}
              className="flex-1"
            >
              {isExecuting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer le transfert
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
