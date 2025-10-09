"use client";

import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { createWarehouse } from "@/lib/actions/warehouse.actions";

export function CreateWarehouseDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    address: "",
    active: true,
  });

  const { execute, status, reset } = useAction(createWarehouse, {
    onSuccess: ({ data }) => {
      toast.success("Entrepôt créé avec succès", {
        description: `${data?.warehouse.name} (${data?.warehouse.code})`,
      });
      setOpen(false);
      setFormData({ code: "", name: "", address: "", active: true });
      reset();
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
        toast.error("Erreur lors de la création", {
          description: error.serverError || "Une erreur est survenue",
        });
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    execute({
      code: formData.code.toUpperCase(),
      name: formData.name,
      address: formData.address || undefined,
      active: formData.active,
    });
  };

  const isLoading = status === "executing";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Créer un entrepôt
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Créer un nouvel entrepôt</DialogTitle>
            <DialogDescription>
              Ajoutez un nouvel entrepôt à votre système de gestion de stock.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Code */}
            <div className="grid gap-2">
              <Label htmlFor="code">
                Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="code"
                placeholder="WH-MAIN"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value.toUpperCase() })
                }
                required
                disabled={isLoading}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Lettres majuscules, chiffres et tirets uniquement
              </p>
            </div>

            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">
                Nom <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Entrepôt principal"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>

            {/* Address */}
            <div className="grid gap-2">
              <Label htmlFor="address">Adresse (optionnel)</Label>
              <Textarea
                id="address"
                placeholder="123 rue Example, 75001 Paris"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                disabled={isLoading}
                rows={3}
              />
            </div>

            {/* Active */}
            <div className="flex items-center justify-between">
              <Label htmlFor="active" className="cursor-pointer">
                Entrepôt actif
              </Label>
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                disabled={isLoading}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Créer l&apos;entrepôt
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
