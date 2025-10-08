"use client";

import * as React from "react";
import { useSession } from "@/lib/auth/client";
import {
  hasPermission,
  hasRole,
  type Permission,
  type UserWithRole,
} from "@/lib/auth/permissions";
import { UserRole } from "@prisma/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";

interface PermissionGuardProps {
  children: React.ReactNode;
  permission?: Permission;
  role?: UserRole;
  fallback?: React.ReactNode;
  requireAll?: boolean; // Si true, nécessite permission ET role
}

export function PermissionGuard({
  children,
  permission,
  role,
  fallback,
  requireAll = false,
}: PermissionGuardProps) {
  const { data: session, isPending } = useSession();

  // Loading state
  if (isPending) {
    return null;
  }

  // Not authenticated
  if (!session?.user) {
    return (
      fallback || (
        <Alert variant="destructive">
          <ShieldAlert className="size-4" />
          <AlertTitle>Accès refusé</AlertTitle>
          <AlertDescription>
            Vous devez être connecté pour accéder à cette ressource.
          </AlertDescription>
        </Alert>
      )
    );
  }

  const user = session.user as unknown as UserWithRole;

  // Check permissions
  let hasAccess = true;

  if (permission && role) {
    // Both permission and role required
    if (requireAll) {
      hasAccess = hasPermission(user, permission) && hasRole(user, role);
    } else {
      // Either permission or role is sufficient
      hasAccess = hasPermission(user, permission) || hasRole(user, role);
    }
  } else if (permission) {
    hasAccess = hasPermission(user, permission);
  } else if (role) {
    hasAccess = hasRole(user, role);
  }

  if (!hasAccess) {
    return (
      fallback || (
        <Alert variant="destructive">
          <ShieldAlert className="size-4" />
          <AlertTitle>Accès refusé</AlertTitle>
          <AlertDescription>
            Vous n&apos;avez pas les permissions nécessaires pour accéder à
            cette ressource.
          </AlertDescription>
        </Alert>
      )
    );
  }

  return <>{children}</>;
}
