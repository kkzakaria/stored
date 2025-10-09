"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "./empty-state";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface DataTableColumn<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface DataTablePagination {
  page: number;
  limit: number;
  total?: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

export interface DataTableSort {
  key: string;
  direction: "asc" | "desc";
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyState?: {
    icon?: LucideIcon;
    title: string;
    description?: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
  pagination?: DataTablePagination;
  sort?: DataTableSort;
  onSortChange?: (sort: DataTableSort) => void;
  rowKey: (item: T) => string;
  onRowClick?: (item: T) => void;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  loading = false,
  emptyState,
  pagination,
  sort,
  onSortChange,
  rowKey,
  onRowClick,
  className,
}: DataTableProps<T>) {
  const handleSort = (columnKey: string) => {
    if (!onSortChange) return;

    if (sort?.key === columnKey) {
      // Toggle direction
      onSortChange({
        key: columnKey,
        direction: sort.direction === "asc" ? "desc" : "asc",
      });
    } else {
      // New column
      onSortChange({
        key: columnKey,
        direction: "asc",
      });
    }
  };

  const renderSortIcon = (columnKey: string) => {
    if (!sort || sort.key !== columnKey) {
      return <ArrowUpDown className="ml-2 size-4" />;
    }

    return sort.direction === "asc" ? (
      <ArrowUp className="ml-2 size-4" />
    ) : (
      <ArrowDown className="ml-2 size-4" />
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className={cn("space-y-3", className)}>
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return emptyState ? (
      <EmptyState
        icon={emptyState.icon}
        title={emptyState.title}
        description={emptyState.description}
        action={emptyState.action}
      />
    ) : (
      <EmptyState
        title="Aucune donnée"
        description="Aucun élément à afficher pour le moment."
      />
    );
  }

  const totalPages = pagination?.total
    ? Math.ceil(pagination.total / pagination.limit)
    : 1;

  const startItem = pagination
    ? (pagination.page - 1) * pagination.limit + 1
    : 1;

  const endItem = pagination
    ? Math.min(pagination.page * pagination.limit, pagination.total || 0)
    : data.length;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={cn(column.headerClassName)}
                >
                  {column.sortable && onSortChange ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-3 h-8 data-[state=open]:bg-accent"
                      onClick={() => handleSort(column.key)}
                    >
                      {column.label}
                      {renderSortIcon(column.key)}
                    </Button>
                  ) : (
                    column.label
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow
                key={rowKey(item)}
                className={cn(onRowClick && "cursor-pointer")}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    className={cn(column.className)}
                  >
                    {column.render
                      ? column.render(item)
                      : String((item as Record<string, unknown>)[column.key] ?? "—")}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {pagination.total ? (
              <>
                Affichage de {startItem} à {endItem} sur {pagination.total}{" "}
                résultat{pagination.total > 1 ? "s" : ""}
              </>
            ) : (
              <>
                Page {pagination.page} sur {totalPages}
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => pagination.onPageChange(1)}
              disabled={pagination.page === 1}
            >
              <ChevronsLeft className="size-4" />
              <span className="sr-only">Première page</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              <ChevronLeft className="size-4" />
              <span className="sr-only">Page précédente</span>
            </Button>
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium">{pagination.page}</span>
              <span className="text-sm text-muted-foreground">
                / {totalPages}
              </span>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= totalPages}
            >
              <ChevronRight className="size-4" />
              <span className="sr-only">Page suivante</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => pagination.onPageChange(totalPages)}
              disabled={pagination.page >= totalPages}
            >
              <ChevronsRight className="size-4" />
              <span className="sr-only">Dernière page</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
