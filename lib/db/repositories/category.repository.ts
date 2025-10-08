import { Category, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { BaseRepository } from "./base.repository";

/**
 * Category with children for tree structure
 */
export type CategoryWithChildren = Category & {
  children?: CategoryWithChildren[];
};

/**
 * Category repository for managing hierarchical categories
 */
export class CategoryRepository extends BaseRepository<Category> {
  constructor() {
    super(prisma.category);
  }

  /**
   * Find root categories (no parent)
   */
  async findRoot(): Promise<Category[]> {
    return prisma.category.findMany({
      where: {
        parentId: null,
        active: true,
      },
      orderBy: { name: "asc" },
    });
  }

  /**
   * Find children of a category
   */
  async findChildren(parentId: string): Promise<Category[]> {
    return prisma.category.findMany({
      where: {
        parentId,
        active: true,
      },
      orderBy: { name: "asc" },
    });
  }

  /**
   * Find category with its direct children
   */
  async findWithChildren(categoryId: string): Promise<CategoryWithChildren | null> {
    return prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        children: {
          where: { active: true },
          orderBy: { name: "asc" },
        },
      },
    });
  }

  /**
   * Find category with all products
   */
  async findWithProducts(categoryId: string, includeInactive = false) {
    return prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        products: {
          where: includeInactive ? {} : { active: true },
          include: {
            variants: true,
            attributes: true,
          },
          orderBy: { name: "asc" },
        },
      },
    });
  }

  /**
   * Build complete category tree (recursive)
   */
  async findTree(): Promise<CategoryWithChildren[]> {
    // Get all active categories
    const categories = await prisma.category.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    });

    // Build tree structure
    const categoryMap = new Map<string, CategoryWithChildren>();
    categories.forEach((cat) => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    const tree: CategoryWithChildren[] = [];

    categories.forEach((cat) => {
      const category = categoryMap.get(cat.id)!;
      if (cat.parentId === null) {
        tree.push(category);
      } else {
        const parent = categoryMap.get(cat.parentId);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(category);
        }
      }
    });

    return tree;
  }

  /**
   * Get all descendant category IDs (including the category itself)
   */
  async getDescendantIds(categoryId: string): Promise<string[]> {
    const descendants: string[] = [categoryId];
    const children = await this.findChildren(categoryId);

    for (const child of children) {
      const childDescendants = await this.getDescendantIds(child.id);
      descendants.push(...childDescendants);
    }

    return descendants;
  }

  /**
   * Create category with validation
   */
  async createCategory(data: Prisma.CategoryCreateInput): Promise<Category> {
    // Validate parent exists if provided
    if (data.parent && typeof data.parent === "object" && "connect" in data.parent) {
      const parentId = data.parent.connect?.id;
      if (parentId) {
        const parent = await this.findById(parentId);
        if (!parent) {
          throw new Error("Parent category not found");
        }
      }
    }

    return prisma.category.create({
      data: {
        ...data,
        active: data.active ?? true,
      },
    });
  }

  /**
   * Move category to different parent
   */
  async moveCategory(
    categoryId: string,
    newParentId: string | null
  ): Promise<Category> {
    // Validate we're not creating a circular reference
    if (newParentId) {
      const descendants = await this.getDescendantIds(categoryId);
      if (descendants.includes(newParentId)) {
        throw new Error("Cannot move category to its own descendant");
      }
    }

    return prisma.category.update({
      where: { id: categoryId },
      data: { parentId: newParentId },
    });
  }

  /**
   * Get category breadcrumb (path from root to category)
   */
  async getBreadcrumb(categoryId: string): Promise<Category[]> {
    const breadcrumb: Category[] = [];
    let currentId: string | null = categoryId;

    while (currentId) {
      const category = await this.findById(currentId);
      if (!category) break;

      breadcrumb.unshift(category);
      currentId = category.parentId;
    }

    return breadcrumb;
  }

  /**
   * Count products in category (including subcategories)
   */
  async countProducts(categoryId: string, includeSubcategories = true): Promise<number> {
    if (!includeSubcategories) {
      return prisma.product.count({
        where: {
          categoryId,
          active: true,
        },
      });
    }

    const categoryIds = await this.getDescendantIds(categoryId);
    return prisma.product.count({
      where: {
        categoryId: { in: categoryIds },
        active: true,
      },
    });
  }
}

// Export singleton instance
export const categoryRepository = new CategoryRepository();
