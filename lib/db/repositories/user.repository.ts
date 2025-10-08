import { User, UserRole, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { BaseRepository } from "./base.repository";

/**
 * User repository for managing users and authentication
 */
export class UserRepository extends BaseRepository<User> {
  constructor() {
    super(prisma.user);
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Find users by role
   */
  async findByRole(role: UserRole): Promise<User[]> {
    return prisma.user.findMany({
      where: { role },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Find active users only
   */
  async findActive(): Promise<User[]> {
    return prisma.user.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    });
  }

  /**
   * Find user with warehouse access
   */
  async findWithWarehouseAccess(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        warehouseAccess: {
          include: {
            warehouse: true,
          },
        },
      },
    });
  }

  /**
   * Update user role
   */
  async updateRole(userId: string, role: UserRole): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: { role },
    });
  }

  /**
   * Toggle user active status
   */
  async toggleActive(userId: string): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    return prisma.user.update({
      where: { id: userId },
      data: { active: !user.active },
    });
  }

  /**
   * Create user with default settings
   */
  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({
      data: {
        ...data,
        active: data.active ?? true,
        emailVerified: data.emailVerified ?? false,
      },
    });
  }

  /**
   * Get user statistics by role
   */
  async getUserStats(): Promise<{
    total: number;
    active: number;
    byRole: Record<UserRole, number>;
  }> {
    const [total, active, byRole] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { active: true } }),
      prisma.user.groupBy({
        by: ["role"],
        _count: true,
      }),
    ]);

    const roleStats = byRole.reduce(
      (acc, item) => {
        acc[item.role] = item._count;
        return acc;
      },
      {} as Record<UserRole, number>
    );

    return {
      total,
      active,
      byRole: roleStats,
    };
  }

  /**
   * Search users by name or email
   */
  async search(query: string): Promise<User[]> {
    return prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
      },
      orderBy: { name: "asc" },
    });
  }
}

// Export singleton instance
export const userRepository = new UserRepository();
