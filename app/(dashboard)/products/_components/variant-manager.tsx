"use client";

import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { ProductVariant } from "@prisma/client";
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { EmptyState } from "@/components/shared/empty-state";
import {
  createVariant,
  updateVariant,
  deleteVariant,
} from "@/lib/actions/product.actions";
import { normalizeSKU } from "@/lib/utils/product";

interface VariantManagerProps {
  productId: string;
  variants: ProductVariant[];
}

export function VariantManager({ productId, variants }: VariantManagerProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [variantToDelete, setVariantToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState({ sku: "", name: "", active: true });

  // Create variant action
  const { execute: executeCreate, status: createStatus } = useAction(createVariant, {
    onSuccess: () => {
      toast.success("Variante créée", {
        description: "La variante a été créée avec succès",
      });
      setCreateDialogOpen(false);
      setFormData({ sku: "", name: "", active: true });
    },
    onError: ({ error }) => {
      toast.error("Erreur", {
        description: error.serverError || "Impossible de créer la variante",
      });
    },
  });

  // Update variant action
  const { execute: executeUpdate, status: updateStatus } = useAction(updateVariant, {
    onSuccess: () => {
      toast.success("Variante mise à jour", {
        description: "La variante a été mise à jour avec succès",
      });
      setEditingVariant(null);
      setFormData({ sku: "", name: "", active: true });
    },
    onError: ({ error }) => {
      toast.error("Erreur", {
        description: error.serverError || "Impossible de mettre à jour la variante",
      });
    },
  });

  // Delete variant action
  const { execute: executeDelete, status: deleteStatus } = useAction(deleteVariant, {
    onSuccess: () => {
      toast.success("Variante supprimée", {
        description: "La variante a été supprimée avec succès",
      });
      setVariantToDelete(null);
    },
    onError: ({ error }) => {
      toast.error("Erreur", {
        description: error.serverError || "Impossible de supprimer la variante",
      });
    },
  });

  const isCreating = createStatus === "executing";
  const isUpdating = updateStatus === "executing";
  const isDeleting = deleteStatus === "executing";

  const handleOpenCreateDialog = () => {
    setFormData({ sku: "", name: "", active: true });
    setCreateDialogOpen(true);
  };

  const handleOpenEditDialog = (variant: ProductVariant) => {
    setFormData({
      sku: variant.sku,
      name: variant.name || "",
      active: variant.active,
    });
    setEditingVariant(variant);
  };

  const handleCreate = () => {
    if (!formData.sku || !formData.name) {
      toast.error("Validation", {
        description: "Veuillez remplir tous les champs obligatoires",
      });
      return;
    }

    executeCreate({
      productId,
      sku: normalizeSKU(formData.sku),
      name: formData.name,
      active: formData.active,
    });
  };

  const handleUpdate = () => {
    if (!editingVariant || !formData.name) {
      toast.error("Validation", {
        description: "Veuillez remplir tous les champs obligatoires",
      });
      return;
    }

    executeUpdate({
      id: editingVariant.id,
      name: formData.name,
      active: formData.active,
    });
  };

  const handleDelete = (variantId: string) => {
    executeDelete({ id: variantId });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Variantes</h3>
          <p className="text-sm text-muted-foreground">
            Gérez les différentes variantes de ce produit
          </p>
        </div>
        <Button onClick={handleOpenCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter une variante
        </Button>
      </div>

      {variants.length === 0 ? (
        <EmptyState
          icon={Plus}
          title="Aucune variante"
          description="Ce produit n'a pas encore de variantes"
        />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {variants.map((variant) => (
                <TableRow key={variant.id}>
                  <TableCell className="font-mono">{variant.sku}</TableCell>
                  <TableCell>{variant.name || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={variant.active ? "default" : "secondary"}>
                      {variant.active ? "Actif" : "Inactif"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEditDialog(variant)}
                        disabled={isUpdating || isDeleting}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setVariantToDelete(variant.id)}
                        disabled={isUpdating || isDeleting}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer une variante</DialogTitle>
            <DialogDescription>
              Ajoutez une nouvelle variante pour ce produit
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="create-sku">
                SKU <span className="text-destructive">*</span>
              </Label>
              <Input
                id="create-sku"
                placeholder="PROD-VAR-001"
                value={formData.sku}
                onChange={(e) =>
                  setFormData({ ...formData, sku: normalizeSKU(e.target.value) })
                }
                disabled={isCreating}
              />
              <p className="text-xs text-muted-foreground">
                Code unique (lettres majuscules, chiffres et tirets)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-name">
                Nom <span className="text-destructive">*</span>
              </Label>
              <Input
                id="create-name"
                placeholder="Nom de la variante"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isCreating}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="create-active" className="cursor-pointer">
                Variante active
              </Label>
              <Switch
                id="create-active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                disabled={isCreating}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
              disabled={isCreating}
            >
              Annuler
            </Button>
            <Button onClick={handleCreate} disabled={isCreating}>
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingVariant} onOpenChange={() => setEditingVariant(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la variante</DialogTitle>
            <DialogDescription>Modifiez les informations de la variante</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>SKU</Label>
              <Input value={formData.sku} disabled className="font-mono" />
              <p className="text-xs text-muted-foreground">
                Le SKU ne peut pas être modifié
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-name">
                Nom <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-name"
                placeholder="Nom de la variante"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isUpdating}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="edit-active" className="cursor-pointer">
                Variante active
              </Label>
              <Switch
                id="edit-active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                disabled={isUpdating}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingVariant(null)}
              disabled={isUpdating}
            >
              Annuler
            </Button>
            <Button onClick={handleUpdate} disabled={isUpdating}>
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!variantToDelete} onOpenChange={() => setVariantToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la variante</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette variante ? Cette action est
              irréversible. Le stock associé à cette variante sera conservé mais ne sera plus
              lié à la variante.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => variantToDelete && handleDelete(variantToDelete)}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
