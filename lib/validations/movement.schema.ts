/**
 * Movement Validation Schemas
 *
 * Zod schemas for inventory movement operations including
 * IN, OUT, TRANSFER, and ADJUSTMENT types with specific validation rules.
 */

import { z } from "zod";
import { MovementType } from "@prisma/client";

/**
 * Base movement fields shared across all movement types
 */
const baseMovementFields = {
  productId: z.string().uuid("Invalid product ID"),
  variantId: z.string().uuid("Invalid variant ID").nullable().optional(),
  quantity: z.number().int().positive("Quantity must be positive"),
  reference: z.string().max(100, "Reference must not exceed 100 characters").optional(),
  notes: z.string().max(1000, "Notes must not exceed 1000 characters").optional(),
};

/**
 * Schema for IN movements (receiving stock)
 */
export const createInMovementSchema = z.object({
  ...baseMovementFields,
  type: z.literal(MovementType.IN),
  toWarehouseId: z.string().uuid("Invalid warehouse ID"),
});

/**
 * Schema for OUT movements (shipping/consuming stock)
 */
export const createOutMovementSchema = z.object({
  ...baseMovementFields,
  type: z.literal(MovementType.OUT),
  fromWarehouseId: z.string().uuid("Invalid warehouse ID"),
});

/**
 * Schema for TRANSFER movements (between warehouses)
 */
export const createTransferMovementSchema = z
  .object({
    ...baseMovementFields,
    type: z.literal(MovementType.TRANSFER),
    fromWarehouseId: z.string().uuid("Invalid source warehouse ID"),
    toWarehouseId: z.string().uuid("Invalid destination warehouse ID"),
  })
  .refine((data) => data.fromWarehouseId !== data.toWarehouseId, {
    message: "Source and destination warehouses must be different",
    path: ["toWarehouseId"],
  });

/**
 * Schema for ADJUSTMENT movements (inventory corrections)
 */
export const createAdjustmentMovementSchema = z.object({
  ...baseMovementFields,
  type: z.literal(MovementType.ADJUSTMENT),
  toWarehouseId: z.string().uuid("Invalid warehouse ID"),
  quantity: z.number().int().refine((val) => val !== 0, {
    message: "Adjustment quantity cannot be zero",
  }),
  notes: z.string().min(1, "Reason is required for adjustments").max(1000),
});

/**
 * Union schema for all movement types
 * Discriminated union based on movement type
 */
export const createMovementSchema = z.discriminatedUnion("type", [
  createInMovementSchema,
  createOutMovementSchema,
  createTransferMovementSchema,
  createAdjustmentMovementSchema,
]);

/**
 * Type exports for use in server actions
 */
export type CreateInMovementInput = z.infer<typeof createInMovementSchema>;
export type CreateOutMovementInput = z.infer<typeof createOutMovementSchema>;
export type CreateTransferMovementInput = z.infer<typeof createTransferMovementSchema>;
export type CreateAdjustmentMovementInput = z.infer<typeof createAdjustmentMovementSchema>;
export type CreateMovementInput = z.infer<typeof createMovementSchema>;
