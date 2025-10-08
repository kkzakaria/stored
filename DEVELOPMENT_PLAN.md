# Plan de Développement - Gestion de Stock Multi-Entrepôts

> Mis à jour le: 2025-10-08
> Statut global: 🟢 **Phase 4 Complétée** - Prêt pour Phase 5 (Server Actions) (29%)

---

## Table des Matières

1. [Vue d'Ensemble](#vue-densemble)
2. [État Actuel](#état-actuel)
3. [Phases de Développement](#phases-de-développement)
4. [Suivi Détaillé](#suivi-détaillé)
5. [Décisions Techniques](#décisions-techniques)
6. [Blocages et Risques](#blocages-et-risques)

---

## Vue d'Ensemble

### Objectif du Projet

Application web de gestion de stock multi-entrepôts permettant:

- Gestion centralisée de plusieurs entrepôts
- Suivi en temps réel des stocks
- Mouvements de stock inter-entrepôts (IN, OUT, TRANSFER, ADJUSTMENT)
- Système de permissions granulaire (5 rôles: ADMINISTRATOR, MANAGER, USER, VISITOR_ADMIN, VISITOR)
- Catégorisation avancée des produits avec variantes

### Stack Technique Cible

| Couche | Technologies |
|--------|--------------|
| **Frontend** | Next.js 15, React 19, TypeScript 5, Tailwind CSS v4, Shadcn UI |
| **Backend** | Next.js API Routes, Prisma 5, PostgreSQL 15+ |
| **Auth** | Better Auth |
| **État** | Nuqs (URL state), Zustand (client state) |
| **Validation** | Zod, Next Safe Action |

### Contraintes Architecturales

- ✅ Next.js 15 avec App Router uniquement
- ✅ Pas de dossier `src/`
- ✅ Server Components par défaut
- ✅ Client Components uniquement pour l'interaction utilisateur
- ✅ PostgreSQL comme source de vérité unique

---

## État Actuel

### ✅ Complété

**Phase 1: Configuration Initiale (100%)**
- [x] Projet Next.js 15.5.4 initialisé
- [x] Configuration Tailwind CSS v4
- [x] Configuration TypeScript strict
- [x] Configuration ESLint
- [x] Path alias `@/*` configuré
- [x] Turbopack activé pour dev et build
- [x] Design system de base (OKLCH colors, theme tokens)
- [x] Documentation CLAUDE.md créée
- [x] Architecture plan documenté
- [x] **Dépendances installées** (Prisma 6.17.0, Better Auth 1.3.27, Next Safe Action 8.0.11, Zustand 5.0.8, Nuqs 2.7.1, Date-fns 4.1.0, Sonner 2.0.7)
- [x] **Shadcn UI composants** (30+ composants dont select, textarea, tabs, switch, sonner)
- [x] **Structure de dossiers complète** (lib/{actions,auth,db,stores,validations,types}, components/{providers,shared}, app/{(auth),(dashboard)})
- [x] **Configuration environnement** (.env et .env.example créés)
- [x] **Build validation** (TypeScript + ESLint passés)

**Phase 2: Base de Données (100%)**
- [x] **Docker PostgreSQL** (PostgreSQL 16 containerisé sur port 5433)
- [x] **Schéma Prisma complet** (9 modèles: User, Warehouse, WarehouseAccess, Category, Product, ProductVariant, ProductAttribute, Stock, Movement)
- [x] **Enums** (UserRole: 5 rôles, MovementType: 4 types)
- [x] **Relations et contraintes** (25+ index, cascade deletes, foreign keys, unique constraints)
- [x] **Client Prisma singleton** (lib/db/client.ts avec pattern singleton)
- [x] **Script de seed** (admin, 3 catégories, 1 warehouse, 3 produits avec variantes, stock initial)
- [x] **Scripts npm DB** (db:generate, db:push, db:migrate, db:studio, db:seed, db:reset)
- [x] **tsx installé** (4.20.6 pour exécution TypeScript)
- [x] **Migrations exécutées** (9 tables créées avec succès)
- [x] **Seed exécuté** (données de test insérées)
- [x] **Build validation** (TypeScript + ESLint passés)

**Phase 3: Authentification et Sécurité (100%)**
- [x] **Schéma Prisma Better Auth** (modèles Session, Account, Verification ajoutés)
- [x] **Migration initiale** (20251008173640_init - toutes les tables créées)
- [x] **Configuration Prisma** (migration de package.json vers prisma.config.ts)
- [x] **Better Auth configuré** (adapter Prisma PostgreSQL, email/password, sessions 7 jours)
- [x] **Routes API** (/api/auth/[...all]/route.ts avec handlers GET/POST)
- [x] **Utilitaires client** (lib/auth/client.ts avec useSession, signIn, signOut)
- [x] **Middleware protection** (middleware.ts - routes publiques vs protégées)
- [x] **Système de permissions** (lib/auth/permissions.ts - 5 rôles, matrice complète)
- [x] **Page login** (app/login/page.tsx avec formulaire email/password)
- [x] **Dashboard** (app/dashboard/page.tsx protégé avec AuthGuard)
- [x] **AuthGuard component** (components/auth/auth-guard.tsx)
- [x] **Variables environnement** (NEXT_PUBLIC_BETTER_AUTH_URL ajouté)
- [x] **Build validation** (TypeScript + ESLint passés, pre-commit hooks OK)

**Phase 4: Couche d'Accès aux Données (100%)**
- [x] **BaseRepository** (lib/db/repositories/base.repository.ts avec méthodes CRUD génériques)
- [x] **UserRepository** (lib/db/repositories/user.repository.ts avec gestion rôles et accès)
- [x] **CategoryRepository** (lib/db/repositories/category.repository.ts avec hiérarchie et arbre)
- [x] **WarehouseRepository** (lib/db/repositories/warehouse.repository.ts avec gestion accès)
- [x] **ProductRepository** (lib/db/repositories/product.repository.ts avec variantes et attributs)
- [x] **StockRepository** (lib/db/repositories/stock.repository.ts avec transactions et réservations)
- [x] **MovementRepository** (lib/db/repositories/movement.repository.ts avec filtres et stats)
- [x] **Index exports** (lib/db/repositories/index.ts pour imports centralisés)
- [x] **Pattern singleton** (instances exportées pour tous les repositories)
- [x] **Type safety complet** (TypeScript strict avec types Prisma)
- [x] **Build validation** (TypeScript + ESLint passés)

### 🔄 En Cours

- [ ] Aucune tâche en cours actuellement

### ⏳ Prochaines Étapes Immédiates

**Phase 5: Server Actions**
1. Configurer Next Safe Action (client de base et client authentifié)
2. Créer les schémas Zod de validation
3. Implémenter warehouse.actions.ts
4. Implémenter product.actions.ts
5. Implémenter movement.actions.ts

---

## Phases de Développement

### ✅ Phase 1: Configuration Initiale (100% complété)

**Objectif**: Préparer l'environnement de développement complet

#### Étapes

- [x] 1.1 Créer le projet Next.js 15
- [x] 1.2 Configurer Tailwind CSS v4
- [x] 1.3 Configurer TypeScript
- [x] 1.4 Installer les dépendances principales
  - [x] Prisma 6.17.0 + @prisma/client
  - [x] Better Auth 1.3.27
  - [x] Zod 4.1.12 + Next Safe Action 8.0.11
  - [x] Zustand 5.0.8 + Nuqs 2.7.1
  - [x] Lucide React 0.545.0 (déjà installé ✓)
  - [x] Date-fns 4.1.0, Sonner 2.0.7
- [x] 1.5 Configurer Shadcn UI
  - [x] Initialiser: `npx shadcn@latest init` (style: new-york, RSC enabled)
  - [x] Installer composants de base (30+ composants dont select, textarea, tabs, switch, sonner)
- [x] 1.6 Créer la structure de dossiers
  - [x] `lib/` (actions, auth, db, stores, validations, utils, types)
  - [x] `components/` (ui, providers, shared)
  - [x] `app/(auth)/` et `app/(dashboard)/`
- [x] 1.7 Configuration environnement
  - [x] Créer `.env` et `.env.example`
  - [x] Configurer les variables d'environnement (DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL)

**Critères de Validation**:

- ✅ Tous les packages installés sans erreur
- ✅ Structure de dossiers créée selon l'architecture
- ✅ Variables d'environnement configurées
- ✅ Build TypeScript passe (compiled in 2.6s)
- ✅ ESLint passe sans erreur
- ✅ Commit créé: `7357b33 feat: complete Phase 1 - Initial setup and project structure`

---

### ✅ Phase 2: Base de Données (100% complété)

**Objectif**: Mettre en place PostgreSQL et le schéma Prisma complet

#### Étapes

- [x] 2.1 Initialiser Prisma
  - [x] `npx prisma init --datasource-provider postgresql`
  - [x] Configurer DATABASE_URL (port 5433 pour éviter conflits)
- [x] 2.2 Créer le schéma Prisma complet
  - [x] Modèles: User, Warehouse, WarehouseAccess
  - [x] Modèles: Category, Product, ProductVariant, ProductAttribute
  - [x] Modèles: Stock, Movement
  - [x] Enums: UserRole (5 rôles), MovementType (4 types)
  - [x] Relations et contraintes d'intégrité (cascade deletes, foreign keys)
  - [x] Index pour optimisation (25+ index)
- [x] 2.3 Générer le client Prisma
  - [x] `npx prisma generate` (v6.17.0)
- [x] 2.4 Créer la base de données
  - [x] **Docker PostgreSQL 16** (docker-compose.yml sur port 5433)
  - [x] Exécuter migrations: `npx prisma db push`
- [x] 2.5 Créer le script de seed
  - [x] `prisma/seed.ts` avec tsx
  - [x] Admin par défaut (admin@example.com)
  - [x] 3 catégories hiérarchiques (Électronique > Ordinateurs)
  - [x] 1 entrepôt (WH-MAIN) avec accès admin
  - [x] 3 produits avec variantes et attributs
  - [x] Stock initial (4 entrées)
- [x] 2.6 Exécuter le seed
  - [x] `npm run db:seed` (succès)
- [x] 2.7 Configurer le client Prisma
  - [x] `lib/db/client.ts`
  - [x] Singleton pattern avec support HMR

**Critères de Validation**:

- ✅ Base de données créée avec toutes les tables (9 modèles)
- ✅ Seed exécuté avec succès (admin, 3 catégories, 1 warehouse, 3 produits)
- ✅ Prisma Studio fonctionne: `npm run db:studio`
- ✅ Données de test présentes et vérifiées
- ✅ Build TypeScript passe (compiled in 2.7s)
- ✅ ESLint passe sans erreur
- ✅ Commit créé: `9d62225 feat: complete Phase 2 - Database setup with Docker PostgreSQL`

---

### ✅ Phase 3: Authentification et Sécurité (100% complété)

**Objectif**: Implémenter Better Auth avec système de permissions

#### Étapes

- [x] 3.1 Configurer Better Auth
  - [x] `lib/auth/config.ts` avec adapter Prisma PostgreSQL
  - [x] Configuration email/password (min 8 chars, max 128)
  - [x] Configuration session (7 jours, cache cookie 5 min)
  - [x] Intégration modèles Prisma (Session, Account, Verification)
- [x] 3.2 Créer les routes API auth
  - [x] `app/api/auth/[...all]/route.ts` avec handlers GET/POST
  - [x] Intégration Better Auth Next.js (toNextJsHandler)
- [x] 3.3 Créer le middleware de protection
  - [x] `middleware.ts` avec vérification session
  - [x] Routes publiques: /login, /api/auth
  - [x] Routes protégées: /dashboard, /products, /warehouses, /stock, /movements
  - [x] Redirections automatiques vers login avec paramètre "from"
- [x] 3.4 Implémenter le système de permissions
  - [x] `lib/auth/permissions.ts` avec interface UserWithRole
  - [x] Matrice de permissions complète (5 rôles × 17 permissions)
  - [x] Fonctions: hasPermission, hasRole, canRead, canWrite, canDelete
  - [x] Helpers: isAdmin, isManager, requirePermission, requireRole
- [x] 3.5 Créer les utils auth client
  - [x] `lib/auth/client.ts` avec createAuthClient
  - [x] Exports: signIn, signOut, signUp, useSession
  - [x] Types: Session, User
- [x] 3.6 Créer la page de login
  - [x] `app/login/page.tsx` avec formulaire email/password
  - [x] Gestion d'erreurs avec toast notifications (Sonner)
  - [x] Suspense boundary pour Next.js App Router
  - [x] Redirect vers destination originale après login
- [x] 3.7 Créer le dashboard et AuthGuard
  - [x] `app/dashboard/page.tsx` avec affichage session
  - [x] `components/auth/auth-guard.tsx` pour protection client
  - [x] Bouton déconnexion fonctionnel
- [x] 3.8 Configuration environnement
  - [x] NEXT_PUBLIC_BETTER_AUTH_URL ajouté
  - [x] prisma.config.ts créé (migration depuis package.json)
  - [x] dotenv intégré pour variables d'environnement

**Critères de Validation**:

- ✅ Login fonctionnel avec admin@example.com (sans mot de passe configuré)
- ✅ Middleware redirige correctement vers /login
- ✅ Session gérée par Better Auth avec cookies
- ✅ Système de permissions complet et type-safe
- ✅ Build TypeScript passe sans erreur
- ✅ ESLint passe sans avertissement
- ✅ Pre-commit hooks (husky + lint-staged) passent
- ✅ Commit: `8132646` avec 16 fichiers, 968 insertions

---

### ✅ Phase 4: Couche d'Accès aux Données (100% complété)

**Objectif**: Créer tous les repositories avec pattern cohérent

#### Étapes

- [x] 4.1 Créer BaseRepository
  - [x] `lib/db/repositories/base.repository.ts`
  - [x] Méthodes CRUD génériques
  - [x] Type safety
- [x] 4.2 Implémenter WarehouseRepository
  - [x] `lib/db/repositories/warehouse.repository.ts`
  - [x] `findAllByUser`, `findWithDetails`
  - [x] `getUserWarehouses`, `getUserWritableWarehouses`
  - [x] `assignUser`, `removeUser`
- [x] 4.3 Implémenter ProductRepository
  - [x] `lib/db/repositories/product.repository.ts`
  - [x] CRUD produits
  - [x] Gestion variantes
  - [x] Gestion attributs
  - [x] Recherche et filtrage
- [x] 4.4 Implémenter StockRepository
  - [x] `lib/db/repositories/stock.repository.ts`
  - [x] `findByWarehouse`, `findByProduct`
  - [x] `updateQuantity` (avec transactions)
  - [x] `getLowStockItems`
- [x] 4.5 Implémenter MovementRepository
  - [x] `lib/db/repositories/movement.repository.ts`
  - [x] `findByFilters` (warehouse, product, type, date)
  - [x] `getRecentMovements`
  - [x] Stats et analytics
- [x] 4.6 Implémenter UserRepository
  - [x] `lib/db/repositories/user.repository.ts`
  - [x] CRUD utilisateurs
  - [x] Gestion des accès entrepôts
- [x] 4.7 Implémenter CategoryRepository
  - [x] `lib/db/repositories/category.repository.ts`
  - [x] Hiérarchie de catégories
  - [x] `findTree`, `findWithProducts`

**Critères de Validation**:

- ✅ Tous les repositories créés
- ✅ Tests manuels des méthodes principales
- ✅ Type safety complet
- ✅ Pas de duplication de code

---

### ⚡ Phase 5: Server Actions (0% complété)

**Objectif**: Créer toutes les Server Actions avec Next Safe Action

#### Étapes

- [ ] 5.1 Configurer Next Safe Action
  - [ ] Client de base avec gestion d'erreurs
  - [ ] Client authentifié (middleware session)
- [ ] 5.2 Créer les schémas Zod de validation
  - [ ] `lib/validations/warehouse.schema.ts`
  - [ ] `lib/validations/product.schema.ts`
  - [ ] `lib/validations/movement.schema.ts`
  - [ ] `lib/validations/user.schema.ts`
  - [ ] `lib/validations/category.schema.ts`
- [ ] 5.3 Implémenter warehouse.actions.ts
  - [ ] `createWarehouse`, `updateWarehouse`, `deleteWarehouse`
  - [ ] `assignUserToWarehouse`, `removeUserFromWarehouse`
  - [ ] Vérifications permissions
  - [ ] Revalidation paths
- [ ] 5.4 Implémenter product.actions.ts
  - [ ] CRUD produits
  - [ ] Gestion variantes
  - [ ] Gestion attributs
  - [ ] Validation SKU unique
- [ ] 5.5 Implémenter movement.actions.ts
  - [ ] `createMovement` avec logique complexe
  - [ ] Validation type de mouvement
  - [ ] Vérification stock disponible
  - [ ] Transactions atomiques (Prisma.$transaction)
  - [ ] Mise à jour stock automatique
- [ ] 5.6 Implémenter user.actions.ts
  - [ ] CRUD utilisateurs (admin only)
  - [ ] Attribution rôles
  - [ ] Gestion password
- [ ] 5.7 Implémenter category.actions.ts
  - [ ] CRUD catégories
  - [ ] Gestion hiérarchie

**Critères de Validation**:

- ✅ Toutes les actions créées
- ✅ Validation Zod fonctionnelle
- ✅ Permissions correctement appliquées
- ✅ Transactions testées (rollback en cas d'erreur)
- ✅ Revalidation cache Next.js fonctionne

---

### 🎨 Phase 6: Interface Utilisateur - Composants Partagés (0% complété)

**Objectif**: Créer les composants UI réutilisables et le layout

#### Étapes

- [ ] 6.1 Configurer les composants Shadcn UI
  - [ ] Tous les composants installés
  - [ ] Thème personnalisé (si nécessaire)
- [ ] 6.2 Créer les Providers
  - [ ] `components/providers/auth-provider.tsx`
  - [ ] `components/providers/toast-provider.tsx` (Sonner)
  - [ ] `components/providers/theme-provider.tsx`
- [ ] 6.3 Créer les composants partagés
  - [ ] `components/shared/page-header.tsx`
  - [ ] `components/shared/permission-guard.tsx`
  - [ ] `components/shared/loading-state.tsx`
  - [ ] `components/shared/error-boundary.tsx`
  - [ ] `components/shared/empty-state.tsx`
  - [ ] `components/shared/data-table.tsx` (table réutilisable)
- [ ] 6.4 Créer la navigation
  - [ ] `components/shared/navbar.tsx`
  - [ ] `components/shared/sidebar.tsx`
  - [ ] `components/shared/user-menu.tsx`
- [ ] 6.5 Créer le layout dashboard
  - [ ] `app/(dashboard)/layout.tsx`
  - [ ] Sidebar avec navigation
  - [ ] Navbar avec user menu
  - [ ] Responsive design
- [ ] 6.6 Créer les stores Zustand
  - [ ] `lib/stores/use-ui-store.ts` (sidebar, theme)
  - [ ] `lib/stores/use-warehouse-store.ts`
  - [ ] `lib/stores/use-product-store.ts`
- [ ] 6.7 Créer les utilitaires
  - [ ] `lib/utils/constants.ts`
  - [ ] `lib/utils/helpers.ts`
  - [ ] `lib/utils/formatters.ts`
  - [ ] `lib/utils/cn.ts` (déjà fourni par Shadcn)

**Critères de Validation**:

- ✅ Layout dashboard fonctionnel
- ✅ Navigation opérationnelle
- ✅ Composants partagés réutilisables
- ✅ Theme switcher fonctionne
- ✅ Responsive sur mobile/tablet/desktop

---

### 🏢 Phase 7: Module Entrepôts (0% complété)

**Objectif**: Implémenter le CRUD complet des entrepôts

#### Étapes

- [ ] 7.1 Créer la page liste
  - [ ] `app/(dashboard)/warehouses/page.tsx`
  - [ ] Server Component avec data fetching
  - [ ] Vérification permissions
- [ ] 7.2 Créer les composants liste
  - [ ] `warehouse-list.tsx`
  - [ ] `warehouse-card.tsx`
  - [ ] `warehouse-filters.tsx` (avec Nuqs)
- [ ] 7.3 Créer le dialogue création
  - [ ] `create-warehouse-dialog.tsx`
  - [ ] Formulaire avec validation
  - [ ] useAction hook
- [ ] 7.4 Créer la page détail
  - [ ] `app/(dashboard)/warehouses/[id]/page.tsx`
  - [ ] Affichage détails + stock + accès
  - [ ] Stats entrepôt
- [ ] 7.5 Créer la page édition
  - [ ] `app/(dashboard)/warehouses/[id]/edit/page.tsx`
  - [ ] Formulaire pré-rempli
- [ ] 7.6 Créer le gestionnaire d'accès
  - [ ] `warehouse-access-manager.tsx`
  - [ ] Liste des utilisateurs avec accès
  - [ ] Ajout/suppression accès
  - [ ] Toggle canWrite
- [ ] 7.7 Créer la vue stock
  - [ ] `stock-overview.tsx`
  - [ ] Liste des produits en stock
  - [ ] Filtres et recherche

**Critères de Validation**:

- ✅ CRUD entrepôts fonctionnel
- ✅ Gestion des accès utilisateurs opérationnelle
- ✅ Filtres et recherche fonctionnent
- ✅ Permissions respectées (admin vs autres)

---

### 📦 Phase 8: Module Produits (0% complété)

**Objectif**: Implémenter le CRUD complet des produits avec variantes

#### Étapes

- [ ] 8.1 Créer la page liste produits
  - [ ] `app/(dashboard)/products/page.tsx`
  - [ ] Filtres: catégorie, recherche, stock
- [ ] 8.2 Créer les composants liste
  - [ ] `product-list.tsx`
  - [ ] `product-card.tsx` (avec stock global)
  - [ ] `product-filters.tsx`
- [ ] 8.3 Créer le dialogue création
  - [ ] `create-product-dialog.tsx`
  - [ ] Formulaire multi-étapes si nécessaire
- [ ] 8.4 Créer le formulaire produit
  - [ ] `product-form.tsx`
  - [ ] Champs: SKU, nom, description, catégorie, unité, minStock
  - [ ] Validation temps réel
- [ ] 8.5 Implémenter le sélecteur de catégories
  - [ ] `category-selector.tsx`
  - [ ] Arbre hiérarchique
  - [ ] Création rapide de catégorie
- [ ] 8.6 Créer le gestionnaire de variantes
  - [ ] `variant-manager.tsx`
  - [ ] Liste des variantes
  - [ ] Ajout/édition/suppression
  - [ ] SKU unique par variante
- [ ] 8.7 Créer le gestionnaire d'attributs
  - [ ] `attribute-manager.tsx`
  - [ ] Liste clé-valeur
  - [ ] Ajout/suppression dynamique
- [ ] 8.8 Créer la page détail produit
  - [ ] `app/(dashboard)/products/[id]/page.tsx`
  - [ ] Informations complètes
  - [ ] Variantes et attributs
  - [ ] Stock par entrepôt
  - [ ] Historique des mouvements
- [ ] 8.9 Créer la page édition
  - [ ] `app/(dashboard)/products/[id]/edit/page.tsx`
- [ ] 8.10 Créer la vue stock par entrepôt
  - [ ] `stock-by-warehouse.tsx`
  - [ ] Table avec quantités

**Critères de Validation**:

- ✅ CRUD produits complet
- ✅ Gestion variantes fonctionnelle
- ✅ Gestion attributs opérationnelle
- ✅ Catégories hiérarchiques fonctionnent
- ✅ Vue stock par entrepôt précise

---

### 🔄 Phase 9: Module Mouvements (0% complété)

**Objectif**: Implémenter tous les types de mouvements de stock

#### Étapes

- [ ] 9.1 Créer la page liste mouvements
  - [ ] `app/(dashboard)/movements/page.tsx`
  - [ ] Filtres: type, entrepôt, produit, date
  - [ ] Pagination
- [ ] 9.2 Créer les composants liste
  - [ ] `movement-list.tsx`
  - [ ] `movement-card.tsx` avec icônes par type
  - [ ] `movement-filters.tsx`
- [ ] 9.3 Créer la page création mouvement
  - [ ] `app/(dashboard)/movements/new/page.tsx`
  - [ ] Sélecteur de type
- [ ] 9.4 Créer le sélecteur de type
  - [ ] `movement-type-selector.tsx`
  - [ ] 4 types: IN, OUT, TRANSFER, ADJUSTMENT
  - [ ] Visual avec icônes
- [ ] 9.5 Créer le formulaire ENTRÉE (IN)
  - [ ] `in-form.tsx`
  - [ ] Sélection: produit, variante, quantité, entrepôt destination
  - [ ] Référence et notes optionnelles
- [ ] 9.6 Créer le formulaire SORTIE (OUT)
  - [ ] `out-form.tsx`
  - [ ] Sélection: produit, variante, quantité, entrepôt source
  - [ ] Vérification stock disponible en temps réel
- [ ] 9.7 Créer le formulaire TRANSFERT (TRANSFER)
  - [ ] `transfer-form.tsx`
  - [ ] Sélection: produit, variante, quantité, entrepôt source ET destination
  - [ ] Vérification permissions sur les 2 entrepôts
  - [ ] Validation: source ≠ destination
- [ ] 9.8 Créer le formulaire AJUSTEMENT (ADJUSTMENT)
  - [ ] `adjustment-form.tsx`
  - [ ] Définition quantité absolue
  - [ ] Justification obligatoire
- [ ] 9.9 Créer le composant détail mouvement
  - [ ] `movement-detail.tsx`
  - [ ] Modal ou page dédiée
  - [ ] Toutes les informations du mouvement

**Critères de Validation**:

- ✅ Les 4 types de mouvements fonctionnent
- ✅ Stock mis à jour correctement après chaque mouvement
- ✅ Transactions atomiques (rollback si erreur)
- ✅ Vérifications permissions correctes
- ✅ Historique complet accessible
- ✅ Filtres fonctionnent

---

### 👥 Phase 10: Module Utilisateurs (0% complété)

**Objectif**: Gestion des utilisateurs (admin uniquement)

#### Étapes

- [ ] 10.1 Créer la page liste utilisateurs
  - [ ] `app/(dashboard)/users/page.tsx`
  - [ ] Visible uniquement pour ADMINISTRATOR
- [ ] 10.2 Créer les composants liste
  - [ ] `user-list.tsx`
  - [ ] `user-card.tsx` avec rôle et statut
- [ ] 10.3 Créer le dialogue création
  - [ ] `create-user-dialog.tsx`
  - [ ] Formulaire: email, nom, rôle, password
  - [ ] Validation password fort
- [ ] 10.4 Créer le formulaire utilisateur
  - [ ] `user-form.tsx`
  - [ ] Édition profil
  - [ ] Changement rôle
  - [ ] Activation/désactivation
- [ ] 10.5 Créer le sélecteur de rôle
  - [ ] `role-selector.tsx`
  - [ ] 5 rôles avec descriptions
- [ ] 10.6 Créer l'assignation entrepôts
  - [ ] `assign-warehouses.tsx`
  - [ ] Liste entrepôts disponibles
  - [ ] Toggle accès + canWrite
- [ ] 10.7 Créer la page détail utilisateur
  - [ ] `app/(dashboard)/users/[id]/page.tsx`
  - [ ] Informations + entrepôts assignés
  - [ ] Historique des mouvements créés

**Critères de Validation**:

- ✅ CRUD utilisateurs (admin only)
- ✅ Attribution rôles fonctionnelle
- ✅ Assignation entrepôts opérationnelle
- ✅ Permissions correctement appliquées
- ✅ Impossible d'accéder si pas admin

---

### 📊 Phase 11: Module Dashboard (0% complété)

**Objectif**: Créer un tableau de bord avec KPIs et stats

#### Étapes

- [ ] 11.1 Créer la page dashboard
  - [ ] `app/(dashboard)/dashboard/page.tsx`
  - [ ] Vue adaptée au rôle
- [ ] 11.2 Créer les cartes de statistiques
  - [ ] `stats-cards.tsx`
  - [ ] Nombre d'entrepôts
  - [ ] Nombre de produits
  - [ ] Valeur stock total (si prix ajoutés)
  - [ ] Mouvements du jour
- [ ] 11.3 Créer le graphique de stock
  - [ ] `stock-chart.tsx`
  - [ ] Évolution stock dans le temps
  - [ ] Utiliser une lib de charts (Recharts ou Chart.js)
- [ ] 11.4 Créer les mouvements récents
  - [ ] `recent-movements.tsx`
  - [ ] Liste des 10 derniers mouvements
  - [ ] Lien vers détails
- [ ] 11.5 Créer les alertes stock bas
  - [ ] `low-stock-alerts.tsx`
  - [ ] Produits < minStock
  - [ ] Actions rapides
- [ ] 11.6 Créer la vue entrepôts
  - [ ] `warehouse-overview.tsx`
  - [ ] Cartes par entrepôt avec stats
- [ ] 11.7 Créer les actions rapides
  - [ ] `quick-actions.tsx`
  - [ ] Boutons: Nouveau mouvement, Nouveau produit, etc.

**Critères de Validation**:

- ✅ Dashboard affiche les bonnes stats
- ✅ Graphiques fonctionnels
- ✅ Alertes stock bas correctes
- ✅ Actions rapides opérationnelles
- ✅ Performance optimale (pas de lag)

---

### 📈 Phase 12: Module Rapports (0% complété)

**Objectif**: Générer des rapports et permettre l'export

#### Étapes

- [ ] 12.1 Créer la page rapports
  - [ ] `app/(dashboard)/reports/page.tsx`
  - [ ] Onglets pour différents types
- [ ] 12.2 Créer le rapport de stock
  - [ ] `stock-report.tsx`
  - [ ] Stock actuel par produit et entrepôt
  - [ ] Filtres: entrepôt, catégorie
- [ ] 12.3 Créer le rapport de mouvements
  - [ ] `movement-report.tsx`
  - [ ] Mouvements par période
  - [ ] Filtres: type, entrepôt, date range
- [ ] 12.4 Créer le rapport par entrepôt
  - [ ] `warehouse-report.tsx`
  - [ ] Détails stock + mouvements par entrepôt
- [ ] 12.5 Créer les alertes stock minimum
  - [ ] `low-stock-alert.tsx`
  - [ ] Liste produits sous seuil
- [ ] 12.6 Créer les filtres de rapports
  - [ ] `report-filters.tsx`
  - [ ] Date range picker
  - [ ] Sélecteurs multiples
- [ ] 12.7 Implémenter l'export
  - [ ] `export-button.tsx`
  - [ ] Export CSV/Excel (xlsx)
  - [ ] Export PDF (optionnel - Phase 2)

**Critères de Validation**:

- ✅ Tous les rapports générés correctement
- ✅ Filtres fonctionnels
- ✅ Export CSV/Excel opérationnel
- ✅ Données précises et à jour

---

### 🧪 Phase 13: Tests et Optimisation (0% complété)

**Objectif**: Tester, optimiser et sécuriser l'application

#### Étapes

- [ ] 13.1 Tests fonctionnels
  - [ ] Tester tous les CRUD
  - [ ] Tester toutes les permissions
  - [ ] Tester les transactions (rollback)
  - [ ] Tester les validations
- [ ] 13.2 Tests de permissions
  - [ ] Créer des utilisateurs de chaque rôle
  - [ ] Vérifier les accès autorisés/interdits
  - [ ] Tester les accès entrepôts
- [ ] 13.3 Optimisation des requêtes
  - [ ] Analyser les requêtes Prisma lentes
  - [ ] Ajouter des index si nécessaire
  - [ ] Utiliser les includes/selects optimaux
- [ ] 13.4 Optimisation performance
  - [ ] Lazy loading images
  - [ ] Code splitting si nécessaire
  - [ ] Optimiser les re-renders
- [ ] 13.5 Validation UX
  - [ ] Responsive sur tous devices
  - [ ] Accessibilité (keyboard navigation)
  - [ ] Messages d'erreur clairs
  - [ ] Loading states partout
- [ ] 13.6 Sécurité
  - [ ] Audit des permissions
  - [ ] Protection CSRF (Next.js par défaut)
  - [ ] Validation côté serveur systématique
  - [ ] Pas de données sensibles exposées

**Critères de Validation**:

- ✅ Tous les tests passent
- ✅ Aucune régression fonctionnelle
- ✅ Performance acceptable (<3s chargement)
- ✅ Sécurité validée

---

### 🚀 Phase 14: Déploiement et Documentation (0% complété)

**Objectif**: Préparer le déploiement en production

#### Étapes

- [ ] 14.1 Documentation technique
  - [ ] README.md complet
  - [ ] Documentation API (si exposée)
  - [ ] Guide d'installation
- [ ] 14.2 Documentation utilisateur
  - [ ] Guide d'utilisation par module
  - [ ] Guide des permissions
  - [ ] FAQ
- [ ] 14.3 Configuration production
  - [ ] Variables d'environnement prod
  - [ ] Configuration SMTP (si emails)
  - [ ] Configuration domaine
- [ ] 14.4 Scripts de déploiement
  - [ ] Scripts migration DB
  - [ ] Scripts de backup
- [ ] 14.5 Monitoring (optionnel)
  - [ ] Logs applicatifs
  - [ ] Monitoring erreurs (Sentry)
  - [ ] Monitoring performance
- [ ] 14.6 Déploiement
  - [ ] Vercel / Railway / VPS
  - [ ] Base de données hébergée
  - [ ] Tests post-déploiement

**Critères de Validation**:

- ✅ Application accessible en production
- ✅ Base de données sécurisée
- ✅ Documentation complète
- ✅ Backups configurés

---

## Suivi Détaillé

### Sprint Actuel (Semaine du 2025-10-08)

**Objectif**: Compléter Phase 1 (Configuration Initiale)

**Tâches Prévues**:

1. Installer toutes les dépendances (Prisma, Better Auth, etc.)
2. Configurer Shadcn UI
3. Créer la structure de dossiers complète
4. Configurer les variables d'environnement

**Blocages**: Aucun

---

## Décisions Techniques

### DT-001: Choix de Better Auth vs NextAuth

**Date**: 2025-10-08
**Décision**: Utiliser **Better Auth**
**Raison**:

- Meilleur support TypeScript
- Plus moderne et flexible
- Adapter Prisma natif
- Champs personnalisés plus faciles (role)

---

### DT-002: Gestion de l'état URL avec Nuqs

**Date**: 2025-10-08
**Décision**: Utiliser **Nuqs** pour l'état dans l'URL
**Raison**:

- Intégration parfaite Next.js App Router
- Synchronisation automatique URL ↔ State
- Re-render Server Components automatique
- Alternative supérieure à useSearchParams natif

---

### DT-003: Transactions Prisma pour mouvements

**Date**: 2025-10-08
**Décision**: Utiliser `prisma.$transaction` pour tous les mouvements de stock
**Raison**:

- Garantir l'atomicité (mouvement + mise à jour stock)
- Rollback automatique en cas d'erreur
- Éviter les incohérences de données
- Pattern standard pour opérations critiques

---

## Blocages et Risques

### 🔴 Blocages Actuels

Aucun blocage actuellement.

---

### 🟡 Risques Identifiés

**R-001: Performances des requêtes avec beaucoup de données**

- **Impact**: Moyen
- **Probabilité**: Haute
- **Mitigation**:
  - Pagination systématique
  - Index Prisma optimaux
  - Lazy loading
  - Caching Next.js

**R-002: Complexité des permissions granulaires**

- **Impact**: Moyen
- **Probabilité**: Moyenne
- **Mitigation**:
  - Tests exhaustifs
  - Matrice de permissions claire
  - Guards réutilisables

**R-003: Gestion des transactions simultanées sur même stock**

- **Impact**: Élevé
- **Probabilité**: Faible
- **Mitigation**:
  - Transactions Prisma
  - Vérification stock dans transaction
  - Optimistic locking si nécessaire

---

## Notes de Progression

### 2025-10-08 - Phases 1, 2 et 3 Complétées ✅

**Phase 1 - Configuration Initiale (matin)**
- ✅ Projet Next.js 15 créé
- ✅ Tailwind v4 configuré
- ✅ Documentation CLAUDE.md créée
- ✅ Plan de développement créé

**Phase 1 - Configuration complète (après-midi)**
- ✅ Branche `feature/phase-1-setup` créée
- ✅ Installation de toutes les dépendances (Prisma, Better Auth, Zustand, Nuqs, Next Safe Action, Date-fns, Sonner)
- ✅ Configuration Shadcn UI avec 30+ composants
- ✅ Structure de dossiers complète (lib/, components/, app/)
- ✅ Fichiers d'environnement (.env, .env.example)
- ✅ Validation build TypeScript et ESLint
- ✅ Commit `7357b33` avec 19 fichiers modifiés, 1387 insertions
- 🎯 **Phase 1 complète à 100%**

**Phase 2 - Base de Données (fin d'après-midi)**
- ✅ Docker PostgreSQL 16 containerisé sur port 5433
- ✅ Schéma Prisma complet (9 modèles, 2 enums, 25+ index)
- ✅ Client Prisma singleton avec pattern optimal
- ✅ Script de seed avec données de test complètes
- ✅ Scripts npm pour gestion DB (generate, push, migrate, studio, seed, reset)
- ✅ tsx installé pour exécution TypeScript
- ✅ Migrations exécutées avec succès (9 tables créées)
- ✅ Seed exécuté (1 admin, 3 catégories, 1 warehouse, 3 produits)
- ✅ Validation build TypeScript et ESLint
- ✅ Commit `9d62225` avec 9 fichiers modifiés, 1181 insertions
- 🎯 **Phase 2 complète à 100%**

**Phase 3 - Authentification et Sécurité (soir)**
- ✅ Branche `feature/phase-3-authentication` créée
- ✅ Schéma Prisma mis à jour avec modèles Better Auth (Session, Account, Verification)
- ✅ Migration initiale créée et appliquée (20251008173640_init)
- ✅ Configuration migrée de package.json vers prisma.config.ts (avec dotenv)
- ✅ Better Auth configuré avec adapter Prisma et email/password
- ✅ Routes API /api/auth/[...all] créées
- ✅ Middleware de protection implémenté
- ✅ Système de permissions complet (5 rôles, 17 permissions)
- ✅ Page login avec formulaire et gestion d'erreurs
- ✅ Dashboard protégé avec AuthGuard
- ✅ Utilitaires client auth (useSession, signIn, signOut)
- ✅ Variables environnement configurées (NEXT_PUBLIC_BETTER_AUTH_URL)
- ✅ Validation build TypeScript et ESLint
- ✅ Pre-commit hooks passés (husky + lint-staged)
- ✅ Commit `8132646` avec 16 fichiers modifiés, 968 insertions
- 🎯 **Phase 3 complète à 100%**

**Phase 4 - Couche d'Accès aux Données (fin de soirée)**
- ✅ Branche `feature/phase-4-repositories` créée
- ✅ BaseRepository créé avec méthodes CRUD génériques type-safe
- ✅ UserRepository avec gestion rôles, recherche, et statistiques
- ✅ CategoryRepository avec hiérarchie, arbre récursif, et breadcrumb
- ✅ WarehouseRepository avec gestion accès utilisateurs et stats
- ✅ ProductRepository avec variantes, attributs, recherche et stock
- ✅ StockRepository avec transactions Prisma, réservations, et alertes stock bas
- ✅ MovementRepository avec filtres avancés, pagination, et analytics
- ✅ Index exports créé (lib/db/repositories/index.ts)
- ✅ Pattern singleton pour toutes les instances
- ✅ Type safety complet avec types Prisma générés
- ✅ Validation build TypeScript et ESLint
- ✅ Commit `9d81dba` avec 8 fichiers créés, 2138 insertions
- ✅ Pre-commit hooks passés (eslint --fix, tsc --noEmit)
- 🎯 **Phase 4 complète à 100%**
- ⏳ Prochaine étape: Phase 5 - Server Actions (Next Safe Action + Zod)

---

## Métriques du Projet

| Métrique | Valeur Actuelle | Objectif |
|----------|-----------------|----------|
| **Progression Globale** | 29% | 100% |
| **Phases Complétées** | 4/14 ✅ | 14/14 |
| **Tests Écrits** | 0 | TBD |
| **Couverture Code** | 0% | >80% |
| **Pages Créées** | 3 (home, login, dashboard) | ~30 |
| **Composants UI** | 30+ (Shadcn) | ~60 |
| **Composants Auth** | 2 (AuthGuard, Login) ✅ | 2 |
| **Repositories** | 7 (Base, User, Category, Warehouse, Product, Stock, Movement) ✅ | 7 |
| **Server Actions** | 0 | ~25 |
| **Dépendances Installées** | 16+ packages | Complet ✅ |
| **Modèles Database** | 12 modèles ✅ | 12 modèles |
| **Tables Database** | 12 tables ✅ | 12 tables |
| **Scripts npm DB** | 6 scripts ✅ | 6 scripts |
| **Routes API** | 1 (auth) ✅ | ~5 |
| **Middleware** | 1 (protection) ✅ | 1 |

---

## Ressources et Références

### Documentation Officielle

- [Next.js 15 Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Better Auth Docs](https://www.better-auth.com/docs)
- [Shadcn UI](https://ui.shadcn.com)
- [Zod](https://zod.dev)

### Fichiers Clés du Projet

- `architecture_plan.md` - Plan architectural complet
- `CLAUDE.md` - Guide pour Claude Code
- `DEVELOPMENT_PLAN.md` - Ce fichier

---

**Dernière mise à jour**: 2025-10-08 par Claude Code
**Prochaine revue prévue**: Fin de Phase 1
