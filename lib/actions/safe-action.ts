/**
 * Next Safe Action v8 Configuration
 *
 * This module configures type-safe server actions using Next Safe Action v8.0.11
 * with Better Auth session management and custom error handling.
 *
 * @see https://next-safe-action.dev/docs/safe-action-client
 */

import {
  createSafeActionClient,
  DEFAULT_SERVER_ERROR_MESSAGE,
  returnValidationErrors,
} from "next-safe-action";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/client";
import { z } from "zod";

/**
 * Custom error classes for domain-specific error handling
 */
export class ActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ActionError";
  }
}

export class PermissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PermissionError";
  }
}

/**
 * Metadata schema for action tracking
 * Tracks action name and execution timestamp
 */
const metadataSchema = z.object({
  actionName: z.string(),
  executedAt: z.date().optional(),
});

/**
 * Base action client without authentication
 *
 * Use this for public actions that don't require user session
 * Includes custom error handling and metadata tracking
 */
export const actionClient = createSafeActionClient({
  handleServerError(e) {
    // Log errors in development
    if (process.env.NODE_ENV === "development") {
      console.error("Action error:", e);
    }

    // Return user-friendly error messages
    if (e instanceof ActionError) {
      return e.message;
    }

    if (e instanceof PermissionError) {
      return e.message;
    }

    return DEFAULT_SERVER_ERROR_MESSAGE;
  },
  defineMetadataSchema() {
    return metadataSchema;
  },
});

/**
 * Authenticated action client with session middleware
 *
 * Use this for protected actions that require user authentication
 * Automatically provides session and user data to action context
 */
export const authActionClient = actionClient.use(async ({ next }) => {
  console.log("🔷 Auth middleware start");

  // Get session from Better Auth
  const session = await auth.api.getSession({
    headers: await (async () => {
      const { headers } = await import("next/headers");
      return headers();
    })(),
  });
  console.log("🔷 Session retrieved:", session ? "✓" : "✗");

  // Check if user is authenticated
  if (!session?.user || !session.session) {
    throw new PermissionError("Authentication required");
  }

  // Fetch full user data including role from database
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, role: true, active: true },
  });
  console.log("🔷 User found:", user?.email, "Role:", user?.role);

  if (!user || !user.active) {
    throw new PermissionError("User not found or inactive");
  }

  console.log("🔷 Auth middleware calling next()");
  // Pass session data to action context
  return next({
    ctx: {
      userId: user.id,
      userRole: user.role,
      userEmail: user.email,
      session: session.session,
    },
  });
});

/**
 * Export utility for validation errors
 * Used within actions to return business logic validation errors
 */
export { returnValidationErrors };

/**
 * Type helpers for action context
 */
export type AuthContext = {
  userId: string;
  userRole: string;
  userEmail: string;
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    token: string;
    ipAddress?: string | null;
    userAgent?: string | null;
  };
};
