"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
import { EmptyState } from "@/components/shared/empty-state";
import { assignUserToWarehouse, removeUserFromWarehouse } from "@/lib/actions/warehouse.actions";
import { toast } from "sonner";

interface UserWarehouseManagerProps {
  userId: string;
  userWarehouses: Array<{
    warehouse: {
      id: string;
      name: string;
      code: string;
      active: boolean;
    };
    canWrite: boolean;
  }>;
  availableWarehouses: Array<{
    id: string;
    name: string;
    code: string;
    active: boolean;
  }>;
}

export function UserWarehouseManager({
  userId,
  userWarehouses,
  availableWarehouses,
}: UserWarehouseManagerProps) {
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>("");
  const [isAdding, setIsAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const router = useRouter();

  // Filter out warehouses already assigned to user
  const assignedWarehouseIds = userWarehouses.map((uw) => uw.warehouse.id);
  const unassignedWarehouses = availableWarehouses.filter(
    (w) => !assignedWarehouseIds.includes(w.id) && w.active
  );

  const handleAssign = async () => {
    if (!selectedWarehouseId) return;

    setIsAdding(true);
    try {
      const result = await assignUserToWarehouse({
        warehouseId: selectedWarehouseId,
        userId,
        canWrite: false, // Default to read-only
      });

      if (result?.serverError || result?.validationErrors) {
        toast.error(result.serverError || "Failed to assign warehouse");
        return;
      }

      toast.success("Warehouse access granted");
      setSelectedWarehouseId("");
      router.refresh();
    } catch (error) {
      toast.error("Failed to assign warehouse");
      console.error("Assign warehouse error:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemove = async (warehouseId: string) => {
    try {
      const result = await removeUserFromWarehouse({
        warehouseId,
        userId,
      });

      if (result?.serverError || result?.validationErrors) {
        toast.error(result.serverError || "Failed to remove access");
        return;
      }

      toast.success("Warehouse access removed");
      setRemovingId(null);
      router.refresh();
    } catch (error) {
      toast.error("Failed to remove access");
      console.error("Remove warehouse error:", error);
    }
  };

  const handleToggleWrite = async (warehouseId: string, currentCanWrite: boolean) => {
    try {
      const result = await assignUserToWarehouse({
        warehouseId,
        userId,
        canWrite: !currentCanWrite,
      });

      if (result?.serverError || result?.validationErrors) {
        toast.error(result.serverError || "Failed to update permissions");
        return;
      }

      toast.success(`Write access ${!currentCanWrite ? "granted" : "revoked"}`);
      router.refresh();
    } catch (error) {
      toast.error("Failed to update permissions");
      console.error("Toggle write error:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Warehouse Access
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Warehouse */}
        {unassignedWarehouses.length > 0 && (
          <div className="flex gap-2">
            <Select
              value={selectedWarehouseId}
              onValueChange={setSelectedWarehouseId}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select a warehouse to assign..." />
              </SelectTrigger>
              <SelectContent>
                {unassignedWarehouses.map((warehouse) => (
                  <SelectItem key={warehouse.id} value={warehouse.id}>
                    {warehouse.name} ({warehouse.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleAssign}
              disabled={!selectedWarehouseId || isAdding}
            >
              <Plus className="h-4 w-4 mr-2" />
              {isAdding ? "Adding..." : "Add"}
            </Button>
          </div>
        )}

        {/* Warehouse List */}
        {userWarehouses.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No warehouse access"
            description="This user has not been assigned to any warehouses yet."
          />
        ) : (
          <div className="space-y-2">
            {userWarehouses.map(({ warehouse, canWrite }) => (
              <div
                key={warehouse.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{warehouse.name}</p>
                    <Badge variant="outline" className="flex-shrink-0">
                      {warehouse.code}
                    </Badge>
                    {!warehouse.active && (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 ml-4">
                  {/* Write Permission Toggle */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Write
                    </span>
                    <Switch
                      checked={canWrite}
                      onCheckedChange={() =>
                        handleToggleWrite(warehouse.id, canWrite)
                      }
                    />
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setRemovingId(warehouse.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Remove Confirmation Dialog */}
        <AlertDialog
          open={removingId !== null}
          onOpenChange={(open) => !open && setRemovingId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Warehouse Access?</AlertDialogTitle>
              <AlertDialogDescription>
                This user will no longer be able to access this warehouse. This
                action can be reversed by re-assigning the warehouse.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => removingId && handleRemove(removingId)}
                className="bg-red-600 hover:bg-red-700"
              >
                Remove Access
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
