/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Model } from 'mongoose';
import { EntityHelper } from './entity.helper';

/**
 * Helper class لعمليات الـ moderation
 * يوحد منطق الـ ban/suspend/approve عبر المشروع
 */
export class ModerationHelper {
  /**
   * حظر entity (User, Driver, etc.)
   *
   * @example
   * ```typescript
   * return ModerationHelper.ban(
   *   this.driverModel,
   *   driverId,
   *   reason,
   *   adminId,
   *   'Driver'
   * );
   * ```
   */
  static async ban<T>(
    model: Model<T>,
    id: string,
    reason: string,
    adminId: string,
    entityName: string,
  ): Promise<{ success: boolean; message: string }> {
    const entity = await EntityHelper.findByIdOrFail(model, id, entityName);

    Object.assign(entity, {
      isBanned: true,
      banReason: reason,
      bannedBy: adminId,
      bannedAt: new Date(),
      isActive: false,
      isAvailable: false, // للـ drivers
    });

    await (entity as any).save();

    return {
      success: true,
      message: `تم حظر ${this.getArabicName(entityName)} بنجاح`,
    };
  }

  /**
   * إلغاء حظر entity
   */
  static async unban<T>(
    model: Model<T>,
    id: string,
    adminId: string,
    entityName: string,
  ): Promise<{ success: boolean; message: string }> {
    const entity = await EntityHelper.findByIdOrFail(model, id, entityName);

    Object.assign(entity, {
      isBanned: false,
      banReason: undefined,
      unbannedBy: adminId,
      unbannedAt: new Date(),
      isActive: true,
    });

    await (entity as any).save();

    return {
      success: true,
      message: `تم إلغاء حظر ${this.getArabicName(entityName)} بنجاح`,
    };
  }

  /**
   * تعليق entity (Store, Vendor, etc.)
   */
  static async suspend<T>(
    model: Model<T>,
    id: string,
    reason: string,
    adminId: string,
    entityName: string,
  ): Promise<{ success: boolean; message: string }> {
    const entity = await EntityHelper.findByIdOrFail(model, id, entityName);

    Object.assign(entity, {
      status: 'suspended',
      suspensionReason: reason,
      suspendedBy: adminId,
      suspendedAt: new Date(),
      isActive: false,
    });

    await (entity as any).save();

    return {
      success: true,
      message: `تم تعليق ${this.getArabicName(entityName)} بنجاح`,
    };
  }

  /**
   * الموافقة على entity
   */
  static async approve<T>(
    model: Model<T>,
    id: string,
    adminId: string,
    entityName: string,
  ): Promise<{ success: boolean; message: string }> {
    const entity = await EntityHelper.findByIdOrFail(model, id, entityName);

    Object.assign(entity, {
      status: 'approved',
      approvedBy: adminId,
      approvedAt: new Date(),
      isActive: true,
    });

    await (entity as any).save();

    return {
      success: true,
      message: `تم الموافقة على ${this.getArabicName(entityName)} بنجاح`,
    };
  }

  /**
   * رفض entity
   */
  static async reject<T>(
    model: Model<T>,
    id: string,
    reason: string,
    adminId: string,
    entityName: string,
  ): Promise<{ success: boolean; message: string }> {
    const entity = await EntityHelper.findByIdOrFail(model, id, entityName);

    Object.assign(entity, {
      status: 'rejected',
      rejectionReason: reason,
      rejectedBy: adminId,
      rejectedAt: new Date(),
    });

    await (entity as any).save();

    return {
      success: true,
      message: `تم رفض ${this.getArabicName(entityName)} بنجاح`,
    };
  }

  /**
   * إعادة تفعيل entity معلق
   */
  static async reactivate<T>(
    model: Model<T>,
    id: string,
    adminId: string,
    entityName: string,
  ): Promise<{ success: boolean; message: string }> {
    const entity = await EntityHelper.findByIdOrFail(model, id, entityName);

    Object.assign(entity, {
      status: 'active',
      suspensionReason: undefined,
      reactivatedBy: adminId,
      reactivatedAt: new Date(),
      isActive: true,
    });

    await (entity as any).save();

    return {
      success: true,
      message: `تم إعادة تفعيل ${this.getArabicName(entityName)} بنجاح`,
    };
  }

  /**
   * الحصول على الاسم العربي للـ entity
   */
  private static getArabicName(entityName: string): string {
    const names: Record<string, string> = {
      Driver: 'السائق',
      User: 'المستخدم',
      Store: 'المتجر',
      Vendor: 'التاجر',
      Product: 'المنتج',
      Marketer: 'المسوق',
    };
    return names[entityName] || entityName;
  }
}
