import { Warehouse, WarehouseAccess, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { BaseRepository } from "./base.repository";

/**
 * Warehouse repository for managing warehouses and access control
 */
export class WarehouseRepository extends BaseRepository<Warehouse> {
  constructor() {
    super(prisma.warehouse);
  }

  /**
   * Find warehouse by code
   */
  async findByCode(code: string): Promise<Warehouse | null> {
    return prisma.warehouse.findUnique({
      where: { code },
    });
  }

  /**
   * Find all active warehouses
   */
  async findActive(): Promise<Warehouse[]> {
    return prisma.warehouse.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    });
  }

  /**
   * Find all warehouses accessible by user
   */
  async findAllByUser(userId: string): Promise<Warehouse[]> {
    const access = await prisma.warehouseAccess.findMany({
      where: { userId },
      include: { warehouse: true },
    });

    return access
      .map((a) => a.warehouse)
      .filter((w) => w.active)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Get warehouses with user access details
   */
  async getUserWarehouses(userId: string) {
    return prisma.warehouseAccess.findMany({
      where: { userId },
      include: {
        warehouse: {
          include: {
            _count: {
              select: {
                stock: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Get warehouses where user has write access
   */
  async getUserWritableWarehouses(userId: string): Promise<Warehouse[]> {
    const access = await prisma.warehouseAccess.findMany({
      where: {
        userId,
        canWrite: true,
      },
      include: { warehouse: true },
    });

    return access
      .map((a) => a.warehouse)
      .filter((w) => w.active)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Find warehouse with complete details
   */
  async findWithDetails(warehouseId: string) {
    return prisma.warehouse.findUnique({
      where: { id: warehouseId },
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
                minStock: true,
              },
            },
            variant: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
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

  /**
   * Assign user to warehouse
   */
  async assignUser(
    warehouseId: string,
    userId: string,
    canWrite = false
  ): Promise<WarehouseAccess> {
    // Check if warehouse exists
    const warehouse = await this.findById(warehouseId);
    if (!warehouse) {
      throw new Error("Warehouse not found");
    }

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error("User not found");
    }

    // Create or update access
    return prisma.warehouseAccess.upsert({
      where: {
        userId_warehouseId: {
          userId,
          warehouseId,
        },
      },
      update: {
        canWrite,
      },
      create: {
        userId,
        warehouseId,
        canWrite,
      },
    });
  }

  /**
   * Remove user from warehouse
   */
  async removeUser(warehouseId: string, userId: string): Promise<WarehouseAccess> {
    return prisma.warehouseAccess.delete({
      where: {
        userId_warehouseId: {
          userId,
          warehouseId,
        },
      },
    });
  }

  /**
   * Update user access level
   */
  async updateUserAccess(
    warehouseId: string,
    userId: string,
    canWrite: boolean
  ): Promise<WarehouseAccess> {
    return prisma.warehouseAccess.update({
      where: {
        userId_warehouseId: {
          userId,
          warehouseId,
        },
      },
      data: { canWrite },
    });
  }

  /**
   * Check if user has access to warehouse
   */
  async hasAccess(userId: string, warehouseId: string): Promise<boolean> {
    const access = await prisma.warehouseAccess.findUnique({
      where: {
        userId_warehouseId: {
          userId,
          warehouseId,
        },
      },
    });

    return access !== null;
  }

  /**
   * Check if user has write access to warehouse
   */
  async hasWriteAccess(userId: string, warehouseId: string): Promise<boolean> {
    const access = await prisma.warehouseAccess.findUnique({
      where: {
        userId_warehouseId: {
          userId,
          warehouseId,
        },
      },
    });

    return access?.canWrite === true;
  }

  /**
   * Get all users with access to warehouse
   */
  async getWarehouseUsers(warehouseId: string) {
    return prisma.warehouseAccess.findMany({
      where: { warehouseId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            active: true,
          },
        },
      },
      orderBy: {
        user: {
          name: "asc",
        },
      },
    });
  }

  /**
   * Create warehouse with validation
   */
  async createWarehouse(data: Prisma.WarehouseCreateInput): Promise<Warehouse> {
    // Check if code is unique
    const existing = await this.findByCode(data.code);
    if (existing) {
      throw new Error(`Warehouse with code "${data.code}" already exists`);
    }

    return prisma.warehouse.create({
      data: {
        ...data,
        active: data.active ?? true,
      },
    });
  }

  /**
   * Get warehouse statistics
   */
  async getWarehouseStats(warehouseId: string) {
    const [stock, allStocks, movements] = await Promise.all([
      prisma.stock.count({
        where: { warehouseId },
      }),
      prisma.stock.findMany({
        where: {
          warehouseId,
          product: {
            minStock: { gt: 0 },
            active: true,
          },
        },
        include: {
          product: {
            select: { minStock: true },
          },
        },
      }),
      prisma.movement.count({
        where: {
          OR: [{ fromWarehouseId: warehouseId }, { toWarehouseId: warehouseId }],
        },
      }),
    ]);

    // Filter for low stock items
    const lowStock = allStocks.filter((s) => s.quantity < s.product.minStock).length;

    return {
      totalStockItems: stock,
      lowStockItems: lowStock,
      totalMovements: movements,
    };
  }
}

// Export singleton instance
export const warehouseRepository = new WarehouseRepository();
