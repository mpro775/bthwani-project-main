import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Marketer } from '../../marketer/entities/marketer.entity';
import { Store } from '../../store/entities/store.entity';
import { CommissionPlan } from '../../marketer/entities/commission-plan.entity';
import { Onboarding } from '../../marketer/entities/onboarding.entity';
import { OnboardingDocument } from '../interfaces/admin.interfaces';
import * as DTO from '../dto';

@Injectable()
export class MarketerService {
  constructor(
    @InjectModel(Marketer.name)
    private marketerModel: Model<Marketer>,
    @InjectModel(Store.name)
    private storeModel: Model<Store>,
    @InjectModel(CommissionPlan.name)
    private commissionPlanModel: Model<CommissionPlan>,
    @InjectModel(Onboarding.name)
    private onboardingModel: Model<Onboarding>,
  ) {}

  async getAllMarketers(
    query?: DTO.GetAllMarketersQueryDto,
  ): Promise<DTO.GetAllMarketersResponseDto> {
    const matchQuery: Record<string, any> = {};
    if (query?.status) matchQuery.status = query.status;

    const page = query?.page || 1;
    const limit = query?.limit || 20;
    const skip = (page - 1) * limit;

    const [marketers, total] = await Promise.all([
      this.marketerModel
        .find(matchQuery)
        .populate('userId', 'fullName email')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      this.marketerModel.countDocuments(matchQuery),
    ]);

    return {
      data: marketers,
      total,
      page,
      limit,
    };
  }

  async getMarketerDetails(
    marketerId: string,
  ): Promise<DTO.GetMarketerDetailsResponseDto> {
    const marketer = await this.marketerModel
      .findById(marketerId)
      .populate('userId', 'fullName email phone');

    if (!marketer) {
      throw new NotFoundException({
        code: 'MARKETER_NOT_FOUND',
        userMessage: 'المسوق غير موجود',
      });
    }

    // Get stores onboarded by this marketer
    const stores = await this.storeModel
      .find({ 'metadata.referredBy': marketerId })
      .select('name status isActive');

    // Get performance stats
    const stats = {
      totalStores: stores.length,
      activeStores: stores.filter((s) => s.isActive).length,
      totalEarnings: marketer.totalEarnings || 0,
      commissionRate: marketer.commissionRate || 0,
    };

    return {
      marketer,
      stats,
    };
  }

  async createMarketer(
    data: DTO.CreateMarketerDto,
    _adminId: string,
  ): Promise<DTO.CreateMarketerResponseDto> {
    // Check if marketer with same phone exists
    const existing = await this.marketerModel.findOne({ phone: data.phone });
    if (existing) {
      throw new BadRequestException({
        code: 'MARKETER_EXISTS',
        userMessage: 'مسوق بنفس رقم الهاتف موجود بالفعل',
      });
    }

    const marketer = new this.marketerModel({
      fullName: data.name,
      phone: data.phone,
      email: data.email,
      status: 'active',
      isActive: true,
      commissionRate: 0.05, // Default 5%
    });

    await marketer.save();

    // TODO: Create user account
    // TODO: Send welcome notification

    return {
      success: true,
      message: 'تم إضافة المسوق',
      marketer: data,
    };
  }

  async updateMarketer(
    data: DTO.UpdateMarketerDto,
  ): Promise<DTO.UpdateMarketerResponseDto> {
    const marketer = await this.marketerModel.findById(data.marketerId);
    if (!marketer) {
      throw new NotFoundException({
        code: 'MARKETER_NOT_FOUND',
        userMessage: 'المسوق غير موجود',
      });
    }

    Object.assign(marketer, data.updates);
    await marketer.save();

    return {
      success: true,
      message: 'تم تحديث المسوق',
    };
  }

  async getMarketerPerformance(
    marketerId: string,
    query?: DTO.GetMarketerPerformanceQueryDto,
  ): Promise<DTO.GetMarketerPerformanceResponseDto> {
    const marketer = await this.marketerModel.findById(marketerId);
    if (!marketer) {
      throw new NotFoundException({
        code: 'MARKETER_NOT_FOUND',
        userMessage: 'المسوق غير موجود',
      });
    }

    // Get stores onboarded
    const storesQuery: {
      'metadata.referredBy': string;
      createdAt?: { $gte?: Date; $lte?: Date };
    } = { 'metadata.referredBy': marketerId };
    if (query?.startDate || query?.endDate) {
      storesQuery.createdAt = {};
      if (query.startDate)
        storesQuery.createdAt.$gte = new Date(query.startDate);
      if (query.endDate) storesQuery.createdAt.$lte = new Date(query.endDate);
    }

    const stores = await this.storeModel.find(storesQuery);

    // Calculate revenue from these stores (would need Order aggregation)
    // For now, returning basic stats
    const storesOnboarded = stores.length;
    const activeStores = stores.filter((s) => s.isActive).length;

    return {
      storesOnboarded,
      totalCommission: marketer.totalEarnings || 0,
      activeStores,
      periodRevenue: 0, // TODO: Calculate from orders
    };
  }

  async getMarketerStores(
    marketerId: string,
  ): Promise<DTO.GetMarketerStoresResponseDto> {
    const stores = await this.storeModel
      .find({ 'metadata.referredBy': marketerId })
      .populate('owner', 'fullName phone')
      .sort({ createdAt: -1 });

    return {
      data: stores,
      total: stores.length,
    };
  }

  getMarketerCommissions(
    _marketerId: string,
    _status?: string,
  ): Promise<DTO.GetMarketerCommissionsResponseDto> {
    // TODO: Implement Commission tracking
    // For now, return placeholder
    return Promise.resolve({
      data: [],
      total: 0,
      totalAmount: 0,
    });
  }

  async activateMarketer(
    data: DTO.ActivateMarketerDto,
  ): Promise<DTO.ActivateMarketerResponseDto> {
    const marketer = await this.marketerModel.findById(data.marketerId);
    if (!marketer) {
      throw new NotFoundException({
        code: 'MARKETER_NOT_FOUND',
        userMessage: 'المسوق غير موجود',
      });
    }

    marketer.status = 'active';
    marketer.isActive = true;
    marketer.deactivationReason = undefined;
    marketer.deactivatedAt = undefined;

    await marketer.save();

    return {
      success: true,
      message: 'تم تفعيل المسوق',
    };
  }

  async deactivateMarketer(
    data: DTO.DeactivateMarketerDto,
  ): Promise<DTO.DeactivateMarketerResponseDto> {
    const marketer = await this.marketerModel.findById(data.marketerId);
    if (!marketer) {
      throw new NotFoundException({
        code: 'MARKETER_NOT_FOUND',
        userMessage: 'المسوق غير موجود',
      });
    }

    marketer.status = 'inactive';
    marketer.isActive = false;
    marketer.deactivationReason = data.reason;
    marketer.deactivatedAt = new Date();

    await marketer.save();

    return {
      success: true,
      message: 'تم تعطيل المسوق',
    };
  }

  async adjustMarketerCommission(
    data: DTO.AdjustMarketerCommissionDto,
  ): Promise<DTO.AdjustMarketerCommissionResponseDto> {
    const marketer = await this.marketerModel.findById(data.marketerId);
    if (!marketer) {
      throw new NotFoundException({
        code: 'MARKETER_NOT_FOUND',
        userMessage: 'المسوق غير موجود',
      });
    }

    marketer.commissionRate = data.rate;
    await marketer.save();

    // TODO: Log audit trail with reason

    return {
      success: true,
      message: 'تم تعديل معدل العمولة',
      newRate: data.rate,
    };
  }

  async getMarketersStatistics(
    query?: DTO.GetMarketersStatisticsQueryDto,
  ): Promise<DTO.GetMarketersStatisticsResponseDto> {
    const matchQuery: {
      createdAt?: { $gte?: Date; $lte?: Date };
      isActive?: boolean;
    } = {};
    if (query?.startDate || query?.endDate) {
      matchQuery.createdAt = {};
      if (query.startDate)
        matchQuery.createdAt.$gte = new Date(query.startDate);
      if (query.endDate) matchQuery.createdAt.$lte = new Date(query.endDate);
    }

    const [totalMarketers, activeMarketers, totalStores] = await Promise.all([
      this.marketerModel.countDocuments(matchQuery),
      this.marketerModel.countDocuments({ ...matchQuery, isActive: true }),
      this.storeModel.countDocuments({
        'metadata.referredBy': { $exists: true },
      }),
    ]);

    // Calculate total commissions paid
    const commissionStats = await this.marketerModel.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalCommissions: { $sum: '$totalEarnings' },
        },
      },
    ]);

    return {
      totalMarketers,
      activeMarketers,
      totalStoresOnboarded: totalStores,
      totalCommissionsPaid:
        (commissionStats[0]?.totalCommissions as number) || 0,
    };
  }

  async exportMarketers(): Promise<{
    data: Marketer[];
    total: number;
    format: string;
  }> {
    const marketers = await this.marketerModel
      .find()
      .populate('userId', 'fullName email phone')
      .sort({ createdAt: -1 });

    // TODO: Convert to CSV/Excel format
    return {
      data: marketers,
      total: marketers.length,
      format: 'json', // TODO: Support CSV/Excel
    };
  }

  // ==================== Onboarding ====================

  async getOnboardingApplications(
    query?: DTO.GetOnboardingApplicationsQueryDto,
  ): Promise<DTO.GetOnboardingApplicationsResponseDto> {
    const matchQuery: {
      status?: string;
      type?: string;
    } = {};
    if (query?.status) matchQuery.status = query.status;
    if (query?.type) matchQuery.type = query.type;

    const page = query?.page || 1;
    const limit = query?.limit || 20;
    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
      this.onboardingModel
        .find(matchQuery)
        .populate('referredBy', 'fullName phone')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      this.onboardingModel.countDocuments(matchQuery),
    ]);

    return {
      data: applications,
      total,
      page,
      limit,
    };
  }

  async getOnboardingDetails(
    applicationId: string,
  ): Promise<DTO.GetOnboardingDetailsResponseDto> {
    const application = await this.onboardingModel
      .findById(applicationId)
      .populate('referredBy', 'fullName phone email');

    if (!application) {
      throw new NotFoundException({
        code: 'APPLICATION_NOT_FOUND',
        userMessage: 'طلب الانضمام غير موجود',
      });
    }

    return {
      application,
    };
  }

  async approveOnboarding(
    data: DTO.ApproveOnboardingDto,
  ): Promise<DTO.ApproveOnboardingResponseDto> {
    const application = await this.onboardingModel.findById(data.applicationId);
    if (!application) {
      throw new NotFoundException({
        code: 'APPLICATION_NOT_FOUND',
        userMessage: 'طلب الانضمام غير موجود',
      });
    }

    const onboardingDoc = application as unknown as OnboardingDocument;

    if (onboardingDoc.status !== 'pending') {
      throw new BadRequestException({
        code: 'APPLICATION_ALREADY_PROCESSED',
        userMessage: 'تم معالجة الطلب بالفعل',
      });
    }

    // Update application status
    onboardingDoc.status = 'approved';
    onboardingDoc.approvedBy = new Types.ObjectId(data.adminId);
    onboardingDoc.approvedAt = new Date();

    await application.save();

    // TODO: Create Store and Vendor from application data
    // TODO: Update marketer's totalStoresOnboarded
    // TODO: Send credentials to vendor

    return {
      success: true,
      message: 'تم الموافقة على الطلب',
    };
  }

  async rejectOnboarding(
    data: DTO.RejectOnboardingDto,
  ): Promise<DTO.RejectOnboardingResponseDto> {
    const application = await this.onboardingModel.findById(data.applicationId);
    if (!application) {
      throw new NotFoundException({
        code: 'APPLICATION_NOT_FOUND',
        userMessage: 'طلب الانضمام غير موجود',
      });
    }

    const onboardingDoc = application as unknown as OnboardingDocument;
    onboardingDoc.status = 'rejected';
    onboardingDoc.rejectionReason = data.reason;
    onboardingDoc.rejectedBy = new Types.ObjectId(data.adminId);

    await application.save();

    return {
      success: true,
      message: 'تم رفض الطلب',
    };
  }

  async getOnboardingStatistics(): Promise<DTO.GetOnboardingStatisticsResponseDto> {
    const [pending, approved, rejected, total] = await Promise.all([
      this.onboardingModel.countDocuments({ status: 'pending' }),
      this.onboardingModel.countDocuments({ status: 'approved' }),
      this.onboardingModel.countDocuments({ status: 'rejected' }),
      this.onboardingModel.countDocuments(),
    ]);

    return {
      pending,
      approved,
      rejected,
      total,
    };
  }

  // ==================== Commission Plans ====================

  async getCommissionPlans() {
    const plans = await this.commissionPlanModel.find({ isActive: true });
    return { data: plans, total: plans.length };
  }

  async createCommissionPlan(
    planData: {
      name: string;
      type: string;
      rate: number;
      minOrders?: number;
      maxOrders?: number;
    },
    adminId: string,
  ) {
    const plan = new this.commissionPlanModel({
      ...planData,
      createdBy: new Types.ObjectId(adminId),
    });

    await plan.save();

    return {
      success: true,
      message: 'تم إنشاء خطة العمولة',
      plan,
    };
  }

  async updateCommissionPlan(
    planId: string,
    updates: Partial<CommissionPlan>,
    adminId: string,
  ) {
    const plan = await this.commissionPlanModel.findById(planId);
    if (!plan) {
      throw new NotFoundException({
        code: 'PLAN_NOT_FOUND',
        userMessage: 'الخطة غير موجودة',
      });
    }

    Object.assign(plan, updates);
    (plan as unknown as { updatedBy: Types.ObjectId }).updatedBy =
      new Types.ObjectId(adminId);

    await plan.save();

    return {
      success: true,
      message: 'تم تحديث خطة العمولة',
    };
  }
}
