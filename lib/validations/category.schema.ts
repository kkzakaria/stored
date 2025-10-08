/**
 * Category Validation Schemas
 *
 * Zod schemas for hierarchical category management operations.
 */

import { z } from "zod";

/**
 * Schema for creating a new category
 */
export const createCategorySchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),
  description: z.string().max(500, "Description must not exceed 500 characters").optional(),
  parentId: z.string().uuid("Invalid parent category ID").nullable().optional(),
  active: z.boolean().default(true),
});

/**
 * Schema for updating an existing category
 */
export const updateCategorySchema = z.object({
  id: z.string().uuid("Invalid category ID"),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters")
    .optional(),
  description: z.string().max(500, "Description must not exceed 500 characters").optional(),
  parentId: z.string().uuid("Invalid parent category ID").nullable().optional(),
  active: z.boolean().optional(),
});

/**
 * Schema for deleting a category
 */
export const deleteCategorySchema = z.object({
  id: z.string().uuid("Invalid category ID"),
});

/**
 * Schema for moving a category to a new parent
 */
export const moveCategorySchema = z
  .object({
    id: z.string().uuid("Invalid category ID"),
    newParentId: z.string().uuid("Invalid parent category ID").nullable(),
  })
  .refine(
    (data) => {
      // Cannot move category to itself
      if (data.newParentId === data.id) {
        return false;
      }
      return true;
    },
    {
      message: "Cannot move category to itself",
      path: ["newParentId"],
    }
  );

/**
 * Type exports for use in server actions
 */
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type DeleteCategoryInput = z.infer<typeof deleteCategorySchema>;
export type MoveCategoryInput = z.infer<typeof moveCategorySchema>;
