/**
 * User Validation Schemas
 *
 * Zod schemas for user management operations including
 * user CRUD and role management.
 */

import { z } from "zod";
import { UserRole } from "@prisma/client";

/**
 * Schema for creating a new user
 */
export const createUserSchema = z.object({
  email: z.string().email("Invalid email address").max(255, "Email must not exceed 255 characters"),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must not exceed 100 characters"),
  role: z.nativeEnum(UserRole, {
    message: "Invalid user role",
  }),
  active: z.boolean().default(true),
});

/**
 * Schema for updating an existing user
 */
export const updateUserSchema = z.object({
  id: z.string().uuid("Invalid user ID"),
  email: z
    .string()
    .email("Invalid email address")
    .max(255, "Email must not exceed 255 characters")
    .optional(),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters")
    .optional(),
  role: z
    .nativeEnum(UserRole, {
      message: "Invalid user role",
    })
    .optional(),
  active: z.boolean().optional(),
});

/**
 * Schema for deleting a user
 */
export const deleteUserSchema = z.object({
  id: z.string().uuid("Invalid user ID"),
});

/**
 * Schema for updating user password
 */
export const updatePasswordSchema = z.object({
  id: z.string().uuid("Invalid user ID"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must not exceed 100 characters"),
});

/**
 * Schema for toggling user active status
 */
export const toggleUserActiveSchema = z.object({
  id: z.string().uuid("Invalid user ID"),
});

/**
 * Type exports for use in server actions
 */
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type DeleteUserInput = z.infer<typeof deleteUserSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
export type ToggleUserActiveInput = z.infer<typeof toggleUserActiveSchema>;
