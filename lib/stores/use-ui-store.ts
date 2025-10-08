import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Breadcrumb = {
  label: string;
  href?: string;
};

type UIState = {
  // Sidebar state
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;

  // Breadcrumbs
  breadcrumbs: Breadcrumb[];

  // Actions
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebarCollapse: () => void;
  setBreadcrumbs: (breadcrumbs: Breadcrumb[]) => void;
  clearBreadcrumbs: () => void;
};

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Initial state
      sidebarOpen: true,
      sidebarCollapsed: false,
      breadcrumbs: [],

      // Actions
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleSidebarCollapse: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
      clearBreadcrumbs: () => set({ breadcrumbs: [] }),
    }),
    {
      name: "ui-storage",
      // Only persist sidebar state, not breadcrumbs
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
