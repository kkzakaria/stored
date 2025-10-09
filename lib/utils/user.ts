import { UserRole } from "@prisma/client";
import { LucideIcon, Shield, ShieldCheck, User, Eye, EyeOff } from "lucide-react";

/**
 * User Utility Functions
 * Helper functions for user management, role handling, and formatting
 */

// ============================================================================
// Role Configuration
// ============================================================================

export interface RoleInfo {
  value: UserRole;
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
  permissions: string[];
}

export const ROLE_INFO: Record<UserRole, RoleInfo> = {
  ADMINISTRATOR: {
    value: "ADMINISTRATOR",
    label: "Administrator",
    description: "Full system access with all permissions including user management",
    icon: ShieldCheck,
    color: "text-red-600 dark:text-red-400",
    permissions: [
      "Manage all users and roles",
      "Full access to all warehouses",
      "Create, edit, and delete all resources",
      "Perform inventory adjustments",
      "View all data and reports",
    ],
  },
  MANAGER: {
    value: "MANAGER",
    label: "Manager",
    description: "Manage assigned warehouses, products, and team operations",
    icon: Shield,
    color: "text-orange-600 dark:text-orange-400",
    permissions: [
      "Manage assigned warehouses",
      "Create and edit products",
      "Perform all stock movements",
      "Inventory adjustments in assigned warehouses",
      "View reports for assigned areas",
    ],
  },
  USER: {
    value: "USER",
    label: "User",
    description: "Create and update products and movements in assigned warehouses",
    icon: User,
    color: "text-blue-600 dark:text-blue-400",
    permissions: [
      "Access assigned warehouses",
      "Create and update products",
      "Perform stock IN/OUT/TRANSFER",
      "View inventory in assigned warehouses",
      "Cannot perform adjustments",
    ],
  },
  VISITOR_ADMIN: {
    value: "VISITOR_ADMIN",
    label: "Visitor Admin",
    description: "Read-only access to all system data and reports",
    icon: Eye,
    color: "text-green-600 dark:text-green-400",
    permissions: [
      "View all warehouses and products",
      "View all stock movements",
      "Access all reports",
      "No editing permissions",
      "Full read-only visibility",
    ],
  },
  VISITOR: {
    value: "VISITOR",
    label: "Visitor",
    description: "Read-only access to assigned warehouses only",
    icon: EyeOff,
    color: "text-gray-600 dark:text-gray-400",
    permissions: [
      "View assigned warehouses only",
      "View products in assigned areas",
      "View stock movements",
      "No editing permissions",
      "Limited visibility",
    ],
  },
};

// ============================================================================
// Role Helper Functions
// ============================================================================

/**
 * Get role information with icon, color, and permissions
 */
export function getRoleInfo(role: UserRole): RoleInfo {
  return ROLE_INFO[role];
}

/**
 * Get role label for display
 */
export function getRoleLabel(role: UserRole): string {
  return ROLE_INFO[role].label;
}

/**
 * Get role icon component
 */
export function getRoleIcon(role: UserRole): LucideIcon {
  return ROLE_INFO[role].icon;
}

/**
 * Get role color class
 */
export function getRoleColor(role: UserRole): string {
  return ROLE_INFO[role].color;
}

/**
 * Get role description
 */
export function getRoleDescription(role: UserRole): string {
  return ROLE_INFO[role].description;
}

/**
 * Get role permissions list
 */
export function getRolePermissions(role: UserRole): string[] {
  return ROLE_INFO[role].permissions;
}

/**
 * Check if role is admin (ADMINISTRATOR)
 */
export function isAdminRole(role: UserRole): boolean {
  return role === "ADMINISTRATOR";
}

/**
 * Check if role is manager or higher
 */
export function isManagerOrHigher(role: UserRole): boolean {
  return role === "ADMINISTRATOR" || role === "MANAGER";
}

/**
 * Check if role has write access by default
 */
export function hasWriteAccess(role: UserRole): boolean {
  return role === "ADMINISTRATOR" || role === "MANAGER" || role === "USER";
}

/**
 * Check if role is read-only
 */
export function isReadOnlyRole(role: UserRole): boolean {
  return role === "VISITOR_ADMIN" || role === "VISITOR";
}

/**
 * Get all available roles for selection
 */
export function getAllRoles(): UserRole[] {
  return Object.keys(ROLE_INFO) as UserRole[];
}

// ============================================================================
// User Status Functions
// ============================================================================

export interface UserStatusInfo {
  label: string;
  color: string;
  variant: "default" | "secondary" | "destructive" | "outline";
}

/**
 * Get user status badge info
 */
export function getUserStatusInfo(active: boolean): UserStatusInfo {
  return active
    ? {
        label: "Active",
        color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        variant: "default",
      }
    : {
        label: "Inactive",
        color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
        variant: "secondary",
      };
}

// ============================================================================
// User Formatting Functions
// ============================================================================

/**
 * Get user initials from name
 */
export function getUserInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Format user full name
 */
export function formatUserName(name: string | null): string {
  return name || "Unknown User";
}

/**
 * Get user display name with email fallback
 */
export function getUserDisplayName(name: string | null, email: string): string {
  return name || email;
}

// ============================================================================
// Password Validation
// ============================================================================

export interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
  suggestions: string[];
}

/**
 * Calculate password strength
 */
export function getPasswordStrength(password: string): PasswordStrength {
  let score = 0;
  const suggestions: string[] = [];

  // Length check
  if (password.length >= 8) score++;
  else suggestions.push("Use at least 8 characters");

  if (password.length >= 12) score++;
  else if (password.length >= 8) suggestions.push("Consider using 12+ characters");

  // Character variety
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score++;
  } else {
    suggestions.push("Mix uppercase and lowercase letters");
  }

  if (/\d/.test(password)) {
    score++;
  } else {
    suggestions.push("Include numbers");
  }

  if (/[^a-zA-Z0-9]/.test(password)) {
    score++;
  } else {
    suggestions.push("Add special characters (!@#$%...)");
  }

  // Cap at 4
  score = Math.min(score, 4);

  // Determine label and color
  let label: string;
  let color: string;

  if (score === 0) {
    label = "Very Weak";
    color = "bg-red-500";
  } else if (score === 1) {
    label = "Weak";
    color = "bg-orange-500";
  } else if (score === 2) {
    label = "Fair";
    color = "bg-yellow-500";
  } else if (score === 3) {
    label = "Good";
    color = "bg-blue-500";
  } else {
    label = "Strong";
    color = "bg-green-500";
  }

  return { score, label, color, suggestions };
}

/**
 * Validate password meets minimum requirements
 */
export function isPasswordValid(password: string): boolean {
  return password.length >= 8;
}

// ============================================================================
// User Statistics
// ============================================================================

/**
 * Get user statistics summary
 */
export function getUserStatsSummary(user: {
  warehouseAccess: { id: string }[];
  movements: { id: string }[];
}): {
  warehouseCount: number;
  movementCount: number;
} {
  return {
    warehouseCount: user.warehouseAccess?.length || 0,
    movementCount: user.movements?.length || 0,
  };
}

// ============================================================================
// User Filtering
// ============================================================================

/**
 * Filter users by search query (name or email)
 */
export function filterUsersBySearch<T extends { name: string | null; email: string }>(
  users: T[],
  query: string
): T[] {
  if (!query.trim()) return users;

  const searchLower = query.toLowerCase();
  return users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
  );
}

/**
 * Filter users by role
 */
export function filterUsersByRole<T extends { role: UserRole }>(
  users: T[],
  role: UserRole | null
): T[] {
  if (!role) return users;
  return users.filter((user) => user.role === role);
}

/**
 * Filter users by active status
 */
export function filterUsersByStatus<T extends { active: boolean }>(
  users: T[],
  activeOnly: boolean
): T[] {
  if (!activeOnly) return users;
  return users.filter((user) => user.active);
}
