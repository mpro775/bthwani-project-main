import { Model, UpdateQuery, FilterQuery } from 'mongoose';

/**
 * Bulk Operations Utility
 * للعمليات الجماعية الأسرع على قاعدة البيانات
 */
export class BulkOperationsUtil {
  /**
   * تحديث جماعي لعدة مستندات
   * @param model - Mongoose Model
   * @param updates - مصفوفة من {filter, update}
   * @returns نتيجة العملية
   */
  static async bulkUpdate<T>(
    model: Model<T>,
    updates: Array<{
      filter: FilterQuery<T>;
      update: UpdateQuery<T>;
    }>,
  ) {
    if (!updates || updates.length === 0) {
      return { modifiedCount: 0, matchedCount: 0 };
    }

    const bulkOps = updates.map((item) => ({
      updateOne: {
        filter: item.filter,
        update: item.update,
      },
    }));

    const result = await model.bulkWrite(bulkOps);

    return {
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount,
      upsertedCount: result.upsertedCount,
    };
  }

  /**
   * حذف جماعي لعدة مستندات
   * @param model - Mongoose Model
   * @param filters - مصفوفة من الفلاتر
   * @returns نتيجة العملية
   */
  static async bulkDelete<T>(model: Model<T>, filters: Array<FilterQuery<T>>) {
    if (!filters || filters.length === 0) {
      return { deletedCount: 0 };
    }

    const bulkOps = filters.map((filter) => ({
      deleteOne: { filter },
    }));

    const result = await model.bulkWrite(bulkOps);

    return {
      deletedCount: result.deletedCount,
    };
  }

  /**
   * إنشاء جماعي لعدة مستندات
   * @param model - Mongoose Model
   * @param documents - مصفوفة من المستندات
   * @returns المستندات المنشأة
   */
  static async bulkCreate<T>(model: Model<T>, documents: Partial<T>[]) {
    if (!documents || documents.length === 0) {
      return [];
    }

    const result = await model.insertMany(documents, { ordered: false });
    return result;
  }

  /**
   * Upsert جماعي (تحديث أو إنشاء)
   * @param model - Mongoose Model
   * @param operations - مصفوفة من {filter, update}
   * @returns نتيجة العملية
   */
  static async bulkUpsert<T>(
    model: Model<T>,
    operations: Array<{
      filter: FilterQuery<T>;
      update: UpdateQuery<T>;
    }>,
  ) {
    if (!operations || operations.length === 0) {
      return { upsertedCount: 0, modifiedCount: 0 };
    }

    const bulkOps = operations.map((op) => ({
      updateOne: {
        filter: op.filter,
        update: op.update,
        upsert: true,
      },
    }));

    const result = await model.bulkWrite(bulkOps);

    return {
      upsertedCount: result.upsertedCount,
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount,
    };
  }

  /**
   * تحديث جماعي بنفس القيمة لعدة مستندات
   * @param model - Mongoose Model
   * @param ids - مصفوفة من IDs
   * @param update - التحديث المطلوب
   * @returns نتيجة العملية
   */
  static async bulkUpdateByIds<T>(
    model: Model<T>,
    ids: string[],
    update: UpdateQuery<T>,
  ) {
    if (!ids || ids.length === 0) {
      return { modifiedCount: 0 };
    }

    const bulkOps = ids.map((id) => ({
      updateOne: {
        filter: { _id: id } as FilterQuery<T>,
        update,
      },
    }));

    const result = await model.bulkWrite(bulkOps);

    return {
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount,
    };
  }

  /**
   * عملية مخصصة مع chunks للأداء الأفضل
   * @param items - العناصر للمعالجة
   * @param chunkSize - حجم كل مجموعة
   * @param operation - العملية المطلوب تنفيذها
   */
  static async processInChunks<T, R>(
    items: T[],
    chunkSize: number,
    operation: (chunk: T[]) => Promise<R>,
  ): Promise<R[]> {
    const results: R[] = [];

    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);
      const result = await operation(chunk);
      results.push(result);
    }

    return results;
  }
}
