import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PrivacyPolicy } from './entities/privacy-policy.entity';
import { TermsOfService } from './entities/terms-of-service.entity';
import { UserConsent } from './entities/user-consent.entity';
import { CreatePrivacyPolicyDto } from './dto/create-privacy-policy.dto';
import { CreateTermsOfServiceDto } from './dto/create-terms-of-service.dto';
import { RecordConsentDto } from './dto/record-consent.dto';

@Injectable()
export class LegalService {
  constructor(
    @InjectModel(PrivacyPolicy.name)
    private readonly privacyPolicyModel: Model<PrivacyPolicy>,
    @InjectModel(TermsOfService.name)
    private readonly termsModel: Model<TermsOfService>,
    @InjectModel(UserConsent.name)
    private readonly consentModel: Model<UserConsent>,
  ) {}

  // ========== Privacy Policy ==========

  /**
   * الحصول على سياسة الخصوصية النشطة
   */
  async getActivePrivacyPolicy(lang: string = 'ar') {
    const policy = await this.privacyPolicyModel
      .findOne({ isActive: true })
      .sort({ effectiveDate: -1 })
      .exec();

    if (!policy) {
      throw new NotFoundException('لا توجد سياسة خصوصية نشطة');
    }

    return {
      id: policy._id,
      version: policy.version,
      content: lang === 'en' ? policy.contentEn : policy.content,
      effectiveDate: policy.effectiveDate,
      updatedAt: policy.updatedAt,
    };
  }

  /**
   * إنشاء سياسة خصوصية جديدة
   */
  async createPrivacyPolicy(dto: CreatePrivacyPolicyDto) {
    // تعطيل السياسات القديمة إذا كانت الجديدة نشطة
    if (dto.isActive !== false) {
      await this.privacyPolicyModel.updateMany(
        { isActive: true },
        { isActive: false },
      );
    }

    const policy = new this.privacyPolicyModel(dto);
    return await policy.save();
  }

  /**
   * الحصول على جميع سياسات الخصوصية (للإدارة)
   */
  async getAllPrivacyPolicies() {
    return await this.privacyPolicyModel
      .find()
      .sort({ effectiveDate: -1 })
      .exec();
  }

  /**
   * تفعيل سياسة خصوصية معينة
   */
  async activatePrivacyPolicy(id: string) {
    const policy = await this.privacyPolicyModel.findById(id);
    if (!policy) {
      throw new NotFoundException('سياسة الخصوصية غير موجودة');
    }

    // تعطيل كل السياسات النشطة
    await this.privacyPolicyModel.updateMany(
      { isActive: true },
      { isActive: false },
    );

    // تفعيل السياسة المحددة
    policy.isActive = true;
    return await policy.save();
  }

  // ========== Terms of Service ==========

  /**
   * الحصول على شروط الخدمة النشطة
   */
  async getTermsOfService(lang: string = 'ar') {
    const terms = await this.termsModel
      .findOne({ isActive: true })
      .sort({ effectiveDate: -1 })
      .exec();

    if (!terms) {
      throw new NotFoundException('لا توجد شروط خدمة نشطة');
    }

    return {
      id: terms._id,
      version: terms.version,
      content: lang === 'en' ? terms.contentEn : terms.content,
      effectiveDate: terms.effectiveDate,
      updatedAt: terms.updatedAt,
    };
  }

  /**
   * إنشاء شروط خدمة جديدة
   */
  async createTermsOfService(dto: CreateTermsOfServiceDto) {
    // تعطيل الشروط القديمة إذا كانت الجديدة نشطة
    if (dto.isActive !== false) {
      await this.termsModel.updateMany({ isActive: true }, { isActive: false });
    }

    const terms = new this.termsModel(dto);
    return await terms.save();
  }

  /**
   * الحصول على جميع شروط الخدمة (للإدارة)
   */
  async getAllTermsOfService() {
    return await this.termsModel.find().sort({ effectiveDate: -1 }).exec();
  }

  /**
   * تفعيل شروط خدمة معينة
   */
  async activateTermsOfService(id: string) {
    const terms = await this.termsModel.findById(id);
    if (!terms) {
      throw new NotFoundException('شروط الخدمة غير موجودة');
    }

    // تعطيل كل الشروط النشطة
    await this.termsModel.updateMany({ isActive: true }, { isActive: false });

    // تفعيل الشروط المحددة
    terms.isActive = true;
    return await terms.save();
  }

  // ========== User Consent ==========

  /**
   * تسجيل موافقة المستخدم
   */
  async recordConsent(userId: string, dto: RecordConsentDto) {
    // التحقق من صحة الإصدار
    if (dto.consentType === 'privacy_policy') {
      const policy = await this.privacyPolicyModel.findOne({
        version: dto.version,
        isActive: true,
      });
      if (!policy) {
        throw new BadRequestException('إصدار سياسة الخصوصية غير صحيح');
      }
    } else if (dto.consentType === 'terms_of_service') {
      const terms = await this.termsModel.findOne({
        version: dto.version,
        isActive: true,
      });
      if (!terms) {
        throw new BadRequestException('إصدار شروط الخدمة غير صحيح');
      }
    }

    const consent = new this.consentModel({
      userId,
      ...dto,
    });

    return await consent.save();
  }

  /**
   * الحصول على موافقات المستخدم
   */
  async getUserConsents(userId: string) {
    return await this.consentModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * التحقق من موافقة المستخدم على الإصدار الحالي
   */
  async checkUserConsent(
    userId: string,
    consentType: 'privacy_policy' | 'terms_of_service',
  ) {
    let currentVersion: string;

    if (consentType === 'privacy_policy') {
      const policy = await this.privacyPolicyModel
        .findOne({ isActive: true })
        .sort({ effectiveDate: -1 })
        .exec();
      currentVersion = policy?.version || '';
    } else {
      const terms = await this.termsModel
        .findOne({ isActive: true })
        .sort({ effectiveDate: -1 })
        .exec();
      currentVersion = terms?.version || '';
    }

    if (!currentVersion) {
      return { hasConsent: true, requiresUpdate: false };
    }

    const consent = await this.consentModel
      .findOne({
        userId,
        consentType,
        version: currentVersion,
        accepted: true,
      })
      .sort({ createdAt: -1 })
      .exec();

    return {
      hasConsent: !!consent,
      requiresUpdate: !consent,
      currentVersion,
      consentedVersion: consent?.version,
    };
  }

  /**
   * الحصول على إحصائيات الموافقات (للإدارة)
   */
  async getConsentStatistics() {
    const [privacyConsents, termsConsents, uniqueUsers] = await Promise.all([
      this.consentModel.countDocuments({
        consentType: 'privacy_policy',
        accepted: true,
      }),
      this.consentModel.countDocuments({
        consentType: 'terms_of_service',
        accepted: true,
      }),
      this.consentModel.distinct('userId'),
    ]);

    return {
      privacyPolicyConsents: privacyConsents,
      termsOfServiceConsents: termsConsents,
      uniqueUsers: uniqueUsers.length,
    };
  }
}
