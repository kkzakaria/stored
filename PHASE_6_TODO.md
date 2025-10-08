# Phase 6: Interface Utilisateur - Composants Partagés
## Liste des tâches

> **Statut**: 🔄 En cours
> **Dernière mise à jour**: 2025-10-08

---

## ✅ Étape 1: Installation Composants Shadcn UI (Complétée)
- [x] Installer sidebar component
- [x] Installer breadcrumb component
- [x] Installer tooltip component
- [x] Installer sheet component
- [x] Installer empty component
- [x] Installer navigation-menu component
- [x] Hook use-mobile créé automatiquement

**Résultat**: 7 nouveaux fichiers créés dans components/ui/

---

## ✅ Étape 2: Providers (Complétée)
- [x] Créer theme-provider.tsx avec next-themes
- [x] Créer index.ts pour exports
- [x] Intégrer ThemeProvider dans app/layout.tsx
- [x] Intégrer Toaster (Sonner) dans app/layout.tsx
- [x] Mettre à jour metadata (titre, description, langue FR)
- [x] Ajouter suppressHydrationWarning pour SSR

**Fichiers créés**:
- components/providers/theme-provider.tsx
- components/providers/index.ts

**Fichiers modifiés**:
- app/layout.tsx

---

## 🔄 Étape 3: Stores Zustand (En cours)
- [ ] Créer use-ui-store.ts
  - [ ] State: sidebarOpen, sidebarCollapsed
  - [ ] State: breadcrumbs array
  - [ ] Actions: toggleSidebar, setSidebarOpen, setBreadcrumbs
- [ ] Créer use-warehouse-store.ts
  - [ ] State: selectedWarehouseId
  - [ ] State: warehouseFilters
  - [ ] Actions: setSelectedWarehouse, setFilters, clearFilters
- [ ] Créer use-product-store.ts
  - [ ] State: productFilters (category, search, stock status)
  - [ ] State: pagination (page, limit)
  - [ ] Actions: setFilters, setPagination, resetFilters

**Fichiers à créer**:
- lib/stores/use-ui-store.ts
- lib/stores/use-warehouse-store.ts
- lib/stores/use-product-store.ts
- lib/stores/index.ts

---

## ⏳ Étape 4: Utilitaires (En attente)
### constants.ts
- [ ] APP_NAME, APP_DESCRIPTION
- [ ] Routes constants (ROUTES object)
- [ ] Pagination limits (DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE)
- [ ] UserRole labels français
- [ ] MovementType labels français
- [ ] Date formats

### formatters.ts
- [ ] formatDate() - Format date avec date-fns
- [ ] formatDateTime() - Format date et heure
- [ ] formatRelativeTime() - Temps relatif (il y a X jours)
- [ ] formatNumber() - Format nombres avec séparateurs
- [ ] formatCurrency() - Format prix (€)
- [ ] formatQuantity() - Format quantités avec unités

### helpers.ts
- [ ] generateSlug() - Création de slugs
- [ ] getInitials() - Initiales d'un nom
- [ ] truncateText() - Tronquer texte avec ellipsis
- [ ] getColorForRole() - Couleur par rôle
- [ ] getIconForMovementType() - Icône par type mouvement

**Fichiers à créer**:
- lib/utils/constants.ts
- lib/utils/formatters.ts
- lib/utils/helpers.ts
- lib/utils/index.ts

---

## ⏳ Étape 5: Composants Partagés de Base (En attente)
### page-header.tsx
- [ ] Props: title, description, actions
- [ ] Responsive layout
- [ ] Slot pour breadcrumb

### permission-guard.tsx
- [ ] Props: permission/role required, fallback
- [ ] Intégration avec lib/auth/permissions
- [ ] Support enfants ou message d'erreur

### loading-state.tsx
- [ ] Variantes: spinner, skeleton, inline
- [ ] Props: text, fullPage
- [ ] Combinaison Skeleton components

### error-boundary.tsx
- [ ] React Error Boundary
- [ ] UI de récupération
- [ ] Bouton retry
- [ ] Log des erreurs

### empty-state.tsx
- [ ] Props: icon, title, description, action
- [ ] Utilise @shadcn/empty
- [ ] Variantes: no-data, no-access, search-empty

**Fichiers à créer**:
- components/shared/page-header.tsx
- components/shared/permission-guard.tsx
- components/shared/loading-state.tsx
- components/shared/error-boundary.tsx
- components/shared/empty-state.tsx
- components/shared/index.ts

---

## ⏳ Étape 6: Navigation (En attente)
### app-sidebar.tsx
- [ ] Utilise @shadcn/sidebar component
- [ ] Logo et APP_NAME
- [ ] Navigation items avec permissions:
  - [ ] Dashboard (tous)
  - [ ] Produits (products:read)
  - [ ] Entrepôts (warehouses:read)
  - [ ] Mouvements (movements:read)
  - [ ] Catégories (categories:read)
  - [ ] Utilisateurs (admin:access)
- [ ] Section utilisateur en bas
- [ ] Active state pour route actuelle
- [ ] Collapsible state (Zustand)
- [ ] Icons Lucide React

### navbar.tsx
- [ ] Breadcrumb navigation (@shadcn/breadcrumb)
- [ ] Toggle sidebar (mobile)
- [ ] User menu
- [ ] Theme switcher
- [ ] Responsive

### user-menu.tsx
- [ ] Dropdown menu avec avatar
- [ ] Informations profil (nom, email, rôle)
- [ ] Menu items:
  - [ ] Mon profil (disabled - Phase future)
  - [ ] Paramètres (disabled - Phase future)
  - [ ] Separator
  - [ ] Theme toggle (light/dark/system)
  - [ ] Separator
  - [ ] Déconnexion
- [ ] Intégration Better Auth (signOut)

**Fichiers à créer**:
- components/shared/navigation/app-sidebar.tsx
- components/shared/navigation/navbar.tsx
- components/shared/navigation/user-menu.tsx
- components/shared/navigation/index.ts

---

## ⏳ Étape 7: Layout Dashboard (En attente)
- [ ] Créer app/(dashboard)/layout.tsx
  - [ ] SidebarProvider de @shadcn/sidebar
  - [ ] AppSidebar component
  - [ ] Main content area avec Navbar
  - [ ] Responsive (mobile/tablet/desktop)
  - [ ] Support pour Sheet (mobile sidebar)
- [ ] Mettre à jour app/dashboard/page.tsx
  - [ ] Utiliser PageHeader
  - [ ] Supprimer AuthGuard (dans layout)
  - [ ] Utiliser composants partagés

**Fichiers à créer/modifier**:
- app/(dashboard)/layout.tsx (nouveau)
- app/dashboard/page.tsx (mise à jour)

---

## ⏳ Étape 8: Data Table Réutilisable (En attente)
- [ ] Créer data-table.tsx générique
  - [ ] Props: columns, data, loading, pagination
  - [ ] Tri par colonnes (state local ou contrôlé)
  - [ ] Sélection lignes (checkbox)
  - [ ] Actions par ligne (dropdown)
  - [ ] Pagination controls
  - [ ] Empty state integration
  - [ ] Loading state (skeleton rows)
  - [ ] Responsive (scroll horizontal mobile)
- [ ] Types TypeScript génériques
- [ ] Support filtres externes

**Fichiers à créer**:
- components/shared/data-table.tsx
- components/shared/data-table-pagination.tsx (optionnel)
- components/shared/data-table-toolbar.tsx (optionnel)

---

## ⏳ Étape 9: Tests et Validation (En attente)
### Tests Fonctionnels
- [ ] Tester theme switcher (light/dark/system)
- [ ] Tester sidebar (open/close/collapse)
- [ ] Tester navigation (toutes les routes)
- [ ] Tester breadcrumb generation
- [ ] Tester responsive (mobile/tablet/desktop)
- [ ] Tester mobile sidebar (Sheet)

### Tests Permissions
- [ ] Admin: accès à tout
- [ ] Manager: pas d'accès utilisateurs
- [ ] User: pas d'accès admin sections
- [ ] Visitor: lecture seule
- [ ] Permission-guard fonctionne

### Validation Technique
- [ ] `npm run build` - Build passe
- [ ] `npm run lint` - Pas d'erreurs ESLint
- [ ] TypeScript strict passe
- [ ] Pas de warnings console
- [ ] Performance acceptable (Lighthouse)

---

## 📊 Métriques de Progression

| Catégorie | Complété | Total | Progression |
|-----------|----------|-------|-------------|
| **Composants Shadcn UI** | 7 | 7 | 100% ✅ |
| **Providers** | 2 | 2 | 100% ✅ |
| **Stores Zustand** | 0 | 3 | 0% ⏳ |
| **Utilitaires** | 0 | 3 | 0% ⏳ |
| **Composants Partagés** | 0 | 5 | 0% ⏳ |
| **Navigation** | 0 | 3 | 0% ⏳ |
| **Layout Dashboard** | 0 | 2 | 0% ⏳ |
| **Data Table** | 0 | 1 | 0% ⏳ |
| **Tests** | 0 | 1 | 0% ⏳ |
| **TOTAL PHASE 6** | 9 | 27 | 33% 🔄 |

---

## 🎯 Critères de Succès Phase 6

- ✅ Tous les composants Shadcn UI installés (7/7)
- ✅ ThemeProvider et Toaster intégrés (2/2)
- ⏳ Stores Zustand fonctionnels (0/3)
- ⏳ Utilitaires créés et testés (0/3)
- ⏳ Composants partagés réutilisables (0/5)
- ⏳ Navigation complète avec permissions (0/3)
- ⏳ Layout dashboard responsive (0/2)
- ⏳ Data table générique opérationnelle (0/1)
- ⏳ Build TypeScript passe
- ⏳ ESLint passe sans avertissement

---

## 📝 Notes de Développement

### Décisions Techniques
- **Shadcn UI**: Tous les composants UI pour cohérence
- **Zustand**: State management simple et performant
- **next-themes**: Gestion theme avec SSR support
- **Lucide React**: Icons cohérents
- **date-fns**: Formatage dates (déjà installé)

### Dépendances Installées
- ✅ @radix-ui/react-navigation-menu
- ✅ @radix-ui/react-tooltip
- ✅ next-themes (déjà présent)
- ✅ zustand (déjà présent)
- ✅ date-fns (déjà présent)

### Structure Créée
```
components/
├── providers/
│   ├── theme-provider.tsx ✅
│   └── index.ts ✅
├── shared/
│   ├── navigation/
│   │   ├── app-sidebar.tsx ⏳
│   │   ├── navbar.tsx ⏳
│   │   └── user-menu.tsx ⏳
│   ├── page-header.tsx ⏳
│   ├── permission-guard.tsx ⏳
│   ├── loading-state.tsx ⏳
│   ├── error-boundary.tsx ⏳
│   ├── empty-state.tsx ⏳
│   └── data-table.tsx ⏳
└── ui/
    ├── sidebar.tsx ✅
    ├── breadcrumb.tsx ✅
    ├── tooltip.tsx ✅
    ├── sheet.tsx ✅
    ├── empty.tsx ✅
    └── navigation-menu.tsx ✅

lib/
├── stores/
│   ├── use-ui-store.ts ⏳
│   ├── use-warehouse-store.ts ⏳
│   └── use-product-store.ts ⏳
└── utils/
    ├── constants.ts ⏳
    ├── formatters.ts ⏳
    └── helpers.ts ⏳

app/
├── layout.tsx ✅ (modifié)
└── (dashboard)/
    ├── layout.tsx ⏳ (nouveau)
    └── dashboard/page.tsx ⏳ (à modifier)
```

---

**Prochaine étape**: Créer les Stores Zustand (Étape 3)
