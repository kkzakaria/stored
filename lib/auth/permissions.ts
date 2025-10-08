import { UserRole } from "@prisma/client";

export interface UserWithRole {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  active: boolean;
}

export type Permission =
  | "products:read"
  | "products:write"
  | "products:delete"
  | "warehouses:read"
  | "warehouses:write"
  | "warehouses:delete"
  | "stock:read"
  | "stock:write"
  | "movements:read"
  | "movements:write"
  | "categories:read"
  | "categories:write"
  | "categories:delete"
  | "users:read"
  | "users:write"
  | "users:delete"
  | "admin:access";

/**
 * Permission matrix for each user role
 *
 * ADMINISTRATOR: Full system access
 * MANAGER: Manage assigned warehouses and products
 * USER: Basic operations in assigned warehouses
 * VISITOR_ADMIN: Extended read access across system
 * VISITOR: Limited read access
 */
const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.ADMINISTRATOR]: [
    "products:read",
    "products:write",
    "products:delete",
    "warehouses:read",
    "warehouses:write",
    "warehouses:delete",
    "stock:read",
    "stock:write",
    "movements:read",
    "movements:write",
    "categories:read",
    "categories:write",
    "categories:delete",
    "users:read",
    "users:write",
    "users:delete",
    "admin:access",
  ],
  [UserRole.MANAGER]: [
    "products:read",
    "products:write",
    "warehouses:read",
    "warehouses:write",
    "stock:read",
    "stock:write",
    "movements:read",
    "movements:write",
    "categories:read",
    "users:read",
  ],
  [UserRole.USER]: [
    "products:read",
    "warehouses:read",
    "stock:read",
    "stock:write",
    "movements:read",
    "movements:write",
    "categories:read",
  ],
  [UserRole.VISITOR_ADMIN]: [
    "products:read",
    "warehouses:read",
    "stock:read",
    "movements:read",
    "categories:read",
    "users:read",
  ],
  [UserRole.VISITOR]: [
    "products:read",
    "warehouses:read",
    "stock:read",
    "categories:read",
  ],
};

/**
 * Check if a user has a specific permission
 */
export function hasPermission(user: UserWithRole, permission: Permission): boolean {
  if (!user.active) {
    return false;
  }

  const userRole = user.role as UserRole;
  const permissions = rolePermissions[userRole] || [];
  return permissions.includes(permission);
}

/**
 * Check if a user has a specific role
 */
export function hasRole(user: UserWithRole, role: UserRole): boolean {
  return user.role === role && user.active;
}

/**
 * Check if a user is an administrator
 */
export function isAdmin(user: UserWithRole): boolean {
  return hasRole(user, UserRole.ADMINISTRATOR);
}

/**
 * Check if a user is a manager
 */
export function isManager(user: UserWithRole): boolean {
  return hasRole(user, UserRole.MANAGER);
}

/**
 * Check if a user can write (create/update)
 */
export function canWrite(user: UserWithRole, resource: string): boolean {
  const permission = `${resource}:write` as Permission;
  return hasPermission(user, permission);
}

/**
 * Check if a user can read
 */
export function canRead(user: UserWithRole, resource: string): boolean {
  const permission = `${resource}:read` as Permission;
  return hasPermission(user, permission);
}

/**
 * Check if a user can delete
 */
export function canDelete(user: UserWithRole, resource: string): boolean {
  const permission = `${resource}:delete` as Permission;
  return hasPermission(user, permission);
}

/**
 * Get all permissions for a user
 */
export function getUserPermissions(user: UserWithRole): Permission[] {
  if (!user.active) {
    return [];
  }

  const userRole = user.role as UserRole;
  return rolePermissions[userRole] || [];
}

/**
 * Require a specific permission - throws if not authorized
 */
export function requirePermission(user: UserWithRole, permission: Permission): void {
  if (!hasPermission(user, permission)) {
    throw new Error(`Unauthorized: Missing permission ${permission}`);
  }
}

/**
 * Require a specific role - throws if not authorized
 */
export function requireRole(user: UserWithRole, role: UserRole): void {
  if (!hasRole(user, role)) {
    throw new Error(`Unauthorized: Required role ${role}`);
  }
}
