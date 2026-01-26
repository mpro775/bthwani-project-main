import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from '../auth/entities/user.entity';
import { Order } from '../order/entities/order.entity';
import { Driver } from '../driver/entities/driver.entity';
import { Vendor } from '../vendor/entities/vendor.entity';
import { Store } from '../store/entities/store.entity';
import { ModerationHelper } from '../../common/utils';
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
 * هذا الـ service يعمل كواجهة موحدة تستدعي الخدمات المتخصصة
 */
@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Driver.name) private driverModel: Model<Driver>,
    @InjectModel(Vendor.name) private vendorModel: Model<Vendor>,
    @InjectModel(Store.name) private storeModel: Model<Store>,
    // Specialized services
    private readonly withdrawalService: WithdrawalService,
    private readonly auditService: AuditService,
    private readonly supportService: SupportAdminService,
    private readonly dataDeletionService: DataDeletionService,
    private readonly settingsService: SettingsService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly securityService: SecurityService,
  ) {}

  // ==================== Dashboard ====================

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

  // ==================== Withdrawals (Delegate to WithdrawalService) ====================

  async getWithdrawals(query?: DTO.GetWithdrawalsQueryDto) {
    return this.withdrawalService.getWithdrawals(query);
  }

  async getPendingWithdrawals() {
    return this.withdrawalService.getPendingWithdrawals();
  }

  async approveWithdrawal(data: DTO.ApproveWithdrawalDto) {
    return this.withdrawalService.approveWithdrawal(data);
  }

  async rejectWithdrawal(data: DTO.RejectWithdrawalDto) {
    return this.withdrawalService.rejectWithdrawal(data);
  }

  // ==================== Support Tickets (Delegate to SupportAdminService) ====================

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

  // ==================== Audit Logs (Delegate to AuditService) ====================

  async getAuditLogs(
    action?: string,
    userId?: string,
    startDate?: string,
    endDate?: string,
    page: number = 1,
    limit: number = 50,
  ) {
    return this.auditService.getAuditLogs(
      action,
      userId,
      startDate,
      endDate,
      page,
      limit,
    );
  }

  async getAuditLogDetails(logId: string) {
    return this.auditService.getAuditLogDetails(logId);
  }

  async getFlaggedAuditLogs() {
    return this.auditService.getFlaggedAuditLogs();
  }

  async getAuditLogsByResource(resource: string, resourceId: string) {
    return this.auditService.getAuditLogsByResource(resource, resourceId);
  }

  // ==================== Data Deletion (Delegate to DataDeletionService) ====================

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

  // ==================== Settings (Delegate to SettingsService) ====================

  async getSettings(category?: string) {
    return this.settingsService.getSettings(category);
  }

  async updateSettings(key: string, value: any, adminId: string) {
    return this.settingsService.updateSetting(key, value, adminId);
  }

  async getPublicSettings() {
    return this.settingsService.getPublicSettings();
  }

  // ==================== Feature Flags (Delegate to FeatureFlagService) ====================

  async getFeatureFlags() {
    return this.featureFlagService.getFeatureFlags();
  }

  async updateFeatureFlag(flag: string, enabled: boolean, adminId: string) {
    return this.featureFlagService.updateFeatureFlag(flag, enabled, adminId);
  }

  async isFeatureEnabled(key: string, userId?: string, userRole?: string) {
    return this.featureFlagService.isEnabled(key, userId, userRole);
  }

  // ==================== Security (Delegate to SecurityService) ====================

  async getFailedPasswordAttempts(threshold: number = 5) {
    return this.securityService.getFailedPasswordAttempts(threshold);
  }

  async getLoginHistory(
    identifier?: string,
    userId?: string,
    page: number = 1,
    limit: number = 50,
  ) {
    return this.securityService.getLoginHistory(
      identifier,
      userId,
      page,
      limit,
    );
  }

  async getSuspiciousActivity() {
    return this.securityService.getSuspiciousActivity();
  }

  // ==================== Store & Vendor Moderation ====================

  async getPendingStores(): Promise<DTO.GetPendingStoresResponseDto> {
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

  async suspendStore(
    storeId: string,
    reason: string,
    adminId: string,
  ): Promise<DTO.ModerateStoreResponseDto> {
    return ModerationHelper.suspend(
      this.storeModel,
      storeId,
      reason,
      adminId,
      'Store',
    );
  }

  async getPendingVendors(): Promise<DTO.GetPendingVendorsResponseDto> {
    const vendors = await this.vendorModel
      .find({ status: 'pending' })
      .limit(50);
    return { data: vendors, total: vendors.length };
  }

  async approveVendor(
    vendorId: string,
    adminId: string,
  ): Promise<DTO.ModerateVendorResponseDto> {
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

  async rejectVendor(
    vendorId: string,
    reason: string,
    adminId: string,
  ): Promise<DTO.ModerateVendorResponseDto> {
    const vendor = await this.vendorModel.findById(vendorId);
    if (!vendor)
      throw new NotFoundException({
        code: 'VENDOR_NOT_FOUND',
        userMessage: 'التاجر غير موجود',
      });

    (
      vendor as unknown as {
        status: string;
        rejectionReason: string;
        rejectedBy: string;
      }
    ).status = 'rejected';
    (vendor as unknown as { rejectionReason: string }).rejectionReason = reason;
    (vendor as unknown as { rejectedBy: string }).rejectedBy = adminId;

    await vendor.save();
    return { success: true, message: 'تم رفض التاجر' };
  }

  async suspendVendor(
    vendorId: string,
    reason: string,
    adminId: string,
  ): Promise<DTO.ModerateVendorResponseDto> {
    return ModerationHelper.suspend(
      this.vendorModel,
      vendorId,
      reason,
      adminId,
      'Vendor',
    );
  }

  // ==================== Users Management ====================

  async getUsers(
    query?: DTO.GetUsersQueryDto,
  ): Promise<DTO.GetUsersResponseDto> {
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

  async getUserDetails(userId: string): Promise<DTO.UserDetailsDto> {
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
      orderStats: orderStats[0] as unknown as {
        totalOrders: 0;
        totalSpent: 0;
        completedOrders: 0;
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

}

