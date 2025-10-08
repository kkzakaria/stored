import { PrismaClient } from "@prisma/client";

/**
 * PrismaClient singleton pattern
 * Prevents multiple instances in development due to hot reloading
 * Ensures optimal connection pooling
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/**
 * Helper to safely disconnect from database
 * Use in API cleanup or testing scenarios
 */
export const disconnectPrisma = async () => {
  await prisma.$disconnect();
};

export default prisma;
