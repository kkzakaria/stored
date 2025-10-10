/**
 * Movement Server Actions
 *
 * Type-safe server actions for inventory movement operations.
 * Uses Prisma transactions to ensure atomic stock updates.
 */

"use server";

// Force Node.js runtime for Prisma database operations
export const runtime = 'nodejs';

import { revalidatePath } from "next/cache";
import { authActionClient, PermissionError, returnValidationErrors } from "./safe-action";
import {
  createInMovementSchema,
  createOutMovementSchema,
  createTransferMovementSchema,
  createAdjustmentMovementSchema,
} from "@/lib/validations/movement.schema";
import { stockRepository, warehouseRepository } from "@/lib/db/repositories";
import { prisma } from "@/lib/db/client";

/**
 * Check if user has write access to warehouse
 */
async function checkWarehouseWriteAccess(
  userId: string,
  userRole: string,
  warehouseId: string
) {
  // Admins and managers have access to all warehouses
  if (userRole === "ADMINISTRATOR" || userRole === "MANAGER") {
    return;
  }

  // Check user's warehouse access
  const hasAccess = await warehouseRepository.hasWriteAccess(userId, warehouseId);
  if (!hasAccess) {
    throw new PermissionError("You don't have write access to this warehouse");
  }
}

/**
 * Create IN movement (receiving stock)
 */
export const createInMovement = authActionClient
  .metadata({ actionName: "createInMovement" })
  .schema(createInMovementSchema)
  .action(async ({ parsedInput, ctx }) => {
    await checkWarehouseWriteAccess(ctx.userId, ctx.userRole, parsedInput.toWarehouseId);

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Create movement record
      const movement = await tx.movement.create({
        data: {
          type: parsedInput.type,
          quantity: parsedInput.quantity,
          notes: parsedInput.notes,
          product: { connect: { id: parsedInput.productId } },
          variant: parsedInput.variantId ? { connect: { id: parsedInput.variantId } } : undefined,
          toWarehouse: { connect: { id: parsedInput.toWarehouseId } },
          user: { connect: { id: ctx.userId } },
        },
      });

      // Update stock - increase quantity
      await stockRepository.updateQuantity(
        parsedInput.toWarehouseId,
        parsedInput.productId,
        parsedInput.variantId ?? null,
        parsedInput.quantity
      );

      return movement;
    });

    revalidatePath("/movements");
    revalidatePath("/stock");
    return { movement: result };
  });

/**
 * Create OUT movement (shipping/consuming stock)
 */
export const createOutMovement = authActionClient
  .metadata({ actionName: "createOutMovement" })
  .schema(createOutMovementSchema)
  .action(async ({ parsedInput, ctx }) => {
    await checkWarehouseWriteAccess(ctx.userId, ctx.userRole, parsedInput.fromWarehouseId);

    // Check available stock before creating movement
    const availableStock = await stockRepository.getAvailableStock(
      parsedInput.fromWarehouseId,
      parsedInput.productId,
      parsedInput.variantId ?? null
    );

    if (availableStock < parsedInput.quantity) {
      returnValidationErrors(createOutMovementSchema, {
        quantity: {
          _errors: [
            `Insufficient stock. Available: ${availableStock}, Requested: ${parsedInput.quantity}`,
          ],
        },
      });
    }

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Create movement record
      const movement = await tx.movement.create({
        data: {
          type: parsedInput.type,
          quantity: parsedInput.quantity,
          notes: parsedInput.notes,
          product: { connect: { id: parsedInput.productId } },
          variant: parsedInput.variantId ? { connect: { id: parsedInput.variantId } } : undefined,
          fromWarehouse: { connect: { id: parsedInput.fromWarehouseId } },
          user: { connect: { id: ctx.userId } },
        },
      });

      // Update stock - decrease quantity
      await stockRepository.updateQuantity(
        parsedInput.fromWarehouseId,
        parsedInput.productId,
        parsedInput.variantId ?? null,
        -parsedInput.quantity
      );

      return movement;
    });

    revalidatePath("/movements");
    revalidatePath("/stock");
    return { movement: result };
  });

/**
 * Create TRANSFER movement (between warehouses)
 */
export const createTransferMovement = authActionClient
  .metadata({ actionName: "createTransferMovement" })
  .schema(createTransferMovementSchema)
  .action(async ({ parsedInput, ctx }) => {
    // Check write access to both warehouses
    await checkWarehouseWriteAccess(ctx.userId, ctx.userRole, parsedInput.fromWarehouseId);
    await checkWarehouseWriteAccess(ctx.userId, ctx.userRole, parsedInput.toWarehouseId);

    // Check available stock in source warehouse
    const availableStock = await stockRepository.getAvailableStock(
      parsedInput.fromWarehouseId,
      parsedInput.productId,
      parsedInput.variantId ?? null
    );

    if (availableStock < parsedInput.quantity) {
      returnValidationErrors(createTransferMovementSchema, {
        quantity: {
          _errors: [
            `Insufficient stock in source warehouse. Available: ${availableStock}, Requested: ${parsedInput.quantity}`,
          ],
        },
      });
    }

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Create movement record
      const movement = await tx.movement.create({
        data: {
          type: parsedInput.type,
          quantity: parsedInput.quantity,
          notes: parsedInput.notes,
          product: { connect: { id: parsedInput.productId } },
          variant: parsedInput.variantId ? { connect: { id: parsedInput.variantId } } : undefined,
          fromWarehouse: { connect: { id: parsedInput.fromWarehouseId } },
          toWarehouse: { connect: { id: parsedInput.toWarehouseId } },
          user: { connect: { id: ctx.userId } },
        },
      });

      // Update stock - decrease from source
      await stockRepository.updateQuantity(
        parsedInput.fromWarehouseId,
        parsedInput.productId,
        parsedInput.variantId ?? null,
        -parsedInput.quantity
      );

      // Update stock - increase in destination
      await stockRepository.updateQuantity(
        parsedInput.toWarehouseId,
        parsedInput.productId,
        parsedInput.variantId ?? null,
        parsedInput.quantity
      );

      return movement;
    });

    revalidatePath("/movements");
    revalidatePath("/stock");
    return { movement: result };
  });

/**
 * Create ADJUSTMENT movement (inventory correction)
 */
export const createAdjustmentMovement = authActionClient
  .metadata({ actionName: "createAdjustmentMovement" })
  .schema(createAdjustmentMovementSchema)
  .action(async ({ parsedInput, ctx }) => {
    // Only admins and managers can make adjustments
    if (ctx.userRole !== "ADMINISTRATOR" && ctx.userRole !== "MANAGER") {
      throw new PermissionError("Only administrators and managers can make stock adjustments");
    }

    await checkWarehouseWriteAccess(ctx.userId, ctx.userRole, parsedInput.toWarehouseId);

    // For negative adjustments, check available stock
    if (parsedInput.quantity < 0) {
      const availableStock = await stockRepository.getAvailableStock(
        parsedInput.toWarehouseId,
        parsedInput.productId,
        parsedInput.variantId ?? null
      );

      if (availableStock < Math.abs(parsedInput.quantity)) {
        returnValidationErrors(createAdjustmentMovementSchema, {
          quantity: {
            _errors: [
              `Cannot reduce stock below zero. Available: ${availableStock}, Requested reduction: ${Math.abs(parsedInput.quantity)}`,
            ],
          },
        });
      }
    }

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Create movement record
      const movement = await tx.movement.create({
        data: {
          type: parsedInput.type,
          quantity: Math.abs(parsedInput.quantity),
          notes: parsedInput.notes,
          product: { connect: { id: parsedInput.productId } },
          variant: parsedInput.variantId ? { connect: { id: parsedInput.variantId } } : undefined,
          toWarehouse: { connect: { id: parsedInput.toWarehouseId } },
          user: { connect: { id: ctx.userId } },
        },
      });

      // Update stock with adjustment delta (can be positive or negative)
      await stockRepository.updateQuantity(
        parsedInput.toWarehouseId,
        parsedInput.productId,
        parsedInput.variantId ?? null,
        parsedInput.quantity
      );

      return movement;
    });

    revalidatePath("/movements");
    revalidatePath("/stock");
    return { movement: result };
  });
