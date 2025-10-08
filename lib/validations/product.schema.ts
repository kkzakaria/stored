/**
 * Product Validation Schemas
 *
 * Zod schemas for product, variant, and attribute management.
 */

import { z } from "zod";

/**
 * Schema for creating a new product
 */
export const createProductSchema = z.object({
  sku: z
    .string()
    .min(2, "SKU must be at least 2 characters")
    .max(50, "SKU must not exceed 50 characters")
    .regex(/^[A-Z0-9-]+$/, "SKU must contain only uppercase letters, numbers, and hyphens"),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(200, "Name must not exceed 200 characters"),
  description: z.string().max(1000, "Description must not exceed 1000 characters").optional(),
  categoryId: z.string().uuid("Invalid category ID"),
  unit: z.string().max(20, "Unit must not exceed 20 characters").default("unit"),
  minStock: z.number().int().min(0, "Minimum stock cannot be negative").default(0),
  active: z.boolean().default(true),
});

/**
 * Schema for updating an existing product
 */
export const updateProductSchema = z.object({
  id: z.string().uuid("Invalid product ID"),
  sku: z
    .string()
    .min(2, "SKU must be at least 2 characters")
    .max(50, "SKU must not exceed 50 characters")
    .regex(/^[A-Z0-9-]+$/, "SKU must contain only uppercase letters, numbers, and hyphens")
    .optional(),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(200, "Name must not exceed 200 characters")
    .optional(),
  description: z.string().max(1000, "Description must not exceed 1000 characters").optional(),
  categoryId: z.string().uuid("Invalid category ID").optional(),
  unit: z.string().max(20, "Unit must not exceed 20 characters").optional(),
  minStock: z.number().int().min(0, "Minimum stock cannot be negative").optional(),
  active: z.boolean().optional(),
});

/**
 * Schema for deleting a product
 */
export const deleteProductSchema = z.object({
  id: z.string().uuid("Invalid product ID"),
});

/**
 * Schema for creating a product variant
 */
export const createVariantSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  sku: z
    .string()
    .min(2, "SKU must be at least 2 characters")
    .max(50, "SKU must not exceed 50 characters")
    .regex(/^[A-Z0-9-]+$/, "SKU must contain only uppercase letters, numbers, and hyphens"),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(200, "Name must not exceed 200 characters"),
  active: z.boolean().default(true),
});

/**
 * Schema for updating a product variant
 */
export const updateVariantSchema = z.object({
  id: z.string().uuid("Invalid variant ID"),
  sku: z
    .string()
    .min(2, "SKU must be at least 2 characters")
    .max(50, "SKU must not exceed 50 characters")
    .regex(/^[A-Z0-9-]+$/, "SKU must contain only uppercase letters, numbers, and hyphens")
    .optional(),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(200, "Name must not exceed 200 characters")
    .optional(),
  active: z.boolean().optional(),
});

/**
 * Schema for deleting a product variant
 */
export const deleteVariantSchema = z.object({
  id: z.string().uuid("Invalid variant ID"),
});

/**
 * Schema for adding a product attribute
 */
export const addAttributeSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  name: z
    .string()
    .min(1, "Attribute name is required")
    .max(100, "Attribute name must not exceed 100 characters"),
  value: z
    .string()
    .min(1, "Attribute value is required")
    .max(500, "Attribute value must not exceed 500 characters"),
});

/**
 * Schema for deleting a product attribute
 */
export const deleteAttributeSchema = z.object({
  id: z.string().uuid("Invalid attribute ID"),
});

/**
 * Type exports for use in server actions
 */
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type DeleteProductInput = z.infer<typeof deleteProductSchema>;
export type CreateVariantInput = z.infer<typeof createVariantSchema>;
export type UpdateVariantInput = z.infer<typeof updateVariantSchema>;
export type DeleteVariantInput = z.infer<typeof deleteVariantSchema>;
export type AddAttributeInput = z.infer<typeof addAttributeSchema>;
export type DeleteAttributeInput = z.infer<typeof deleteAttributeSchema>;
