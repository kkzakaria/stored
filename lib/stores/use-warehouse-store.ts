import { create } from "zustand";
import { persist } from "zustand/middleware";

export type WarehouseFilters = {
  search?: string;
  active?: boolean;
};

type WarehouseState = {
  // Selected warehouse
  selectedWarehouseId: string | null;

  // Filters
  filters: WarehouseFilters;

  // Actions
  setSelectedWarehouse: (warehouseId: string | null) => void;
  setFilters: (filters: WarehouseFilters) => void;
  updateFilter: <K extends keyof WarehouseFilters>(
    key: K,
    value: WarehouseFilters[K]
  ) => void;
  clearFilters: () => void;
  reset: () => void;
};

const initialFilters: WarehouseFilters = {
  search: undefined,
  active: undefined,
};

export const useWarehouseStore = create<WarehouseState>()(
  persist(
    (set) => ({
      // Initial state
      selectedWarehouseId: null,
      filters: initialFilters,

      // Actions
      setSelectedWarehouse: (warehouseId) =>
        set({ selectedWarehouseId: warehouseId }),

      setFilters: (filters) => set({ filters }),

      updateFilter: (key, value) =>
        set((state) => ({
          filters: {
            ...state.filters,
            [key]: value,
          },
        })),

      clearFilters: () => set({ filters: initialFilters }),

      reset: () =>
        set({
          selectedWarehouseId: null,
          filters: initialFilters,
        }),
    }),
    {
      name: "warehouse-storage",
      // Only persist selected warehouse, not filters
      partialize: (state) => ({
        selectedWarehouseId: state.selectedWarehouseId,
      }),
    }
  )
);
