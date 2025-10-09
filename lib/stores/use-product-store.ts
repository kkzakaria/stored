import { create } from "zustand";

export type StockStatus = "all" | "in-stock" | "low-stock" | "out-of-stock";

export type ProductFilters = {
  search?: string;
  categoryId?: string;
  warehouseId?: string;
  stockStatus?: StockStatus;
  active?: boolean;
};

export type PaginationState = {
  page: number;
  limit: number;
  total?: number;
};

type ProductState = {
  // Filters
  filters: ProductFilters;

  // Pagination
  pagination: PaginationState;

  // Actions
  setFilters: (filters: ProductFilters) => void;
  updateFilter: <K extends keyof ProductFilters>(
    key: K,
    value: ProductFilters[K]
  ) => void;
  clearFilters: () => void;

  setPagination: (pagination: Partial<PaginationState>) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setTotal: (total: number) => void;
  resetPagination: () => void;

  reset: () => void;
};

const initialFilters: ProductFilters = {
  search: undefined,
  categoryId: undefined,
  warehouseId: undefined,
  stockStatus: "all",
  active: undefined,
};

const initialPagination: PaginationState = {
  page: 1,
  limit: 10,
  total: undefined,
};

export const useProductStore = create<ProductState>()((set) => ({
  // Initial state
  filters: initialFilters,
  pagination: initialPagination,

  // Filter actions
  setFilters: (filters) =>
    set({
      filters,
      // Reset to page 1 when filters change
      pagination: { ...initialPagination },
    }),

  updateFilter: (key, value) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value,
      },
      // Reset to page 1 when filter changes
      pagination: { ...state.pagination, page: 1 },
    })),

  clearFilters: () =>
    set({
      filters: initialFilters,
      pagination: initialPagination,
    }),

  // Pagination actions
  setPagination: (pagination) =>
    set((state) => ({
      pagination: {
        ...state.pagination,
        ...pagination,
      },
    })),

  setPage: (page) =>
    set((prevState) => ({
      pagination: {
        ...prevState.pagination,
        page,
      },
    })),

  setLimit: (limit) =>
    set((state) => ({
      pagination: {
        ...state.pagination,
        limit,
        page: 1, // Reset to page 1 when limit changes
      },
    })),

  setTotal: (total) =>
    set((state) => ({
      pagination: {
        ...state.pagination,
        total,
      },
    })),

  resetPagination: () =>
    set(() => ({
      pagination: initialPagination,
    })),

  // Reset all
  reset: () =>
    set({
      filters: initialFilters,
      pagination: initialPagination,
    }),
}));
