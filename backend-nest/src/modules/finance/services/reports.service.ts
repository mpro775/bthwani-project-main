import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DailyReport } from '../entities/daily-report.entity';
import { Order } from '../../order/entities/order.entity';
import { Commission } from '../entities/commission.entity';
import { PayoutBatch } from '../entities/payout-batch.entity';
import { Settlement } from '../entities/settlement.entity';
import { FinancialCoupon } from '../entities/financial-coupon.entity';
import { WalletTransaction } from '../../wallet/entities/wallet-transaction.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(DailyReport.name)
    private dailyReportModel: Model<DailyReport>,
    @InjectModel(Order.name)
    private orderModel: Model<Order>,
    @InjectModel(Commission.name)
    private commissionModel: Model<Commission>,
    @InjectModel(PayoutBatch.name)
    private payoutBatchModel: Model<PayoutBatch>,
    @InjectModel(Settlement.name)
    private settlementModel: Model<Settlement>,
    @InjectModel(FinancialCoupon.name)
    private couponModel: Model<FinancialCoupon>,
    @InjectModel(WalletTransaction.name)
    private walletModel: Model<WalletTransaction>,
  ) {}

  /**
   * إنشاء تقرير يومي
   */
  async generateDailyReport(date: Date): Promise<DailyReport> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // التحقق من عدم وجود تقرير لهذا اليوم
    const existing = await this.dailyReportModel.findOne({ date: startOfDay });
    if (existing) {
      return existing; // إرجاع التقرير الموجود
    }

    // جمع البيانات
    const [
      orders,
      revenue,
      commissions,
      payouts,
      settlements,
      coupons,
      wallet,
    ] = await Promise.all([
      this.getOrdersStats(startOfDay, endOfDay),
      this.getRevenueBreakdown(startOfDay, endOfDay),
      this.getCommissionsStats(startOfDay, endOfDay),
      this.getPayoutsStats(startOfDay, endOfDay),
      this.getSettlementsStats(startOfDay, endOfDay),
      this.getCouponsStats(startOfDay, endOfDay),
      this.getWalletStats(startOfDay, endOfDay),
    ]);

    // توليد رقم التقرير
    const reportNumber = this.generateReportNumber(date);

    const report = new this.dailyReportModel({
      date: startOfDay,
      reportNumber,
      orders,
      revenue,
      commissions,
      payouts,
      settlements,
      coupons,
      wallet,
      users: {
        newRegistrations: 0,
        activeUsers: 0,
        newOrders: 0,
        returningCustomers: 0,
      },
      status: 'draft',
      generatedBy: 'system',
    });

    return report.save();
  }

  /**
   * إحصائيات الطلبات
   */
  private async getOrdersStats(startDate: Date, endDate: Date) {
    const stats: Array<{
      _id: string;
      count: number;
      totalValue: number;
    }> = await this.orderModel.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$totalPrice' },
        },
      },
    ]);

    const total = stats.reduce((sum, s) => sum + s.count, 0);
    const totalValue = stats.reduce((sum, s) => sum + (s.totalValue || 0), 0);
    const completed = stats.find((s) => s._id === 'delivered')?.count || 0;
    const cancelled = stats.find((s) => s._id === 'cancelled')?.count || 0;
    const pending = stats.find((s) => s._id === 'created')?.count || 0;

    return {
      total,
      completed,
      cancelled,
      pending,
      totalValue,
      averageOrderValue: total > 0 ? totalValue / total : 0,
    };
  }

  /**
   * تفصيل الإيرادات
   */
  private async getRevenueBreakdown(startDate: Date, endDate: Date) {
    const orders: Array<{
      totalGross: number;
      deliveryFees: number;
      tips: number;
    }> = await this.orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: 'delivered',
        },
      },
      {
        $group: {
          _id: null,
          totalGross: { $sum: '$totalPrice' },
          deliveryFees: { $sum: '$deliveryFee' },
          tips: { $sum: { $ifNull: ['$tip', 0] } },
        },
      },
    ]);

    const data = orders[0] || { totalGross: 0, deliveryFees: 0, tips: 0 };
    const platformCommission = data.totalGross * 0.15; // 15% commission

    return {
      totalGross: data.totalGross,
      platformCommission,
      deliveryFees: data.deliveryFees,
      tips: data.tips,
      other: 0,
      totalNet: data.totalGross - platformCommission,
    };
  }

  /**
   * إحصائيات العمولات
   */
  private async getCommissionsStats(startDate: Date, endDate: Date) {
    const stats: Array<{
      _id: { type: string; status: string };
      count: number;
      total: number;
    }> = await this.commissionModel.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: { type: '$beneficiaryType', status: '$status' },
          count: { $sum: 1 },
          total: { $sum: '$amount' },
        },
      },
    ]);

    const drivers = stats
      .filter((s) => s._id.type === 'driver')
      .reduce(
        (acc, s) => ({
          count: acc.count + s.count,
          total: acc.total + s.total,
        }),
        { count: 0, total: 0 },
      );

    const vendors = stats
      .filter((s) => s._id.type === 'vendor')
      .reduce(
        (acc, s) => ({
          count: acc.count + s.count,
          total: acc.total + s.total,
        }),
        { count: 0, total: 0 },
      );

    const marketers = stats
      .filter((s) => s._id.type === 'marketer')
      .reduce(
        (acc, s) => ({
          count: acc.count + s.count,
          total: acc.total + s.total,
        }),
        { count: 0, total: 0 },
      );

    const totalPaid = stats
      .filter((s) => s._id.status === 'paid')
      .reduce((sum, s) => sum + s.total, 0);

    const totalPending = stats
      .filter((s) => s._id.status === 'pending')
      .reduce((sum, s) => sum + s.total, 0);

    return { drivers, vendors, marketers, totalPaid, totalPending };
  }

  /**
   * إحصائيات الدفعات
   */
  private async getPayoutsStats(startDate: Date, endDate: Date) {
    const stats: Array<{
      _id: string;
      count: number;
      totalAmount: number;
      itemsCount: number;
    }> = await this.payoutBatchModel.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
          itemsCount: { $sum: '$itemsCount' },
        },
      },
    ]);

    const batchesCreated = stats.reduce((sum, s) => sum + s.count, 0);
    const batchesCompleted =
      stats.find((s) => s._id === 'completed')?.count || 0;
    const totalAmount = stats.reduce((sum, s) => sum + s.totalAmount, 0);
    const itemsCount = stats.reduce((sum, s) => sum + s.itemsCount, 0);

    return { batchesCreated, batchesCompleted, totalAmount, itemsCount };
  }

  /**
   * إحصائيات التسويات
   */
  private async getSettlementsStats(startDate: Date, endDate: Date) {
    const stats: Array<{
      _id: string;
      count: number;
      totalAmount: number;
    }> = await this.settlementModel.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: '$entityModel',
          count: { $sum: 1 },
          totalAmount: { $sum: '$netAmount' },
        },
      },
    ]);

    const vendorSettlements = stats.find((s) => s._id === 'Vendor')?.count || 0;
    const driverSettlements = stats.find((s) => s._id === 'Driver')?.count || 0;
    const totalAmount = stats.reduce((sum, s) => sum + s.totalAmount, 0);

    return { vendorSettlements, driverSettlements, totalAmount };
  }

  /**
   * إحصائيات الكوبونات
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/require-await
  private async getCouponsStats(startDate: Date, endDate: Date) {
    // TODO: تتبع استخدام الكوبونات (يحتاج جدول منفصل)
    return {
      used: 0,
      totalDiscount: 0,
      mostUsedCode: '',
      mostUsedCount: 0,
    };
  }

  /**
   * إحصائيات المحفظة
   */
  private async getWalletStats(startDate: Date, endDate: Date) {
    const stats: Array<{
      _id: string;
      count: number;
      total: number;
    }> = await this.walletModel.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          total: { $sum: '$amount' },
        },
      },
    ]);

    const deposits = stats.find((s) => s._id === 'credit')?.total || 0;
    const withdrawals = stats.find((s) => s._id === 'debit')?.total || 0;
    const transactions = stats.reduce((sum, s) => sum + s.count, 0);

    return {
      deposits,
      withdrawals,
      totalBalance: deposits - withdrawals,
      transactions,
    };
  }

  /**
   * توليد رقم تقرير
   */
  private generateReportNumber(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `DR-${year}-${month}-${day}`;
  }

  /**
   * الحصول على تقرير يومي
   */
  async getDailyReport(date: Date): Promise<DailyReport | null> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    return this.dailyReportModel.findOne({ date: startOfDay });
  }

  /**
   * الحصول على تقارير نطاق زمني
   */
  async getReports(startDate: Date, endDate: Date): Promise<any[]> {
    return this.dailyReportModel
      .find({
        date: { $gte: startDate, $lte: endDate },
      })
      .sort({ date: -1 })
      .lean()
      .exec();
  }

  /**
   * تثبيت تقرير
   */
  async finalizeReport(id: string): Promise<DailyReport> {
    const report = await this.dailyReportModel.findById(id);
    if (!report) {
      throw new Error('التقرير غير موجود');
    }

    report.status = 'finalized';
    report.finalizedAt = new Date();
    return report.save();
  }
}
