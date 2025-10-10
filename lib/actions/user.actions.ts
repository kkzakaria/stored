/**
 * User Server Actions
 *
 * Type-safe server actions for user management operations.
 * Requires ADMINISTRATOR role for all operations.
 */

"use server";

// Force Node.js runtime for Prisma database operations
export const runtime = 'nodejs';

import { revalidatePath } from "next/cache";
import { authActionClient, PermissionError, returnValidationErrors } from "./safe-action";
import {
  createUserSchema,
  updateUserSchema,
  deleteUserSchema,
  updatePasswordSchema,
  toggleUserActiveSchema,
} from "@/lib/validations/user.schema";
import { userRepository } from "@/lib/db/repositories";
import { prisma } from "@/lib/db/client";
import bcrypt from "bcryptjs";

/**
 * Check if user has admin permissions
 */
function checkAdminPermissions(userRole: string) {
  if (userRole !== "ADMINISTRATOR") {
    throw new PermissionError("Only administrators can manage users");
  }
}

/**
 * Create a new user
 */
export const createUser = authActionClient
  .metadata({ actionName: "createUser" })
  .schema(createUserSchema)
  .action(async ({ parsedInput, ctx }) => {
    checkAdminPermissions(ctx.userRole);

    // Check if email already exists
    const existing = await userRepository.findByEmail(parsedInput.email);
    if (existing) {
      returnValidationErrors(createUserSchema, {
        email: {
          _errors: [`User with email "${parsedInput.email}" already exists`],
        },
      });
    }

    // Hash password using bcrypt (Better Auth compatible)
    const hashedPassword = await bcrypt.hash(parsedInput.password, 10);

    // Create user and credential account in transaction
    const user = await prisma.$transaction(async (tx) => {
      // Create user
      const newUser = await tx.user.create({
        data: {
          email: parsedInput.email,
          name: parsedInput.name,
          role: parsedInput.role,
          active: parsedInput.active,
          emailVerified: false,
        },
      });

      // Create credential account with password
      await tx.account.create({
        data: {
          userId: newUser.id,
          providerId: "credential",
          accountId: parsedInput.email,
          password: hashedPassword,
        },
      });

      return newUser;
    });

    revalidatePath("/users");
    return { user };
  });

/**
 * Update an existing user
 */
export const updateUser = authActionClient
  .metadata({ actionName: "updateUser" })
  .schema(updateUserSchema)
  .action(async ({ parsedInput, ctx }) => {
    checkAdminPermissions(ctx.userRole);

    const { id, ...updateData } = parsedInput;

    // Check if user exists
    const existing = await userRepository.findById(id);
    if (!existing) {
      returnValidationErrors(updateUserSchema, {
        id: {
          _errors: ["User not found"],
        },
      });
    }

    // If updating email, check uniqueness
    if (updateData.email && updateData.email !== existing.email) {
      const emailExists = await userRepository.findByEmail(updateData.email);
      if (emailExists) {
        returnValidationErrors(updateUserSchema, {
          email: {
            _errors: [`User with email "${updateData.email}" already exists`],
          },
        });
      }
    }

    const user = await userRepository.update(id, updateData);

    revalidatePath("/users");
    revalidatePath(`/users/${id}`);
    return { user };
  });

/**
 * Delete a user
 */
export const deleteUser = authActionClient
  .metadata({ actionName: "deleteUser" })
  .schema(deleteUserSchema)
  .action(async ({ parsedInput, ctx }) => {
    checkAdminPermissions(ctx.userRole);

    // Prevent self-deletion
    if (parsedInput.id === ctx.userId) {
      returnValidationErrors(deleteUserSchema, {
        id: {
          _errors: ["You cannot delete your own account"],
        },
      });
    }

    // Check if user exists
    const existing = await userRepository.findById(parsedInput.id);
    if (!existing) {
      returnValidationErrors(deleteUserSchema, {
        id: {
          _errors: ["User not found"],
        },
      });
    }

    await userRepository.delete(parsedInput.id);

    revalidatePath("/users");
    return { success: true };
  });

/**
 * Update user password
 */
export const updateUserPassword = authActionClient
  .metadata({ actionName: "updateUserPassword" })
  .schema(updatePasswordSchema)
  .action(async ({ parsedInput, ctx }) => {
    checkAdminPermissions(ctx.userRole);

    // Check if user exists
    const existing = await userRepository.findById(parsedInput.id);
    if (!existing) {
      returnValidationErrors(updatePasswordSchema, {
        id: {
          _errors: ["User not found"],
        },
      });
    }

    // Hash new password using bcrypt (Better Auth compatible)
    const hashedPassword = await bcrypt.hash(parsedInput.newPassword, 10);

    // Update password in credential account
    await prisma.account.updateMany({
      where: {
        userId: parsedInput.id,
        providerId: "credential",
      },
      data: {
        password: hashedPassword,
      },
    });

    revalidatePath("/users");
    revalidatePath(`/users/${parsedInput.id}`);
    return { success: true };
  });

/**
 * Toggle user active status
 */
export const toggleUserActive = authActionClient
  .metadata({ actionName: "toggleUserActive" })
  .schema(toggleUserActiveSchema)
  .action(async ({ parsedInput, ctx }) => {
    checkAdminPermissions(ctx.userRole);

    // Prevent self-deactivation
    if (parsedInput.id === ctx.userId) {
      returnValidationErrors(toggleUserActiveSchema, {
        id: {
          _errors: ["You cannot deactivate your own account"],
        },
      });
    }

    const user = await userRepository.toggleActive(parsedInput.id);

    revalidatePath("/users");
    revalidatePath(`/users/${parsedInput.id}`);
    return { user };
  });
