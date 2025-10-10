/**
 * Product Server Actions
 *
 * Type-safe server actions for product, variant, and attribute management.
 * Requires ADMINISTRATOR or MANAGER role for all operations.
 */

"use server";

// Force Node.js runtime for Prisma database operations
export const runtime = 'nodejs';

import { revalidatePath } from "next/cache";
import { authActionClient, PermissionError, returnValidationErrors } from "./safe-action";
import {
  createProductSchema,
  updateProductSchema,
  deleteProductSchema,
  createVariantSchema,
  updateVariantSchema,
  deleteVariantSchema,
  addAttributeSchema,
  deleteAttributeSchema,
} from "@/lib/validations/product.schema";
import { productRepository } from "@/lib/db/repositories";

/**
 * Check if user has product management permissions
 */
function checkProductPermissions(userRole: string) {
  if (userRole !== "ADMINISTRATOR" && userRole !== "MANAGER") {
    throw new PermissionError("Only administrators and managers can manage products");
  }
}

/**
 * Create a new product
 */
export const createProduct = authActionClient
  .metadata({ actionName: "createProduct" })
  .schema(createProductSchema)
  .action(async ({ parsedInput, ctx }) => {
    checkProductPermissions(ctx.userRole);

    // Check if SKU already exists
    const existing = await productRepository.findBySku(parsedInput.sku);
    if (existing) {
      returnValidationErrors(createProductSchema, {
        sku: {
          _errors: [`Product with SKU "${parsedInput.sku}" already exists`],
        },
      });
    }

    const product = await productRepository.createProduct({
      sku: parsedInput.sku,
      name: parsedInput.name,
      description: parsedInput.description,
      unit: parsedInput.unit,
      minStock: parsedInput.minStock,
      active: parsedInput.active,
      category: {
        connect: { id: parsedInput.categoryId },
      },
      creator: {
        connect: { id: ctx.userId },
      },
    });

    revalidatePath("/products");
    return { product };
  });

/**
 * Update an existing product
 */
export const updateProduct = authActionClient
  .metadata({ actionName: "updateProduct" })
  .schema(updateProductSchema)
  .action(async ({ parsedInput, ctx }) => {
    checkProductPermissions(ctx.userRole);

    const { id, ...updateData } = parsedInput;

    // Check if product exists
    const existing = await productRepository.findById(id);
    if (!existing) {
      returnValidationErrors(updateProductSchema, {
        id: {
          _errors: ["Product not found"],
        },
      });
    }

    // If updating SKU, check uniqueness
    if (updateData.sku && updateData.sku !== existing.sku) {
      const skuExists = await productRepository.findBySku(updateData.sku);
      if (skuExists) {
        returnValidationErrors(updateProductSchema, {
          sku: {
            _errors: [`Product with SKU "${updateData.sku}" already exists`],
          },
        });
      }
    }

    // Build update object with proper Prisma relations
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prismaUpdateData: any = {
      ...updateData,
    };

    if (updateData.categoryId) {
      delete prismaUpdateData.categoryId;
      Object.assign(prismaUpdateData, {
        category: {
          connect: { id: updateData.categoryId },
        },
      });
    }

    const product = await productRepository.update(id, prismaUpdateData);

    revalidatePath("/products");
    revalidatePath(`/products/${id}`);
    return { product };
  });

/**
 * Delete a product
 */
export const deleteProduct = authActionClient
  .metadata({ actionName: "deleteProduct" })
  .schema(deleteProductSchema)
  .action(async ({ parsedInput, ctx }) => {
    checkProductPermissions(ctx.userRole);

    // Check if product exists
    const existing = await productRepository.findById(parsedInput.id);
    if (!existing) {
      returnValidationErrors(deleteProductSchema, {
        id: {
          _errors: ["Product not found"],
        },
      });
    }

    await productRepository.delete(parsedInput.id);

    revalidatePath("/products");
    return { success: true };
  });

/**
 * Create a new product variant
 */
export const createVariant = authActionClient
  .metadata({ actionName: "createVariant" })
  .schema(createVariantSchema)
  .action(async ({ parsedInput, ctx }) => {
    checkProductPermissions(ctx.userRole);

    const variant = await productRepository.addVariant(parsedInput.productId, {
      sku: parsedInput.sku,
      name: parsedInput.name,
      active: parsedInput.active,
      attributes: {},
    });

    revalidatePath("/products");
    revalidatePath(`/products/${parsedInput.productId}`);
    return { variant };
  });

/**
 * Update an existing product variant
 */
export const updateVariant = authActionClient
  .metadata({ actionName: "updateVariant" })
  .schema(updateVariantSchema)
  .action(async ({ parsedInput, ctx }) => {
    checkProductPermissions(ctx.userRole);

    const { id, ...updateData } = parsedInput;

    const variant = await productRepository.updateVariant(id, updateData);

    revalidatePath("/products");
    revalidatePath(`/products/${variant.productId}`);
    return { variant };
  });

/**
 * Delete a product variant
 */
export const deleteVariant = authActionClient
  .metadata({ actionName: "deleteVariant" })
  .schema(deleteVariantSchema)
  .action(async ({ parsedInput, ctx }) => {
    checkProductPermissions(ctx.userRole);

    const variant = await productRepository.deleteVariant(parsedInput.id);

    revalidatePath("/products");
    revalidatePath(`/products/${variant.productId}`);
    return { success: true };
  });

/**
 * Add an attribute to a product
 */
export const addProductAttribute = authActionClient
  .metadata({ actionName: "addProductAttribute" })
  .schema(addAttributeSchema)
  .action(async ({ parsedInput, ctx }) => {
    checkProductPermissions(ctx.userRole);

    const attribute = await productRepository.addAttribute(
      parsedInput.productId,
      parsedInput.name,
      parsedInput.value
    );

    revalidatePath("/products");
    revalidatePath(`/products/${parsedInput.productId}`);
    return { attribute };
  });

/**
 * Delete a product attribute
 */
export const deleteProductAttribute = authActionClient
  .metadata({ actionName: "deleteProductAttribute" })
  .schema(deleteAttributeSchema)
  .action(async ({ parsedInput, ctx }) => {
    checkProductPermissions(ctx.userRole);

    const attribute = await productRepository.deleteAttribute(parsedInput.id);

    revalidatePath("/products");
    revalidatePath(`/products/${attribute.productId}`);
    return { success: true };
  });
