"use client";

import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { ProductAttribute } from "@prisma/client";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { EmptyState } from "@/components/shared/empty-state";
import {
  addProductAttribute,
  deleteProductAttribute,
} from "@/lib/actions/product.actions";

interface AttributeManagerProps {
  productId: string;
  attributes: ProductAttribute[];
}

export function AttributeManager({ productId, attributes }: AttributeManagerProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [attributeToDelete, setAttributeToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", value: "" });

  // Add attribute action
  const { execute: executeAdd, status: addStatus } = useAction(addProductAttribute, {
    onSuccess: () => {
      toast.success("Attribut ajouté", {
        description: "L'attribut a été ajouté avec succès",
      });
      setCreateDialogOpen(false);
      setFormData({ name: "", value: "" });
    },
    onError: ({ error }) => {
      toast.error("Erreur", {
        description: error.serverError || "Impossible d'ajouter l'attribut",
      });
    },
  });

  // Delete attribute action
  const { execute: executeDelete, status: deleteStatus } = useAction(deleteProductAttribute, {
    onSuccess: () => {
      toast.success("Attribut supprimé", {
        description: "L'attribut a été supprimé avec succès",
      });
      setAttributeToDelete(null);
    },
    onError: ({ error }) => {
      toast.error("Erreur", {
        description: error.serverError || "Impossible de supprimer l'attribut",
      });
    },
  });

  const isAdding = addStatus === "executing";
  const isDeleting = deleteStatus === "executing";

  const handleOpenCreateDialog = () => {
    setFormData({ name: "", value: "" });
    setCreateDialogOpen(true);
  };

  const handleAdd = () => {
    if (!formData.name || !formData.value) {
      toast.error("Validation", {
        description: "Veuillez remplir tous les champs",
      });
      return;
    }

    executeAdd({
      productId,
      name: formData.name.trim(),
      value: formData.value.trim(),
    });
  };

  const handleDelete = (attributeId: string) => {
    executeDelete({ id: attributeId });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Attributs</h3>
          <p className="text-sm text-muted-foreground">
            Caractéristiques techniques et informations complémentaires
          </p>
        </div>
        <Button onClick={handleOpenCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un attribut
        </Button>
      </div>

      {attributes.length === 0 ? (
        <EmptyState
          icon={Plus}
          title="Aucun attribut"
          description="Ce produit n'a pas encore d'attributs"
        />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Nom</TableHead>
                <TableHead>Valeur</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attributes.map((attribute) => (
                <TableRow key={attribute.id}>
                  <TableCell className="font-medium">{attribute.name}</TableCell>
                  <TableCell>{attribute.value}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAttributeToDelete(attribute.id)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
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
            <DialogTitle>Ajouter un attribut</DialogTitle>
            <DialogDescription>
              Ajoutez une caractéristique ou information complémentaire au produit
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="attr-name">
                Nom <span className="text-destructive">*</span>
              </Label>
              <Input
                id="attr-name"
                placeholder="Couleur, Taille, Matière, etc."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isAdding}
              />
              <p className="text-xs text-muted-foreground">
                Nom de la caractéristique (max 100 caractères)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="attr-value">
                Valeur <span className="text-destructive">*</span>
              </Label>
              <Input
                id="attr-value"
                placeholder="Rouge, XL, Coton, etc."
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                disabled={isAdding}
              />
              <p className="text-xs text-muted-foreground">
                Valeur de la caractéristique (max 500 caractères)
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
              disabled={isAdding}
            >
              Annuler
            </Button>
            <Button onClick={handleAdd} disabled={isAdding}>
              {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!attributeToDelete} onOpenChange={() => setAttributeToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l&apos;attribut</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cet attribut ? Cette action est
              irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => attributeToDelete && handleDelete(attributeToDelete)}
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
