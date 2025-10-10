import { Stock, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { BaseRepository } from "./base.repository";

/**
 * Stock repository for managing inventory with transaction support
 */
export class StockRepository extends BaseRepository<Stock> {
  constructor() {
    super(prisma.stock);
  }

  /**
   * Find all stock in a warehouse
   */
  async findByWarehouse(warehouseId: string) {
    return prisma.stock.findMany({
      where: { warehouseId },
      include: {
        warehouse: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        product: {
          select: {
            id: true,
            sku: true,
            name: true,
            minStock: true,
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
      },
      orderBy: {
        product: {
          name: "asc",
        },
      },
    });
  }

  /**
   * Find stock for a product across all warehouses
   */
  async findByProduct(productId: string) {
    return prisma.stock.findMany({
      where: { productId },
      include: {
        warehouse: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        variant: {
          select: {
            id: true,
            sku: true,
            name: true,
          },
        },
      },
      orderBy: {
        warehouse: {
          name: "asc",
        },
      },
    });
  }

  /**
   * Find specific stock item
   */
  async findByWarehouseAndProduct(
    warehouseId: string,
    productId: string,
    variantId?: string | null
  ): Promise<Stock | null> {
    return prisma.stock.findFirst({
      where: {
        warehouseId,
        productId,
        variantId: variantId === undefined ? undefined : variantId,
      },
      include: {
        product: true,
        variant: true,
        warehouse: true,
      },
    });
  }

  /**
   * Update stock quantity with transaction
   * Uses delta to increment/decrement quantity
   */
  async updateQuantity(
    warehouseId: string,
    productId: string,
    variantId: string | null,
    quantityDelta: number,
    reservedDelta = 0
  ): Promise<Stock> {
    return prisma.$transaction(async (tx) => {
      // Find existing stock
      const stock = await tx.stock.findFirst({
        where: {
          warehouseId,
          productId,
          variantId,
        },
      });

      if (!stock) {
        // Create new stock entry if it doesn't exist
        return tx.stock.create({
          data: {
            warehouseId,
            productId,
            variantId,
            quantity: Math.max(0, quantityDelta),
            reservedQty: Math.max(0, reservedDelta),
          },
        });
      }

      // Update existing stock
      const newQuantity = stock.quantity + quantityDelta;
      const newReserved = stock.reservedQty + reservedDelta;

      // Validate we don't go negative
      if (newQuantity < 0) {
        throw new Error("Insufficient stock quantity");
      }

      if (newReserved < 0) {
        throw new Error("Invalid reserved quantity");
      }

      return tx.stock.update({
        where: {
          id: stock.id,
        },
        data: {
          quantity: newQuantity,
          reservedQty: newReserved,
        },
      });
    });
  }

  /**
   * Set absolute stock quantity (adjustment)
   */
  async adjustStock(
    warehouseId: string,
    productId: string,
    variantId: string | null,
    newQuantity: number
  ): Promise<Stock> {
    if (newQuantity < 0) {
      throw new Error("Stock quantity cannot be negative");
    }

    // Find existing stock
    const existing = await prisma.stock.findFirst({
      where: {
        warehouseId,
        productId,
        variantId,
      },
    });

    if (existing) {
      return prisma.stock.update({
        where: { id: existing.id },
        data: { quantity: newQuantity },
      });
    }

    return prisma.stock.create({
      data: {
        warehouseId,
        productId,
        variantId,
        quantity: newQuantity,
        reservedQty: 0,
      },
    });
  }

  /**
   * Get items with low stock in a warehouse
   */
  async getLowStockItems(warehouseId?: string) {
    const where: Prisma.StockWhereInput = {
      product: {
        minStock: { gt: 0 },
        active: true,
      },
    };

    if (warehouseId) {
      where.warehouseId = warehouseId;
    }

    const stocks = await prisma.stock.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            sku: true,
            name: true,
            minStock: true,
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
        warehouse: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });

    // Filter items below minimum stock
    return stocks.filter((stock) => stock.quantity < stock.product.minStock);
  }

  /**
   * Get total stock quantity for a product across all warehouses
   */
  async getTotalStock(productId: string, variantId?: string | null): Promise<number> {
    const result = await prisma.stock.aggregate({
      where: {
        productId,
        variantId: variantId ?? null,
      },
      _sum: {
        quantity: true,
      },
    });

    return result._sum.quantity || 0;
  }

  /**
   * Get available stock (quantity - reserved)
   */
  async getAvailableStock(
    warehouseId: string,
    productId: string,
    variantId?: string | null
  ): Promise<number> {
    const stock = await this.findByWarehouseAndProduct(
      warehouseId,
      productId,
      variantId
    );

    if (!stock) {
      return 0;
    }

    return Math.max(0, stock.quantity - stock.reservedQty);
  }

  /**
   * Reserve stock (increment reservedQty)
   */
  async reserveStock(
    warehouseId: string,
    productId: string,
    variantId: string | null,
    quantity: number
  ): Promise<Stock> {
    if (quantity <= 0) {
      throw new Error("Reserve quantity must be positive");
    }

    return prisma.$transaction(async (tx) => {
      const stock = await tx.stock.findFirst({
        where: {
          warehouseId,
          productId,
          variantId,
        },
      });

      if (!stock) {
        throw new Error("Stock not found");
      }

      const available = stock.quantity - stock.reservedQty;
      if (available < quantity) {
        throw new Error("Insufficient available stock to reserve");
      }

      return tx.stock.update({
        where: {
          id: stock.id,
        },
        data: {
          reservedQty: stock.reservedQty + quantity,
        },
      });
    });
  }

  /**
   * Release reserved stock (decrement reservedQty)
   */
  async releaseReservedStock(
    warehouseId: string,
    productId: string,
    variantId: string | null,
    quantity: number
  ): Promise<Stock> {
    if (quantity <= 0) {
      throw new Error("Release quantity must be positive");
    }

    return prisma.$transaction(async (tx) => {
      const stock = await tx.stock.findFirst({
        where: {
          warehouseId,
          productId,
          variantId,
        },
      });

      if (!stock) {
        throw new Error("Stock not found");
      }

      const newReserved = Math.max(0, stock.reservedQty - quantity);

      return tx.stock.update({
        where: {
          id: stock.id,
        },
        data: {
          reservedQty: newReserved,
        },
      });
    });
  }

  /**
   * Get warehouse stock summary
   */
  async getWarehouseSummary(warehouseId: string) {
    const stocks = await this.findByWarehouse(warehouseId);

    const totalItems = stocks.length;
    const lowStockItems = stocks.filter(
      (s) => s.quantity < s.product.minStock
    ).length;
    const totalQuantity = stocks.reduce((sum, s) => sum + s.quantity, 0);
    const totalReserved = stocks.reduce((sum, s) => sum + s.reservedQty, 0);

    return {
      totalItems,
      lowStockItems,
      totalQuantity,
      totalReserved,
      availableQuantity: totalQuantity - totalReserved,
    };
  }
}

// Export singleton instance
export const stockRepository = new StockRepository();
