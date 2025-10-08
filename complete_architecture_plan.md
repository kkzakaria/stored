# Plan Architectural Complet

## Application de Gestion de Stock Multi-Entrepôts

---

## Table des Matières

1. [Vue d'Ensemble](#1-vue-densemble)
2. [Stack Technique](#2-stack-technique)
3. [Architecture Globale](#3-architecture-globale)
4. [Structure du Projet](#4-structure-du-projet)
5. [Couche Base de Données](#5-couche-base-de-données)
6. [Couche d'Accès aux Données](#6-couche-daccès-aux-données)
7. [Couche Business Logic](#7-couche-business-logic)
8. [Couche Présentation](#8-couche-présentation)
9. [Gestion de l'État](#9-gestion-de-létat)
10. [Sécurité et Authentification](#10-sécurité-et-authentification)
11. [Système de Permissions](#11-système-de-permissions)
12. [Validation des Données](#12-validation-des-données)
13. [Patterns et Principes](#13-patterns-et-principes)
14. [Flux de Données](#14-flux-de-données)
15. [Modules Fonctionnels](#15-modules-fonctionnels)
16. [Installation et Configuration](#16-installation-et-configuration)

---

## 1. Vue d'Ensemble

### 1.1 Objectif du Système

Application web de gestion de stock multi-entrepôts permettant :

- Gestion centralisée de plusieurs entrepôts
- Suivi en temps réel des stocks
- Mouvements de stock inter-entrepôts
- Système de permissions granulaire
- Catégorisation avancée des produits avec variantes

### 1.2 Principes Architecturaux

- **Server-First Architecture** : Maximiser les Server Components
- **Type Safety** : TypeScript strict de bout en bout
- **SOLID** : Séparation des responsabilités
- **DRY** : Éviter la duplication de code
- **Open/Closed** : Ouvert à l'extension, fermé à la modification
- **Performance** : Optimisation des requêtes et du rendu

### 1.3 Contraintes Techniques

- Next.js 15 avec App Router uniquement
- Pas de dossier `src/`
- Server Components par défaut
- Client Components uniquement pour l'interaction utilisateur
- PostgreSQL comme source de vérité unique

---

## 2. Stack Technique

### 2.1 Frontend

| Technologie | Version | Usage |
|-------------|---------|-------|
| Next.js | 15.x | Framework React avec App Router |
| React | 19.x | Bibliothèque UI |
| TypeScript | 5.x | Typage statique |
| Tailwind CSS | 3.x | Styling |
| Shadcn UI | Latest | Composants UI |

### 2.2 Backend

| Technologie | Version | Usage |
|-------------|---------|-------|
| Next.js API Routes | 15.x | Endpoints API |
| Prisma | 5.x | ORM |
| PostgreSQL | 15+ | Base de données |
| Better Auth | Latest | Authentification |
| Next Safe Action | Latest | Server Actions sécurisées |

### 2.3 État et Routing

| Technologie | Version | Usage |
|-------------|---------|-------|
| Nuqs | Latest | État dans l'URL |
| Zustand | 4.x | État global client |
| Zod | 3.x | Validation des schémas |

### 2.4 Outils de Développement

- ESLint + Prettier
- Husky (Git hooks)
- TypeScript en mode strict
- Prisma Studio pour la DB

---

## 3. Architecture Globale

### 3.1 Diagramme en Couches

```text
┌─────────────────────────────────────────────────────────┐
│                    PRÉSENTATION                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Server     │  │   Client     │  │   Shared     │  │
│  │  Components  │  │  Components  │  │  Components  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────┐
│                  BUSINESS LOGIC                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Server     │  │  Validation  │  │  Permissions │  │
│  │   Actions    │  │   Schemas    │  │    Logic     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────┐
│                 DATA ACCESS LAYER                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Repositories │  │   Services   │  │    Utils     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────┐
│                   DATABASE LAYER                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │    Prisma    │  │  PostgreSQL  │  │  Migrations  │  │
│  │    Client    │  │   Database   │  │              │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 3.2 Flux de Communication

```text
User Action
    ↓
Client Component (onClick, onChange)
    ↓
Server Action (Next Safe Action)
    ↓
Validation (Zod Schema)
    ↓
Permission Check (Better Auth)
    ↓
Repository Method
    ↓
Prisma Query
    ↓
PostgreSQL
    ↓
Response
    ↓
Revalidation (Next.js Cache)
    ↓
UI Update
```

---

## 4. Structure du Projet

### 4.1 Arborescence Complète

```text
stock-management/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   ├── page.tsx
│   │   │   └── _components/
│   │   │       └── login-form.tsx
│   │   └── layout.tsx
│   │
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   └── _components/
│   │   │       ├── stats-cards.tsx
│   │   │       ├── recent-movements.tsx
│   │   │       └── stock-alerts.tsx
│   │   │
│   │   ├── warehouses/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx
│   │   │   │   └── edit/
│   │   │   │       └── page.tsx
│   │   │   └── _components/
│   │   │       ├── warehouse-list.tsx
│   │   │       ├── warehouse-card.tsx
│   │   │       ├── warehouse-filters.tsx
│   │   │       ├── create-warehouse-dialog.tsx
│   │   │       ├── edit-warehouse-form.tsx
│   │   │       └── warehouse-access-manager.tsx
│   │   │
│   │   ├── products/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx
│   │   │   │   └── edit/
│   │   │   │       └── page.tsx
│   │   │   └── _components/
│   │   │       ├── product-list.tsx
│   │   │       ├── product-card.tsx
│   │   │       ├── product-filters.tsx
│   │   │       ├── create-product-dialog.tsx
│   │   │       ├── product-form.tsx
│   │   │       ├── variant-manager.tsx
│   │   │       ├── attribute-manager.tsx
│   │   │       └── category-selector.tsx
│   │   │
│   │   ├── movements/
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── _components/
│   │   │       ├── movement-list.tsx
│   │   │       ├── movement-filters.tsx
│   │   │       ├── create-movement-dialog.tsx
│   │   │       ├── transfer-form.tsx
│   │   │       ├── in-form.tsx
│   │   │       ├── out-form.tsx
│   │   │       └── adjustment-form.tsx
│   │   │
│   │   ├── users/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   └── _components/
│   │   │       ├── user-list.tsx
│   │   │       ├── user-card.tsx
│   │   │       ├── create-user-dialog.tsx
│   │   │       ├── user-form.tsx
│   │   │       └── assign-warehouses.tsx
│   │   │
│   │   ├── reports/
│   │   │   ├── page.tsx
│   │   │   └── _components/
│   │   │       ├── stock-report.tsx
│   │   │       ├── movement-report.tsx
│   │   │       ├── warehouse-report.tsx
│   │   │       └── export-button.tsx
│   │   │
│   │   └── layout.tsx
│   │
│   ├── api/
│   │   └── auth/
│   │       └── [...all]/
│   │           └── route.ts
│   │
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
│
├── components/
│   ├── ui/                      # Shadcn UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── table.tsx
│   │   ├── badge.tsx
│   │   ├── tabs.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── toast.tsx
│   │   ├── alert.tsx
│   │   ├── skeleton.tsx
│   │   └── ...
│   │
│   ├── providers/
│   │   ├── auth-provider.tsx
│   │   ├── toast-provider.tsx
│   │   └── theme-provider.tsx
│   │
│   └── shared/
│       ├── data-table.tsx
│       ├── page-header.tsx
│       ├── permission-guard.tsx
│       ├── loading-state.tsx
│       ├── error-boundary.tsx
│       ├── empty-state.tsx
│       ├── navbar.tsx
│       ├── sidebar.tsx
│       └── user-menu.tsx
│
├── lib/
│   ├── actions/
│   │   ├── warehouse.actions.ts
│   │   ├── product.actions.ts
│   │   ├── movement.actions.ts
│   │   ├── user.actions.ts
│   │   └── category.actions.ts
│   │
│   ├── auth/
│   │   ├── config.ts
│   │   ├── permissions.ts
│   │   ├── middleware.ts
│   │   └── utils.ts
│   │
│   ├── db/
│   │   ├── client.ts
│   │   ├── seed.ts
│   │   └── repositories/
│   │       ├── base.repository.ts
│   │       ├── warehouse.repository.ts
│   │       ├── product.repository.ts
│   │       ├── movement.repository.ts
│   │       ├── user.repository.ts
│   │       ├── category.repository.ts
│   │       └── stock.repository.ts
│   │
│   ├── stores/
│   │   ├── use-ui-store.ts
│   │   ├── use-warehouse-store.ts
│   │   └── use-product-store.ts
│   │
│   ├── validations/
│   │   ├── warehouse.schema.ts
│   │   ├── product.schema.ts
│   │   ├── movement.schema.ts
│   │   ├── user.schema.ts
│   │   └── category.schema.ts
│   │
│   ├── utils/
│   │   ├── constants.ts
│   │   ├── helpers.ts
│   │   ├── formatters.ts
│   │   └── cn.ts
│   │
│   └── types/
│       ├── auth.types.ts
│       ├── warehouse.types.ts
│       ├── product.types.ts
│       ├── movement.types.ts
│       └── common.types.ts
│
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
│
├── public/
│   ├── images/
│   └── icons/
│
├── .env
├── .env.example
├── .eslintrc.json
├── .gitignore
├── components.json
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

### 4.2 Conventions de Nommage

#### Fichiers

- **Pages** : `page.tsx`
- **Layouts** : `layout.tsx`
- **Server Components** : `component-name.tsx`
- **Client Components** : `component-name.tsx` avec `"use client"`
- **Server Actions** : `*.actions.ts`
- **Repositories** : `*.repository.ts`
- **Schemas** : `*.schema.ts`
- **Types** : `*.types.ts`
- **Stores** : `use-*-store.ts`

#### Composants

- **PascalCase** : `ProductCard`, `WarehouseList`
- **Préfixes** :
  - `Create*Dialog` : Dialogues de création
  - `Edit*Form` : Formulaires d'édition
  - `*List` : Composants de liste
  - `*Card` : Composants carte
  - `*Filters` : Composants de filtrage

#### Variables et Fonctions

- **camelCase** : `getUserWarehouses`, `productData`
- **SCREAMING_SNAKE_CASE** : `PERMISSIONS`, `DEFAULT_PAGE_SIZE`

---

## 5. Couche Base de Données

### 5.1 Schéma Prisma Complet

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// ENUMS
// ============================================

enum UserRole {
  ADMINISTRATOR
  MANAGER
  USER
  VISITOR_ADMIN
  VISITOR
}

enum MovementType {
  IN
  OUT
  TRANSFER
  ADJUSTMENT
}

// ============================================
// AUTHENTICATION & USERS
// ============================================

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  role          UserRole
  active        Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  warehouseAccess WarehouseAccess[]
  movements       Movement[]
  createdProducts Product[] @relation("ProductCreator")
  
  @@index([email])
  @@index([role])
  @@index([active])
  @@map("users")
}

// ============================================
// WAREHOUSES
// ============================================

model Warehouse {
  id          String   @id @default(cuid())
  name        String
  code        String   @unique
  address     String?
  city        String?
  country     String?
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  access        WarehouseAccess[]
  stock         Stock[]
  movementsFrom Movement[] @relation("MovementFrom")
  movementsTo   Movement[] @relation("MovementTo")
  
  @@index([code])
  @@index([active])
  @@map("warehouses")
}

model WarehouseAccess {
  id          String   @id @default(cuid())
  userId      String
  warehouseId String
  canWrite    Boolean  @default(false)
  createdAt   DateTime @default(now())
  
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  warehouse   Warehouse @relation(fields: [warehouseId], references: [id], onDelete: Cascade)
  
  @@unique([userId, warehouseId])
  @@index([userId])
  @@index([warehouseId])
  @@map("warehouse_access")
}

// ============================================
// PRODUCTS & CATEGORIES
// ============================================

model Category {
  id          String   @id @default(cuid())
  name        String
  description String?
  parentId    String?
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  parent      Category?  @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children    Category[] @relation("CategoryHierarchy")
  products    Product[]
  
  @@index([parentId])
  @@index([active])
  @@map("categories")
}

model Product {
  id          String   @id @default(cuid())
  sku         String   @unique
  name        String
  description String?
  categoryId  String
  unit        String
  minStock    Int      @default(0)
  active      Boolean  @default(true)
  createdBy   String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  category    Category @relation(fields: [categoryId], references: [id])
  creator     User     @relation("ProductCreator", fields: [createdBy], references: [id])
  variants    ProductVariant[]
  attributes  ProductAttribute[]
  stock       Stock[]
  movements   Movement[]
  
  @@index([sku])
  @@index([categoryId])
  @@index([active])
  @@map("products")
}

model ProductVariant {
  id          String   @id @default(cuid())
  productId   String
  name        String
  sku         String   @unique
  attributes  Json
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  stock       Stock[]
  movements   Movement[]
  
  @@index([productId])
  @@index([sku])
  @@index([active])
  @@map("product_variants")
}

model ProductAttribute {
  id          String   @id @default(cuid())
  productId   String
  name        String
  value       String
  createdAt   DateTime @default(now())
  
  product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  @@index([productId])
  @@map("product_attributes")
}

// ============================================
// STOCK & MOVEMENTS
// ============================================

model Stock {
  id          String   @id @default(cuid())
  warehouseId String
  productId   String
  variantId   String?
  quantity    Int      @default(0)
  reservedQty Int      @default(0)
  updatedAt   DateTime @updatedAt
  
  warehouse   Warehouse       @relation(fields: [warehouseId], references: [id], onDelete: Cascade)
  product     Product         @relation(fields: [productId], references: [id], onDelete: Cascade)
  variant     ProductVariant? @relation(fields: [variantId], references: [id], onDelete: SetNull)
  
  @@unique([warehouseId, productId, variantId])
  @@index([warehouseId])
  @@index([productId])
  @@index([quantity])
  @@map("stock")
}

model Movement {
  id              String       @id @default(cuid())
  type            MovementType
  productId       String
  variantId       String?
  quantity        Int
  fromWarehouseId String?
  toWarehouseId   String?
  userId          String
  reference       String?
  notes           String?
  createdAt       DateTime     @default(now())
  
  product         Product         @relation(fields: [productId], references: [id])
  variant         ProductVariant? @relation(fields: [variantId], references: [id], onDelete: SetNull)
  fromWarehouse   Warehouse?      @relation("MovementFrom", fields: [fromWarehouseId], references: [id])
  toWarehouse     Warehouse?      @relation("MovementTo", fields: [toWarehouseId], references: [id])
  user            User            @relation(fields: [userId], references: [id])
  
  @@index([productId])
  @@index([fromWarehouseId])
  @@index([toWarehouseId])
  @@index([userId])
  @@index([createdAt])
  @@index([type])
  @@map("movements")
}
```

### 5.2 Relations et Contraintes

#### Relations Principales

1. **User ↔ Warehouse** : Many-to-Many via `WarehouseAccess`
2. **Category** : Self-referential pour hiérarchie
3. **Product ↔ ProductVariant** : One-to-Many
4. **Warehouse ↔ Stock** : One-to-Many
5. **Movement** : Multiple relations vers Warehouse (from/to)

#### Contraintes d'Intégrité

- **Unique Constraints** :
  - `User.email`
  - `Warehouse.code`
  - `Product.sku`
  - `ProductVariant.sku`
  - `Stock (warehouseId, productId, variantId)`
  - `WarehouseAccess (userId, warehouseId)`

- **Cascade Deletes** :
  - Supprimer un User → Supprime ses WarehouseAccess
  - Supprimer un Warehouse → Supprime ses Stock et Access
  - Supprimer un Product → Supprime ses Variants et Attributes

---

## 6. Couche d'Accès aux Données

### 6.1 Pattern Repository

#### Base Repository

```typescript
// lib/db/repositories/base.repository.ts

export abstract class BaseRepository<T> {
  protected abstract model: any;

  async findById(id: string): Promise<T | null> {
    return this.model.findUnique({ where: { id } });
  }

  async findMany(where?: any, include?: any): Promise<T[]> {
    return this.model.findMany({ where, include });
  }

  async create(data: any): Promise<T> {
    return this.model.create({ data });
  }

  async update(id: string, data: any): Promise<T> {
    return this.model.update({ where: { id }, data });
  }

  async delete(id: string): Promise<T> {
    return this.model.delete({ where: { id } });
  }

  async softDelete(id: string): Promise<T> {
    return this.model.update({
      where: { id },
      data: { active: false },
    });
  }
}
```

#### Warehouse Repository

```typescript
// lib/db/repositories/warehouse.repository.ts

import { prisma } from "@/lib/db/client";
import { BaseRepository } from "./base.repository";
import { Warehouse, Prisma, UserRole } from "@prisma/client";

export class WarehouseRepository extends BaseRepository<Warehouse> {
  protected model = prisma.warehouse;

  async findAllByUser(userId: string, userRole: UserRole) {
    const where: Prisma.WarehouseWhereInput = { active: true };

    if (userRole !== UserRole.ADMINISTRATOR && userRole !== UserRole.VISITOR_ADMIN) {
      where.access = { some: { userId } };
    }

    return this.model.findMany({
      where,
      include: {
        _count: {
          select: {
            stock: true,
            access: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });
  }

  async findWithDetails(id: string) {
    return this.model.findUnique({
      where: { id },
      include: {
        access: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
        stock: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
            variant: true,
          },
          where: {
            quantity: { gt: 0 },
          },
        },
        _count: {
          select: {
            stock: true,
            movementsFrom: true,
            movementsTo: true,
          },
        },
      },
    });
  }

  async getUserWarehouses(userId: string) {
    return prisma.warehouseAccess.findMany({
      where: { userId },
      include: { warehouse: true },
    });
  }

  async getUserWritableWarehouses(userId: string) {
    return prisma.warehouseAccess.findMany({
      where: { userId, canWrite: true },
      select: { warehouseId: true },
    });
  }

  async assignUser(warehouseId: string, userId: string, canWrite: boolean) {
    return prisma.warehouseAccess.upsert({
      where: {
        userId_warehouseId: { userId, warehouseId },
      },
      update: { canWrite },
      create: { userId, warehouseId, canWrite },
    });
  }

  async removeUser(warehouseId: string, userId: string) {
    return prisma.warehouseAccess.delete({
      where: {
        userId_warehouseId: { userId, warehouseId },
      },
    });
  }
}

export const warehouseRepository = new WarehouseRepository();
```

### 6.2 Autres Repositories

```typescript
// lib/db/repositories/product.repository.ts
// lib/db/repositories/movement.repository.ts
// lib/db/repositories/stock.repository.ts
// lib/db/repositories/category.repository.ts
```

Suivent le même pattern avec leurs méthodes spécifiques.

---

## 7. Couche Business Logic

### 7.1 Server Actions avec Next Safe Action

```typescript
// lib/actions/warehouse.actions.ts

"use server";

import { createSafeActionClient } from "next-safe-action";
import { auth } from "@/lib/auth/config";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  warehouseSchema,
  warehouseAccessSchema,
} from "@/lib/validations/warehouse.schema";
import { warehouseRepository } from "@/lib/db/repositories/warehouse.repository";
import { hasPermission } from "@/lib/auth/permissions";

// Client d'action sécurisée avec authentification
const actionClient = createSafeActionClient({
  handleReturnedServerError(e) {
    return {
      serverError: e.message,
    };
  },
});

const authenticatedActionClient = actionClient.use(async ({ next }) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    throw new Error("Non authentifié");
  }

  return next({ ctx: { user: session.user } });
});

// ============================================
// ACTIONS CRUD ENTREPÔTS
// ============================================

export const createWarehouse = authenticatedActionClient
  .schema(warehouseSchema)
  .action(async ({ parsedInput, ctx }) => {
    if (!hasPermission(ctx.user.role, "warehouse", "create")) {
      throw new Error("Permission refusée");
    }

    const warehouse = await warehouseRepository.create(parsedInput);

    revalidatePath("/dashboard/warehouses");

    return { success: true, data: warehouse };
  });

export const updateWarehouse = authenticatedActionClient
  .schema(warehouseSchema.extend({ id: z.string().cuid() }))
  .action(async ({ parsedInput, ctx }) => {
    if (!hasPermission(ctx.user.role, "warehouse", "update")) {
      throw new Error("Permission refusée");
    }

    const { id, ...data } = parsedInput;
    const warehouse = await warehouseRepository.update(id, data);

    revalidatePath("/dashboard/warehouses");
    revalidatePath(`/dashboard/warehouses/${id}`);

    return { success: true, data: warehouse };
  });

export const deleteWarehouse = authenticatedActionClient
  .schema(z.object({ id: z.string().cuid() }))
  .action(async ({ parsedInput, ctx }) => {
    if (!hasPermission(ctx.user.role, "warehouse", "delete")) {
      throw new Error("Permission refusée");
    }

    await warehouseRepository.softDelete(parsedInput.id);

    revalidatePath("/dashboard/warehouses");
    redirect("/dashboard/warehouses");
  });

// ============================================
// GESTION DES ACCÈS
// ============================================

export const assignUserToWarehouse = authenticatedActionClient
  .schema(warehouseAccessSchema)
  .action(async ({ parsedInput, ctx }) => {
    if (ctx.user.role !== "ADMINISTRATOR") {
      throw new Error("Seul un administrateur peut assigner des utilisateurs");
    }

    const access = await warehouseRepository.assignUser(
      parsedInput.warehouseId,
      parsedInput.userId,
      parsedInput.canWrite
    );

    revalidatePath(`/dashboard/warehouses/${parsedInput.warehouseId}`);
    revalidatePath("/dashboard/users");

    return { success: true, data: access };
  });

export const removeUserFromWarehouse = authenticatedActionClient
  .schema(z.object({
    warehouseId: z.string().cuid(),
    userId: z.string().cuid(),
  }))
  .action(async ({ parsedInput, ctx }) => {
    if (ctx.user.role !== "ADMINISTRATOR") {
      throw new Error("Seul un administrateur peut retirer des utilisateurs");
    }

    await warehouseRepository.removeUser(
      parsedInput.warehouseId,
      parsedInput.userId
    );

    revalidatePath(`/dashboard/warehouses/${parsedInput.warehouseId}`);
    revalidatePath("/dashboard/users");

    return { success: true };
  });
```

### 7.2 Actions de Mouvements

```typescript
// lib/actions/movement.actions.ts

"use server";

import { authenticatedActionClient } from "./base";
import { movementSchema } from "@/lib/validations/movement.schema";
import { prisma } from "@/lib/db/client";
import { hasPermission, canWriteToWarehouse } from "@/lib/auth/permissions";
import { MovementType } from "@prisma/client";
import { revalidatePath } from "next/cache";

export const createMovement = authenticatedActionClient
  .schema(movementSchema)
  .action(async ({ parsedInput, ctx }) => {
    if (!hasPermission(ctx.user.role, "movement", "create")) {
      throw new Error("Permission refusée");
    }

    // Vérifier les permissions d'écriture sur les entrepôts
    const userWarehouses = await warehouseRepository.getUserWritableWarehouses(
      ctx.user.id
    );
    const writeWarehouses = userWarehouses.map((w) => w.warehouseId);

    // Validation des permissions selon le type de mouvement
    if (parsedInput.type === MovementType.TRANSFER) {
      if (
        !canWriteToWarehouse(
          ctx.user.role,
          parsedInput.fromWarehouseId!,
          writeWarehouses
        ) ||
        !canWriteToWarehouse(
          ctx.user.role,
          parsedInput.toWarehouseId!,
          writeWarehouses
        )
      ) {
        throw new Error("Permission insuffisante sur les entrepôts");
      }
    } else if (parsedInput.type === MovementType.OUT) {
      if (
        !canWriteToWarehouse(
          ctx.user.role,
          parsedInput.fromWarehouseId!,
          writeWarehouses
        )
      ) {
        throw new Error("Permission insuffisante sur l'entrepôt source");
      }
    } else if (parsedInput.type === MovementType.IN) {
      if (
        !canWriteToWarehouse(
          ctx.user.role,
          parsedInput.toWarehouseId!,
          writeWarehouses
        )
      ) {
        throw new Error("Permission insuffisante sur l'entrepôt destination");
      }
    }

    // Transaction atomique pour garantir la cohérence
    const result = await prisma.$transaction(async (tx) => {
      // 1. Créer le mouvement
      const movement = await tx.movement.create({
        data: {
          ...parsedInput,
          userId: ctx.user.id,
        },
      });

      // 2. Mettre à jour les stocks
      const { type, quantity, productId, variantId, fromWarehouseId, toWarehouseId } =
        parsedInput;

      if (type === MovementType.IN || type === MovementType.TRANSFER) {
        await tx.stock.upsert({
          where: {
            warehouseId_productId_variantId: {
              warehouseId: toWarehouseId!,
              productId,
              variantId: variantId ?? null,
            },
          },
          update: {
            quantity: { increment: quantity },
          },
          create: {
            warehouseId: toWarehouseId!,
            productId,
            variantId,
            quantity,
          },
        });
      }

      if (type === MovementType.OUT || type === MovementType.TRANSFER) {
        const stock = await tx.stock.findUnique({
          where: {
            warehouseId_productId_variantId: {
              warehouseId: fromWarehouseId!,
              productId,
              variantId: variantId ?? null,
            },
          },
        });

        if (!stock || stock.quantity < quantity) {
          throw new Error("Stock insuffisant pour effectuer ce mouvement");
        }

        await tx.stock.update({
          where: {
            warehouseId_productId_variantId: {
              warehouseId: fromWarehouseId!,
              productId,
              variantId: variantId ?? null,
            },
          },
          data: {
            quantity: { decrement: quantity },
          },
        });
      }

      if (type === MovementType.ADJUSTMENT) {
        // Pour un ajustement, on met à jour directement la quantité
        await tx.stock.upsert({
          where: {
            warehouseId_productId_variantId: {
              warehouseId: toWarehouseId!,
              productId,
              variantId: variantId ?? null,
            },
          },
          update: {
            quantity,
          },
          create: {
            warehouseId: toWarehouseId!,
            productId,
            variantId,
            quantity,
          },
        });
      }

      return movement;
    });

    // Revalidation des caches
    revalidatePath("/dashboard/movements");
    revalidatePath("/dashboard/warehouses");
    revalidatePath("/dashboard/products");

    return { success: true, data: result };
  });

export const getMovements = authenticatedActionClient
  .schema(
    z.object({
      warehouseId: z.string().cuid().optional(),
      productId: z.string().cuid().optional(),
      type: z.nativeEnum(MovementType).optional(),
      page: z.number().default(1),
      limit: z.number().default(50),
    })
  )
  .action(async ({ parsedInput, ctx }) => {
    const { warehouseId, productId, type, page, limit } = parsedInput;

    const where: any = {};

    if (warehouseId) {
      where.OR = [
        { fromWarehouseId: warehouseId },
        { toWarehouseId: warehouseId },
      ];
    }

    if (productId) {
      where.productId = productId;
    }

    if (type) {
      where.type = type;
    }

    // Filtrer selon les permissions
    if (
      ctx.user.role !== "ADMINISTRATOR" &&
      ctx.user.role !== "VISITOR_ADMIN"
    ) {
      const userWarehouses = await warehouseRepository.getUserWarehouses(
        ctx.user.id
      );
      const warehouseIds = userWarehouses.map((w) => w.warehouseId);

      where.OR = [
        { fromWarehouseId: { in: warehouseIds } },
        { toWarehouseId: { in: warehouseIds } },
      ];
    }

    const [movements, total] = await Promise.all([
      prisma.movement.findMany({
        where,
        include: {
          product: {
            select: { id: true, name: true, sku: true },
          },
          variant: {
            select: { id: true, name: true, sku: true },
          },
          fromWarehouse: {
            select: { id: true, name: true, code: true },
          },
          toWarehouse: {
            select: { id: true, name: true, code: true },
          },
          user: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.movement.count({ where }),
    ]);

    return {
      success: true,
      data: {
        movements,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  });
```

---

## 8. Couche Présentation

### 8.1 Server Components (Pages)

```typescript
// app/(dashboard)/warehouses/page.tsx

import { Suspense } from "react";
import { parseAsString, parseAsInteger } from "nuqs/server";
import { warehouseRepository } from "@/lib/db/repositories/warehouse.repository";
import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { WarehouseList } from "./_components/warehouse-list";
import { WarehouseFilters } from "./_components/warehouse-filters";
import { CreateWarehouseButton } from "./_components/create-warehouse-button";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { hasPermission } from "@/lib/auth/permissions";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    page?: string;
  }>;
}

export default async function WarehousesPage({ searchParams }: PageProps) {
  // Authentification
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/login");
  }

  // Vérification des permissions
  if (!hasPermission(session.user.role, "warehouse", "view")) {
    redirect("/dashboard");
  }

  // Parsing des paramètres URL avec Nuqs
  const params = await searchParams;
  const search = parseAsString.parseServerSide(params.search ?? "");
  const page = parseAsInteger.parseServerSide(params.page ?? "1");

  // Récupération des données
  const warehouses = await warehouseRepository.findAllByUser(
    session.user.id,
    session.user.role
  );

  // Filtrage côté serveur
  const filteredWarehouses = search
    ? warehouses.filter(
        (w) =>
          w.name.toLowerCase().includes(search.toLowerCase()) ||
          w.code.toLowerCase().includes(search.toLowerCase())
      )
    : warehouses;

  const canCreate = hasPermission(session.user.role, "warehouse", "create");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Entrepôts"
        description="Gérez vos entrepôts et leurs accès"
        action={canCreate ? <CreateWarehouseButton /> : null}
      />

      <WarehouseFilters />

      <Suspense fallback={<Skeleton className="h-96" />}>
        <WarehouseList
          warehouses={filteredWarehouses}
          userRole={session.user.role}
        />
      </Suspense>
    </div>
  );
}
```

### 8.2 Client Components

```typescript
// app/(dashboard)/warehouses/_components/warehouse-filters.tsx

"use client";

import { useQueryState } from "nuqs";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function WarehouseFilters() {
  const [search, setSearch] = useQueryState("search", {
    defaultValue: "",
    shallow: false, // Cause un re-render du Server Component
  });

  return (
    <div className="flex items-center gap-4">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un entrepôt..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>
    </div>
  );
}
```

```typescript
// app/(dashboard)/warehouses/_components/create-warehouse-dialog.tsx

"use client";

import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { createWarehouse } from "@/lib/actions/warehouse.actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export function CreateWarehouseDialog() {
  const [open, setOpen] = useState(false);

  const { execute, status } = useAction(createWarehouse, {
    onSuccess: ({ data }) => {
      toast.success("Entrepôt créé avec succès");
      setOpen(false);
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Une erreur est survenue");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    execute({
      name: formData.get("name") as string,
      code: formData.get("code") as string,
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      country: formData.get("country") as string,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouvel entrepôt
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer un entrepôt</DialogTitle>
          <DialogDescription>
            Ajoutez un nouvel entrepôt à votre système de gestion.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom *</Label>
            <Input
              id="name"
              name="name"
              required
              placeholder="Entrepôt Principal"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="code">Code *</Label>
            <Input
              id="code"
              name="code"
              required
              placeholder="WH-001"
              className="uppercase"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Adresse</Label>
            <Input
              id="address"
              name="address"
              placeholder="123 Rue Example"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Ville</Label>
              <Input id="city" name="city" placeholder="Paris" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Pays</Label>
              <Input id="country" name="country" placeholder="France" />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={status === "executing"}>
              {status === "executing" ? "Création..." : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

### 8.3 Composants Partagés

```typescript
// components/shared/page-header.tsx

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-2">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
```

```typescript
// components/shared/permission-guard.tsx

"use client";

import { UserRole } from "@prisma/client";
import { hasPermission } from "@/lib/auth/permissions";

interface PermissionGuardProps {
  userRole: UserRole;
  resource: "warehouse" | "product" | "movement" | "user";
  action: "create" | "update" | "delete" | "view";
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGuard({
  userRole,
  resource,
  action,
  children,
  fallback = null,
}: PermissionGuardProps) {
  if (!hasPermission(userRole, resource, action)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
```

---

## 9. Gestion de l'État

### 9.1 Nuqs pour l'État dans l'URL

```typescript
// Utilisation dans un Client Component

"use client";

import { useQueryState, parseAsString, parseAsInteger } from "nuqs";

export function ProductFilters() {
  // État synchronisé avec l'URL
  const [search, setSearch] = useQueryState("search", {
    defaultValue: "",
    shallow: false, // Re-render du Server Component parent
  });

  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));

  const [category, setCategory] = useQueryState("category", parseAsString);

  return (
    // ... composant
  );
}
```

### 9.2 Zustand pour l'État Global

```typescript
// lib/stores/use-ui-store.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  sidebarOpen: boolean;
  theme: "light" | "dark" | "system";
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      theme: "system",
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "ui-storage",
    }
  )
);
```

```typescript
// lib/stores/use-warehouse-store.ts

import { create } from "zustand";

interface WarehouseState {
  selectedWarehouse: string | null;
  setSelectedWarehouse: (id: string | null) => void;
  clearSelectedWarehouse: () => void;
}

export const useWarehouseStore = create<WarehouseState>((set) => ({
  selectedWarehouse: null,
  setSelectedWarehouse: (id) => set({ selectedWarehouse: id }),
  clearSelectedWarehouse: () => set({ selectedWarehouse: null }),
}));
```

### 9.3 Principe de Séparation

- **Nuqs** : État lié à la navigation et au filtrage (search, page, filters)
- **Zustand** : État UI temporaire (sidebar, modals, selections)
- **Server State** : Données métier via Server Components et Actions

---

## 10. Sécurité et Authentification

### 10.1 Configuration Better Auth

```typescript
// lib/auth/config.ts

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/db/client";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // À activer en production
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 jours
    updateAge: 60 * 60 * 24, // 1 jour
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "USER",
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
```

### 10.2 Middleware de Protection

```typescript
// middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth/config";

const publicRoutes = ["/login", "/register"];
const authRoutes = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Vérifier si la route est publique
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Récupérer la session
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  // Rediriger vers login si non authentifié
  if (!isPublicRoute && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Rediriger vers dashboard si déjà authentifié
  if (authRoutes.includes(pathname) && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
```

---

## 11. Système de Permissions

### 11.1 Définition des Permissions

```typescript
// lib/auth/permissions.ts

import { UserRole } from "@prisma/client";

export const PERMISSIONS = {
  warehouse: {
    create: [UserRole.ADMINISTRATOR],
    update: [UserRole.ADMINISTRATOR, UserRole.MANAGER],
    delete: [UserRole.ADMINISTRATOR],
    view: [
      UserRole.ADMINISTRATOR,
      UserRole.MANAGER,
      UserRole.USER,
      UserRole.VISITOR_ADMIN,
      UserRole.VISITOR,
    ],
  },
  product: {
    create: [UserRole.ADMINISTRATOR, UserRole.MANAGER, UserRole.USER],
    update: [UserRole.ADMINISTRATOR, UserRole.MANAGER, UserRole.USER],
    delete: [UserRole.ADMINISTRATOR, UserRole.MANAGER],
    view: [
      UserRole.ADMINISTRATOR,
      UserRole.MANAGER,
      UserRole.USER,
      UserRole.VISITOR_ADMIN,
      UserRole.VISITOR,
    ],
  },
  movement: {
    create: [UserRole.ADMINISTRATOR, UserRole.MANAGER, UserRole.USER],
    view: [
      UserRole.ADMINISTRATOR,
      UserRole.MANAGER,
      UserRole.USER,
      UserRole.VISITOR_ADMIN,
      UserRole.VISITOR,
    ],
  },
  user: {
    create: [UserRole.ADMINISTRATOR],
    update: [UserRole.ADMINISTRATOR],
    delete: [UserRole.ADMINISTRATOR],
    view: [UserRole.ADMINISTRATOR],
  },
  report: {
    viewAll: [UserRole.ADMINISTRATOR, UserRole.VISITOR_ADMIN],
    viewAssigned: [
      UserRole.MANAGER,
      UserRole.USER,
      UserRole.VISITOR,
    ],
  },
} as const;

type PermissionResource = keyof typeof PERMISSIONS;
type PermissionAction = "create" | "update" | "delete" | "view" | "viewAll" | "viewAssigned";

export function hasPermission(
  userRole: UserRole,
  resource: PermissionResource,
  action: string
): boolean {
  const resourcePermissions = PERMISSIONS[resource] as Record<string, UserRole[]>;
  return resourcePermissions[action]?.includes(userRole) ?? false;
}

export function canAccessWarehouse(
  userRole: UserRole,
  warehouseId: string,
  userWarehouses: string[]
): boolean {
  // Accès total pour admin et visitor_admin
  if (userRole === UserRole.ADMINISTRATOR || userRole === UserRole.VISITOR_ADMIN) {
    return true;
  }
  // Vérifier si l'utilisateur a accès à cet entrepôt
  return userWarehouses.includes(warehouseId);
}

export function canWriteToWarehouse(
  userRole: UserRole,
  warehouseId: string,
  userWarehousesWithWrite: string[]
): boolean {
  // Admin a toujours les droits d'écriture
  if (userRole === UserRole.ADMINISTRATOR) {
    return true;
  }
  // Visiteurs n'ont jamais de droits d'écriture
  if (userRole === UserRole.VISITOR || userRole === UserRole.VISITOR_ADMIN) {
    return false;
  }
  // Vérifier si l'utilisateur a les droits d'écriture sur cet entrepôt
  return userWarehousesWithWrite.includes(warehouseId);
}
```

### 11.2 Matrice des Permissions

| Rôle | Entrepôts | Produits | Mouvements | Utilisateurs | Rapports |
|------|-----------|----------|------------|--------------|----------|
| **ADMINISTRATOR** | CRUD + Tous | CRUD + Tous | CRUD + Tous | CRUD + Tous | Tous |
| **MANAGER** | RU + Assignés | CRUD + Tous | CRUD + Assignés | - | Assignés |
| **USER** | R + Assignés (écriture) | CRUD + Assignés | CRUD + Assignés (écriture) | - | Assignés |
| **VISITOR_ADMIN** | R + Tous | R + Tous | R + Tous | - | Tous |
| **VISITOR** | R + Assignés | R + Assignés | R + Assignés | - | Assignés |

Légende : C=Create, R=Read, U=Update, D=Delete

---

## 12. Validation des Données

### 12.1 Schémas Zod

```typescript
// lib/validations/warehouse.schema.ts

import { z } from "zod";

export const warehouseSchema = z.object({
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
  code: z
    .string()
    .min(2, "Le code doit contenir au moins 2 caractères")
    .max(20, "Le code ne peut pas dépasser 20 caractères")
    .regex(/^[A-Z0-9-]+$/, "Le code ne peut contenir que des majuscules, chiffres et tirets")
    .transform((val) => val.toUpperCase()),
  address: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
});

export const warehouseAccessSchema = z.object({
  userId: z.string().cuid("ID utilisateur invalide"),
  warehouseId: z.string().cuid("ID entrepôt invalide"),
  canWrite: z.boolean().default(false),
});

export type WarehouseInput = z.infer<typeof warehouseSchema>;
export type WarehouseAccessInput = z.infer<typeof warehouseAccessSchema>;
```

```typescript
// lib/validations/product.schema.ts

import { z } from "zod";

export const productSchema = z.object({
  sku: z
    .string()
    .min(2, "Le SKU doit contenir au moins 2 caractères")
    .max(50, "Le SKU ne peut pas dépasser 50 caractères")
    .regex(/^[A-Z0-9-]+$/, "Le SKU ne peut contenir que des majuscules, chiffres et tirets")
    .transform((val) => val.toUpperCase()),
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(200, "Le nom ne peut pas dépasser 200 caractères"),
  description: z.string().max(1000).optional(),
  categoryId: z.string().cuid("ID catégorie invalide"),
  unit: z.string().min(1, "L'unité est requise").max(20),
  minStock: z.number().int().min(0, "Le stock minimum doit être positif").default(0),
});

export const productVariantSchema = z.object({
  productId: z.string().cuid("ID produit invalide"),
  name: z.string().min(2).max(200),
  sku: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[A-Z0-9-]+$/)
    .transform((val) => val.toUpperCase()),
  attributes: z.record(z.string(), z.any()),
});

export const productAttributeSchema = z.object({
  productId: z.string().cuid("ID produit invalide"),
  name: z.string().min(1).max(100),
  value: z.string().min(1).max(255),
});

export type ProductInput = z.infer<typeof productSchema>;
export type ProductVariantInput = z.infer<typeof productVariantSchema>;
export type ProductAttributeInput = z.infer<typeof productAttributeSchema>;
```

```typescript
// lib/validations/movement.schema.ts

import { z } from "zod";
import { MovementType } from "@prisma/client";

export const movementSchema = z
  .object({
    type: z.nativeEnum(MovementType, {
      errorMap: () => ({ message: "Type de mouvement invalide" }),
    }),
    productId: z.string().cuid("ID produit invalide"),
    variantId: z.string().cuid("ID variante invalide").optional(),
    quantity: z.number().int().positive("La quantité doit être positive"),
    fromWarehouseId: z.string().cuid("ID entrepôt source invalide").optional(),
    toWarehouseId: z.string().cuid("ID entrepôt destination invalide").optional(),
    reference: z.string().max(100).optional(),
    notes: z.string().max(500).optional(),
  })
  .refine(
    (data) => {
      if (data.type === MovementType.TRANSFER) {
        return !!data.fromWarehouseId && !!data.toWarehouseId;
      }
      return true;
    },
    {
      message: "Un transfert nécessite un entrepôt source et destination",
      path: ["type"],
    }
  )
  .refine(
    (data) => {
      if (data.type === MovementType.IN) {
        return !!data.toWarehouseId;
      }
      return true;
    },
    {
      message: "Une entrée nécessite un entrepôt de destination",
      path: ["toWarehouseId"],
    }
  )
  .refine(
    (data) => {
      if (data.type === MovementType.OUT) {
        return !!data.fromWarehouseId;
      }
      return true;
    },
    {
      message: "Une sortie nécessite un entrepôt source",
      path: ["fromWarehouseId"],
    }
  )
  .refine(
    (data) => {
      if (data.type === MovementType.TRANSFER) {
        return data.fromWarehouseId !== data.toWarehouseId;
      }
      return true;
    },
    {
      message: "L'entrepôt source et destination doivent être différents",
      path: ["toWarehouseId"],
    }
  );

export type MovementInput = z.infer<typeof movementSchema>;
```

```typescript
// lib/validations/user.schema.ts

import { z } from "zod";
import { UserRole } from "@prisma/client";

export const userSchema = z.object({
  email: z.string().email("Email invalide"),
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
  role: z.nativeEnum(UserRole, {
    errorMap: () => ({ message: "Rôle invalide" }),
  }),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre"
    ),
});

export const updateUserSchema = userSchema.partial().extend({
  id: z.string().cuid("ID utilisateur invalide"),
});

export type UserInput = z.infer<typeof userSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
```

---

## 13. Patterns et Principes

### 13.1 SOLID

#### Single Responsibility Principle (SRP)

```typescript
// ✅ BIEN : Chaque classe a une seule responsabilité

// Repository : Accès aux données uniquement
class WarehouseRepository {
  async findAll() { /* ... */ }
  async create() { /* ... */ }
}

// Service : Logique métier
class WarehouseService {
  constructor(private repo: WarehouseRepository) {}
  async assignUser() { /* logique métier */ }
}

// Action : Interface avec le client
async function createWarehouse() {
  // Validation, permissions, orchestration
}
```

#### Open/Closed Principle (OCP)

```typescript
// ✅ BIEN : Ouvert à l'extension, fermé à la modification

// Classe de base
abstract class BaseRepository<T> {
  abstract model: any;
  
  async findById(id: string): Promise<T | null> {
    return this.model.findUnique({ where: { id } });
  }
}

// Extension sans modification de la base
class WarehouseRepository extends BaseRepository<Warehouse> {
  model = prisma.warehouse;
  
  // Méthodes spécifiques ajoutées
  async findAllByUser(userId: string) { /* ... */ }
}
```

#### Liskov Substitution Principle (LSP)

```typescript
// ✅ BIEN : Les sous-classes peuvent remplacer leurs classes parentes

interface Repository<T> {
  findById(id: string): Promise<T | null>;
  create(data: any): Promise<T>;
}

class WarehouseRepository implements Repository<Warehouse> {
  // Implémentation conforme au contrat
}

class ProductRepository implements Repository<Product> {
  // Implémentation conforme au contrat
}
```

#### Interface Segregation Principle (ISP)

```typescript
// ✅ BIEN : Interfaces spécifiques et ciblées

interface Readable<T> {
  findById(id: string): Promise<T | null>;
  findMany(): Promise<T[]>;
}

interface Writable<T> {
  create(data: any): Promise<T>;
  update(id: string, data: any): Promise<T>;
  delete(id: string): Promise<void>;
}

// Les repositories n'implémentent que ce dont ils ont besoin
class ReadOnlyRepository<T> implements Readable<T> {
  // ...
}

class FullRepository<T> implements Readable<T>, Writable<T> {
  // ...
}
```

#### Dependency Inversion Principle (DIP)

```typescript
// ✅ BIEN : Dépendre des abstractions, pas des implémentations

// Abstraction
interface IWarehouseRepository {
  findById(id: string): Promise<Warehouse | null>;
}

// Implémentation concrète
class PrismaWarehouseRepository implements IWarehouseRepository {
  async findById(id: string) {
    return prisma.warehouse.findUnique({ where: { id } });
  }
}

// Service dépend de l'abstraction
class WarehouseService {
  constructor(private repo: IWarehouseRepository) {}
}
```

### 13.2 DRY (Don't Repeat Yourself)

```typescript
// ✅ BIEN : Réutilisation via abstractions

// Fonction réutilisable
function createAuthenticatedAction<T>(
  schema: z.ZodSchema<T>,
  handler: (input: T, user: User) => Promise<any>
) {
  return actionClient
    .schema(schema)
    .action(async ({ parsedInput, ctx }) => {
      const session = await auth.api.getSession();
      if (!session?.user) throw new Error("Non authentifié");
      return handler(parsedInput, session.user);
    });
}

// Utilisation
export const createWarehouse = createAuthenticatedAction(
  warehouseSchema,
  async (data, user) => {
    if (!hasPermission(user.role, "warehouse", "create")) {
      throw new Error("Permission refusée");
    }
    return warehouseRepository.create(data);
  }
);
```

### 13.3 Composition over Inheritance

```typescript
// ✅ BIEN : Composition de fonctionnalités

// Fonctions composables
const withAuth = (handler: Function) => async (...args: any[]) => {
  const session = await auth.api.getSession();
  if (!session?.user) throw new Error("Non authentifié");
  return handler(...args, session.user);
};

const withPermission = (resource: string, action: string) => 
  (handler: Function) => async (...args: any[]) => {
    const user = args[args.length - 1]; // Dernier argument est le user
    if (!hasPermission(user.role, resource, action)) {
      throw new Error("Permission refusée");
    }
    return handler(...args);
  };

// Composition
export const createWarehouse = withAuth(
  withPermission("warehouse", "create")(
    async (data: WarehouseInput, user: User) => {
      return warehouseRepository.create(data);
    }
  )
);
```

---

## 14. Flux de Données

### 14.1 Flux de Lecture (Query)

```text
User Request
    ↓
Server Component (Page)
    ↓
Repository Method
    ↓
Prisma Query
    ↓
PostgreSQL
    ↓
Data Transformation
    ↓
JSX Rendering
    ↓
HTML Response
```

**Exemple Concret :**

```typescript
// 1. User visite /dashboard/warehouses
// 2. Server Component s'exécute

export default async function WarehousesPage() {
  // 3. Récupération de la session
  const session = await auth.api.getSession();
  
  // 4. Appel au repository
  const warehouses = await warehouseRepository.findAllByUser(
    session.user.id,
    session.user.role
  );
  
  // 5. Rendu avec les données
  return <WarehouseList warehouses={warehouses} />;
}
```

### 14.2 Flux d'Écriture (Mutation)

```text
User Action (Click)
    ↓
Client Component Event
    ↓
Server Action Call (Next Safe Action)
    ↓
Authentication Check
    ↓
Permission Check
    ↓
Data Validation (Zod)
    ↓
Repository Method
    ↓
Prisma Transaction
    ↓
PostgreSQL Write
    ↓
Cache Revalidation
    ↓
UI Update (Optimistic or Refetch)
```

**Exemple Concret :**

```typescript
// 1. User clique sur "Créer"
<Button onClick={() => execute(formData)}>Créer</Button>

// 2. Client Component appelle l'action
const { execute } = useAction(createWarehouse);

// 3. Server Action s'exécute
export const createWarehouse = authenticatedActionClient
  .schema(warehouseSchema)
  .action(async ({ parsedInput, ctx }) => {
    // 4. Authentification (middleware)
    // 5. Validation (Zod)
    // 6. Permission
    if (!hasPermission(ctx.user.role, "warehouse", "create")) {
      throw new Error("Permission refusée");
    }
    
    // 7. Écriture en base
    const warehouse = await warehouseRepository.create(parsedInput);
    
    // 8. Revalidation
    revalidatePath("/dashboard/warehouses");
    
    // 9. Retour
    return { success: true, data: warehouse };
  });

// 10. UI se met à jour automatiquement
```

### 14.3 Flux de Transfert de Stock

```text
User Initiate Transfer
    ↓
Validate Permissions (Both Warehouses)
    ↓
Check Stock Availability
    ↓
BEGIN TRANSACTION
    ├─> Create Movement Record
    ├─> Decrement Source Stock
    ├─> Increment Destination Stock
    └─> COMMIT or ROLLBACK
    ↓
Revalidate Multiple Paths
    ↓
Update UI
```

---

## 15. Modules Fonctionnels

### 15.1 Module Entrepôts

**Fonctionnalités :**

- CRUD des entrepôts
- Gestion des accès utilisateurs
- Vue détaillée du stock par entrepôt
- Historique des mouvements

**Structure :**

```text
warehouses/
├── page.tsx                    # Liste des entrepôts
├── [id]/
│   ├── page.tsx               # Détail entrepôt
│   └── edit/
│       └── page.tsx           # Édition entrepôt
└── _components/
    ├── warehouse-list.tsx
    ├── warehouse-card.tsx
    ├── warehouse-filters.tsx
    ├── create-warehouse-dialog.tsx
    ├── edit-warehouse-form.tsx
    ├── warehouse-access-manager.tsx
    └── stock-overview.tsx
```

### 15.2 Module Produits

**Fonctionnalités :**

- CRUD des produits
- Gestion des catégories hiérarchiques
- Gestion des variantes
- Gestion des attributs personnalisés
- Vue du stock global

**Structure :**

```text
products/
├── page.tsx                    # Liste des produits
├── [id]/
│   ├── page.tsx               # Détail produit
│   └── edit/
│       └── page.tsx           # Édition produit
└── _components/
    ├── product-list.tsx
    ├── product-card.tsx
    ├── product-filters.tsx
    ├── create-product-dialog.tsx
    ├── product-form.tsx
    ├── variant-manager.tsx
    ├── attribute-manager.tsx
    ├── category-selector.tsx
    └── stock-by-warehouse.tsx
```

### 15.3 Module Mouvements

**Fonctionnalités :**

- Entrées de stock
- Sorties de stock
- Transferts inter-entrepôts
- Ajustements d'inventaire
- Historique complet
- Filtres avancés

**Structure :**

```text
movements/
├── page.tsx                    # Liste des mouvements
├── new/
│   └── page.tsx               # Création mouvement
└── _components/
    ├── movement-list.tsx
    ├── movement-filters.tsx
    ├── movement-type-selector.tsx
    ├── transfer-form.tsx
    ├── in-form.tsx
    ├── out-form.tsx
    ├── adjustment-form.tsx
    └── movement-detail.tsx
```

### 15.4 Module Utilisateurs

**Fonctionnalités :**

- CRUD des utilisateurs (admin uniquement)
- Attribution des rôles
- Affectation aux entrepôts
- Gestion des permissions d'écriture

**Structure :**

```text
users/
├── page.tsx                    # Liste des utilisateurs
├── [id]/
│   └── page.tsx               # Détail utilisateur
└── _components/
    ├── user-list.tsx
    ├── user-card.tsx
    ├── create-user-dialog.tsx
    ├── user-form.tsx
    ├── role-selector.tsx
    └── assign-warehouses.tsx
```

### 15.5 Module Rapports

**Fonctionnalités :**

- Rapport de stock
- Rapport des mouvements
- Rapport par entrepôt
- Alertes stock minimum
- Export Excel/PDF

**Structure :**

```text
reports/
├── page.tsx                    # Tableau de bord rapports
└── _components/
    ├── stock-report.tsx
    ├── movement-report.tsx
    ├── warehouse-report.tsx
    ├── low-stock-alert.tsx
    ├── report-filters.tsx
    └── export-button.tsx
```

### 15.6 Module Dashboard

**Fonctionnalités :**

- Vue d'ensemble des statistiques
- Graphiques en temps réel
- Alertes stock minimum
- Mouvements récents
- Indicateurs clés (KPI)

**Structure :**

```text
dashboard/
├── page.tsx                    # Page principale
└── _components/
    ├── stats-cards.tsx
    ├── stock-chart.tsx
    ├── recent-movements.tsx
    ├── low-stock-alerts.tsx
    ├── warehouse-overview.tsx
    └── quick-actions.tsx
```

---

## 16. Installation et Configuration

### 16.1 Initialisation du Projet

```bash
# Créer le projet Next.js 15
npx create-next-app@latest stock-management \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*"

cd stock-management
```

### 16.2 Installation des Dépendances

```bash
# Base de données et ORM
npm install prisma @prisma/client
npm install -D prisma

# Authentification
npm install better-auth

# Validation et Actions
npm install zod
npm install next-safe-action

# Gestion d'état
npm install zustand
npm install nuqs

# UI et Utilitaires
npm install clsx tailwind-merge
npm install lucide-react
npm install date-fns
npm install sonner  # Pour les toasts

# Initialiser Shadcn UI
npx shadcn@latest init
```

### 16.3 Configuration Shadcn UI

```bash
# Installer les composants nécessaires
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add form
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add select
npx shadcn@latest add table
npx shadcn@latest add tabs
npx shadcn@latest add badge
npx shadcn@latest add dropdown-menu
npx shadcn@latest add toast
npx shadcn@latest add alert
npx shadcn@latest add skeleton
npx shadcn@latest add checkbox
npx shadcn@latest add radio-group
npx shadcn@latest add separator
npx shadcn@latest add avatar
npx shadcn@latest add popover
npx shadcn@latest add command
```

### 16.4 Configuration Prisma

```bash
# Initialiser Prisma
npx prisma init

# Le fichier .env sera créé automatiquement
```

**Fichier `.env` :**

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/stock_management?schema=public"

# Better Auth
BETTER_AUTH_SECRET="your-random-secret-key-min-32-characters"
BETTER_AUTH_URL="http://localhost:3000"

# Application
NODE_ENV="development"
```

**Fichier `.env.example` :**

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/stock_management?schema=public"

# Better Auth
BETTER_AUTH_SECRET=""
BETTER_AUTH_URL="http://localhost:3000"

# Application
NODE_ENV="development"
```

### 16.5 Configuration TypeScript

**`tsconfig.json` :**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "incremental": true,
    "isolatedModules": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 16.6 Scripts Package.json

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio"
  }
}
```

### 16.7 Initialisation de la Base de Données

```bash
# Générer le client Prisma
npx prisma generate

# Créer la base de données et les tables
npx prisma db push

# Ou utiliser les migrations (recommandé en production)
npx prisma migrate dev --name init

# Seed initial (optionnel)
npm run db:seed
```

**Fichier de Seed (`prisma/seed.ts`) :**

```typescript
import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Créer un utilisateur administrateur
  const adminPassword = await bcrypt.hash("Admin123!", 10);
  
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Administrateur",
      password: adminPassword,
      role: UserRole.ADMINISTRATOR,
    },
  });

  console.log("✅ Administrateur créé :", admin.email);

  // Créer des catégories
  const electronics = await prisma.category.create({
    data: {
      name: "Électronique",
      description: "Produits électroniques",
    },
  });

  const computers = await prisma.category.create({
    data: {
      name: "Ordinateurs",
      description: "Ordinateurs et accessoires",
      parentId: electronics.id,
    },
  });

  console.log("✅ Catégories créées");

  // Créer un entrepôt principal
  const warehouse = await prisma.warehouse.create({
    data: {
      name: "Entrepôt Principal",
      code: "WH-001",
      address: "123 Rue Example",
      city: "Paris",
      country: "France",
    },
  });

  console.log("✅ Entrepôt créé :", warehouse.name);

  // Créer des produits exemples
  const laptop = await prisma.product.create({
    data: {
      sku: "LAPTOP-001",
      name: "Ordinateur Portable Dell XPS 15",
      description: "Laptop haute performance",
      categoryId: computers.id,
      unit: "pièce",
      minStock: 5,
      createdBy: admin.id,
    },
  });

  console.log("✅ Produit créé :", laptop.name);

  // Créer du stock initial
  await prisma.stock.create({
    data: {
      warehouseId: warehouse.id,
      productId: laptop.id,
      quantity: 10,
    },
  });

  console.log("✅ Stock initial créé");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### 16.8 Configuration Tailwind

**`tailwind.config.ts` :**

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

### 16.9 Lancement du Projet

```bash
# Lancer le serveur de développement
npm run dev

# Ouvrir Prisma Studio (interface DB)
npm run db:studio

# Accéder à l'application
# http://localhost:3000
```

### 16.10 Structure Finale du Projet

```text
stock-management/
├── app/                        ✅ Configuré
├── components/                 ✅ Configuré
├── lib/                        ✅ Configuré
├── prisma/                     ✅ Configuré
│   ├── schema.prisma          ✅ Créé
│   ├── seed.ts                ✅ Créé
│   └── migrations/            ✅ Généré
├── public/                     ✅ Configuré
├── .env                        ✅ À créer
├── .env.example               ✅ À créer
├── .gitignore                 ✅ Configuré
├── components.json            ✅ Configuré (Shadcn)
├── middleware.ts              ⏳ À créer
├── next.config.js             ✅ Configuré
├── package.json               ✅ Configuré
├── postcss.config.js          ✅ Configuré
├── tailwind.config.ts         ✅ Configuré
├── tsconfig.json              ✅ Configuré
└── README.md                  ⏳ À créer
```

---

## 17. Checklist de Démarrage

### Phase 1 : Configuration Initiale

- [ ] Créer le projet Next.js 15
- [ ] Installer toutes les dépendances
- [ ] Configurer Shadcn UI
- [ ] Initialiser Prisma
- [ ] Créer le fichier `.env`
- [ ] Générer le schéma Prisma

### Phase 2 : Base de Données

- [ ] Créer la base PostgreSQL
- [ ] Exécuter les migrations
- [ ] Créer le seed script
- [ ] Exécuter le seed
- [ ] Tester avec Prisma Studio

### Phase 3 : Authentification

- [ ] Configurer Better Auth
- [ ] Créer le middleware
- [ ] Créer la page de login
- [ ] Tester l'authentification

### Phase 4 : Repositories

- [ ] Créer BaseRepository
- [ ] Implémenter WarehouseRepository
- [ ] Implémenter ProductRepository
- [ ] Implémenter MovementRepository
- [ ] Implémenter UserRepository

### Phase 5 : Server Actions

- [ ] Configurer Next Safe Action
- [ ] Créer warehouse.actions.ts
- [ ] Créer product.actions.ts
- [ ] Créer movement.actions.ts
- [ ] Créer user.actions.ts

### Phase 6 : Interface Utilisateur

- [ ] Créer le layout dashboard
- [ ] Implémenter module Entrepôts
- [ ] Implémenter module Produits
- [ ] Implémenter module Mouvements
- [ ] Implémenter module Utilisateurs
- [ ] Implémenter module Dashboard

### Phase 7 : Tests et Optimisation

- [ ] Tester toutes les permissions
- [ ] Tester les transactions
- [ ] Optimiser les requêtes
- [ ] Ajouter les validations
- [ ] Tester la réactivité UI

---

## 18. Prochaines Étapes et Améliorations

### Court Terme

- Notifications en temps réel (Pusher/Socket.io)
- Export Excel/PDF des rapports
- Gestion des codes-barres
- Recherche globale avancée
- Mode hors-ligne (PWA)

### Moyen Terme

- API publique REST/GraphQL
- Intégration avec ERP
- Gestion multi-devises
- Gestion des fournisseurs
- Commandes et réceptions

### Long Terme

- Intelligence artificielle (prédiction de stock)
- Application mobile (React Native)
- Module de facturation
- Analytics avancés
- Intégration e-commerce

---

## Conclusion

Cette architecture fournit une base solide, moderne et scalable pour une application de gestion de stock multi-entrepôts. Elle respecte les principes SOLID, DRY, et utilise les dernières technologies du écosystème Next.js/React.

**Points Forts :**

- ✅ Type-safe de bout en bout
- ✅ Sécurité maximale (Better Auth + Next Safe Action)
- ✅ Performance optimisée (Server Components)
- ✅ Architecture modulaire et maintenable
- ✅ Prête pour la production
