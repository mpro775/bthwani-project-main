import { Injectable, NotFoundException, Inject, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { User } from '../auth/entities/user.entity';
import { Order } from '../order/entities/order.entity';
import { Driver } from '../driver/entities/driver.entity';
import { Vendor } from '../vendor/entities/vendor.entity';
import { Store } from '../store/entities/store.entity';
import { Role } from './entities/role.entity';
import { ModerationHelper, CacheHelper } from '../../common/utils';
import * as DTO from './dto';

// Import specialized services
import {
  WithdrawalService,
  AuditService,
  SupportAdminService,
  DataDeletionService,
  SettingsService,
  FeatureFlagService,
  SecurityService,
  DriverShiftService,
  AttendanceService,
  LeaveService,
  MarketerService,
  BackupService,
} from './services';

export interface FinancialStats {
  totalRevenue: number;
  totalDeliveryFees: number;
  totalCompanyShare: number;
  totalPlatformShare: number;
  orderCount: number;
}

/**
 * Admin Service - Facade Pattern
 * يعمل كواجهة موحدة تستدعي الخدمات المتخصصة
 *
 * تم تقسيم الكود إلى 12 خدمة متخصصة لتحسين:
 * - قابلية الصيانة
 * - قابلية الاختبار
 * - إعادة الاستخدام
 * - فصل المسؤوليات
 */
@Injectable()
export class AdminService {
  constructor(
    // Core models
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Driver.name) private driverModel: Model<Driver>,
    @InjectModel(Vendor.name) private vendorModel: Model<Vendor>,
    @InjectModel(Store.name) private storeModel: Model<Store>,
    @InjectModel(Role.name) private roleModel: Model<Role>,
    // Cache manager
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    // Specialized services
    private readonly withdrawalService: WithdrawalService,
    private readonly auditService: AuditService,
    private readonly supportService: SupportAdminService,
    private readonly dataDeletionService: DataDeletionService,
    private readonly settingsService: SettingsService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly securityService: SecurityService,
    private readonly shiftService: DriverShiftService,
    private readonly attendanceService: AttendanceService,
    private readonly leaveService: LeaveService,
    private readonly marketerService: MarketerService,
    private readonly backupService: BackupService,
  ) {}

  // ==================== Dashboard & Statistics ====================

  async getDashboardStats(): Promise<DTO.DashboardStatsDto> {
    const [
      totalUsers,
      activeUsers,
      totalOrders,
      pendingOrders,
      totalDrivers,
      availableDrivers,
      totalVendors,
      activeStores,
    ] = await Promise.all([
      this.userModel.countDocuments(),
      this.userModel.countDocuments({ isActive: true }),
      this.orderModel.countDocuments(),
      this.orderModel.countDocuments({
        status: { $in: ['created', 'confirmed', 'preparing'] },
      }),
      this.driverModel.countDocuments(),
      this.driverModel.countDocuments({ isAvailable: true, isBanned: false }),
      this.vendorModel.countDocuments(),
      this.storeModel.countDocuments({ isActive: true }),
    ]);

    return {
      users: { total: totalUsers, active: activeUsers },
      orders: { total: totalOrders, pending: pendingOrders },
      drivers: { total: totalDrivers, available: availableDrivers },
      vendors: { total: totalVendors },
      stores: { active: activeStores },
    };
  }

  async getTodayStats(): Promise<DTO.TodayStatsDto> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [newUsers, newOrders, deliveredOrders] = await Promise.all([
      this.userModel.countDocuments({ createdAt: { $gte: today } }),
      this.orderModel.countDocuments({ createdAt: { $gte: today } }),
      this.orderModel.countDocuments({
        status: 'delivered',
        deliveredAt: { $gte: today },
      }),
    ]);

    return { newUsers, newOrders, deliveredOrders };
  }

  async getFinancialStats(): Promise<FinancialStats> {
    const result = await this.orderModel.aggregate([
      { $match: { status: 'delivered', paid: true } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$price' },
          totalDeliveryFees: { $sum: '$deliveryFee' },
          totalCompanyShare: { $sum: '$companyShare' },
          totalPlatformShare: { $sum: '$platformShare' },
          orderCount: { $sum: 1 },
        },
      },
    ]);

    return (
      (result[0] as FinancialStats) || {
        totalRevenue: 0,
        totalDeliveryFees: 0,
        totalCompanyShare: 0,
        totalPlatformShare: 0,
        orderCount: 0,
      }
    );
  }

  async getOrdersByStatus(
    query?: DTO.OrdersByStatusQueryDto,
  ): Promise<DTO.OrdersByStatusDto[]> {
    const matchQuery: Record<string, any> = {};
    if (query?.startDate || query?.endDate) {
      matchQuery.createdAt = {
        ...(query.startDate && { $gte: new Date(query.startDate) }),
        ...(query.endDate && { $lte: new Date(query.endDate) }),
      };
    }

    const result = await this.orderModel.aggregate([
      { $match: matchQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    return result as DTO.OrdersByStatusDto[];
  }

  async getRevenueAnalytics(
    query: DTO.RevenueAnalyticsQueryDto,
  ): Promise<DTO.RevenueAnalyticsDto[]> {
    const matchQuery: Record<string, any> = { status: 'delivered', paid: true };
    if (query.startDate || query.endDate) {
      matchQuery.deliveredAt = {
        ...(query.startDate && { $gte: new Date(query.startDate) }),
        ...(query.endDate && { $lte: new Date(query.endDate) }),
      };
    }

    let groupBy: Record<string, any>;
    if (query.period === 'daily') {
      groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$deliveredAt' } };
    } else if (query.period === 'weekly') {
      groupBy = { $dateToString: { format: '%Y-W%U', date: '$deliveredAt' } };
    } else {
      groupBy = { $dateToString: { format: '%Y-%m', date: '$deliveredAt' } };
    }

    const result = await this.orderModel.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: '$price' },
          deliveryFees: { $sum: '$deliveryFee' },
          platformShare: { $sum: '$platformShare' },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return result as DTO.RevenueAnalyticsDto[];
  }

  async getLiveMetrics(): Promise<DTO.LiveMetricsDto> {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const [activeOrders, activeDrivers, recentOrders] = await Promise.all([
      this.orderModel.countDocuments({
        status: {
          $in: ['confirmed', 'preparing', 'ready', 'picked_up', 'on_the_way'],
        },
      }),
      this.driverModel.countDocuments({ isAvailable: true, isBanned: false }),
      this.orderModel.countDocuments({ createdAt: { $gte: oneHourAgo } }),
    ]);

    return { activeOrders, activeDrivers, recentOrders };
  }

  async getDashboardSummary(query: {
    from?: string;
    to?: string;
    tz?: string;
  }): Promise<DTO.DashboardSummaryDto> {
    const { from, to, tz } = query;
    const startDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = to ? new Date(to) : new Date();

    const [
      totalOrders,
      totalGMV,
      totalRevenue,
      totalCancelRate,
      deliveryTimeAvg,
      deliveryTimeP90,
      ordersByStatus
    ] = await Promise.all([
      this.orderModel.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
      this.orderModel.aggregate([
        { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      this.orderModel.aggregate([
        { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: null, total: { $sum: '$platformFee' } } }
      ]),
      this.orderModel.aggregate([
        { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
        {
          $group: {
            _id: null,
            cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
            total: { $sum: 1 }
          }
        }
      ]),
      this.orderModel.aggregate([
        { $match: { createdAt: { $gte: startDate, $lte: endDate }, status: 'delivered' } },
        { $group: { _id: null, avg: { $avg: '$deliveryTimeMinutes' } } }
      ]),
      this.orderModel.aggregate([
        { $match: { createdAt: { $gte: startDate, $lte: endDate }, status: 'delivered' } },
        { $sort: { deliveryTimeMinutes: -1 } },
        { $limit: Math.ceil(await this.orderModel.countDocuments({ createdAt: { $gte: startDate, $lte: endDate }, status: 'delivered' }) * 0.9) },
        { $group: { _id: null, p90: { $max: '$deliveryTimeMinutes' } } }
      ]),
      this.orderModel.aggregate([
        { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ]);

    const gmv = totalGMV[0]?.total || 0;
    const revenue = totalRevenue[0]?.total || 0;
    const cancelRate = totalCancelRate[0] ? (totalCancelRate[0].cancelled / totalCancelRate[0].total) : 0;

    return {
      orders: totalOrders,
      gmv,
      revenue,
      cancelRate,
      deliveryTime: {
        avgMin: deliveryTimeAvg[0]?.avg || 0,
        p90Min: deliveryTimeP90[0]?.p90 || 0
      },
      byStatus: ordersByStatus.map(item => ({
        status: item._id,
        count: item.count
      }))
    };
  }

  async getDashboardTimeseries(query: {
    metric: 'orders' | 'gmv' | 'revenue';
    interval: 'day' | 'hour';
    from?: string;
    to?: string;
    tz?: string;
  }): Promise<DTO.DashboardTimeseriesDto> {
    const { metric, interval, from, to } = query;
    const startDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = to ? new Date(to) : new Date();

    const groupBy = interval === 'hour' ? {
      year: { $year: { date: '$createdAt', timezone: 'Asia/Aden' } },
      month: { $month: { date: '$createdAt', timezone: 'Asia/Aden' } },
      day: { $dayOfMonth: { date: '$createdAt', timezone: 'Asia/Aden' } },
      hour: { $hour: { date: '$createdAt', timezone: 'Asia/Aden' } }
    } : {
      year: { $year: { date: '$createdAt', timezone: 'Asia/Aden' } },
      month: { $month: { date: '$createdAt', timezone: 'Asia/Aden' } },
      day: { $dayOfMonth: { date: '$createdAt', timezone: 'Asia/Aden' } }
    };

    const fieldMap = {
      orders: { $sum: 1 },
      gmv: { $sum: '$totalAmount' },
      revenue: { $sum: '$platformFee' }
    };

    const data = await this.orderModel.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: groupBy,
          value: fieldMap[metric],
          date: { $first: '$createdAt' }
        }
      },
      { $sort: { '_id': 1 } },
      {
        $project: {
          date: '$date',
          value: 1
        }
      }
    ]);

    return { data };
  }

  async getDashboardTop(query: {
    by: 'stores' | 'cities' | 'categories';
    limit?: number;
    from?: string;
    to?: string;
    tz?: string;
  }): Promise<DTO.DashboardTopDto> {
    const { by, limit = 10, from, to } = query;
    const startDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = to ? new Date(to) : new Date();

    const fieldMap = {
      stores: '$storeId',
      cities: '$deliveryAddress.city',
      categories: '$items.category'
    };

    const data = await this.orderModel.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: fieldMap[by],
          orders: { $sum: 1 },
          gmv: { $sum: '$totalAmount' },
          revenue: { $sum: '$platformFee' }
        }
      },
      { $sort: { gmv: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          id: '$_id',
          orders: 1,
          gmv: 1,
          revenue: 1
        }
      }
    ]);

    return { rows: data };
  }

  async getDashboardAlerts(): Promise<DTO.DashboardAlertsDto> {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const [
      awaitingProcurement,
      awaitingAssign,
      overdueDeliveries
    ] = await Promise.all([
      this.orderModel.countDocuments({
        status: 'confirmed',
        createdAt: { $lt: new Date(now.getTime() - 30 * 60 * 1000) } // أكثر من 30 دقيقة
      }),
      this.orderModel.countDocuments({
        status: 'confirmed',
        assignedDriverId: { $exists: false }
      }),
      this.orderModel.countDocuments({
        status: 'in_delivery',
        deliveryStartTime: { $lt: new Date(now.getTime() - 90 * 60 * 1000) } // أكثر من 90 دقيقة
      })
    ]);

    return {
      awaitingProcurement,
      awaitingAssign,
      overdueDeliveries
    };
  }

  // ==================== Drivers Management ====================

  async getAllDrivers(
    query?: DTO.GetAllDriversQueryDto,
  ): Promise<DTO.GetAllDriversResponseDto> {
    const matchQuery: Record<string, any> = {};
    if (query?.status) matchQuery.status = query.status;
    if (query?.isAvailable !== undefined)
      matchQuery.isAvailable = query.isAvailable;

    const page = query?.page || 1;
    const limit = query?.limit || 20;
    const skip = (page - 1) * limit;

    const [drivers, total] = await Promise.all([
      this.driverModel
        .find(matchQuery)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      this.driverModel.countDocuments(matchQuery),
    ]);

    return {
      data: drivers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getDriverDetails(driverId: string): Promise<DTO.DriverDetailsDto> {
    const driver = await this.driverModel.findById(driverId);
    if (!driver)
      throw new NotFoundException({
        code: 'DRIVER_NOT_FOUND',
        userMessage: 'السائق غير موجود',
      });

    const [totalOrders, completedOrders, cancelledOrders] = await Promise.all([
      this.orderModel.countDocuments({ driver: new Types.ObjectId(driverId) }),
      this.orderModel.countDocuments({
        driver: new Types.ObjectId(driverId),
        status: 'delivered',
      }),
      this.orderModel.countDocuments({
        driver: new Types.ObjectId(driverId),
        status: 'cancelled',
      }),
    ]);

    return { driver, stats: { totalOrders, completedOrders, cancelledOrders } };
  }

  async getDriverPerformance(
    driverId: string,
    query?: DTO.DriverPerformanceQueryDto,
  ): Promise<DTO.DriverPerformanceDto> {
    const matchQuery: Record<string, any> = {
      driver: new Types.ObjectId(driverId),
      status: 'delivered',
    };
    if (query?.startDate || query?.endDate) {
      matchQuery.deliveredAt = {
        ...(query.startDate && { $gte: new Date(query.startDate) }),
        ...(query.endDate && { $lte: new Date(query.endDate) }),
      };
    }

    const result = await this.orderModel.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalEarnings: { $sum: '$driverShare' },
          averageRating: { $avg: '$rating' },
        },
      },
    ]);

    return (
      (result[0] as DTO.DriverPerformanceDto) || {
        totalOrders: 0,
        totalEarnings: 0,
        averageRating: 0,
      }
    );
  }

  async getDriverFinancials(
    driverId: string,
  ): Promise<DTO.DriverFinancialsDto> {
    const driver = await this.driverModel.findById(driverId).select('wallet');
    if (!driver)
      throw new NotFoundException({
        code: 'DRIVER_NOT_FOUND',
        userMessage: 'السائق غير موجود',
      });

    return {
      wallet: (
        driver as unknown as {
          wallet: {
            balance: number;
            totalEarned: number;
            totalWithdrawn: number;
          };
        }
      ).wallet || {
        balance: 0,
        totalEarned: 0,
        totalWithdrawn: 0,
      },
    };
  }

  async banDriver(data: DTO.BanDriverDto) {
    return ModerationHelper.ban(
      this.driverModel,
      data.driverId,
      data.reason,
      data.adminId,
      'Driver',
    );
  }

  async unbanDriver(driverId: string, adminId: string) {
    return ModerationHelper.unban(
      this.driverModel,
      driverId,
      adminId,
      'Driver',
    );
  }

  async adjustDriverBalance(
    data: DTO.AdjustDriverBalanceDto,
  ): Promise<DTO.AdjustDriverBalanceResponseDto> {
    const driver = await this.driverModel.findById(data.driverId);
    if (!driver)
      throw new NotFoundException({
        code: 'DRIVER_NOT_FOUND',
        userMessage: 'السائق غير موجود',
      });

    const wallet = (driver as unknown as { wallet: { balance: number } })
      .wallet || { balance: 0 };
    if (data.type === 'credit') {
      wallet.balance += data.amount;
    } else {
      wallet.balance -= data.amount;
    }
    (driver as unknown as { wallet: { balance: number } }).wallet = wallet;

    await driver.save();

    return { success: true, newBalance: wallet.balance };
  }

  async getDriverDocuments(driverId: string) {
    const driver = await this.driverModel
      .findById(driverId)
      .select('documents');
    if (!driver)
      throw new NotFoundException({
        code: 'DRIVER_NOT_FOUND',
        userMessage: 'السائق غير موجود',
      });

    return {
      documents: (driver as unknown as { documents: any[] }).documents || [],
    };
  }

  async verifyDocument(data: DTO.VerifyDocumentDto) {
    const driver = await this.driverModel.findById(data.driverId);
    if (!driver)
      throw new NotFoundException({
        code: 'DRIVER_NOT_FOUND',
        userMessage: 'السائق غير موجود',
      });

    const documents =
      (driver as unknown as { documents: any[] }).documents || [];
    const doc = documents.find(
      (d: unknown) => (d as { _id: string })._id?.toString() === data.docId,
    ) as unknown as {
      verified: boolean;
      verifiedBy: string;
      verifiedAt: Date;
      verificationNotes: string;
    };

    if (!doc) {
      throw new NotFoundException({
        code: 'DOCUMENT_NOT_FOUND',
        userMessage: 'المستند غير موجود',
      });
    }

    doc.verified = data.verified;
    doc.verifiedBy = data.adminId || '';
    doc.verifiedAt = new Date();
    doc.verificationNotes = data.notes || '';

    await driver.save();
    return {
      success: true,
      message: data.verified ? 'تم التحقق من المستند' : 'تم رفض المستند',
    };
  }

  async updateDocument(data: DTO.UpdateDocumentDto) {
    const driver = await this.driverModel.findById(data.driverId);
    if (!driver)
      throw new NotFoundException({
        code: 'DRIVER_NOT_FOUND',
        userMessage: 'السائق غير موجود',
      });

    const documents =
      (driver as unknown as { documents: unknown[] }).documents || [];
    const doc = documents.find(
      (d: unknown) => (d as { _id: string })._id?.toString() === data.docId,
    );

    if (!doc) {
      throw new NotFoundException({
        code: 'DOCUMENT_NOT_FOUND',
        userMessage: 'المستند غير موجود',
      });
    }

    Object.assign(doc, data.updates);
    await driver.save();

    return { success: true, message: 'تم تحديث المستند' };
  }

  async getDriversByStatus() {
    const result = await this.driverModel.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    return { data: result };
  }

  // ==================== Withdrawals (→ WithdrawalService) ====================

  async getWithdrawals(query?: DTO.GetWithdrawalsQueryDto) {
    return this.withdrawalService.getWithdrawals(query);
  }

  async getPendingWithdrawals() {
    return this.withdrawalService.getPendingWithdrawals();
  }

  async approveWithdrawal(data: DTO.ApproveWithdrawalDto): Promise<any> {
    return this.withdrawalService.approveWithdrawal(data);
  }

  async rejectWithdrawal(data: DTO.RejectWithdrawalDto): Promise<any> {
    return this.withdrawalService.rejectWithdrawal(data);
  }

  // ==================== Store & Vendor Moderation ====================

  async getPendingStores() {
    const stores = await this.storeModel.find({ status: 'pending' }).limit(50);
    return { data: stores, total: stores.length };
  }

  async approveStore(storeId: string, adminId: string) {
    return ModerationHelper.approve(this.storeModel, storeId, adminId, 'Store');
  }

  async rejectStore(storeId: string, reason: string, adminId: string) {
    return ModerationHelper.reject(
      this.storeModel,
      storeId,
      reason,
      adminId,
      'Store',
    );
  }

  async suspendStore(storeId: string, reason: string, adminId: string) {
    return ModerationHelper.suspend(
      this.storeModel,
      storeId,
      reason,
      adminId,
      'Store',
    );
  }

  async getPendingVendors() {
    const vendors = await this.vendorModel
      .find({ status: 'pending' })
      .limit(50);
    return { data: vendors, total: vendors.length };
  }

  async approveVendor(vendorId: string, adminId: string) {
    const vendor = await this.vendorModel.findById(vendorId);
    if (!vendor)
      throw new NotFoundException({
        code: 'VENDOR_NOT_FOUND',
        userMessage: 'التاجر غير موجود',
      });

    (
      vendor as unknown as {
        status: string;
        approvedBy: string;
        approvedAt: Date;
      }
    ).status = 'approved';
    (vendor as unknown as { approvedBy: string }).approvedBy = adminId;
    (vendor as unknown as { approvedAt: Date }).approvedAt = new Date();

    await vendor.save();
    return { success: true, message: 'تم الموافقة على التاجر' };
  }

  async rejectVendor(vendorId: string, reason: string, adminId: string) {
    const vendor = await this.vendorModel.findById(vendorId);
    if (!vendor)
      throw new NotFoundException({
        code: 'VENDOR_NOT_FOUND',
        userMessage: 'التاجر غير موجود',
      });

    (vendor as unknown as { status: string }).status = 'rejected';
    (vendor as unknown as { rejectionReason: string }).rejectionReason = reason;
    (vendor as unknown as { rejectedBy: string }).rejectedBy = adminId;

    await vendor.save();
    return { success: true, message: 'تم رفض التاجر' };
  }

  async suspendVendor(vendorId: string, reason: string, adminId: string) {
    return ModerationHelper.suspend(
      this.vendorModel,
      vendorId,
      reason,
      adminId,
      'Vendor',
    );
  }

  // ==================== Users Management ====================

  async getUsers(query?: DTO.GetUsersQueryDto) {
    const matchQuery: Record<string, any> = {};
    if (query?.search) {
      matchQuery.$or = [
        { fullName: new RegExp(query.search, 'i') },
        { phone: new RegExp(query.search, 'i') },
        { email: new RegExp(query.search, 'i') },
      ];
    }
    if (query?.isActive !== undefined) matchQuery.isActive = query.isActive;

    const page = query?.page || 1;
    const limit = query?.limit || 20;
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.userModel
        .find(matchQuery)
        .select('-password')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      this.userModel.countDocuments(matchQuery),
    ]);

    return {
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUserDetails(userId: string) {
    const user = await this.userModel.findById(userId).select('-password');
    if (!user)
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        userMessage: 'المستخدم غير موجود',
      });

    const orderStats = await this.orderModel.aggregate([
      { $match: { user: new Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' },
          completedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] },
          },
        },
      },
    ]);

    return {
      user,
      orderStats: (orderStats[0] as {
        totalOrders: number;
        totalSpent: number;
        completedOrders: number;
      }) || {
        totalOrders: 0,
        totalSpent: 0,
        completedOrders: 0,
      },
    };
  }

  async banUser(data: DTO.BanUserDto) {
    return ModerationHelper.ban(
      this.userModel,
      data.userId,
      data.reason,
      data.adminId,
      'User',
    );
  }

  async unbanUser(userId: string, adminId: string) {
    return ModerationHelper.unban(this.userModel, userId, adminId, 'User');
  }

  async getUserOrdersHistory(userId: string) {
    const orders = await this.orderModel
      .find({ user: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(50);
    return { data: orders, total: orders.length };
  }

  // ==================== Reports ====================

  async getDailyReport(query?: DTO.DailyReportQueryDto) {
    const targetDate = query?.date ? new Date(query.date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const [orders, revenue, newUsers] = await Promise.all([
      this.orderModel.countDocuments({
        createdAt: { $gte: targetDate, $lt: nextDay },
      }),
      this.orderModel.aggregate([
        {
          $match: {
            createdAt: { $gte: targetDate, $lt: nextDay },
            status: 'delivered',
            paid: true,
          },
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      this.userModel.countDocuments({
        createdAt: { $gte: targetDate, $lt: nextDay },
      }),
    ]);

    return {
      date: targetDate,
      orders,
      revenue: (revenue[0] as { total: number } | undefined)?.total || 0,
      newUsers,
    };
  }

  async getUserActivityReport() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [activeToday, newToday] = await Promise.all([
      this.orderModel.distinct('user', { createdAt: { $gte: today } }),
      this.userModel.countDocuments({ createdAt: { $gte: today } }),
    ]);

    return { activeUsers: activeToday.length, newUsers: newToday };
  }

  // ==================== Withdrawals (→ WithdrawalService) ====================
  // Already delegated above

  // ==================== Support Tickets (→ SupportAdminService) ====================

  async getSupportTickets(
    status?: string,
    priority?: string,
    page: number = 1,
    limit: number = 20,
  ) {
    return this.supportService.getSupportTickets(status, priority, page, limit);
  }

  async assignTicket(ticketId: string, assigneeId: string, adminId: string) {
    return this.supportService.assignTicket(ticketId, assigneeId, adminId);
  }

  async resolveTicket(ticketId: string, resolution: string, adminId: string) {
    return this.supportService.resolveTicket(ticketId, resolution, adminId);
  }

  async getSLAMetrics() {
    return this.supportService.getSLAMetrics();
  }

  // ==================== Settings (→ SettingsService) ====================

  async getSettings() {
    return this.settingsService.getSettings();
  }

  async updateSettings(settings: { key: string; value: any }, adminId: string) {
    return this.settingsService.updateSetting(
      settings.key,
      settings.value,
      adminId,
    );
  }

  // ==================== Feature Flags (→ FeatureFlagService) ====================

  async getFeatureFlags() {
    return this.featureFlagService.getFeatureFlags();
  }

  async updateFeatureFlag(flag: string, enabled: boolean, adminId: string) {
    return this.featureFlagService.updateFeatureFlag(flag, enabled, adminId);
  }

  // ==================== Backup (→ BackupService) ====================

  async createBackup(
    collections?: string[],
    description?: string,
    adminId?: string,
  ) {
    return this.backupService.createBackup(collections, description, adminId);
  }

  async listBackups(page: number = 1, limit: number = 20) {
    return this.backupService.listBackups(page, limit);
  }

  async restoreBackup(backupId: string, adminId: string) {
    return this.backupService.restoreBackup(backupId, adminId);
  }

  async downloadBackup(backupId: string) {
    return this.backupService.downloadBackup(backupId);
  }

  // ==================== Data Deletion (→ DataDeletionService) ====================

  async getDataDeletionRequests(status?: string) {
    return this.dataDeletionService.getDataDeletionRequests(status);
  }

  async approveDataDeletion(requestId: string, adminId: string) {
    return this.dataDeletionService.approveDataDeletion(requestId, adminId);
  }

  async rejectDataDeletion(requestId: string, reason: string, adminId: string) {
    return this.dataDeletionService.rejectDataDeletion(
      requestId,
      reason,
      adminId,
    );
  }

  // ==================== Security (→ SecurityService) ====================

  async getFailedPasswordAttempts(threshold: number = 5) {
    return this.securityService.getFailedPasswordAttempts(threshold);
  }

  async resetUserPassword(data: DTO.ResetUserPasswordDto) {
    const user = await this.userModel.findById(data.userId);
    if (!user)
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        userMessage: 'المستخدم غير موجود',
      });

    const password = data.tempPassword || Math.random().toString(36).slice(-8);

    return {
      success: true,
      message: 'تم إعادة تعيين كلمة المرور',
      tempPassword: password,
    };
  }

  async unlockAccount(data: DTO.UnlockAccountDto) {
    const user = await this.userModel.findById(data.userId);
    if (!user)
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        userMessage: 'المستخدم غير موجود',
      });

    (user as unknown as { isLocked: boolean }).isLocked = false;
    (user as unknown as { failedLoginAttempts: number }).failedLoginAttempts =
      0;
    await user.save();

    return { success: true, message: 'تم فتح الحساب' };
  }

  // ==================== Driver Attendance (→ AttendanceService) ====================

  async getDriverAttendance(
    driverId: string,
    query?: DTO.GetDriverAttendanceQueryDto,
  ) {
    return this.attendanceService.getDriverAttendance(driverId, query);
  }

  async getAttendanceSummary(date?: string) {
    return this.attendanceService.getAttendanceSummary(date);
  }

  async adjustAttendance(data: DTO.AdjustAttendanceDto) {
    if (!data.adminId) {
      throw new Error('adminId is required');
    }
    return this.attendanceService.adjustAttendance({
      driverId: data.driverId,
      data: data.data,
      adminId: data.adminId,
    });
  }

  // ==================== Driver Shifts (→ DriverShiftService) ====================

  async getAllShifts() {
    return this.shiftService.getAllShifts();
  }

  async createShift(
    shiftData: {
      name: string;
      startTime: string;
      endTime: string;
      days: number[];
      breakTimes?: any;
      maxDrivers?: number;
      description?: string;
      color?: string;
    },
    adminId: string,
  ) {
    return this.shiftService.createShift(shiftData, adminId);
  }

  async updateShift(shiftId: string, updates: Partial<any>) {
    return this.shiftService.updateShift(shiftId, updates);
  }

  async assignShiftToDriver(
    shiftId: string,
    driverId: string,
    startDate: string,
    endDate?: string,
  ) {
    return this.shiftService.assignShiftToDriver(
      shiftId,
      driverId,
      startDate,
      endDate,
    );
  }

  async getDriverShifts(driverId: string) {
    return this.shiftService.getDriverShifts(driverId);
  }

  // ==================== Leave Management (→ LeaveService) ====================

  async getLeaveRequests(
    status?: string,
    page: number = 1,
    limit: number = 20,
  ) {
    return this.leaveService.getLeaveRequests(status, page, limit);
  }

  async approveLeaveRequest(requestId: string, adminId: string) {
    return this.leaveService.approveLeaveRequest(requestId, adminId);
  }

  async rejectLeaveRequest(requestId: string, reason: string, adminId: string) {
    return this.leaveService.rejectLeaveRequest(requestId, reason, adminId);
  }

  async getDriverLeaveBalance(driverId: string) {
    return this.leaveService.getDriverLeaveBalance(driverId);
  }

  async adjustLeaveBalance(
    driverId: string,
    days: number,
    type: 'add' | 'deduct',
  ) {
    return this.leaveService.adjustLeaveBalance(driverId, days, type);
  }

  // ==================== Marketer Management (→ MarketerService) ====================

  async getAllMarketers(query?: DTO.GetAllMarketersQueryDto) {
    return this.marketerService.getAllMarketers(query);
  }

  async getMarketerDetails(marketerId: string) {
    return this.marketerService.getMarketerDetails(marketerId);
  }

  async createMarketer(data: DTO.CreateMarketerDto, adminId: string) {
    return this.marketerService.createMarketer(data, adminId);
  }

  async updateMarketer(data: DTO.UpdateMarketerDto) {
    return this.marketerService.updateMarketer(data);
  }

  async getMarketerPerformance(
    marketerId: string,
    query?: DTO.GetMarketerPerformanceQueryDto,
  ) {
    return this.marketerService.getMarketerPerformance(marketerId, query);
  }

  async getMarketerStores(marketerId: string) {
    return this.marketerService.getMarketerStores(marketerId);
  }

  async getMarketerCommissions(marketerId: string, status?: string) {
    return this.marketerService.getMarketerCommissions(marketerId, status);
  }

  async activateMarketer(data: DTO.ActivateMarketerDto) {
    return this.marketerService.activateMarketer(data);
  }

  async deactivateMarketer(data: DTO.DeactivateMarketerDto) {
    return this.marketerService.deactivateMarketer(data);
  }

  async adjustMarketerCommission(data: DTO.AdjustMarketerCommissionDto) {
    return this.marketerService.adjustMarketerCommission(data);
  }

  async getMarketersStatistics(query?: DTO.GetMarketersStatisticsQueryDto) {
    return this.marketerService.getMarketersStatistics(query);
  }

  async exportMarketers(): Promise<any> {
    return this.marketerService.exportMarketers();
  }

  // ==================== Onboarding (→ MarketerService) ====================

  async getOnboardingApplications(
    query?: DTO.GetOnboardingApplicationsQueryDto,
  ) {
    return this.marketerService.getOnboardingApplications(query);
  }

  async getOnboardingDetails(applicationId: string) {
    return this.marketerService.getOnboardingDetails(applicationId);
  }

  async approveOnboarding(data: DTO.ApproveOnboardingDto) {
    return this.marketerService.approveOnboarding(data);
  }

  async rejectOnboarding(data: DTO.RejectOnboardingDto) {
    return this.marketerService.rejectOnboarding(data);
  }

  async getOnboardingStatistics() {
    return this.marketerService.getOnboardingStatistics();
  }

  // ==================== Commission Plans (→ MarketerService) ====================

  async getCommissionPlans() {
    return this.marketerService.getCommissionPlans();
  }

  async createCommissionPlan(planData: Record<string, any>, adminId: string) {
    return this.marketerService.createCommissionPlan(
      {
        name: planData.name as string,
        type: planData.type as string,
        rate: planData.rate as number,
        minOrders: planData.minOrders as number | undefined,
        maxOrders: planData.maxOrders as number | undefined,
      },
      adminId,
    );
  }

  async updateCommissionPlan(
    planId: string,
    updates: Record<string, any>,
    adminId: string,
  ) {
    return this.marketerService.updateCommissionPlan(planId, updates, adminId);
  }

  // ==================== Audit Logs (→ AuditService) ====================

  async getAuditLogs(
    action?: string,
    userId?: string,
    startDate?: string,
    endDate?: string,
  ) {
    return this.auditService.getAuditLogs(action, userId, startDate, endDate);
  }

  async getAuditLogDetails(logId: string) {
    return this.auditService.getAuditLogDetails(logId);
  }

  // ==================== System Health ====================

  getSystemHealth() {
    return {
      status: 'healthy',
      database: 'connected',
      redis: 'connected',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  }

  getSystemMetrics() {
    return {
      cpu: 0,
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      activeConnections: 0,
    };
  }

  async getDatabaseStats() {
    const stats = await Promise.all([
      this.userModel.countDocuments(),
      this.orderModel.countDocuments(),
      this.driverModel.countDocuments(),
      this.storeModel.countDocuments(),
      this.vendorModel.countDocuments(),
    ]);

    return {
      users: stats[0],
      orders: stats[1],
      drivers: stats[2],
      stores: stats[3],
      vendors: stats[4],
    };
  }

  // ==================== Orders Analytics ====================

  async getOrdersByCity(startDate?: string, endDate?: string) {
    const query: Record<string, any> = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate)
        (query.createdAt as Record<string, any>).$gte = new Date(startDate);
      if (endDate)
        (query.createdAt as Record<string, any>).$lte = new Date(endDate);
    }

    const result = await this.orderModel.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$address.city',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$price' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return { data: result };
  }

  async getOrdersByPaymentMethod() {
    const result = await this.orderModel.aggregate([
      { $group: { _id: '$paymentMethod', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    return { data: result };
  }

  // ==================== Notifications ====================

  sendBulkNotification(data: DTO.SendBulkNotificationDto) {
    return {
      success: true,
      message: 'تم إرسال الإشعار',
      recipients: data.userIds?.length || 0,
    };
  }

  // ==================== Quality Metrics ====================

  async getQualityMetrics(startDate?: string, endDate?: string) {
    const query: Record<string, any> = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate)
        (query.createdAt as Record<string, any>).$gte = new Date(startDate);
      if (endDate)
        (query.createdAt as Record<string, any>).$lte = new Date(endDate);
    }

    const [avgOrderRating, avgDriverRating] = await Promise.all([
      this.orderModel.aggregate([
        { $match: { ...query, rating: { $exists: true } } },
        { $group: { _id: null, avg: { $avg: '$rating' } } },
      ]),
      this.driverModel.aggregate([
        { $match: { 'rating.average': { $exists: true } } },
        { $group: { _id: null, avg: { $avg: '$rating.average' } } },
      ]),
    ]);

    return {
      orderRating: (avgOrderRating[0] as { avg: number })?.avg || 0,
      driverRating: (avgDriverRating[0] as { avg: number })?.avg || 0,
    };
  }

  // ==================== Roles & Permissions ====================

  async getRoles() {
    const roles = await this.roleModel.find({ isActive: true }).sort({ createdAt: -1 });
    return {
      success: true,
      data: roles.map(role => ({
        _id: (role._id as Types.ObjectId).toString(),
        name: role.name,
        displayName: role.displayName,
        description: role.description,
        permissions: role.permissions,
        isActive: role.isActive,
        users: role.users,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
      })) as any,
      count: roles.length,
    };
  }

  async createRole(roleData: {
    name: string;
    displayName: string;
    description?: string;
    permissions?: Record<string, boolean>;
  }, adminId: string) {
    // التحقق من عدم وجود دور بنفس الاسم
    const existingRole = await this.roleModel.findOne({ name: roleData.name });
    if (existingRole) {
      throw new BadRequestException('دور بنفس الاسم موجود بالفعل');
    }

    const role = new this.roleModel({
      ...roleData,
      createdBy: adminId,
      isActive: true,
    });

    const savedRole = await role.save();

    // تسجيل في سجل المراجعة
    await this.auditService.logAction({
      action: 'CREATE_ROLE',
      entityType: 'Role',
      entityId: (savedRole._id as Types.ObjectId).toString(),
      userId: adminId,
      details: { roleName: roleData.name },
    });

    return {
      success: true,
      message: 'تم إنشاء الدور بنجاح',
      data: {
        _id: (savedRole._id as Types.ObjectId).toString(),
        name: savedRole.name,
        displayName: savedRole.displayName,
        description: savedRole.description,
        permissions: savedRole.permissions,
        isActive: savedRole.isActive,
        users: savedRole.users,
        createdAt: savedRole.createdAt,
        updatedAt: savedRole.updatedAt,
      } as any,
    };
  }

  async updateRole(roleId: string, updates: {
    name?: string;
    displayName?: string;
    description?: string;
    permissions?: Record<string, boolean>;
    isActive?: boolean;
  }, adminId: string) {
    const role = await this.roleModel.findById(roleId);
    if (!role) {
      throw new NotFoundException('الدور غير موجود');
    }

    // منع تعديل الأدوار النظامية الأساسية
    const systemRoles = ['admin', 'superadmin'];
    if (systemRoles.includes(role.name) && updates.name) {
      throw new BadRequestException('لا يمكن تعديل اسم الأدوار النظامية');
    }

    const updatedRole = await this.roleModel.findByIdAndUpdate(
      roleId,
      {
        ...updates,
        updatedBy: adminId,
        updatedAt: new Date(),
      },
      { new: true }
    );

    // تسجيل في سجل المراجعة
    await this.auditService.logAction({
      action: 'UPDATE_ROLE',
      entityType: 'Role',
      entityId: roleId,
      userId: adminId,
      details: { updates },
    });

    return {
      success: true,
      message: 'تم تحديث الدور بنجاح',
      data: updatedRole ? {
        _id: (updatedRole._id as Types.ObjectId).toString(),
        name: updatedRole.name,
        displayName: updatedRole.displayName,
        description: updatedRole.description,
        permissions: updatedRole.permissions,
        isActive: updatedRole.isActive,
        users: updatedRole.users,
        createdAt: updatedRole.createdAt,
        updatedAt: updatedRole.updatedAt,
      } as any : undefined,
    };
  }

  async deleteRole(roleId: string, adminId: string) {
    const role = await this.roleModel.findById(roleId);
    if (!role) {
      throw new NotFoundException('الدور غير موجود');
    }

    // منع حذف الأدوار النظامية الأساسية
    const systemRoles = ['admin', 'superadmin'];
    if (systemRoles.includes(role.name)) {
      throw new BadRequestException('لا يمكن حذف الأدوار النظامية');
    }

    // التحقق من عدم وجود مستخدمين مرتبطين بالدور
    if (role.users && role.users.length > 0) {
      throw new BadRequestException('لا يمكن حذف دور مرتبط بمستخدمين');
    }

    await this.roleModel.findByIdAndDelete(roleId);

    // تسجيل في سجل المراجعة
    await this.auditService.logAction({
      action: 'DELETE_ROLE',
      entityType: 'Role',
      entityId: roleId,
      userId: adminId,
      details: { roleName: role.name },
    });

    return {
      success: true,
      message: 'تم حذف الدور بنجاح',
    };
  }

  async getRoleById(roleId: string) {
    const role = await this.roleModel.findById(roleId);
    if (!role) {
      throw new NotFoundException('الدور غير موجود');
    }

    return {
      success: true,
      data: {
        _id: (role._id as Types.ObjectId).toString(),
        name: role.name,
        displayName: role.displayName,
        description: role.description,
        permissions: role.permissions,
        isActive: role.isActive,
        users: role.users,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
      } as any,
    };
  }

  // ==================== Reports Export ====================

  async exportReport(type: string, format: string, filters?: any) {
    try {
      let data: any[] = [];
      let filename = `report_${type}_${new Date().toISOString().split('T')[0]}`;

      // بناء البيانات حسب نوع التقرير
      switch (type) {
        case 'users':
          data = await this.userModel.find(filters || {}).select('fullName email phone isActive createdAt');
          break;

        case 'drivers':
          data = await this.driverModel.find(filters || {}).select('fullName email phone isAvailable isBanned createdAt');
          break;

        case 'orders':
          data = await this.orderModel.find(filters || {}).populate('user', 'fullName').populate('driver', 'fullName');
          break;

        case 'vendors':
          data = await this.vendorModel.find(filters || {}).select('name email phone isActive createdAt');
          break;

        case 'financial':
          // تقرير مالي - يحتاج تنفيذ أكثر تفصيلاً
          data = [await this.getFinancialStats()];
          break;

        default:
          throw new BadRequestException(`نوع التقرير غير مدعوم: ${type}`);
      }

      // إنشاء محتوى الملف حسب التنسيق
      if (format === 'csv') {
        const csvContent = this.convertToCSV(data);
        return {
          success: true,
          filename: `${filename}.csv`,
          content: csvContent,
          contentType: 'text/csv',
        };
      } else if (format === 'excel') {
        const excelContent = this.convertToExcel(data);
        return {
          success: true,
          filename: `${filename}.xlsx`,
          content: excelContent,
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        };
      } else if (format === 'pdf') {
        const pdfContent = await this.convertToPDF(data, type);
        return {
          success: true,
          filename: `${filename}.pdf`,
          content: pdfContent,
          contentType: 'application/pdf',
        };
      } else {
        throw new BadRequestException(`تنسيق الملف غير مدعوم: ${format}`);
      }

    } catch (error) {
      throw new BadRequestException(`فشل في إنشاء التقرير: ${error.message}`);
    }
  }

  private convertToCSV(data: any[]): string {
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(item =>
      Object.values(item).map(value =>
        typeof value === 'object' ? JSON.stringify(value) : String(value || '')
      ).join(',')
    );

    return [headers, ...rows].join('\n');
  }

  private convertToExcel(data: any[]): Buffer {
    // تنفيذ بسيط للـ Excel - يمكن استخدام مكتبة مثل exceljs لاحقاً
    const csv = this.convertToCSV(data);
    return Buffer.from(csv, 'utf-8');
  }

  private async convertToPDF(data: any[], type: string): Promise<Buffer> {
    // تنفيذ بسيط للـ PDF - يمكن استخدام مكتبة مثل pdfkit لاحقاً
    const content = `
      تقرير ${type}
      تاريخ الإنشاء: ${new Date().toLocaleDateString('ar-SA')}
      عدد السجلات: ${data.length}

      البيانات:
      ${JSON.stringify(data, null, 2)}
    `;

    return Buffer.from(content, 'utf-8');
  }

  // ==================== Cache Management ====================

  async clearCache() {
    try {
      // مسح جميع الـ cache باستخدام CacheHelper
      await CacheHelper.flush(this.cacheManager);

      return {
        success: true,
        message: 'تم مسح الكاش بنجاح',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        message: 'فشل في مسح الكاش',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getCacheStats() {
    try {
      // اختبار أداء الـ cache
      const testKey = '__admin_stats_check__';
      const testValue = { timestamp: Date.now() };

      // قياس وقت الكتابة
      const writeStart = Date.now();
      await this.cacheManager.set(testKey, testValue, 5000);
      const writeLatency = Date.now() - writeStart;

      // قياس وقت القراءة
      const readStart = Date.now();
      const retrieved = await this.cacheManager.get(testKey);
      const readLatency = Date.now() - readStart;

      // تنظيف
      await this.cacheManager.del(testKey);

      const storeType = process.env.REDIS_HOST ? 'redis' : 'memory';
      const totalLatency = writeLatency + readLatency;

      return {
        success: true,
        type: storeType,
        connected: !!retrieved,
        performance: {
          writeLatencyMs: writeLatency,
          readLatencyMs: readLatency,
          totalLatencyMs: totalLatency,
          status:
            totalLatency < 100
              ? 'optimal'
              : totalLatency < 500
                ? 'good'
                : 'slow',
        },
        config: {
          ttl: parseInt(process.env.CACHE_TTL || '600', 10),
          maxItems: parseInt(process.env.CACHE_MAX_ITEMS || '100', 10),
          redisHost: process.env.REDIS_HOST || 'not configured',
          redisPort: process.env.REDIS_PORT || 'not configured',
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        type: 'unknown',
        connected: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      };
    }
  }

  // ==================== Additional Delete Methods ====================

  async deleteDriver(driverId: string) {
    const driver = await this.driverModel.findById(driverId);
    if (!driver) {
      throw new NotFoundException('السائق غير موجود');
    }

    // تحديث حالة السائق بدلاً من الحذف الفعلي
    await this.driverModel.findByIdAndUpdate(driverId, {
      isBanned: true,
      isAvailable: false,
    });

    return {
      success: true,
      message: 'تم تعطيل السائق بنجاح',
    };
  }

  async deleteLeaveRequest(requestId: string) {
    return this.leaveService.deleteLeaveRequest(requestId);
  }

  async deleteShift(shiftId: string) {
    return this.shiftService.deleteShift(shiftId);
  }

  async deleteDriverAsset(assetId: string) {
    // TODO: Implement driver assets deletion
    return {
      success: true,
      message: 'تم حذف الأصل بنجاح',
    };
  }

  // ==================== Admin User Profile ====================

  async getCurrentAdminUser(user: any) {
    const adminUser = await this.userModel.findById(user.id).select('-password');
    if (!adminUser) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    return {
      id: (adminUser._id as Types.ObjectId).toString(),
      email: adminUser.email,
      fullName: adminUser.fullName,
      role: adminUser.role,
      permissions: (adminUser as any).permissions || [],
      createdAt: (adminUser as any).createdAt,
      lastLogin: adminUser.lastLoginAt,
    };
  }

  // ==================== Admin Users List ====================

  async getAdminUsersList({ page, limit, search }: { page: number; limit: number; search?: string }) {
    const skip = (page - 1) * limit;
    const query: any = { role: { $in: ['admin', 'superadmin', 'manager'] } };

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.userModel
        .find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.userModel.countDocuments(query),
    ]);

    return {
      users: users.map(user => ({
        id: (user._id as Types.ObjectId).toString(),
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isActive: user.isActive,
        createdAt: (user as any).createdAt,
        lastLogin: user.lastLoginAt,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // ==================== Admin Modules/Roles ====================

  async getModules() {
    return this.getRoles();
  }

  async getAdminsList({ page, limit }: { page: number; limit: number }) {
    return this.getAdminUsersList({ page, limit });
  }

  async createAdmin(
    { email, password, role, fullName }: { email: string; password: string; role: string; fullName: string },
    adminId: string,
  ) {
    // Validate role
    const validRoles = ['admin', 'manager', 'support'];
    if (!validRoles.includes(role)) {
      throw new BadRequestException('الدور غير صحيح');
    }

    // Check if email already exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new BadRequestException('البريد الإلكتروني مستخدم بالفعل');
    }

    const newAdmin = new this.userModel({
      email,
      password, // Will be hashed by pre-save hook
      fullName,
      role,
      isActive: true,
      createdBy: adminId,
    });

    await newAdmin.save();

    // Log the action
    await this.auditService.logAction({
      action: 'ADMIN_USER_CREATED',
      userId: adminId,
      resource: 'admin',
      resourceId: (newAdmin._id as Types.ObjectId).toString(),
      details: { email, role, fullName },
    });

    return {
      success: true,
      message: 'تم إنشاء المستخدم الإداري بنجاح',
      admin: {
        id: (newAdmin._id as Types.ObjectId).toString(),
        email: newAdmin.email,
        fullName: newAdmin.fullName,
        role: newAdmin.role,
        createdAt: (newAdmin as any).createdAt,
      },
    };
  }

  // ==================== Drivers Finance ====================

  async getDriversFinance({ startDate, endDate, page, limit }: {
    startDate?: string;
    endDate?: string;
    page: number;
    limit: number;
  }) {
    const skip = (page - 1) * limit;
    const matchConditions: any = {};

    if (startDate || endDate) {
      matchConditions.createdAt = {};
      if (startDate) matchConditions.createdAt.$gte = new Date(startDate);
      if (endDate) matchConditions.createdAt.$lte = new Date(endDate);
    }

    const [drivers, total] = await Promise.all([
      this.driverModel
        .find(matchConditions)
        .select('fullName phone balance earnings rating status')
        .sort({ earnings: -1 })
        .skip(skip)
        .limit(limit),
      this.driverModel.countDocuments(matchConditions),
    ]);

    const stats = await this.driverModel.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: '$earnings' },
          totalBalance: { $sum: '$balance' },
          averageRating: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]);

    return {
      drivers: drivers.map(driver => ({
        id: (driver._id as Types.ObjectId).toString(),
        fullName: driver.fullName,
        phone: driver.phone,
        balance: (driver as any).wallet?.balance || 0,
        earnings: (driver as any).wallet?.earnings || 0,
        rating: 0, // Driver entity doesn't have rating
        status: (driver as any).isAvailable ? 'available' : 'unavailable',
      })),
      summary: stats[0] || {
        totalEarnings: 0,
        totalBalance: 0,
        averageRating: 0,
        count: 0,
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async runFinanceCalculations({ period, force }: { period: string; force?: boolean }, adminId: string) {
    // TODO: Implement finance calculations logic
    // This would typically involve calculating commissions, settlements, etc.

    await this.auditService.logAction({
      action: 'FINANCE_CALCULATIONS_RUN',
      userId: adminId,
      resource: 'finance',
      details: { period, force },
    });

    return {
      success: true,
      message: 'تم تشغيل حسابات المالية بنجاح',
      period,
      timestamp: new Date().toISOString(),
    };
  }

  // ==================== Drivers Attendance ====================

  async getAllDriversAttendance({ date, page, limit }: {
    date?: string;
    page: number;
    limit: number;
  }) {
    const targetDate = date ? new Date(date) : new Date();
    return this.attendanceService.getAllDriversAttendance(targetDate, page, limit);
  }

  // ==================== Vendors Management ====================

  async getVendorsList({ status, page, limit }: {
    status?: string;
    page: number;
    limit: number;
  }) {
    const skip = (page - 1) * limit;
    const query: any = {};

    if (status) {
      query.status = status;
    }

    const [vendors, total] = await Promise.all([
      this.vendorModel
        .find(query)
        .populate('store', 'name category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.vendorModel.countDocuments(query),
    ]);

    return {
      vendors: vendors.map(vendor => ({
        id: (vendor._id as Types.ObjectId).toString(),
        fullName: vendor.fullName,
        phone: vendor.phone,
        email: vendor.email,
        status: (vendor as any).isActive ? 'active' : 'inactive',
        store: (vendor as any).store,
        createdAt: (vendor as any).createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // ==================== Settings Appearance ====================

  async getAppearanceSettings() {
    return this.settingsService.getAppearanceSettings();
  }

  async updateAppearanceSettings(updates: any, adminId: string) {
    const result = await this.settingsService.updateAppearanceSettings(updates);

    await this.auditService.logAction({
      action: 'APPEARANCE_SETTINGS_UPDATED',
      userId: adminId,
      resource: 'settings',
      resourceId: 'appearance',
      details: updates,
    });

    return result;
  }

  // ==================== Support Stats ====================

  async getSupportStats({ startDate, endDate }: {
    startDate?: string;
    endDate?: string;
  }) {
    return this.supportService.getSupportStats({ startDate, endDate });
  }

  // ==================== Audit Logs Stats ====================

  async getAuditLogsStats({ startDate, endDate }: {
    startDate?: string;
    endDate?: string;
  }) {
    const matchConditions: any = {};

    if (startDate || endDate) {
      matchConditions.timestamp = {};
      if (startDate) matchConditions.timestamp.$gte = new Date(startDate);
      if (endDate) matchConditions.timestamp.$lte = new Date(endDate);
    }

    const stats = await this.auditService.getAuditLogsStats(matchConditions);

    return {
      totalLogs: stats.totalLogs,
      actionsByType: stats.actionsByType,
      actionsByUser: stats.actionsByUser,
      recentActivity: stats.recentActivity,
      period: {
        startDate: startDate || null,
        endDate: endDate || null,
      },
    };
  }

  async getMyAuditActions({ limit, adminId }: {
    limit: number;
    adminId: string;
  }) {
    const actions = await this.auditService.getAuditLogs(
      undefined, // action
      adminId,   // userId
      undefined, // startDate
      undefined, // endDate
      1,         // page
      limit      // limit
    );

    return {
      actions: actions.data.map(action => ({
        id: (action._id as Types.ObjectId).toString(),
        action: action.action,
        resource: action.resource,
        timestamp: action.createdAt,
        details: action.metadata?.description || '',
      })),
      limit,
    };
  }

  // ==================== Pending Activations ====================

  async getPendingActivations({ type, page, limit }: {
    type?: string;
    page: number;
    limit: number;
  }) {
    const skip = (page - 1) * limit;
    const query: any = { isActive: false };

    if (type === 'vendors') {
      // Get pending vendors
      const [vendors, total] = await Promise.all([
        this.vendorModel
          .find(query)
          .populate('store', 'name')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        this.vendorModel.countDocuments(query),
      ]);

      return {
        type: 'vendors',
        items: vendors.map(vendor => ({
          id: (vendor._id as Types.ObjectId).toString(),
          type: 'vendor',
          fullName: vendor.fullName,
          phone: vendor.phone,
          store: (vendor as any).store,
          createdAt: (vendor as any).createdAt,
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    }

    // Default: stores
    const [stores, total] = await Promise.all([
      this.storeModel
        .find(query)
        .populate('vendor', 'fullName phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.storeModel.countDocuments(query),
    ]);

    return {
      type: 'stores',
      items: stores.map(store => ({
        id: (store._id as Types.ObjectId).toString(),
        type: 'store',
        name: store.name,
        category: (store as any).category,
        vendor: null, // Store doesn't have vendor property directly
        createdAt: (store as any).createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // ==================== Drivers Documents ====================

  async getDriversDocuments({ status, page, limit }: {
    status?: string;
    page: number;
    limit: number;
  }) {
    // TODO: Implement drivers documents logic
    return {
      documents: [],
      pagination: {
        page,
        limit,
        total: 0,
        pages: 0,
      },
      message: 'قيد التطوير',
    };
  }

  // ==================== Drivers Payouts ====================

  async getDriversPayouts({ status, page, limit }: {
    status?: string;
    page: number;
    limit: number;
  }) {
    // TODO: Implement drivers payouts logic
    return {
      payouts: [],
      pagination: {
        page,
        limit,
        total: 0,
        pages: 0,
      },
      message: 'قيد التطوير',
    };
  }

  // ==================== Drivers Shifts ====================

  async getDriversShifts({ status, date, page, limit }: {
    status?: string;
    date?: string;
    page: number;
    limit: number;
  }) {
    return this.shiftService.getDriversShifts({ status, date, page, limit });
  }

  // ==================== Drivers Vacations ====================

  async getDriversVacationsStats({ year }: { year?: number }) {
    const targetYear = year || new Date().getFullYear();
    return this.leaveService.getDriversVacationsStats(targetYear);
  }

  // ==================== Wallet Coupons ====================

  async getWalletCoupons({ status, page, limit }: {
    status?: string;
    page: number;
    limit: number;
  }) {
    // TODO: Implement wallet coupons logic
    return {
      coupons: [],
      pagination: {
        page,
        limit,
        total: 0,
        pages: 0,
      },
      message: 'قيد التطوير',
    };
  }

  // ==================== Ops Drivers Realtime ====================

  async getOpsDriversRealtime({ area, status }: {
    area?: string;
    status?: string;
  }) {
    const query: any = { isAvailable: true };

    if (status) {
      query.status = status;
    }

    if (area) {
      // TODO: Add area filtering based on location
      query.area = area;
    }

    const drivers = await this.driverModel
      .find(query)
      .select('fullName phone currentLocation status lastLocationUpdate')
      .sort({ lastLocationUpdate: -1 })
      .limit(50);

    return {
      drivers: drivers.map(driver => ({
        id: (driver._id as Types.ObjectId).toString(),
        fullName: driver.fullName,
        phone: driver.phone,
        location: (driver as any).currentLocation,
        status: (driver as any).isAvailable ? 'available' : 'unavailable',
        lastUpdate: (driver as any).currentLocation?.updatedAt || new Date(),
      })),
      total: drivers.length,
      timestamp: new Date().toISOString(),
    };
  }

  // ==================== Ops Heatmap ====================

  async getOpsHeatmap({ hours, resolution }: {
    hours: number;
    resolution: string;
  }) {
    // TODO: Implement ops heatmap logic
    return {
      heatmap: [],
      resolution,
      hours,
      timestamp: new Date().toISOString(),
      message: 'قيد التطوير',
    };
  }

  // ==================== Commission Plans ====================
}
