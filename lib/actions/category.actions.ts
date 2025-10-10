/**
 * Category Server Actions
 *
 * Type-safe server actions for hierarchical category management.
 * Requires ADMINISTRATOR or MANAGER role for all operations.
 */

"use server";

// Force Node.js runtime for Prisma database operations
export const runtime = 'nodejs';

import { revalidatePath } from "next/cache";
import { authActionClient, PermissionError, returnValidationErrors } from "./safe-action";
import {
  createCategorySchema,
  updateCategorySchema,
  deleteCategorySchema,
  moveCategorySchema,
} from "@/lib/validations/category.schema";
import { categoryRepository } from "@/lib/db/repositories";

/**
 * Check if user has category management permissions
 */
function checkCategoryPermissions(userRole: string) {
  if (userRole !== "ADMINISTRATOR" && userRole !== "MANAGER") {
    throw new PermissionError("Only administrators and managers can manage categories");
  }
}

/**
 * Create a new category
 */
export const createCategory = authActionClient
  .metadata({ actionName: "createCategory" })
  .schema(createCategorySchema)
  .action(async ({ parsedInput, ctx }) => {
    checkCategoryPermissions(ctx.userRole);

    // If parent specified, verify it exists
    if (parsedInput.parentId) {
      const parent = await categoryRepository.findById(parsedInput.parentId);
      if (!parent) {
        returnValidationErrors(createCategorySchema, {
          parentId: {
            _errors: ["Parent category not found"],
          },
        });
      }
    }

    const category = await categoryRepository.create({
      name: parsedInput.name,
      description: parsedInput.description,
      active: parsedInput.active ?? true,
      parent: parsedInput.parentId ? { connect: { id: parsedInput.parentId } } : undefined,
    });

    revalidatePath("/categories");
    return { category };
  });

/**
 * Update an existing category
 */
export const updateCategory = authActionClient
  .metadata({ actionName: "updateCategory" })
  .schema(updateCategorySchema)
  .action(async ({ parsedInput, ctx }) => {
    checkCategoryPermissions(ctx.userRole);

    const { id, ...updateData } = parsedInput;

    // Check if category exists
    const existing = await categoryRepository.findById(id);
    if (!existing) {
      returnValidationErrors(updateCategorySchema, {
        id: {
          _errors: ["Category not found"],
        },
      });
    }

    // If updating parent, verify it exists and prevent circular references
    if (updateData.parentId !== undefined) {
      if (updateData.parentId === id) {
        returnValidationErrors(updateCategorySchema, {
          parentId: {
            _errors: ["A category cannot be its own parent"],
          },
        });
      }

      if (updateData.parentId) {
        const parent = await categoryRepository.findById(updateData.parentId);
        if (!parent) {
          returnValidationErrors(updateCategorySchema, {
            parentId: {
              _errors: ["Parent category not found"],
            },
          });
        }

        // Check for circular reference
        const descendants = await categoryRepository.getDescendantIds(id);
        if (descendants.includes(updateData.parentId)) {
          returnValidationErrors(updateCategorySchema, {
            parentId: {
              _errors: ["Cannot move category to one of its descendants (circular reference)"],
            },
          });
        }
      }
    }

    // Build update object with proper Prisma relations
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prismaUpdateData: any = {
      ...updateData,
    };

    if (updateData.parentId !== undefined) {
      delete prismaUpdateData.parentId;
      if (updateData.parentId === null) {
        Object.assign(prismaUpdateData, {
          parent: { disconnect: true },
        });
      } else {
        Object.assign(prismaUpdateData, {
          parent: { connect: { id: updateData.parentId } },
        });
      }
    }

    const category = await categoryRepository.update(id, prismaUpdateData);

    revalidatePath("/categories");
    revalidatePath(`/categories/${id}`);
    return { category };
  });

/**
 * Delete a category
 */
export const deleteCategory = authActionClient
  .metadata({ actionName: "deleteCategory" })
  .schema(deleteCategorySchema)
  .action(async ({ parsedInput, ctx }) => {
    checkCategoryPermissions(ctx.userRole);

    // Check if category exists
    const existing = await categoryRepository.findById(parsedInput.id);
    if (!existing) {
      returnValidationErrors(deleteCategorySchema, {
        id: {
          _errors: ["Category not found"],
        },
      });
    }

    // Check if category has children
    const descendants = await categoryRepository.getDescendantIds(parsedInput.id);
    if (descendants.length > 1) {
      // More than 1 because it includes itself
      returnValidationErrors(deleteCategorySchema, {
        id: {
          _errors: [
            "Cannot delete category with subcategories. Please delete or move subcategories first.",
          ],
        },
      });
    }

    await categoryRepository.delete(parsedInput.id);

    revalidatePath("/categories");
    return { success: true };
  });

/**
 * Move a category to a new parent
 */
export const moveCategory = authActionClient
  .metadata({ actionName: "moveCategory" })
  .schema(moveCategorySchema)
  .action(async ({ parsedInput, ctx }) => {
    checkCategoryPermissions(ctx.userRole);

    // Check if category exists
    const existing = await categoryRepository.findById(parsedInput.id);
    if (!existing) {
      returnValidationErrors(moveCategorySchema, {
        id: {
          _errors: ["Category not found"],
        },
      });
    }

    // If new parent specified, verify it exists and prevent circular references
    if (parsedInput.newParentId) {
      const parent = await categoryRepository.findById(parsedInput.newParentId);
      if (!parent) {
        returnValidationErrors(moveCategorySchema, {
          newParentId: {
            _errors: ["Parent category not found"],
          },
        });
      }

      // Check for circular reference
      const descendants = await categoryRepository.getDescendantIds(parsedInput.id);
      if (descendants.includes(parsedInput.newParentId)) {
        returnValidationErrors(moveCategorySchema, {
          newParentId: {
            _errors: ["Cannot move category to one of its descendants (circular reference)"],
          },
        });
      }
    }

    const category = await categoryRepository.moveCategory(
      parsedInput.id,
      parsedInput.newParentId
    );

    revalidatePath("/categories");
    revalidatePath(`/categories/${parsedInput.id}`);
    return { category };
  });
