"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { Warehouse } from "@prisma/client";
import { Loader2, Save, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { updateWarehouse, deleteWarehouse } from "@/lib/actions/warehouse.actions";

interface WarehouseEditFormProps {
  warehouse: Warehouse;
}

export function WarehouseEditForm({ warehouse }: WarehouseEditFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    code: warehouse.code,
    name: warehouse.name,
    address: warehouse.address || "",
    active: warehouse.active,
  });

  // Update action
  const { execute: executeUpdate, status: updateStatus } = useAction(updateWarehouse, {
    onSuccess: ({ data }) => {
      toast.success("Entrepôt mis à jour", {
        description: `${data?.warehouse.name} (${data?.warehouse.code})`,
      });
      router.push(`/warehouses/${warehouse.id}`);
    },
    onError: ({ error }) => {
      if (error.validationErrors) {
        const errors = error.validationErrors;
        if (errors.code?._errors?.[0]) {
          toast.error("Erreur de validation", {
            description: errors.code._errors[0],
          });
        } else if (errors.name?._errors?.[0]) {
          toast.error("Erreur de validation", {
            description: errors.name._errors[0],
          });
        }
      } else {
        toast.error("Erreur lors de la mise à jour", {
          description: error.serverError || "Une erreur est survenue",
        });
      }
    },
  });

  // Delete action
  const { execute: executeDelete, status: deleteStatus } = useAction(deleteWarehouse, {
    onSuccess: () => {
      toast.success("Entrepôt supprimé", {
        description: "L'entrepôt a été supprimé avec succès",
      });
      router.push("/warehouses");
    },
    onError: ({ error }) => {
      toast.error("Erreur lors de la suppression", {
        description: error.serverError || "Une erreur est survenue",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeUpdate({
      id: warehouse.id,
      code: formData.code.toUpperCase(),
      name: formData.name,
      address: formData.address || undefined,
      active: formData.active,
    });
  };

  const handleDelete = () => {
    executeDelete({ id: warehouse.id });
  };

  const handleCancel = () => {
    router.push(`/warehouses/${warehouse.id}`);
  };

  const isUpdating = updateStatus === "executing";
  const isDeleting = deleteStatus === "executing";
  const isLoading = isUpdating || isDeleting;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informations de l&apos;entrepôt</CardTitle>
          <CardDescription>Modifiez les informations de l&apos;entrepôt</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Code */}
          <div className="space-y-2">
            <Label htmlFor="code">
              Code <span className="text-destructive">*</span>
            </Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              required
              disabled={isLoading}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Lettres majuscules, chiffres et tirets uniquement
            </p>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Nom <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Adresse (optionnel)</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              disabled={isLoading}
              rows={3}
            />
          </div>

          {/* Active */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="active" className="cursor-pointer text-base">
                Entrepôt actif
              </Label>
              <p className="text-sm text-muted-foreground">
                Les entrepôts inactifs ne peuvent pas recevoir de nouveaux mouvements
              </p>
            </div>
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="flex items-center justify-between">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button type="button" variant="destructive" disabled={isLoading}>
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer l&apos;entrepôt</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer cet entrepôt ? Cette action est irréversible et
                supprimera également tous les stocks et mouvements associés.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Supprimer définitivement
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
            <X className="mr-2 h-4 w-4" />
            Annuler
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Enregistrer
          </Button>
        </div>
      </div>
    </form>
  );
}
