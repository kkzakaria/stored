/**
 * Warehouse Server Actions
 *
 * Type-safe server actions for warehouse management operations.
 * Requires ADMINISTRATOR or MANAGER role for all operations.
 */

"use server";

import { revalidatePath } from "next/cache";
import { authActionClient, PermissionError, returnValidationErrors } from "./safe-action";
import {
  createWarehouseSchema,
  updateWarehouseSchema,
  deleteWarehouseSchema,
  assignUserSchema,
  removeUserSchema,
} from "@/lib/validations/warehouse.schema";
import { warehouseRepository } from "@/lib/db/repositories";

/**
 * Check if user has warehouse management permissions
 */
function checkWarehousePermissions(userRole: string) {
  if (userRole !== "ADMINISTRATOR" && userRole !== "MANAGER") {
    throw new PermissionError("Only administrators and managers can manage warehouses");
  }
}

/**
 * Create a new warehouse
 */
export const createWarehouse = authActionClient
  .metadata({ actionName: "createWarehouse" })
  .schema(createWarehouseSchema)
  .action(async ({ parsedInput, ctx }) => {
    checkWarehousePermissions(ctx.userRole);

    // Check if warehouse code already exists
    const existing = await warehouseRepository.findByCode(parsedInput.code);
    if (existing) {
      returnValidationErrors(createWarehouseSchema, {
        code: {
          _errors: [`Warehouse with code "${parsedInput.code}" already exists`],
        },
      });
    }

    const warehouse = await warehouseRepository.createWarehouse({
      code: parsedInput.code,
      name: parsedInput.name,
      address: parsedInput.address,
      active: parsedInput.active ?? true,
    });

    revalidatePath("/warehouses");
    return { warehouse };
  });

/**
 * Update an existing warehouse
 */
export const updateWarehouse = authActionClient
  .metadata({ actionName: "updateWarehouse" })
  .schema(updateWarehouseSchema)
  .action(async ({ parsedInput, ctx }) => {
    checkWarehousePermissions(ctx.userRole);

    const { id, ...updateData } = parsedInput;

    // Check if warehouse exists
    const existing = await warehouseRepository.findById(id);
    if (!existing) {
      returnValidationErrors(updateWarehouseSchema, {
        id: {
          _errors: ["Warehouse not found"],
        },
      });
    }

    // If updating code, check uniqueness
    if (updateData.code && updateData.code !== existing.code) {
      const codeExists = await warehouseRepository.findByCode(updateData.code);
      if (codeExists) {
        returnValidationErrors(updateWarehouseSchema, {
          code: {
            _errors: [`Warehouse with code "${updateData.code}" already exists`],
          },
        });
      }
    }

    const warehouse = await warehouseRepository.update(id, updateData);

    revalidatePath("/warehouses");
    revalidatePath(`/warehouses/${id}`);
    return { warehouse };
  });

/**
 * Delete a warehouse
 */
export const deleteWarehouse = authActionClient
  .metadata({ actionName: "deleteWarehouse" })
  .schema(deleteWarehouseSchema)
  .action(async ({ parsedInput, ctx }) => {
    checkWarehousePermissions(ctx.userRole);

    // Check if warehouse exists
    const existing = await warehouseRepository.findById(parsedInput.id);
    if (!existing) {
      returnValidationErrors(deleteWarehouseSchema, {
        id: {
          _errors: ["Warehouse not found"],
        },
      });
    }

    await warehouseRepository.delete(parsedInput.id);

    revalidatePath("/warehouses");
    return { success: true };
  });

/**
 * Assign a user to a warehouse with specific permissions
 */
export const assignUserToWarehouse = authActionClient
  .metadata({ actionName: "assignUserToWarehouse" })
  .schema(assignUserSchema)
  .action(async ({ parsedInput, ctx }) => {
    checkWarehousePermissions(ctx.userRole);

    const access = await warehouseRepository.assignUser(
      parsedInput.warehouseId,
      parsedInput.userId,
      parsedInput.canWrite
    );

    revalidatePath("/warehouses");
    revalidatePath(`/warehouses/${parsedInput.warehouseId}`);
    return { access };
  });

/**
 * Remove a user's access from a warehouse
 */
export const removeUserFromWarehouse = authActionClient
  .metadata({ actionName: "removeUserFromWarehouse" })
  .schema(removeUserSchema)
  .action(async ({ parsedInput, ctx }) => {
    checkWarehousePermissions(ctx.userRole);

    await warehouseRepository.removeUser(parsedInput.warehouseId, parsedInput.userId);

    revalidatePath("/warehouses");
    revalidatePath(`/warehouses/${parsedInput.warehouseId}`);
    return { success: true };
  });
