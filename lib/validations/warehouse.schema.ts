/**
 * Warehouse Validation Schemas
 *
 * Zod schemas for warehouse management operations including
 * warehouse CRUD and user access control.
 */

import { z } from "zod";

/**
 * Schema for creating a new warehouse
 */
export const createWarehouseSchema = z.object({
  code: z
    .string()
    .min(2, "Code must be at least 2 characters")
    .max(20, "Code must not exceed 20 characters")
    .regex(/^[A-Z0-9-]+$/, "Code must contain only uppercase letters, numbers, and hyphens"),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),
  address: z.string().max(500, "Address must not exceed 500 characters").optional(),
  active: z.boolean().optional().default(true),
});

/**
 * Schema for updating an existing warehouse
 */
export const updateWarehouseSchema = z.object({
  id: z.string().uuid("Invalid warehouse ID"),
  code: z
    .string()
    .min(2, "Code must be at least 2 characters")
    .max(20, "Code must not exceed 20 characters")
    .regex(/^[A-Z0-9-]+$/, "Code must contain only uppercase letters, numbers, and hyphens")
    .optional(),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters")
    .optional(),
  address: z.string().max(500, "Address must not exceed 500 characters").optional(),
  active: z.boolean().optional(),
});

/**
 * Schema for deleting a warehouse
 */
export const deleteWarehouseSchema = z.object({
  id: z.string().uuid("Invalid warehouse ID"),
});

/**
 * Schema for assigning a user to a warehouse
 */
export const assignUserSchema = z.object({
  warehouseId: z.string().uuid("Invalid warehouse ID"),
  userId: z.string().uuid("Invalid user ID"),
  canWrite: z.boolean().default(false),
});

/**
 * Schema for removing user access from a warehouse
 */
export const removeUserSchema = z.object({
  warehouseId: z.string().uuid("Invalid warehouse ID"),
  userId: z.string().uuid("Invalid user ID"),
});

/**
 * Type exports for use in server actions
 */
export type CreateWarehouseInput = z.infer<typeof createWarehouseSchema>;
export type UpdateWarehouseInput = z.infer<typeof updateWarehouseSchema>;
export type DeleteWarehouseInput = z.infer<typeof deleteWarehouseSchema>;
export type AssignUserInput = z.infer<typeof assignUserSchema>;
export type RemoveUserInput = z.infer<typeof removeUserSchema>;
