import { Movement, MovementType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { BaseRepository } from "./base.repository";

/**
 * Movement filter options
 */
export interface MovementFilters {
  type?: MovementType;
  fromWarehouseId?: string;
  toWarehouseId?: string;
  productId?: string;
  variantId?: string | null;
  userId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

/**
 * Movement repository for managing inventory movements with advanced filtering
 */
export class MovementRepository extends BaseRepository<Movement> {
  constructor() {
    super(prisma.movement);
  }

  /**
   * Find movements with advanced filtering
   */
  async findByFilters(filters: MovementFilters, limit?: number) {
    const where: Prisma.MovementWhereInput = {};

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.fromWarehouseId) {
      where.fromWarehouseId = filters.fromWarehouseId;
    }

    if (filters.toWarehouseId) {
      where.toWarehouseId = filters.toWarehouseId;
    }

    if (filters.productId) {
      where.productId = filters.productId;
    }

    if (filters.variantId !== undefined) {
      where.variantId = filters.variantId;
    }

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.createdAt.lte = filters.dateTo;
      }
    }

    return prisma.movement.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            sku: true,
            name: true,
            unit: true,
          },
        },
        variant: {
          select: {
            id: true,
            sku: true,
            name: true,
          },
        },
        fromWarehouse: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        toWarehouse: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  /**
   * Find all movements for a warehouse (both from and to)
   */
  async findByWarehouse(warehouseId: string, limit?: number) {
    return prisma.movement.findMany({
      where: {
        OR: [{ fromWarehouseId: warehouseId }, { toWarehouseId: warehouseId }],
      },
      include: {
        product: {
          select: {
            id: true,
            sku: true,
            name: true,
            unit: true,
          },
        },
        variant: {
          select: {
            id: true,
            sku: true,
            name: true,
          },
        },
        fromWarehouse: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        toWarehouse: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  /**
   * Find movement history for a product
   */
  async findByProduct(productId: string, variantId?: string | null, limit?: number) {
    const where: Prisma.MovementWhereInput = {
      productId,
    };

    if (variantId !== undefined) {
      where.variantId = variantId;
    }

    return prisma.movement.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            sku: true,
            name: true,
            unit: true,
          },
        },
        variant: {
          select: {
            id: true,
            sku: true,
            name: true,
          },
        },
        fromWarehouse: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        toWarehouse: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  /**
   * Get recent movements with limit
   */
  async getRecentMovements(limit = 10) {
    return prisma.movement.findMany({
      include: {
        product: {
          select: {
            id: true,
            sku: true,
            name: true,
            unit: true,
          },
        },
        variant: {
          select: {
            id: true,
            sku: true,
            name: true,
          },
        },
        fromWarehouse: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        toWarehouse: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  /**
   * Get movement statistics for a warehouse
   */
  async getMovementStats(
    warehouseId: string,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<{
    total: number;
    byType: Record<MovementType, number>;
    totalQuantityIn: number;
    totalQuantityOut: number;
  }> {
    const where: Prisma.MovementWhereInput = {
      OR: [{ fromWarehouseId: warehouseId }, { toWarehouseId: warehouseId }],
    };

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = dateFrom;
      }
      if (dateTo) {
        where.createdAt.lte = dateTo;
      }
    }

    const [total, byType, movements] = await Promise.all([
      prisma.movement.count({ where }),
      prisma.movement.groupBy({
        by: ["type"],
        where,
        _count: true,
      }),
      prisma.movement.findMany({
        where,
        select: {
          type: true,
          quantity: true,
          fromWarehouseId: true,
          toWarehouseId: true,
        },
      }),
    ]);

    const typeStats = byType.reduce(
      (acc, item) => {
        acc[item.type] = item._count;
        return acc;
      },
      {
        IN: 0,
        OUT: 0,
        TRANSFER: 0,
        ADJUSTMENT: 0,
      } as Record<MovementType, number>
    );

    // Calculate total quantity in and out
    let totalQuantityIn = 0;
    let totalQuantityOut = 0;

    movements.forEach((m) => {
      if (m.type === "IN" || (m.type === "TRANSFER" && m.toWarehouseId === warehouseId)) {
        totalQuantityIn += m.quantity;
      } else if (
        m.type === "OUT" ||
        (m.type === "TRANSFER" && m.fromWarehouseId === warehouseId)
      ) {
        totalQuantityOut += m.quantity;
      } else if (m.type === "ADJUSTMENT") {
        if (m.quantity > 0) {
          totalQuantityIn += m.quantity;
        } else {
          totalQuantityOut += Math.abs(m.quantity);
        }
      }
    });

    return {
      total,
      byType: typeStats,
      totalQuantityIn,
      totalQuantityOut,
    };
  }

  /**
   * Get complete movement history for a product
   */
  async getProductMovementHistory(productId: string, variantId?: string | null) {
    return this.findByProduct(productId, variantId);
  }

  /**
   * Create movement with validation
   */
  async createMovement(data: Prisma.MovementCreateInput): Promise<Movement> {
    // Validate warehouses exist based on movement type
    if (data.type === "IN" || data.type === "ADJUSTMENT") {
      if (!data.toWarehouse || typeof data.toWarehouse !== "object") {
        throw new Error("toWarehouse is required for IN/ADJUSTMENT movements");
      }
    }

    if (data.type === "OUT") {
      if (!data.fromWarehouse || typeof data.fromWarehouse !== "object") {
        throw new Error("fromWarehouse is required for OUT movements");
      }
    }

    if (data.type === "TRANSFER") {
      if (
        !data.fromWarehouse ||
        typeof data.fromWarehouse !== "object" ||
        !data.toWarehouse ||
        typeof data.toWarehouse !== "object"
      ) {
        throw new Error("Both fromWarehouse and toWarehouse are required for TRANSFER movements");
      }
    }

    return prisma.movement.create({
      data,
      include: {
        product: true,
        variant: true,
        fromWarehouse: true,
        toWarehouse: true,
        user: true,
      },
    });
  }

  /**
   * Paginated movement list
   */
  async findPaginated(
    page = 1,
    pageSize = 20,
    filters?: MovementFilters
  ): Promise<{
    movements: Movement[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * pageSize;

    const where: Prisma.MovementWhereInput = {};

    if (filters) {
      if (filters.type) {
        where.type = filters.type;
      }

      if (filters.fromWarehouseId) {
        where.fromWarehouseId = filters.fromWarehouseId;
      }

      if (filters.toWarehouseId) {
        where.toWarehouseId = filters.toWarehouseId;
      }

      if (filters.productId) {
        where.productId = filters.productId;
      }

      if (filters.variantId !== undefined) {
        where.variantId = filters.variantId;
      }

      if (filters.userId) {
        where.userId = filters.userId;
      }

      if (filters.dateFrom || filters.dateTo) {
        where.createdAt = {};
        if (filters.dateFrom) {
          where.createdAt.gte = filters.dateFrom;
        }
        if (filters.dateTo) {
          where.createdAt.lte = filters.dateTo;
        }
      }
    }

    const [movements, total] = await Promise.all([
      prisma.movement.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              sku: true,
              name: true,
              unit: true,
            },
          },
          variant: {
            select: {
              id: true,
              sku: true,
              name: true,
            },
          },
          fromWarehouse: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          toWarehouse: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.movement.count({ where }),
    ]);

    return {
      movements,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Get movements by user
   */
  async findByUser(userId: string, limit?: number) {
    return prisma.movement.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            sku: true,
            name: true,
            unit: true,
          },
        },
        variant: {
          select: {
            id: true,
            sku: true,
            name: true,
          },
        },
        fromWarehouse: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        toWarehouse: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }
}

// Export singleton instance
export const movementRepository = new MovementRepository();
