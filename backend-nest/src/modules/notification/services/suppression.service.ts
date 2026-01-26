import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  NotificationSuppression,
  SuppressionChannel,
  SuppressionReason,
} from '../entities/suppression.entity';
import {
  CreateSuppressionDto,
  UpdateSuppressionDto,
  SuppressionStatsDto,
} from '../dto/suppression.dto';

@Injectable()
export class SuppressionService {
  private readonly logger = new Logger(SuppressionService.name);

  constructor(
    @InjectModel(NotificationSuppression.name)
    private readonly suppressionModel: Model<NotificationSuppression>,
  ) {}

  /**
   * إنشاء حظر جديد
   */
  async createSuppression(
    userId: string,
    dto: CreateSuppressionDto,
    suppressedBy: 'system' | 'user' | 'admin' = 'user',
    adminId?: string,
  ): Promise<NotificationSuppression> {
    try {
      this.logger.log(
        `Creating suppression for user ${userId}, channels: ${dto.suppressedChannels.join(', ')}`,
      );

      // التحقق من وجود حظر نشط
      const existing = await this.suppressionModel.findOne({
        userId: new Types.ObjectId(userId),
        isActive: true,
      });

      if (existing) {
        // تحديث الحظر الموجود
        existing.suppressedChannels = [
          ...new Set([
            ...existing.suppressedChannels,
            ...dto.suppressedChannels,
          ]),
        ];
        existing.reason = dto.reason;
        existing.details = dto.details || existing.details;
        existing.expiresAt = dto.expiresAt || existing.expiresAt;
        existing.suppressedBy = suppressedBy;

        if (adminId) {
          existing.suppressedByAdmin = new Types.ObjectId(adminId);
        }

        const updated = await existing.save();
        this.logger.log(
          `Updated existing suppression: ${(updated as NotificationSuppression)._id?.toString()}`,
        );
        return updated;
      }

      // إنشاء حظر جديد
      const suppression = new this.suppressionModel({
        userId: new Types.ObjectId(userId),
        suppressedChannels: dto.suppressedChannels,
        reason: dto.reason,
        details: dto.details,
        expiresAt: dto.expiresAt,
        isActive: true,
        suppressedBy,
        suppressedByAdmin: adminId ? new Types.ObjectId(adminId) : undefined,
      });

      const saved = await suppression.save();
      this.logger.log(
        `Suppression created successfully: ${(saved as NotificationSuppression)._id?.toString()}`,
      );
      return saved;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to create suppression: ${message}`, stack);
      throw new BadRequestException('فشل في إنشاء الحظر');
    }
  }

  /**
   * التحقق من حظر قناة محددة لمستخدم
   */
  async isChannelSuppressed(
    userId: string,
    channel: SuppressionChannel,
  ): Promise<boolean> {
    try {
      const now = new Date();

      const suppression = await this.suppressionModel.findOne({
        userId: new Types.ObjectId(userId),
        isActive: true,
        suppressedChannels: channel,
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: null },
          { expiresAt: { $gt: now } },
        ],
      });

      return !!suppression;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to check suppression: ${message}`, stack);
      return false; // في حالة الخطأ، نسمح بالإرسال للأمان
    }
  }

  /**
   * الحصول على جميع القنوات المحظورة لمستخدم
   */
  async getSuppressedChannels(userId: string): Promise<SuppressionChannel[]> {
    try {
      const now = new Date();

      const suppressions = await this.suppressionModel.find({
        userId: new Types.ObjectId(userId),
        isActive: true,
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: null },
          { expiresAt: { $gt: now } },
        ],
      });

      const channels = new Set<SuppressionChannel>();
      suppressions.forEach((s) => {
        s.suppressedChannels.forEach((c) => channels.add(c));
      });

      return Array.from(channels);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to get suppressed channels: ${message}`, stack);
      return [];
    }
  }

  /**
   * الحصول على جميع حظور مستخدم
   */
  async getUserSuppressions(
    userId: string,
  ): Promise<NotificationSuppression[]> {
    try {
      return await this.suppressionModel
        .find({ userId: new Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .exec();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to get user suppressions: ${message}`, stack);
      throw new BadRequestException('فشل في جلب قائمة الحظر');
    }
  }

  /**
   * تحديث حظر
   */
  async updateSuppression(
    suppressionId: string,
    dto: UpdateSuppressionDto,
  ): Promise<NotificationSuppression> {
    try {
      const suppression = await this.suppressionModel.findById(suppressionId);

      if (!suppression) {
        throw new NotFoundException('الحظر غير موجود');
      }

      if (dto.suppressedChannels) {
        suppression.suppressedChannels = dto.suppressedChannels;
      }

      if (dto.isActive !== undefined) {
        suppression.isActive = dto.isActive;
      }

      if (dto.expiresAt !== undefined) {
        suppression.expiresAt = dto.expiresAt;
      }

      if (dto.details) {
        suppression.details = dto.details;
      }

      const updated = await suppression.save();
      this.logger.log(
        `Suppression updated: ${(updated as NotificationSuppression)._id?.toString()}`,
      );
      return updated;
    } catch (error: unknown) {
      if (error instanceof NotFoundException) throw error;
      const message = error instanceof Error ? error.message : 'Unknown error';
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to update suppression: ${message}`, stack);
      throw new BadRequestException('فشل في تحديث الحظر');
    }
  }

  /**
   * إلغاء حظر (soft delete)
   */
  async removeSuppression(suppressionId: string): Promise<void> {
    try {
      const suppression = await this.suppressionModel.findById(suppressionId);

      if (!suppression) {
        throw new NotFoundException('الحظر غير موجود');
      }

      suppression.isActive = false;
      await suppression.save();

      this.logger.log(`Suppression removed: ${suppressionId}`);
    } catch (error: unknown) {
      if (error instanceof NotFoundException) throw error;
      const message = error instanceof Error ? error.message : 'Unknown error';
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to remove suppression: ${message}`, stack);
      throw new BadRequestException('فشل في إلغاء الحظر');
    }
  }

  /**
   * إلغاء حظر قناة محددة لمستخدم
   */
  async removeChannelSuppression(
    userId: string,
    channel: SuppressionChannel,
  ): Promise<void> {
    try {
      const suppressions = await this.suppressionModel.find({
        userId: new Types.ObjectId(userId),
        isActive: true,
        suppressedChannels: channel,
      });

      for (const suppression of suppressions) {
        suppression.suppressedChannels = suppression.suppressedChannels.filter(
          (c) => c !== channel,
        );

        if (suppression.suppressedChannels.length === 0) {
          suppression.isActive = false;
        }

        await suppression.save();
      }

      this.logger.log(
        `Channel ${channel} suppression removed for user ${userId}`,
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to remove channel suppression: ${message}`,
        stack,
      );
      throw new BadRequestException('فشل في إلغاء حظر القناة');
    }
  }

  /**
   * تسجيل فشل في الإرسال
   */
  async recordFailure(
    userId: string,
    channel: SuppressionChannel,
    reason: string,
  ): Promise<void> {
    try {
      const suppression = await this.suppressionModel.findOne({
        userId: new Types.ObjectId(userId),
        isActive: true,
        suppressedChannels: channel,
      });

      if (suppression) {
        suppression.failureCount += 1;
        suppression.lastFailureAt = new Date();
        suppression.details = `${suppression.details || ''}\nFailure: ${reason}`;
        await suppression.save();
      } else {
        // إنشاء حظر تلقائي بعد 5 فشلات
        const recentFailures = this.getRecentFailureCount();

        if (recentFailures >= 5) {
          await this.createSuppression(
            userId,
            {
              suppressedChannels: [channel],
              reason: SuppressionReason.TOO_MANY_FAILURES,
              details: `تم الحظر تلقائياً بعد ${recentFailures} محاولات فاشلة`,
            },
            'system',
          );
        }
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to record failure: ${message}`, stack);
    }
  }

  /**
   * حساب عدد الفشلات الأخيرة
   */
  private getRecentFailureCount(): number {
    // يمكن تنفيذ هذا بطريقة أكثر تعقيداً مع تخزين الفشلات
    // هنا نستخدم طريقة مبسّطة
    // TODO: Implement with userId and channel parameters when needed
    return 0;
  }

  /**
   * تنظيف الحظور المنتهية (Cron Job)
   * يعمل كل يوم في منتصف الليل
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupExpiredSuppressions(): Promise<void> {
    try {
      this.logger.log('Starting cleanup of expired suppressions...');

      const now = new Date();
      const result = await this.suppressionModel.updateMany(
        {
          isActive: true,
          expiresAt: { $lte: now },
        },
        {
          $set: { isActive: false },
        },
      );

      this.logger.log(
        `Cleaned up ${result.modifiedCount} expired suppressions`,
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to cleanup expired suppressions: ${message}`,
        stack,
      );
    }
  }

  /**
   * إحصائيات الحظر
   */
  async getSuppressionStats(): Promise<SuppressionStatsDto> {
    try {
      const total = await this.suppressionModel.countDocuments();
      const active = await this.suppressionModel.countDocuments({
        isActive: true,
      });

      const byReason = await this.suppressionModel.aggregate<{
        _id: string;
        count: number;
      }>([
        { $match: { isActive: true } },
        { $group: { _id: '$reason', count: { $sum: 1 } } },
      ]);

      const byChannel = await this.suppressionModel.aggregate<{
        _id: string;
        count: number;
      }>([
        { $match: { isActive: true } },
        { $unwind: '$suppressedChannels' },
        { $group: { _id: '$suppressedChannels', count: { $sum: 1 } } },
      ]);

      const result: SuppressionStatsDto = {
        total,
        active,
        inactive: total - active,
        byReason: byReason.map((item) => ({
          _id: item._id,
          count: item.count,
        })),
        byChannel: byChannel.map((item) => ({
          _id: item._id,
          count: item.count,
        })),
      };

      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to get suppression stats: ${message}`, stack);
      throw new BadRequestException('فشل في جلب الإحصائيات');
    }
  }
}
