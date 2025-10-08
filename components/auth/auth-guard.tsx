"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth/client";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Client-side authentication guard component
 *
 * Protects routes and components based on authentication status.
 * For role and permission checks, use server-side validation with Prisma.
 *
 * @example
 * <AuthGuard>
 *   <Dashboard />
 * </AuthGuard>
 */
export function AuthGuard({
  children,
  fallback = null,
}: AuthGuardProps) {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  // Loading state
  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  // Not authenticated
  if (!session) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
