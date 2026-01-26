import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery, UpdateQuery } from 'mongoose';
import { Marketer } from './entities/marketer.entity';
import { Onboarding } from './entities/onboarding.entity';
import { ReferralEvent } from './entities/referral-event.entity';
import { CommissionPlan } from './entities/commission-plan.entity';

@Injectable()
export class MarketerService {
  constructor(
    @InjectModel(Marketer.name) private marketerModel: Model<Marketer>,
    @InjectModel(Onboarding.name) private onboardingModel: Model<Onboarding>,
    @InjectModel(ReferralEvent.name)
    private referralEventModel: Model<ReferralEvent>,
    @InjectModel(CommissionPlan.name)
    private commissionPlanModel: Model<CommissionPlan>,
  ) {}

  // ==================== Marketers ====================

  async create(marketerData: any) {
    const marketer = await this.marketerModel.create(marketerData);
    return marketer;
  }

  async getAll() {
    const marketers = await this.marketerModel.find().sort({ createdAt: -1 });
    return { data: marketers, total: marketers.length };
  }

  async getById(marketerId: string) {
    const marketer = await this.marketerModel.findById(marketerId);
    if (!marketer) {
      throw new NotFoundException({
        code: 'MARKETER_NOT_FOUND',
        userMessage: 'المسوق غير موجود',
      });
    }
    return marketer;
  }

  async update(marketerId: string, updates: UpdateQuery<Marketer>) {
    const marketer = await this.marketerModel.findByIdAndUpdate(
      marketerId,
      updates,
      { new: true },
    );

    if (!marketer) {
      throw new NotFoundException({
        code: 'MARKETER_NOT_FOUND',
        userMessage: 'المسوق غير موجود',
      });
    }
    return marketer;
  }

  // ==================== Performance ====================

  async getPerformance(
    marketerId: string,
    startDate?: string,
    endDate?: string,
  ) {
    try {
      const matchQuery: FilterQuery<Onboarding> = {
        marketer: new Types.ObjectId(marketerId) as any,
      };

      if (startDate || endDate) {
        const dateFilter: any = {};
        if (startDate) dateFilter.$gte = new Date(startDate);
        if (endDate) dateFilter.$lte = new Date(endDate);
        matchQuery.createdAt = dateFilter as any;
      }

      // عدد الـ onboardings
      const onboardingsCount = await this.onboardingModel.countDocuments(
        matchQuery,
      );

      // عدد المتاجر النشطة
      const activeStores = await this.onboardingModel.countDocuments({
        ...matchQuery,
        status: 'approved',
        type: 'store',
      } as FilterQuery<Onboarding>);

      // حساب الإيرادات (من Orders للمتاجر التابعة)
      const approvedStores = await this.onboardingModel
        .find({
          marketer: new Types.ObjectId(marketerId),
          status: 'approved',
          type: 'store',
          createdEntityId: { $exists: true },
        })
        .select('createdEntityId');

      const storeIds = approvedStores.map((s) => s.createdEntityId);

      let revenue = 0;
      if (storeIds.length > 0) {
        const orderStats = await this.marketerModel.db
          .collection('deliveryorders')
          .aggregate([
            {
              $match: {
                store: { $in: storeIds },
                status: 'delivered',
              },
            },
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: '$totalPrice' },
              },
            },
          ])
          .toArray();

        revenue = orderStats[0]?.totalRevenue || 0;
      }

      // حساب العمولات
      const commissionsData = await this.getCommissions(marketerId);

      return {
        onboardings: onboardingsCount,
        activeStores,
        revenue,
        commissions: commissionsData.totalAmount,
      };
    } catch (error) {
      console.error('Error getting performance:', error);
      return { onboardings: 0, activeStores: 0, revenue: 0, commissions: 0 };
    }
  }

  // ==================== Stores ====================

  async getMyStores(marketerId: string) {
    const onboardings = await this.onboardingModel
      .find({
        marketer: new Types.ObjectId(marketerId),
        type: 'store',
        status: 'approved',
      })
      .select('storeName createdEntityId');

    // TODO: Populate actual store data
    return { data: onboardings, total: onboardings.length };
  }

  async getStoreDetails(storeId: string): Promise<{ store: any }> {
    try {
      // البحث في deliverystores collection
      const store = await this.marketerModel.db
        .collection('deliverystores')
        .findOne({ _id: new Types.ObjectId(storeId) });

      if (!store) {
        throw new NotFoundException({
          code: 'STORE_NOT_FOUND',
          userMessage: 'المتجر غير موجود',
        });
      }

      return { store };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new NotFoundException({
        code: 'STORE_NOT_FOUND',
        userMessage: 'المتجر غير موجود',
      });
    }
  }

  // ==================== Vendors ====================

  async getMyVendors(marketerId: string) {
    const onboardings = await this.onboardingModel
      .find({
        marketer: new Types.ObjectId(marketerId),
        type: 'vendor',
        status: 'approved',
      })
      .select('storeName createdEntityId');

    return { data: onboardings, total: onboardings.length };
  }

  async getVendorDetails(vendorId: string): Promise<{ vendor: any }> {
    try {
      const vendor = await this.marketerModel.db
        .collection('vendors')
        .findOne({ _id: new Types.ObjectId(vendorId) });

      if (!vendor) {
        throw new NotFoundException({
          code: 'VENDOR_NOT_FOUND',
          userMessage: 'التاجر غير موجود',
        });
      }

      return { vendor };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new NotFoundException({
        code: 'VENDOR_NOT_FOUND',
        userMessage: 'التاجر غير موجود',
      });
    }
  }

  // ==================== Commissions ====================

  async getCommissions(marketerId: string) {
    try {
      // البحث في جميع الـ onboardings المعتمدة للمسوق
      const approvedOnboardings = await this.onboardingModel
        .find({
          marketer: new Types.ObjectId(marketerId),
          status: 'approved',
        })
        .sort({ approvedAt: -1 });

      // حساب العمولات بناءً على نوع الكيان
      const commissions = approvedOnboardings.map((onb) => {
        let amount = 0;
        let status = 'pending';

        // عمولة ثابتة حسب النوع
        switch (onb.type) {
          case 'store':
            amount = 5000; // 5000 ريال لكل متجر
            break;
          case 'vendor':
            amount = 3000; // 3000 ريال لكل تاجر
            break;
          case 'driver':
            amount = 1000; // 1000 ريال لكل سائق
            break;
        }

        // إذا مر أكثر من 7 أيام على الاعتماد، تصبح مدفوعة
        if (onb.approvedAt) {
          const daysSinceApproval =
            (Date.now() - new Date(onb.approvedAt).getTime()) /
            (1000 * 60 * 60 * 24);
          if (daysSinceApproval > 7) {
            status = 'paid';
          }
        }

        return {
          _id: String(onb._id),
          onboardingId: onb._id,
          type: onb.type,
          storeName: onb.storeName,
          amount,
          status,
          createdAt: (onb as any).createdAt,
          approvedAt: onb.approvedAt,
          paidAt: status === 'paid' ? onb.approvedAt : undefined,
        };
      });

      const totalAmount = commissions.reduce((sum, c) => sum + c.amount, 0);

      return { data: commissions, total: commissions.length, totalAmount };
    } catch (error) {
      console.error('Error getting commissions:', error);
      return { data: [], total: 0, totalAmount: 0 };
    }
  }

  async getCommissionDetails(commissionId: string) {
    const onboarding = await this.onboardingModel
      .findById(commissionId)
      .populate('marketer');

    if (!onboarding) {
      throw new NotFoundException({
        code: 'COMMISSION_NOT_FOUND',
        userMessage: 'العمولة غير موجودة',
      });
    }

    let amount = 0;
    switch (onboarding.type) {
      case 'store':
        amount = 5000;
        break;
      case 'vendor':
        amount = 3000;
        break;
      case 'driver':
        amount = 1000;
        break;
    }

    return {
      commission: {
        _id: onboarding._id,
        type: onboarding.type,
        storeName: onboarding.storeName,
        amount,
        status: onboarding.status,
        createdAt: (onboarding as any).createdAt,
        approvedAt: onboarding.approvedAt,
      },
    };
  }

  // ==================== Admin Operations ====================

  async activate(marketerId: string, adminId: string) {
    const marketer = await this.marketerModel.findByIdAndUpdate(
      marketerId,
      {
        isActive: true,
        activatedBy: new Types.ObjectId(adminId),
        activatedAt: new Date(),
      },
      { new: true },
    );

    if (!marketer) {
      throw new NotFoundException({
        code: 'MARKETER_NOT_FOUND',
        userMessage: 'المسوق غير موجود',
      });
    }

    return { success: true, message: 'تم تفعيل المسوق', marketer };
  }

  async deactivate(marketerId: string, adminId: string) {
    const marketer = await this.marketerModel.findByIdAndUpdate(
      marketerId,
      {
        isActive: false,
        deactivatedBy: new Types.ObjectId(adminId),
        deactivatedAt: new Date(),
      },
      { new: true },
    );

    if (!marketer) {
      throw new NotFoundException({
        code: 'MARKETER_NOT_FOUND',
        userMessage: 'المسوق غير موجود',
      });
    }

    return { success: true, message: 'تم إلغاء تفعيل المسوق', marketer };
  }

  async adjustCommission(
    marketerId: string,
    adjustmentData: any,
    adminId: string,
  ) {
    // TODO: Implement commission adjustment
    void marketerId;
    void adjustmentData;
    void adminId;
    await Promise.resolve();
    return { success: true, message: 'تم تعديل العمولة' };
  }

  // ==================== Statistics ====================

  async getStatistics() {
    const [total, active, pending] = await Promise.all([
      this.marketerModel.countDocuments(),
      this.marketerModel.countDocuments({ isActive: true }),
      this.onboardingModel.countDocuments({ status: 'pending' }),
    ]);

    return { total, active, pending };
  }

  // ==================== Onboarding ====================

  async getApplications(marketerId?: string) {
    const query: FilterQuery<Onboarding> = {};
    if (marketerId) query.marketer = new Types.ObjectId(marketerId);
    void marketerId;
    await Promise.resolve();

    const applications = await this.onboardingModel
      .find(query)
      .sort({ createdAt: -1 });
    return { data: applications, total: applications.length };
  }

  async getApplicationDetails(applicationId: string) {
    const application = await this.onboardingModel
      .findById(applicationId)
      .populate('marketer');
    if (!application) {
      throw new NotFoundException({
        code: 'APPLICATION_NOT_FOUND',
        userMessage: 'الطلب غير موجود',
      });
    }
    return application;
  }

  async approveApplication(applicationId: string, adminId: string) {
    const application = await this.onboardingModel.findByIdAndUpdate(
      applicationId,
      {
        status: 'approved',
        approvedBy: new Types.ObjectId(adminId),
        approvedAt: new Date(),
      },
      { new: true },
    );

    if (!application) {
      throw new NotFoundException({
        code: 'APPLICATION_NOT_FOUND',
        userMessage: 'الطلب غير موجود',
      });
    }

    // TODO: Create actual store/vendor entity
    return { success: true, message: 'تم قبول الطلب', application };
  }

  async rejectApplication(
    applicationId: string,
    reason: string,
    adminId: string,
  ) {
    const application = await this.onboardingModel.findByIdAndUpdate(
      applicationId,
      {
        status: 'rejected',
        rejectedBy: new Types.ObjectId(adminId),
        rejectedAt: new Date(),
        rejectionReason: reason,
      },
      { new: true },
    );

    if (!application) {
      throw new NotFoundException({
        code: 'APPLICATION_NOT_FOUND',
        userMessage: 'الطلب غير موجود',
      });
    }

    return { success: true, message: 'تم رفض الطلب', application };
  }

  async getOnboardingStatistics() {
    const stats = await this.onboardingModel.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    return { byStatus: stats, byType: [] };
  }

  // ==================== Files ====================

  async uploadFile(
    marketerId: string,
    fileData: { fileUrl: string; type: string; relatedTo?: string },
  ) {
    try {
      const file = {
        _id: new Types.ObjectId(),
        marketerId: new Types.ObjectId(marketerId),
        fileUrl: fileData.fileUrl,
        type: fileData.type,
        relatedTo: fileData.relatedTo,
        uploadedAt: new Date(),
      };

      await this.marketerModel.db.collection('marketerfiles').insertOne(file);

      return {
        success: true,
        fileId: file._id.toString(),
        message: 'تم رفع الملف بنجاح',
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      return {
        success: false,
        message: 'فشل في رفع الملف',
      };
    }
  }

  async getFiles(marketerId: string): Promise<{ data: any[] }> {
    try {
      const files = await this.marketerModel.db
        .collection('marketerfiles')
        .find({ marketerId: new Types.ObjectId(marketerId) })
        .sort({ uploadedAt: -1 })
        .toArray();

      return { data: files };
    } catch (error) {
      console.error('Error getting files:', error);
      return { data: [] };
    }
  }

  // ==================== Notifications ====================

  async getNotifications(marketerId: string): Promise<{ data: any[] }> {
    try {
      const notifications = await this.marketerModel.db
        .collection('notifications')
        .find({
          recipient: new Types.ObjectId(marketerId),
          recipientType: 'marketer',
        })
        .sort({ createdAt: -1 })
        .limit(50)
        .toArray();

      return { data: notifications };
    } catch (error) {
      console.error('Error getting notifications:', error);
      return { data: [] };
    }
  }

  // ==================== Export ====================

  async exportMarketers(format: string) {
    // TODO: Export to CSV/Excel
    void format;
    await Promise.resolve();
    return { success: true, url: '' };
  }

  // ==================== Additional Methods ====================

  async getMarketerEarnings(
    marketerId: string,
    startDate?: string,
    endDate?: string,
  ) {
    try {
      const matchQuery: FilterQuery<Onboarding> = {
        marketer: new Types.ObjectId(marketerId) as any,
        status: 'approved',
      };

      if (startDate || endDate) {
        const dateFilter: any = {};
        if (startDate) dateFilter.$gte = new Date(startDate);
        if (endDate) dateFilter.$lte = new Date(endDate);
        matchQuery.approvedAt = dateFilter as any;
      }

      const onboardings = await this.onboardingModel.find(matchQuery);

      let totalCommissions = 0;
      const breakdown: any[] = [];

      onboardings.forEach((onb) => {
        let amount = 0;
        switch (onb.type) {
          case 'store':
            amount = 5000;
            break;
          case 'vendor':
            amount = 3000;
            break;
          case 'driver':
            amount = 1000;
            break;
        }

        totalCommissions += amount;

        breakdown.push({
          type: onb.type,
          storeName: onb.storeName,
          amount,
          date: onb.approvedAt,
        });
      });

      // الحصول على المكافآت من marketer.totalEarnings
      const marketer = await this.marketerModel.findById(marketerId);
      const bonuses = (marketer?.totalEarnings || 0) - totalCommissions;

      return {
        totalEarnings: marketer?.totalEarnings || 0,
        totalCommissions,
        bonuses: bonuses > 0 ? bonuses : 0,
        breakdown,
        ordersCount: onboardings.length,
        averagePerOrder: onboardings.length > 0 ? totalCommissions / onboardings.length : 0,
      };
    } catch (error) {
      console.error('Error getting marketer earnings:', error);
      return {
        totalEarnings: 0,
        totalCommissions: 0,
        bonuses: 0,
        breakdown: [],
        ordersCount: 0,
        averagePerOrder: 0,
      };
    }
  }

  async addBonus(
    marketerId: string,
    amount: number,
    reason: string,
    adminId: string,
  ) {
    // TODO: Add bonus to marketer wallet
    void marketerId;
    void amount;
    void reason;
    void adminId;
    await Promise.resolve();
    return { success: true, message: 'تم إضافة المكافأة', amount, reason };
  }

  async getMarketerReferrals(marketerId: string) {
    const referrals = await this.referralEventModel
      .find({ marketer: new Types.ObjectId(marketerId) })
      .sort({ createdAt: -1 })
      .limit(100);

    void marketerId;
    await Promise.resolve();
    return { data: referrals, total: referrals.length };
  }

  async getLeaderboard(period: string) {
    // TODO: Aggregate top marketers by period
    void period;
    await Promise.resolve();
    return { data: [], period };
  }

  async getProfile(marketerId: string) {
    return this.getById(marketerId);
  }

  async updateProfile(marketerId: string, updates: UpdateQuery<Marketer>) {
    void marketerId;
    void updates;
    await Promise.resolve();
    return this.update(marketerId, updates);
  }

  async createOnboarding(marketerId: string, onboardingData: any) {
    const onboarding = await this.onboardingModel.create({
      ...onboardingData,
      marketer: new Types.ObjectId(marketerId),
      status: 'pending',
    });
    void marketerId;
    void onboardingData;
    await Promise.resolve();
    return onboarding;
  }

  async getMyOnboardings(marketerId: string, status?: string) {
    const query: FilterQuery<Onboarding> = {
      marketer: new Types.ObjectId(marketerId),
    };
    if (status) query.status = status;

    const onboardings = await this.onboardingModel
      .find(query)
      .sort({ createdAt: -1 });
    void marketerId;
    void status;
    await Promise.resolve();
    return { data: onboardings, total: onboardings.length };
  }

  async getOnboardingDetails(onboardingId: string) {
    return this.getApplicationDetails(onboardingId);
  }

  async quickOnboard(marketerId: string, data: any) {
    return this.createOnboarding(marketerId, { ...data, quickOnboard: true });
  }

  async generateReferralCode(marketerId: string) {
    const code = 'REF' + Math.random().toString(36).substr(2, 8).toUpperCase();
    await this.marketerModel.findByIdAndUpdate(marketerId, {
      referralCode: code,
    });
    return { code };
  }

  async getMyReferrals(marketerId: string) {
    return this.getMarketerReferrals(marketerId);
  }

  async getReferralStatistics(marketerId: string) {
    try {
      const referrals = await this.referralEventModel.find({
        referrer: new Types.ObjectId(marketerId),
      });

      const total = referrals.length;
      const successful = referrals.filter(
        (r) => r.eventType === 'completed',
      ).length;
      const pending = referrals.filter(
        (r) => r.eventType === 'registered',
      ).length;

      return {
        total,
        successful,
        pending,
        firstOrderCount: referrals.filter(
          (r) => r.eventType === 'first_order',
        ).length,
      };
    } catch (error) {
      console.error('Error getting referral statistics:', error);
      return { total: 0, successful: 0, pending: 0, firstOrderCount: 0 };
    }
  }

  async getStorePerformance(
    storeId: string,
    startDate?: string,
    endDate?: string,
  ) {
    try {
      const matchQuery: any = { store: new Types.ObjectId(storeId) };

      if (startDate || endDate) {
        const dateFilter: any = {};
        if (startDate) dateFilter.$gte = new Date(startDate);
        if (endDate) dateFilter.$lte = new Date(endDate);
        matchQuery.createdAt = dateFilter;
      }

      // Aggregate من deliveryorders
      const stats = await this.marketerModel.db
        .collection('deliveryorders')
        .aggregate([
          { $match: matchQuery },
          {
            $group: {
              _id: null,
              totalOrders: { $sum: 1 },
              totalRevenue: { $sum: '$totalPrice' },
              avgRating: { $avg: '$rating' },
            },
          },
        ])
        .toArray();

      const result: any = stats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        avgRating: 0,
      };

      return {
        orders: Number(result.totalOrders) || 0,
        revenue: Number(result.totalRevenue) || 0,
        rating: Number(result.avgRating) || 0,
      };
    } catch (error) {
      console.error('Error getting store performance:', error);
      return { orders: 0, revenue: 0, rating: 0 };
    }
  }

  async getMyCommissions(marketerId: string, status?: string) {
    const result = await this.getCommissions(marketerId);

    if (status) {
      const filteredData = result.data.filter(
        (c: any) => c.status === status,
      );
      result.data = filteredData;
      result.total = filteredData.length;
      result.totalAmount = filteredData.reduce(
        (sum: number, c: any) => sum + (c.amount || 0),
        0,
      );
    }

    return result;
  }

  async getCommissionStatistics(marketerId: string) {
    const allCommissions = await this.getCommissions(marketerId);
    const commissions = allCommissions.data as any[];

    const total = commissions.reduce(
      (sum, c) => sum + (c.amount || 0),
      0,
    );
    const pending = commissions
      .filter((c) => c.status === 'pending')
      .reduce((sum, c) => sum + (c.amount || 0), 0);
    const paid = commissions
      .filter((c) => c.status === 'paid')
      .reduce((sum, c) => sum + (c.amount || 0), 0);

    return {
      total,
      pending,
      paid,
      totalCount: commissions.length,
      pendingCount: commissions.filter((c) => c.status === 'pending').length,
      paidCount: commissions.filter((c) => c.status === 'paid').length,
    };
  }

  async getPendingCommissions(marketerId: string) {
    return this.getMyCommissions(marketerId, 'pending');
  }

  async getOverview(marketerId: string) {
    try {
      const [marketer, onboardings, referrals, commissionsData] =
        await Promise.all([
          this.getById(marketerId),
          this.onboardingModel.countDocuments({
            marketer: new Types.ObjectId(marketerId),
          }),
          this.referralEventModel.countDocuments({
            referrer: new Types.ObjectId(marketerId),
          }),
          this.getCommissions(marketerId),
        ]);

      // إحصائيات الـ onboardings
      const [approved, pending, rejected] = await Promise.all([
        this.onboardingModel.countDocuments({
          marketer: new Types.ObjectId(marketerId),
          status: 'approved',
        }),
        this.onboardingModel.countDocuments({
          marketer: new Types.ObjectId(marketerId),
          status: 'pending',
        }),
        this.onboardingModel.countDocuments({
          marketer: new Types.ObjectId(marketerId),
          status: 'rejected',
        }),
      ]);

      return {
        marketer,
        stats: {
          totalOnboardings: onboardings,
          approvedOnboardings: approved,
          pendingOnboardings: pending,
          rejectedOnboardings: rejected,
          approvalRate: onboardings > 0 ? (approved / onboardings) * 100 : 0,
          totalReferrals: referrals,
          totalEarnings: commissionsData.totalAmount,
          pendingEarnings: commissionsData.data
            .filter((c: any) => c.status === 'pending')
            .reduce((sum: number, c: any) => sum + (c.amount || 0), 0),
          paidEarnings: commissionsData.data
            .filter((c: any) => c.status === 'paid')
            .reduce((sum: number, c: any) => sum + (c.amount || 0), 0),
        },
        items: await this.onboardingModel
          .find({ marketer: new Types.ObjectId(marketerId) })
          .sort({ createdAt: -1 })
          .limit(10)
          .lean(),
      };
    } catch (error) {
      console.error('Error getting overview:', error);
      const marketer = await this.getById(marketerId);
      return {
        marketer,
        stats: {
          totalOnboardings: 0,
          approvedOnboardings: 0,
          pendingOnboardings: 0,
          rejectedOnboardings: 0,
          approvalRate: 0,
          totalReferrals: 0,
          totalEarnings: 0,
          pendingEarnings: 0,
          paidEarnings: 0,
        },
        items: [],
      };
    }
  }

  async getTodayStatistics(marketerId: string) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayOnboardings = await this.onboardingModel.find({
        marketer: new Types.ObjectId(marketerId),
        createdAt: { $gte: today },
      });

      const approvedToday = todayOnboardings.filter(
        (o) => o.status === 'approved',
      );

      let earningsToday = 0;
      approvedToday.forEach((onb) => {
        switch (onb.type) {
          case 'store':
            earningsToday += 5000;
            break;
          case 'vendor':
            earningsToday += 3000;
            break;
          case 'driver':
            earningsToday += 1000;
            break;
        }
      });

      return {
        onboardings: todayOnboardings.length,
        approved: approvedToday.length,
        pending: todayOnboardings.filter((o) => o.status === 'pending').length,
        earnings: earningsToday,
      };
    } catch (error) {
      console.error('Error getting today statistics:', error);
      return { onboardings: 0, approved: 0, pending: 0, earnings: 0 };
    }
  }

  async getMonthStatistics(marketerId: string) {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const monthOnboardings = await this.onboardingModel.find({
        marketer: new Types.ObjectId(marketerId),
        createdAt: { $gte: startOfMonth },
      });

      const approvedMonth = monthOnboardings.filter(
        (o) => o.status === 'approved',
      );

      let earningsMonth = 0;
      approvedMonth.forEach((onb) => {
        switch (onb.type) {
          case 'store':
            earningsMonth += 5000;
            break;
          case 'vendor':
            earningsMonth += 3000;
            break;
          case 'driver':
            earningsMonth += 1000;
            break;
        }
      });

      return {
        onboardings: monthOnboardings.length,
        approved: approvedMonth.length,
        pending: monthOnboardings.filter((o) => o.status === 'pending').length,
        earnings: earningsMonth,
      };
    } catch (error) {
      console.error('Error getting month statistics:', error);
      return { onboardings: 0, approved: 0, pending: 0, earnings: 0 };
    }
  }

  async getEarnings(marketerId: string, startDate?: string, endDate?: string) {
    return this.getMarketerEarnings(marketerId, startDate, endDate);
  }

  async getEarningsBreakdown(marketerId: string) {
    try {
      const onboardings = await this.onboardingModel
        .find({
          marketer: new Types.ObjectId(marketerId),
          status: 'approved',
        })
        .sort({ approvedAt: 1 });

      // Breakdown by type
      const byTypeMap: Record<string, number> = {};
      onboardings.forEach((onb) => {
        let amount = 0;
        switch (onb.type) {
          case 'store':
            amount = 5000;
            break;
          case 'vendor':
            amount = 3000;
            break;
          case 'driver':
            amount = 1000;
            break;
        }
        byTypeMap[onb.type] = (byTypeMap[onb.type] || 0) + amount;
      });

      const byType = Object.entries(byTypeMap).map(([type, amount]) => ({
        type,
        amount,
      }));

      // Breakdown by month
      const byMonthMap: Record<string, number> = {};
      onboardings.forEach((onb) => {
        if (!onb.approvedAt) return;

        const date = new Date(onb.approvedAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        let amount = 0;
        switch (onb.type) {
          case 'store':
            amount = 5000;
            break;
          case 'vendor':
            amount = 3000;
            break;
          case 'driver':
            amount = 1000;
            break;
        }

        byMonthMap[monthKey] = (byMonthMap[monthKey] || 0) + amount;
      });

      const byMonth = Object.entries(byMonthMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, amount]) => ({
          month,
          amount,
        }));

      return { byType, byMonth };
    } catch (error) {
      console.error('Error getting earnings breakdown:', error);
      return { byType: [], byMonth: [] };
    }
  }

  async markNotificationRead(notificationId: string) {
    try {
      await this.marketerModel.db.collection('notifications').updateOne(
        { _id: new Types.ObjectId(notificationId) },
        {
          $set: {
            read: true,
            readAt: new Date(),
          },
        },
      );

      return { success: true, message: 'تم تحديد الإشعار كمقروء' };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return { success: false, message: 'فشل في تحديث الإشعار' };
    }
  }

  async getTerritoryStats(marketerId: string) {
    try {
      const marketer = await this.getById(marketerId);
      const territory = (marketer as Marketer).territory;

      // عدد المتاجر في المنطقة
      const storesCount = await this.onboardingModel.countDocuments({
        marketer: new Types.ObjectId(marketerId),
        type: 'store',
        status: 'approved',
      });

      // حساب الأرباح من المنطقة
      const earnings = storesCount * 5000;

      // عدد الـ vendors
      const vendorsCount = await this.onboardingModel.countDocuments({
        marketer: new Types.ObjectId(marketerId),
        type: 'vendor',
        status: 'approved',
      });

      return {
        territory,
        stores: storesCount,
        vendors: vendorsCount,
        earnings,
        totalOnboardings: storesCount + vendorsCount,
      };
    } catch (error) {
      console.error('Error getting territory stats:', error);
      return {
        territory: undefined,
        stores: 0,
        vendors: 0,
        earnings: 0,
        totalOnboardings: 0,
      };
    }
  }
}
