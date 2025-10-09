import { Product, ProductVariant, ProductAttribute, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { BaseRepository } from "./base.repository";

/**
 * Product repository for managing products, variants, and attributes
 */
export class ProductRepository extends BaseRepository<Product> {
  constructor() {
    super(prisma.product);
  }

  /**
   * Find product by SKU
   */
  async findBySku(sku: string): Promise<Product | null> {
    return prisma.product.findUnique({
      where: { sku },
      include: {
        category: true,
        variants: true,
        attributes: true,
      },
    });
  }

  /**
   * Find product with all details
   */
  async findWithDetails(productId: string) {
    return prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        variants: {
          where: { active: true },
          orderBy: { name: "asc" },
        },
        attributes: {
          orderBy: { name: "asc" },
        },
        stock: {
          include: {
            warehouse: true,
          },
        },
      },
    });
  }

  /**
   * Find products by category (optionally include subcategories)
   */
  async findByCategory(categoryId: string, includeChildren = false): Promise<Product[]> {
    if (!includeChildren) {
      return prisma.product.findMany({
        where: {
          categoryId,
          active: true,
        },
        include: {
          variants: { where: { active: true } },
          attributes: true,
        },
        orderBy: { name: "asc" },
      });
    }

    // Get category and all descendants
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return [];
    }

    // Recursive function to get all descendant IDs
    const getDescendantIds = async (id: string): Promise<string[]> => {
      const children = await prisma.category.findMany({
        where: { parentId: id, active: true },
      });

      const ids = [id];
      for (const child of children) {
        const childIds = await getDescendantIds(child.id);
        ids.push(...childIds);
      }

      return ids;
    };

    const categoryIds = await getDescendantIds(categoryId);

    return prisma.product.findMany({
      where: {
        categoryId: { in: categoryIds },
        active: true,
      },
      include: {
        variants: { where: { active: true } },
        attributes: true,
      },
      orderBy: { name: "asc" },
    });
  }

  /**
   * Search products by name, SKU, or description
   */
  async search(query: string): Promise<Product[]> {
    return prisma.product.findMany({
      where: {
        active: true,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { sku: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      include: {
        category: true,
        variants: { where: { active: true } },
      },
      orderBy: { name: "asc" },
    });
  }

  /**
   * Create product with variants
   */
  async createWithVariants(
    productData: Prisma.ProductCreateInput,
    variants?: Prisma.ProductVariantCreateWithoutProductInput[]
  ): Promise<Product> {
    return prisma.product.create({
      data: {
        ...productData,
        active: productData.active ?? true,
        variants: variants
          ? {
              create: variants.map((v) => ({
                ...v,
                active: v.active ?? true,
              })),
            }
          : undefined,
      },
      include: {
        variants: true,
        attributes: true,
      },
    });
  }

  /**
   * Add variant to product
   */
  async addVariant(
    productId: string,
    variantData: Prisma.ProductVariantCreateWithoutProductInput
  ): Promise<ProductVariant> {
    // Check if SKU is unique
    const existing = await prisma.productVariant.findUnique({
      where: { sku: variantData.sku },
    });

    if (existing) {
      throw new Error(`Variant SKU "${variantData.sku}" already exists`);
    }

    return prisma.productVariant.create({
      data: {
        ...variantData,
        productId,
        active: variantData.active ?? true,
      },
    });
  }

  /**
   * Update variant
   */
  async updateVariant(
    variantId: string,
    data: Prisma.ProductVariantUpdateInput
  ): Promise<ProductVariant> {
    return prisma.productVariant.update({
      where: { id: variantId },
      data,
    });
  }

  /**
   * Delete variant
   */
  async deleteVariant(variantId: string): Promise<ProductVariant> {
    return prisma.productVariant.delete({
      where: { id: variantId },
    });
  }

  /**
   * Add attribute to product
   */
  async addAttribute(
    productId: string,
    name: string,
    value: string
  ): Promise<ProductAttribute> {
    return prisma.productAttribute.create({
      data: {
        productId,
        name,
        value,
      },
    });
  }

  /**
   * Update attribute
   */
  async updateAttribute(
    attributeId: string,
    value: string
  ): Promise<ProductAttribute> {
    return prisma.productAttribute.update({
      where: { id: attributeId },
      data: { value },
    });
  }

  /**
   * Delete attribute
   */
  async deleteAttribute(attributeId: string): Promise<ProductAttribute> {
    return prisma.productAttribute.delete({
      where: { id: attributeId },
    });
  }

  /**
   * Find product with stock information
   */
  async findWithStock(productId: string) {
    return prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        variants: {
          where: { active: true },
          include: {
            stock: {
              include: {
                warehouse: {
                  select: {
                    id: true,
                    name: true,
                    code: true,
                  },
                },
              },
            },
          },
        },
        stock: {
          include: {
            warehouse: {
              select: {
                id: true,
                name: true,
                code: true,
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
      },
    });
  }

  /**
   * Get products with low stock
   */
  async getLowStockProducts(): Promise<Product[]> {
    // Products where any stock item is below minStock
    const products = await prisma.product.findMany({
      where: {
        active: true,
        minStock: { gt: 0 },
      },
      include: {
        stock: {
          include: {
            warehouse: true,
          },
        },
      },
    });

    // Filter to only products with low stock
    return products.filter((product) =>
      product.stock.some((stock) => stock.quantity < product.minStock)
    );
  }

  /**
   * Create product with validation
   */
  async createProduct(data: Prisma.ProductCreateInput): Promise<Product> {
    // Check if SKU is unique
    const existing = await this.findBySku(data.sku);
    if (existing) {
      throw new Error(`Product SKU "${data.sku}" already exists`);
    }

    return prisma.product.create({
      data: {
        ...data,
        active: data.active ?? true,
      },
      include: {
        category: true,
        variants: true,
        attributes: true,
      },
    });
  }

  /**
   * Get product statistics
   */
  async getProductStats() {
    const [total, active, withVariants] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { active: true } }),
      prisma.product.count({
        where: {
          variants: {
            some: {},
          },
        },
      }),
    ]);

    return {
      total,
      active,
      withVariants,
    };
  }
}

// Export singleton instance
export const productRepository = new ProductRepository();
