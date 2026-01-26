/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Model, Types, PopulateOptions } from 'mongoose';
import { NotFoundException } from '@nestjs/common';

/**
 * Helper class للتعامل مع الـ entities
 * يوحد منطق الـ validation والـ error handling
 */
export class EntityHelper {
  /**
   * جلب entity بالـ ID أو رمي NotFoundException
   *
   * @example
   * ```typescript
   * const user = await EntityHelper.findByIdOrFail(
   *   this.userModel,
   *   userId,
   *   'User'
   * );
   * ```
   */
  static async findByIdOrFail<T>(
    model: Model<T>,
    id: string,
    entityName: string = 'Entity',
    options?: {
      select?: string;
      populate?: string | string[] | PopulateOptions;
      lean?: boolean;
    },
  ): Promise<T> {
    let query: any = model.findById(id);

    if (options?.select) {
      query = query.select(options.select);
    }

    if (options?.populate) {
      if (Array.isArray(options.populate)) {
        options.populate.forEach((p) => {
          query = query.populate(p);
        });
      } else {
        query = query.populate(options.populate);
      }
    }

    if (options?.lean) {
      query = query.lean();
    }

    const entity = await query.exec();

    if (!entity) {
      throw new NotFoundException({
        code: `${entityName.toUpperCase()}_NOT_FOUND`,
        message: `${entityName} not found`,
        userMessage: `${this.getArabicEntityName(entityName)} غير موجود`,
        suggestedAction: 'يرجى التحقق من المعرف',
      });
    }

    return entity;
  }

  /**
   * جلب entity بشرط أو رمي NotFoundException
   */
  static async findOneOrFail<T>(
    model: Model<T>,
    query: any,
    entityName: string = 'Entity',
    options?: {
      select?: string;
      populate?: string | string[];
      lean?: boolean;
    },
  ): Promise<T> {
    let queryBuilder: any = model.findOne(query);

    if (options?.select) {
      queryBuilder = queryBuilder.select(options.select);
    }

    if (options?.populate) {
      if (Array.isArray(options.populate)) {
        options.populate.forEach((p) => {
          queryBuilder = queryBuilder.populate(p);
        });
      } else {
        queryBuilder = queryBuilder.populate(options.populate);
      }
    }

    if (options?.lean) {
      queryBuilder = queryBuilder.lean();
    }

    const entity = await queryBuilder.exec();

    if (!entity) {
      throw new NotFoundException({
        code: `${entityName.toUpperCase()}_NOT_FOUND`,
        message: `${entityName} not found`,
        userMessage: `${this.getArabicEntityName(entityName)} غير موجود`,
      });
    }

    return entity;
  }

  /**
   * جلب عدة entities بالـ IDs أو رمي NotFoundException
   */
  static async findManyByIdsOrFail<T>(
    model: Model<T>,
    ids: string[],
    entityName: string = 'Entity',
    options?: {
      select?: string;
      populate?: string | string[];
    },
  ): Promise<T[]> {
    const objectIds = ids.map((id) => new Types.ObjectId(id));

    let query: any = model.find({ _id: { $in: objectIds } } as any);

    if (options?.select) {
      query = query.select(options.select);
    }

    if (options?.populate) {
      if (Array.isArray(options.populate)) {
        options.populate.forEach((p) => {
          query = query.populate(p);
        });
      } else {
        query = query.populate(options.populate);
      }
    }

    const entities = await query.exec();

    if (entities.length !== ids.length) {
      throw new NotFoundException({
        code: `${entityName.toUpperCase()}_NOT_FOUND`,
        message: `Some ${entityName}s not found`,
        userMessage: `بعض ${this.getArabicEntityName(entityName)} غير موجودة`,
        details: {
          requested: ids.length,
          found: entities.length,
        },
      });
    }

    return entities;
  }

  /**
   * التحقق من وجود entity
   */
  static async exists<T>(model: Model<T>, query: any): Promise<boolean> {
    const count = await model.countDocuments(query);
    return count > 0;
  }

  /**
   * الحصول على الاسم العربي للـ entity
   */
  private static getArabicEntityName(entityName: string): string {
    const names: Record<string, string> = {
      User: 'المستخدم',
      Order: 'الطلب',
      Driver: 'السائق',
      Vendor: 'التاجر',
      Store: 'المتجر',
      Product: 'المنتج',
      Banner: 'البانر',
      Commission: 'العمولة',
      Coupon: 'الكوبون',
      Promotion: 'العرض',
      Transaction: 'المعاملة',
    };
    return names[entityName] || entityName;
  }
}
