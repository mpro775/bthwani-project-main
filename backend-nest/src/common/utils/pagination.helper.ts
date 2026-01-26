/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Model, FilterQuery, PopulateOptions } from 'mongoose';
import { CursorPaginationDto } from '../dto/pagination.dto';

export interface PaginationOptions {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  populate?: string | string[] | PopulateOptions;
  select?: string;
  lean?: boolean;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    nextCursor: string | null;
    hasMore: boolean;
    limit: number;
  };
}

/**
 * Helper class للـ Cursor Pagination
 * يوحد منطق الـ pagination عبر المشروع ويقلل التكرار
 */
export class PaginationHelper {
  /**
   * تنفيذ cursor pagination على أي model
   *
   * @example
   * ```typescript
   * return PaginationHelper.paginate(
   *   this.orderModel,
   *   { user: userId },
   *   pagination,
   *   { populate: 'driver', select: 'fullName phone' }
   * );
   * ```
   */
  static async paginate<T>(
    model: Model<T>,
    baseQuery: FilterQuery<T>,
    pagination: CursorPaginationDto,
    options: PaginationOptions = {},
  ): Promise<PaginationResult<T>> {
    const {
      sortBy = 'createdAt',
      sortOrder = 'desc',
      populate,
      select,
      lean = false,
    } = options;

    const query: any = { ...baseQuery };

    // إضافة cursor للـ query
    if (pagination.cursor) {
      query._id = { $gt: pagination.cursor };
    }

    const limit = pagination.limit || 20;
    const sortOption: any = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // بناء الـ query
    let queryBuilder: any = model
      .find(query)
      .sort(sortOption)
      .limit(limit + 1);

    // Populate
    if (populate) {
      if (Array.isArray(populate)) {
        populate.forEach((p) => {
          queryBuilder = queryBuilder.populate(p);
        });
      } else {
        queryBuilder = queryBuilder.populate(populate);
      }
    }

    // Select
    if (select) {
      queryBuilder = queryBuilder.select(select);
    }

    // Lean
    if (lean) {
      queryBuilder = queryBuilder.lean();
    }

    const items = await queryBuilder.exec();

    // حساب hasMore و nextCursor
    const hasMore = items.length > limit;
    const results = hasMore ? items.slice(0, -1) : items;

    return {
      data: results,
      pagination: {
        nextCursor: hasMore
          ? results[results.length - 1]?._id?.toString() || null
          : null,
        hasMore,
        limit,
      },
    };
  }

  /**
   * Offset-based pagination (للاستخدام مع الـ admin panels)
   */
  static async paginateOffset<T>(
    model: Model<T>,
    baseQuery: FilterQuery<T>,
    page: number = 1,
    limit: number = 20,
    options: PaginationOptions = {},
  ): Promise<{
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      sortBy = 'createdAt',
      sortOrder = 'desc',
      populate,
      select,
      lean = false,
    } = options;

    const skip = (page - 1) * limit;
    const sortOption: any = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    let queryBuilder: any = model
      .find(baseQuery)
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    if (populate) {
      if (Array.isArray(populate)) {
        populate.forEach((p) => {
          queryBuilder = queryBuilder.populate(p);
        });
      } else {
        queryBuilder = queryBuilder.populate(populate);
      }
    }

    if (select) {
      queryBuilder = queryBuilder.select(select);
    }

    if (lean) {
      queryBuilder = queryBuilder.lean();
    }

    const [data, total] = await Promise.all([
      queryBuilder.exec(),
      model.countDocuments(baseQuery),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
