"use client";

import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { User as PrismaUser, UserRole } from "@prisma/client";
import { UserPlus, Trash2, Loader2 } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { EmptyState } from "@/components/shared/empty-state";
import { assignUserToWarehouse, removeUserFromWarehouse } from "@/lib/actions/warehouse.actions";

interface WarehouseAccessItem {
  id: string;
  canWrite: boolean;
  user: {
    id: string;
    name: string | null;
    email: string;
    role: UserRole;
    active: boolean;
  };
}

interface WarehouseAccessManagerProps {
  warehouseId: string;
  access: WarehouseAccessItem[];
  availableUsers: PrismaUser[];
}

export function WarehouseAccessManager({
  warehouseId,
  access,
  availableUsers,
}: WarehouseAccessManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [canWrite, setCanWrite] = useState(false);
  const [userToRemove, setUserToRemove] = useState<string | null>(null);

  // Assign user action
  const { execute: executeAssign, status: assignStatus } = useAction(assignUserToWarehouse, {
    onSuccess: () => {
      toast.success("Accès accordé", {
        description: "L'utilisateur a été ajouté à l'entrepôt",
      });
      setDialogOpen(false);
      setSelectedUserId("");
      setCanWrite(false);
    },
    onError: ({ error }) => {
      toast.error("Erreur", {
        description: error.serverError || "Impossible d'ajouter l'utilisateur",
      });
    },
  });

  // Remove user action
  const { execute: executeRemove, status: removeStatus } = useAction(removeUserFromWarehouse, {
    onSuccess: () => {
      toast.success("Accès révoqué", {
        description: "L'utilisateur n'a plus accès à cet entrepôt",
      });
      setUserToRemove(null);
    },
    onError: ({ error }) => {
      toast.error("Erreur", {
        description: error.serverError || "Impossible de retirer l'utilisateur",
      });
    },
  });

  const handleAssignUser = () => {
    if (!selectedUserId) return;

    executeAssign({
      warehouseId,
      userId: selectedUserId,
      canWrite,
    });
  };

  const handleRemoveUser = (userId: string) => {
    executeRemove({
      warehouseId,
      userId,
    });
  };

  const isAssigning = assignStatus === "executing";
  const isRemoving = removeStatus === "executing";

  // Filter out users who already have access
  const usersWithAccess = new Set(access.map((a) => a.user.id));
  const usersToAdd = availableUsers.filter((user) => !usersWithAccess.has(user.id));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Utilisateurs avec accès</h3>
          <p className="text-sm text-muted-foreground">
            Gérez les permissions d&apos;accès à cet entrepôt
          </p>
        </div>
        {usersToAdd.length > 0 && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Ajouter un utilisateur
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un utilisateur</DialogTitle>
                <DialogDescription>
                  Accordez l&apos;accès à cet entrepôt à un utilisateur
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="user">Utilisateur</Label>
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger id="user">
                      <SelectValue placeholder="Sélectionner un utilisateur" />
                    </SelectTrigger>
                    <SelectContent>
                      {usersToAdd.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center gap-2">
                            <span>{user.name || user.email}</span>
                            <Badge variant="outline" className="text-xs">
                              {user.role}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="canWrite" className="cursor-pointer">
                    Autoriser la modification
                  </Label>
                  <Switch id="canWrite" checked={canWrite} onCheckedChange={setCanWrite} />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isAssigning}>
                  Annuler
                </Button>
                <Button onClick={handleAssignUser} disabled={!selectedUserId || isAssigning}>
                  {isAssigning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Ajouter
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {access.length === 0 ? (
        <EmptyState
          icon={UserPlus}
          title="Aucun utilisateur"
          description="Aucun utilisateur n&apos;a encore accès à cet entrepôt"
        />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {access.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.user.name || "—"}
                    {!item.user.active && (
                      <Badge variant="secondary" className="ml-2">
                        Inactif
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{item.user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.canWrite ? "default" : "secondary"}>
                      {item.canWrite ? "Lecture/Écriture" : "Lecture seule"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setUserToRemove(item.user.id)}
                      disabled={isRemoving}
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

      {/* Remove confirmation dialog */}
      <AlertDialog open={!!userToRemove} onOpenChange={() => setUserToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Retirer l&apos;accès</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir retirer l&apos;accès de cet utilisateur à l&apos;entrepôt ? Cette
              action est réversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => userToRemove && handleRemoveUser(userToRemove)}
              disabled={isRemoving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRemoving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Retirer l&apos;accès
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
