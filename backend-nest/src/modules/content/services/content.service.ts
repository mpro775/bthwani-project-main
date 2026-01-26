import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Banner } from '../entities/banner.entity';
import { StoreSection } from '../entities/store-section.entity';
import {
  SubscriptionPlan,
  UserSubscription,
} from '../entities/subscription.entity';
import { CreateBannerDto, UpdateBannerDto } from '../dto/create-banner.dto';
import {
  CreateStoreSectionDto,
  UpdateStoreSectionDto,
} from '../dto/create-section.dto';
import {
  CreateSubscriptionPlanDto,
  SubscribeDto,
} from '../dto/create-subscription.dto';

@Injectable()
export class ContentService {
  constructor(
    @InjectModel(Banner.name)
    private bannerModel: Model<Banner>,
    @InjectModel(StoreSection.name)
    private storeSectionModel: Model<StoreSection>,
    @InjectModel(SubscriptionPlan.name)
    private subscriptionPlanModel: Model<SubscriptionPlan>,
    @InjectModel(UserSubscription.name)
    private userSubscriptionModel: Model<UserSubscription>,
  ) {}

  // ==================== Banner Management ====================

  async createBanner(dto: CreateBannerDto, createdBy: string): Promise<Banner> {
    const banner = new this.bannerModel({
      ...dto,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      createdBy,
      clicksCount: 0,
      viewsCount: 0,
    });

    return banner.save();
  }

  async findActiveBanners(placement?: string): Promise<any[]> {
    const now = new Date();
    const query: {
      isActive: boolean;
      placement?: string;
      $or?: any[];
      $and?: any[];
    } = { isActive: true };
    if (placement) query.placement = placement;

    // التحقق من التواريخ
    query.$or = [
      { startDate: { $exists: false } },
      { startDate: { $lte: now } },
    ];
    query.$and = [
      { $or: [{ endDate: { $exists: false } }, { endDate: { $gte: now } }] },
    ];

    const banners = await this.bannerModel
      .find(query)
      .sort({ order: 1 })
      .populate('store category')
      .lean()
      .exec();

    // زيادة عداد المشاهدات
    await this.bannerModel.updateMany(
      { _id: { $in: banners.map((b) => b._id) } },
      { $inc: { viewsCount: 1 } },
    );

    return banners;
  }

  async recordBannerClick(id: string): Promise<void> {
    await this.bannerModel.findByIdAndUpdate(id, { $inc: { clicksCount: 1 } });
  }

  async updateBanner(id: string, dto: UpdateBannerDto): Promise<Banner> {
    const banner = await this.bannerModel.findById(id);
    if (!banner) {
      throw new NotFoundException('البانر غير موجود');
    }

    Object.assign(banner, dto);
    if (dto.endDate) banner.endDate = new Date(dto.endDate);

    return banner.save();
  }

  async deleteBanner(id: string): Promise<void> {
    const result = await this.bannerModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('البانر غير موجود');
    }
  }

  async findAllBanners(): Promise<any[]> {
    return this.bannerModel
      .find()
      .sort({ order: 1 })
      .populate('store category')
      .lean()
      .exec();
  }

  // ==================== Store Section Management ====================

  async createStoreSection(dto: CreateStoreSectionDto): Promise<StoreSection> {
    const section = new this.storeSectionModel({
      ...dto,
      productsCount: 0,
    });

    return section.save();
  }

  async findStoreSections(storeId: string): Promise<any[]> {
    return this.storeSectionModel
      .find({ store: storeId, isActive: true })
      .sort({ order: 1 })
      .lean()
      .exec();
  }

  async updateStoreSection(
    id: string,
    dto: UpdateStoreSectionDto,
  ): Promise<StoreSection> {
    const section = await this.storeSectionModel.findById(id);
    if (!section) {
      throw new NotFoundException('القسم غير موجود');
    }

    Object.assign(section, dto);
    return section.save();
  }

  async deleteStoreSection(id: string): Promise<void> {
    const result = await this.storeSectionModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('القسم غير موجود');
    }
  }

  // ==================== Subscription Management ====================

  async createSubscriptionPlan(
    dto: CreateSubscriptionPlanDto,
  ): Promise<SubscriptionPlan> {
    const existing = await this.subscriptionPlanModel.findOne({
      code: dto.code.toUpperCase(),
    });

    if (existing) {
      throw new BadRequestException('كود الخطة مستخدم بالفعل');
    }

    const plan = new this.subscriptionPlanModel({
      ...dto,
      code: dto.code.toUpperCase(),
      subscribersCount: 0,
    });

    return plan.save();
  }

  async findAllSubscriptionPlans(): Promise<any[]> {
    return this.subscriptionPlanModel
      .find({ isActive: true })
      .sort({ order: 1 })
      .lean()
      .exec();
  }

  async subscribe(
    userId: string,
    dto: SubscribeDto,
  ): Promise<UserSubscription> {
    // البحث عن الخطة
    const plan = await this.subscriptionPlanModel.findOne({
      code: dto.planCode.toUpperCase(),
      isActive: true,
    });

    if (!plan) {
      throw new NotFoundException('الخطة غير موجودة أو غير نشطة');
    }

    // التحقق من عدم وجود اشتراك نشط
    const existingSubscription = await this.userSubscriptionModel.findOne({
      user: userId,
      status: 'active',
    });

    if (existingSubscription) {
      throw new BadRequestException('لديك اشتراك نشط بالفعل');
    }

    // حساب تواريخ الاشتراك
    const startDate = new Date();
    const endDate = new Date();

    if (plan.billingCycle === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (plan.billingCycle === 'quarterly') {
      endDate.setMonth(endDate.getMonth() + 3);
    } else if (plan.billingCycle === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    const subscription = new this.userSubscriptionModel({
      user: userId,
      plan: plan._id,
      status: 'active',
      startDate,
      endDate,
      autoRenew: true,
      nextBillingDate: endDate,
      amountPaid: plan.price,
      paymentMethod: dto.paymentMethod,
    });

    await subscription.save();

    // زيادة عداد المشتركين
    await this.subscriptionPlanModel.findByIdAndUpdate(plan._id, {
      $inc: { subscribersCount: 1 },
    });

    return subscription;
  }

  async getMySubscription(userId: string): Promise<UserSubscription | null> {
    return this.userSubscriptionModel
      .findOne({ user: userId, status: 'active' })
      .populate('plan');
  }

  async cancelSubscription(
    userId: string,
    reason: string,
  ): Promise<UserSubscription> {
    const subscription = await this.userSubscriptionModel.findOne({
      user: userId,
      status: 'active',
    });

    if (!subscription) {
      throw new NotFoundException('لا يوجد اشتراك نشط');
    }

    subscription.status = 'cancelled';
    subscription.autoRenew = false;
    subscription.cancellationReason = reason;
    subscription.cancelledAt = new Date();

    return subscription.save();
  }

  // ==================== CMS Pages Advanced ====================

  async getCMSPages(type?: string) {
    const query: Record<string, any> = { isActive: true };
    if (type) query.type = type;

    return this.bannerModel.find(query).sort({ order: 1 }).lean();
  }

  async getCMSPageBySlug(slug: string) {
    const page = await this.bannerModel.findOne({ slug, isActive: true });
    if (!page) {
      throw new NotFoundException('الصفحة غير موجودة');
    }
    return page;
  }

  async createCMSPage(pageData: any, adminId: string) {
    void adminId;
    void pageData;
    await Promise.resolve();
    // TODO: Implement with CMS Page model
    return {
      success: true,
      message: 'تم إنشاء الصفحة',
      page: pageData as unknown,
    };
  }

  async updateCMSPage(pageId: string, updates: any) {
    void pageId;
    void updates;
    await Promise.resolve();
    // TODO: Implement with CMS Page model
    return { success: true, message: 'تم تحديث الصفحة' };
  }

  // ==================== App Settings ====================

  async getAppSettings() {
    await Promise.resolve();
    // TODO: Get from AppSettings model
    return {
      maintenanceMode: false,
      allowRegistration: true,
      minAppVersion: '1.0.0',
      forceUpdate: false,
      supportWhatsapp: '+966500000000',
      supportEmail: 'support@bthwani.com',
      socialMedia: {
        twitter: '',
        instagram: '',
        facebook: '',
      },
    };
  }

  async updateAppSettings(settings: any, adminId: string) {
    // TODO: Update AppSettings model
    void settings;
    void adminId;
    await Promise.resolve();
    return {
      success: true,
      message: 'تم تحديث الإعدادات',
      settings: settings as unknown,
    };
  }

  // ==================== FAQs ====================

  async getFAQs(category?: string) {
    void category;
    await Promise.resolve();
    // TODO: Implement FAQ model
    return {
      data: [
        {
          question: 'كيف أقوم بإنشاء حساب؟',
          answer: 'يمكنك إنشاء حساب من خلال التطبيق...',
          category: 'عام',
          order: 1,
        },
      ],
    };
  }

  async createFAQ(faqData: any) {
    // TODO: Implement FAQ model
    void faqData;
    await Promise.resolve();
    return {
      success: true,
      message: 'تم إضافة السؤال',
      faq: faqData as unknown,
    };
  }

  async updateFAQ(faqId: string, updates: any) {
    // TODO: Implement FAQ model
    void faqId;
    void updates;
    await Promise.resolve();
    return { success: true, message: 'تم تحديث السؤال' };
  }

  async deleteFAQ(faqId: string) {
    void faqId;
    await Promise.resolve();
    // TODO: Implement FAQ model
    return { success: true, message: 'تم حذف السؤال' };
  }
}
