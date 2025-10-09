# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **multi-warehouse inventory management system** built with Next.js 15.5.4 using:

- **React 19.1.0** with TypeScript (strict mode)
- **Tailwind CSS v4** (PostCSS architecture with OKLCH color space)
- **App Router** architecture (Next.js App directory)
- **Turbopack** for development and builds
- **Prisma ORM** with PostgreSQL database
- **Better Auth** for authentication (email/password with bcrypt)
- **Next Safe Action v8** for type-safe server actions
- **Nuqs** for URL state management
- **Zustand** for client-side global state

## Development Commands

```bash
# Development server (with Turbopack)
npm run dev

# Production build (with Turbopack)
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Database commands
npm run db:generate    # Generate Prisma Client
npm run db:push        # Push schema changes to database
npm run db:migrate     # Create and apply migrations
npm run db:studio      # Open Prisma Studio GUI
npm run db:seed        # Seed database with initial data
npm run db:reset       # Reset database (WARNING: destructive)
```

## Architecture Overview

This application follows a **layered architecture** with strict separation of concerns:

```
Presentation Layer (app/)
    ↓
Business Logic Layer (lib/actions/)
    ↓
Data Access Layer (lib/db/repositories/)
    ↓
Database Layer (Prisma + PostgreSQL)
```

### Key Architectural Patterns

1. **Repository Pattern**: All database access goes through repository classes that extend `BaseRepository<T>` (lib/db/repositories/base.repository.ts:31)
2. **Server Actions**: All mutations use Next Safe Action v8 with authentication middleware (lib/actions/safe-action.ts:80)
3. **Permission System**: Role-based access control with granular permissions (lib/auth/permissions.ts)
4. **Validation**: Zod schemas for all input validation (lib/validations/)

## Core Domain Models

### User Roles (Prisma Schema)
- **ADMINISTRATOR**: Full system access
- **MANAGER**: Manage assigned warehouses and products
- **USER**: Create/update products and movements in assigned warehouses
- **VISITOR_ADMIN**: Read-only access to all data
- **VISITOR**: Read-only access to assigned warehouses

### Movement Types
- **IN**: Stock entry into warehouse
- **OUT**: Stock removal from warehouse
- **TRANSFER**: Stock transfer between warehouses
- **ADJUSTMENT**: Inventory adjustment/correction

### Database Schema
The Prisma schema (prisma/schema.prisma) defines:
- **User**: Authentication and role management with Better Auth integration
- **Warehouse**: Physical storage locations with access control
- **Product**: Items with SKU, categories, variants, and attributes
- **Stock**: Warehouse inventory levels (unique constraint on warehouseId + productId + variantId)
- **Movement**: Stock transaction history with atomic updates
- **Category**: Hierarchical product categorization (self-referential)

## Authentication & Security

### Better Auth Configuration (lib/auth/config.ts)
- Email/password authentication with bcrypt hashing (10 rounds)
- 7-day session expiration with 24-hour update age
- 5-minute cookie cache for performance
- PostgreSQL adapter via Prisma
- Session management with IP address and user agent tracking

### Server Action Security Pattern
All authenticated actions follow this pattern (lib/actions/safe-action.ts):

1. **Authentication Middleware**: Validates session and fetches user with role
2. **Permission Check**: Verifies user role has required permission
3. **Zod Validation**: Input validated against schema
4. **Business Logic**: Repository method execution
5. **Cache Revalidation**: Next.js cache invalidated for affected paths

Example context provided to actions:
```typescript
{
  userId: string,
  userRole: UserRole,
  userEmail: string,
  session: Session
}
```

### Permission System
Permission matrix defined in lib/auth/permissions.ts with three key functions:
- `hasPermission(userRole, resource, action)`: Check basic permissions
- `canAccessWarehouse(userRole, warehouseId, userWarehouses)`: Warehouse access check
- `canWriteToWarehouse(userRole, warehouseId, userWarehousesWithWrite)`: Write permission check

## Repository Pattern Implementation

### Base Repository (lib/db/repositories/base.repository.ts)
Abstract class providing CRUD operations:
- `findById(id, include?)`: Single record lookup
- `findMany(where?, include?)`: Multiple records with filtering
- `findFirst(where, include?)`: First matching record
- `create(data)`: Create new record
- `update(id, data)`: Update existing record
- `delete(id)`: Hard delete record
- `count(where?)`: Count records
- `exists(id)`: Check record existence

### Model-Specific Repositories
Each domain model has a repository extending BaseRepository:
- **WarehouseRepository**: Includes user access filtering and warehouse assignment methods
- **ProductRepository**: Product and variant management
- **MovementRepository**: Stock transaction history
- **StockRepository**: Inventory level queries
- **UserRepository**: User and role management
- **CategoryRepository**: Hierarchical category operations

Export pattern: Each repository file exports a singleton instance (e.g., `export const warehouseRepository = new WarehouseRepository()`)

## Server Actions Pattern

### Action Configuration (lib/actions/safe-action.ts)
Two action clients provided:
1. **actionClient**: Base client with error handling
2. **authActionClient**: Extends base with authentication middleware

Custom error classes:
- `ActionError`: Business logic errors
- `PermissionError`: Authorization failures

### Movement Actions Pattern
Stock movements require **atomic transactions** to ensure data consistency. Example pattern (lib/actions/movement.actions.ts):

```typescript
await prisma.$transaction(async (tx) => {
  // 1. Create movement record
  const movement = await tx.movement.create({ data });

  // 2. Update stock levels atomically
  // - IN: Increment destination stock
  // - OUT: Decrement source stock (validate availability)
  // - TRANSFER: Both operations
  // - ADJUSTMENT: Set absolute quantity

  return movement;
});
```

Critical: Always validate stock availability before decrementing to prevent negative inventory.

## State Management Strategy

### URL State (Nuqs)
Use for navigation-related state that should persist in URL:
- Search queries
- Pagination (page number, limit)
- Filters (category, status, date ranges)
- Sort options

Pattern: Use `shallow: false` to trigger Server Component re-render on state change.

### Client State (Zustand)
Use for ephemeral UI state:
- Sidebar open/closed state
- Theme selection
- Modal/dialog visibility
- Temporary selections (e.g., selected warehouse for filtering)

Stores located in lib/stores/ with convention: `use-*-store.ts`

### Server State
Primary source of truth is **always the database**. Server Components fetch data directly from repositories, no client-side caching needed.

## UI Component Organization

### Route Groups
- **(auth)**: Authentication pages (login) with minimal layout
- **(dashboard)**: Main application pages with sidebar navigation

### Component Types
1. **Server Components** (default): Pages and data-fetching components
2. **Client Components** (`"use client"`): Interactive components (forms, dialogs, filters)
3. **Shared Components** (components/shared/): Reusable across features
4. **UI Components** (components/ui/): Shadcn components (excluded from TypeScript compilation)

### Naming Conventions
- **Pages**: `page.tsx`
- **Layouts**: `layout.tsx`
- **Private components**: `_components/` directory (page-specific, not routable)
- **Actions**: `*.actions.ts`
- **Repositories**: `*.repository.ts`
- **Schemas**: `*.schema.ts`
- **Stores**: `use-*-store.ts`

## Validation Pattern

All input validation uses Zod schemas in lib/validations/:
- **warehouseSchema**: Name, unique code, location details
- **productSchema**: SKU (uppercase), name, category, unit, minStock
- **movementSchema**: Complex validation with type-specific refinements
- **userSchema**: Email, role, password strength requirements

Schema transformations:
- SKU and warehouse codes automatically uppercased
- String trimming and sanitization
- Custom refinements for business rules (e.g., transfer requires different source/destination)

## Styling System

### Tailwind CSS v4 Architecture
- **CSS-first configuration** in app/globals.css (no traditional tailwind.config)
- **Design tokens** via CSS custom properties (`--color-*`, `--radius-*`)
- **OKLCH color space** for perceptually uniform colors
- **Dark mode** via `.dark` class with `@custom-variant`
- **PostCSS plugins**: `@tailwindcss/postcss`, `tw-animate-css`

### Utility Functions
- `cn()` utility (lib/utils.ts): Combines `clsx` and `tailwind-merge` for conditional classes
- `class-variance-authority`: Type-safe component variants

## Database Best Practices

### Unique Constraints
Critical unique constraints enforced:
- `User.email`
- `Warehouse.code`
- `Product.sku`
- `ProductVariant.sku`
- `Stock(warehouseId, productId, variantId)` - prevents duplicate stock entries
- `WarehouseAccess(userId, warehouseId)` - prevents duplicate access grants

### Cascade Deletion Behavior
- User deletion → Cascades to sessions, warehouse access, and movements
- Warehouse deletion → Cascades to stock and access records
- Product deletion → Cascades to variants, attributes, stock, and movements
- Variant deletion → Sets stock.variantId and movement.variantId to NULL

### Index Strategy
Key indexes for query performance:
- `User`: email, role, active status
- `Warehouse`: code, active status
- `Product`: sku, categoryId, active status
- `Stock`: warehouseId, productId, quantity (for low-stock queries)
- `Movement`: type, createdAt, warehouse IDs, userId, productId

## Important Implementation Notes

### Path Alias
Use `@/*` to reference project root: `import { auth } from "@/lib/auth/config"`

### TypeScript Configuration
- Strict mode enabled
- Module resolution: `bundler`
- Components/ui excluded from compilation (tsconfig.json:26)
- ES2017 target for Node.js compatibility

### Font Optimization
Uses `next/font` with Geist Sans and Geist Mono font families (app/layout.tsx)

### Environment Variables
Required in `.env`:
- `DATABASE_URL`: PostgreSQL connection string
- `BETTER_AUTH_URL`: Application base URL (default: http://localhost:3000)

### Husky & Lint-Staged
Pre-commit hooks configured:
- ESLint with auto-fix
- TypeScript compilation check (`tsc --noEmit`)

## Common Development Workflows

### Adding a New Feature Module
1. Create route group in `app/(dashboard)/[feature]/`
2. Create repository in `lib/db/repositories/[feature].repository.ts`
3. Create validation schema in `lib/validations/[feature].schema.ts`
4. Create server actions in `lib/actions/[feature].actions.ts`
5. Implement UI pages and components
6. Add permission checks to actions
7. Update navigation in components/shared/navigation/

### Creating Database Migrations
```bash
# Development: Push schema changes directly
npm run db:push

# Production: Create versioned migration
npm run db:migrate

# Always regenerate Prisma Client after schema changes
npm run db:generate
```

### Testing Permissions
Use Prisma Studio to modify user roles and test permission boundaries:
```bash
npm run db:studio
```

## Architecture Documentation

For comprehensive architectural details, see `architecture_plan.md` which includes:
- Complete Prisma schema documentation (French language)
- Detailed repository patterns and examples
- Server action implementation patterns
- Permission matrix by role
- Movement transaction workflows
- Complete file structure and organization
- Installation and configuration steps
