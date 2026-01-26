import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserConsent } from '../entities/user-consent.entity';
import { ConsentDto, ConsentType } from '../dto/consent.dto';

@Injectable()
export class ConsentService {
  private readonly logger = new Logger(ConsentService.name);

  constructor(
    @InjectModel(UserConsent.name)
    private readonly consentModel: Model<UserConsent>,
  ) {}

  /**
   * تسجيل موافقة جديدة
   */
  async recordConsent(
    userId: string,
    consentData: ConsentDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<UserConsent> {
    try {
      this.logger.log(
        `Recording consent for user ${userId}, type: ${consentData.consentType}`,
      );

      const consent = new this.consentModel({
        userId: new Types.ObjectId(userId),
        consentType: consentData.consentType,
        granted: consentData.granted,
        version: consentData.version,
        consentDate: new Date(),
        ipAddress,
        userAgent,
        notes: consentData.notes,
      });

      const savedConsent = await consent.save();

      this.logger.log(`Consent recorded successfully: ${savedConsent._id}`);
      return savedConsent;
    } catch (error) {
      this.logger.error(
        `Failed to record consent: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('فشل في حفظ الموافقة');
    }
  }

  /**
   * تسجيل موافقات متعددة دفعة واحدة
   */
  async recordBulkConsents(
    userId: string,
    consents: ConsentDto[],
    ipAddress?: string,
    userAgent?: string,
  ): Promise<UserConsent[]> {
    try {
      this.logger.log(
        `Recording ${consents.length} consents for user ${userId}`,
      );

      const consentDocuments = consents.map((consent) => ({
        userId: new Types.ObjectId(userId),
        consentType: consent.consentType,
        granted: consent.granted,
        version: consent.version,
        consentDate: new Date(),
        ipAddress,
        userAgent,
        notes: consent.notes,
      }));

      const savedConsents =
        await this.consentModel.insertMany(consentDocuments);

      this.logger.log(`${savedConsents.length} consents recorded successfully`);
      return savedConsents;
    } catch (error) {
      this.logger.error(
        `Failed to record bulk consents: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('فشل في حفظ الموافقات');
    }
  }

  /**
   * التحقق من وجود موافقة نشطة
   */
  async checkConsent(userId: string, type: ConsentType): Promise<boolean> {
    try {
      const consent = await this.consentModel
        .findOne({
          userId: new Types.ObjectId(userId),
          consentType: type,
          granted: true,
          withdrawnAt: null, // لم يتم سحبها
        })
        .sort({ consentDate: -1 }) // أحدث موافقة
        .exec();

      return !!consent;
    } catch (error) {
      this.logger.error(
        `Failed to check consent: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }

  /**
   * التحقق من موافقات متعددة
   */
  async checkMultipleConsents(
    userId: string,
    types: ConsentType[],
  ): Promise<Record<ConsentType, boolean>> {
    try {
      const results: Record<string, boolean> = {};

      for (const type of types) {
        results[type] = await this.checkConsent(userId, type);
      }

      return results as Record<ConsentType, boolean>;
    } catch (error) {
      this.logger.error(
        `Failed to check multiple consents: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * سحب موافقة
   */
  async withdrawConsent(
    userId: string,
    type: ConsentType,
    reason?: string,
  ): Promise<UserConsent> {
    try {
      this.logger.log(`Withdrawing consent for user ${userId}, type: ${type}`);

      // البحث عن آخر موافقة نشطة
      const consent = await this.consentModel
        .findOne({
          userId: new Types.ObjectId(userId),
          consentType: type,
          granted: true,
          withdrawnAt: null,
        })
        .sort({ consentDate: -1 })
        .exec();

      if (!consent) {
        throw new NotFoundException('لم يتم العثور على موافقة نشطة لسحبها');
      }

      // تحديث الموافقة بتاريخ السحب
      consent.withdrawnAt = new Date();
      consent.granted = false;
      if (reason) {
        consent.notes = `${consent.notes || ''}\nتم السحب: ${reason}`;
      }

      const updatedConsent = await consent.save();

      this.logger.log(`Consent withdrawn successfully: ${updatedConsent._id}`);
      return updatedConsent;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(
        `Failed to withdraw consent: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('فشل في سحب الموافقة');
    }
  }

  /**
   * الحصول على سجل الموافقات لمستخدم
   */
  async getConsentHistory(
    userId: string,
    consentType?: ConsentType,
  ): Promise<UserConsent[]> {
    try {
      const query: any = { userId: new Types.ObjectId(userId) };

      if (consentType) {
        query.consentType = consentType;
      }

      const consents = await this.consentModel
        .find(query)
        .sort({ consentDate: -1 })
        .exec();

      return consents;
    } catch (error) {
      this.logger.error(
        `Failed to get consent history: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('فشل في جلب سجل الموافقات');
    }
  }

  /**
   * الحصول على آخر موافقة لنوع معين
   */
  async getLatestConsent(
    userId: string,
    type: ConsentType,
  ): Promise<UserConsent | null> {
    try {
      const consent = await this.consentModel
        .findOne({
          userId: new Types.ObjectId(userId),
          consentType: type,
        })
        .sort({ consentDate: -1 })
        .exec();

      return consent;
    } catch (error) {
      this.logger.error(
        `Failed to get latest consent: ${error.message}`,
        error.stack,
      );
      return null;
    }
  }

  /**
   * الحصول على ملخص موافقات المستخدم
   */
  async getConsentSummary(userId: string): Promise<any> {
    try {
      const allTypes = Object.values(ConsentType);
      const summary: any = {};

      for (const type of allTypes) {
        const hasConsent = await this.checkConsent(userId, type);
        const latestConsent = await this.getLatestConsent(userId, type);

        summary[type] = {
          hasActiveConsent: hasConsent,
          latestConsent: latestConsent
            ? {
                granted: latestConsent.granted,
                version: latestConsent.version,
                date: latestConsent.consentDate,
                withdrawnAt: latestConsent.withdrawnAt,
              }
            : null,
        };
      }

      return summary;
    } catch (error) {
      this.logger.error(
        `Failed to get consent summary: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('فشل في جلب ملخص الموافقات');
    }
  }

  /**
   * حذف جميع موافقات مستخدم (للامتثال لـ GDPR - حق النسيان)
   */
  async deleteAllUserConsents(userId: string): Promise<void> {
    try {
      this.logger.log(`Deleting all consents for user ${userId}`);

      await this.consentModel.deleteMany({
        userId: new Types.ObjectId(userId),
      });

      this.logger.log(`All consents deleted for user ${userId}`);
    } catch (error) {
      this.logger.error(
        `Failed to delete user consents: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('فشل في حذف موافقات المستخدم');
    }
  }

  /**
   * التحقق من الحاجة لتحديث الموافقة (عند تغيير نسخة السياسة)
   */
  async needsConsentUpdate(
    userId: string,
    type: ConsentType,
    currentVersion: string,
  ): Promise<boolean> {
    try {
      const latestConsent = await this.getLatestConsent(userId, type);

      if (
        !latestConsent ||
        !latestConsent.granted ||
        latestConsent.withdrawnAt
      ) {
        return true; // لا توجد موافقة نشطة
      }

      // التحقق من النسخة
      return latestConsent.version !== currentVersion;
    } catch (error) {
      this.logger.error(
        `Failed to check consent update need: ${error.message}`,
        error.stack,
      );
      return true; // في حالة الخطأ، نطلب الموافقة للأمان
    }
  }
}
