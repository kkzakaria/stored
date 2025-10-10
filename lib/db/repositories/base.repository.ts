/**
 * Base repository interface for CRUD operations
 * Provides type-safe generic methods for database operations
 */
export interface IBaseRepository<T> {
  findById(id: string, include?: object): Promise<T | null>;
  findMany(params?: object): Promise<T[]>;
  findFirst(where: object, include?: object): Promise<T | null>;
  create(data: object): Promise<T>;
  update(id: string, data: object): Promise<T>;
  delete(id: string): Promise<T>;
  count(where?: object): Promise<number>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PrismaModel = any;

/**
 * Base repository implementation
 * Extends this class for model-specific repositories
 *
 * @example
 * ```typescript
 * export class UserRepository extends BaseRepository<User> {
 *   constructor() {
 *     super(prisma.user);
 *   }
 * }
 * ```
 */
export abstract class BaseRepository<T> implements IBaseRepository<T> {
  constructor(protected model: PrismaModel) {}

  /**
   * Find a record by ID
   */
  async findById(id: string, include?: object): Promise<T | null> {
    return this.model.findUnique({
      where: { id },
      include,
    });
  }

  /**
   * Find multiple records matching criteria
   */
  async findMany(params?: object): Promise<T[]> {
    return this.model.findMany(params);
  }

  /**
   * Find first record matching criteria
   */
  async findFirst(where: object, include?: object): Promise<T | null> {
    return this.model.findFirst({
      where,
      include,
    });
  }

  /**
   * Create a new record
   */
  async create(data: object): Promise<T> {
    return this.model.create({
      data,
    });
  }

  /**
   * Update an existing record
   */
  async update(id: string, data: object): Promise<T> {
    return this.model.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a record
   */
  async delete(id: string): Promise<T> {
    return this.model.delete({
      where: { id },
    });
  }

  /**
   * Count records matching criteria
   */
  async count(where?: object): Promise<number> {
    return this.model.count({
      where,
    });
  }

  /**
   * Check if a record exists
   */
  async exists(id: string): Promise<boolean> {
    const count = await this.model.count({
      where: { id },
    });
    return count > 0;
  }
}
