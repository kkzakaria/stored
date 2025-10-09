import { UserRole, MovementType } from "@prisma/client";

// Application
export const APP_NAME = "Gestion de Stock";
export const APP_DESCRIPTION = "Système de gestion de stock multi-entrepôts";

// Routes
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  PRODUCTS: "/products",
  PRODUCT_DETAIL: (id: string) => `/products/${id}`,
  PRODUCT_NEW: "/products/new",
  WAREHOUSES: "/warehouses",
  WAREHOUSE_DETAIL: (id: string) => `/warehouses/${id}`,
  WAREHOUSE_NEW: "/warehouses/new",
  STOCK: "/stock",
  MOVEMENTS: "/movements",
  MOVEMENT_DETAIL: (id: string) => `/movements/${id}`,
  MOVEMENT_NEW: "/movements/new",
  CATEGORIES: "/categories",
  USERS: "/users",
  USER_DETAIL: (id: string) => `/users/${id}`,
  USER_NEW: "/users/new",
  REPORTS: "/reports",
  SETTINGS: "/settings",
} as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
export const MAX_PAGE_SIZE = 100;

// Date formats
export const DATE_FORMAT = "dd/MM/yyyy";
export const DATETIME_FORMAT = "dd/MM/yyyy HH:mm";
export const TIME_FORMAT = "HH:mm";
export const DATE_FORMAT_ISO = "yyyy-MM-dd";

// User Roles (French labels)
export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADMINISTRATOR]: "Administrateur",
  [UserRole.MANAGER]: "Gestionnaire",
  [UserRole.USER]: "Utilisateur",
  [UserRole.VISITOR_ADMIN]: "Visiteur Admin",
  [UserRole.VISITOR]: "Visiteur",
};

export const USER_ROLE_COLORS: Record<UserRole, string> = {
  [UserRole.ADMINISTRATOR]: "destructive",
  [UserRole.MANAGER]: "default",
  [UserRole.USER]: "secondary",
  [UserRole.VISITOR_ADMIN]: "outline",
  [UserRole.VISITOR]: "outline",
};

// Movement Types (French labels)
export const MOVEMENT_TYPE_LABELS: Record<MovementType, string> = {
  [MovementType.IN]: "Entrée",
  [MovementType.OUT]: "Sortie",
  [MovementType.TRANSFER]: "Transfert",
  [MovementType.ADJUSTMENT]: "Ajustement",
};

export const MOVEMENT_TYPE_COLORS: Record<MovementType, string> = {
  [MovementType.IN]: "default",
  [MovementType.OUT]: "destructive",
  [MovementType.TRANSFER]: "secondary",
  [MovementType.ADJUSTMENT]: "outline",
};

// Stock status thresholds
export const LOW_STOCK_THRESHOLD = 0.2; // 20% of minimum stock
export const OUT_OF_STOCK_THRESHOLD = 0;

// Validation
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 128;
export const MIN_NAME_LENGTH = 2;
export const MAX_NAME_LENGTH = 100;
export const MAX_DESCRIPTION_LENGTH = 500;
export const MAX_NOTES_LENGTH = 1000;

// Units
export const QUANTITY_UNITS = [
  "pièce",
  "kg",
  "g",
  "L",
  "mL",
  "m",
  "cm",
  "m²",
  "m³",
  "carton",
  "palette",
] as const;

export type QuantityUnit = (typeof QUANTITY_UNITS)[number];
