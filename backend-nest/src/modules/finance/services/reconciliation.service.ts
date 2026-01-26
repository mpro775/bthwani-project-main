import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Reconciliation } from '../entities/reconciliation.entity';
import { Order } from '../../order/entities/order.entity';
import { Commission } from '../entities/commission.entity';
import { PayoutBatch } from '../entities/payout-batch.entity';

@Injectable()
export class ReconciliationService {
  constructor(
    @InjectModel(Reconciliation.name)
    private reconciliationModel: Model<Reconciliation>,
    @InjectModel(Order.name)
    private orderModel: Model<Order>,
    @InjectModel(Commission.name)
    private commissionModel: Model<Commission>,
    @InjectModel(PayoutBatch.name)
    private payoutBatchModel: Model<PayoutBatch>,
  ) {}

  /**
   * إنشاء مطابقة جديدة
   */
  async create(
    startDate: Date,
    endDate: Date,
    periodType: string,
    performedBy: string,
  ): Promise<Reconciliation> {
    // 1. توليد رقم المطابقة
    const reconciliationNumber = await this.generateReconciliationNumber();

    // 2. جمع البيانات من النظام
    const systemTotals = await this.calculateSystemTotals(startDate, endDate);

    // 3. إنشاء المطابقة
    const reconciliation = new this.reconciliationModel({
      reconciliationNumber,
      period: new Date(startDate),
      periodType,
      startDate,
      endDate,
      status: 'pending',
      systemTotals,
      performedBy,
    });

    return reconciliation.save();
  }

  /**
   * حساب الإجماليات من النظام
   */
  private async calculateSystemTotals(startDate: Date, endDate: Date) {
    // عدد الطلبات والإيرادات
    const orders: Array<{ totalOrders: number; totalRevenue: number }> =
      await this.orderModel.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            status: 'delivered',
          },
        },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: '$totalPrice' },
          },
        },
      ]);

    // إجمالي العمولات
    const commissions: Array<{ totalCommissions: number }> =
      await this.commissionModel.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            status: { $in: ['approved', 'paid'] },
          },
        },
        {
          $group: {
            _id: null,
            totalCommissions: { $sum: '$amount' },
          },
        },
      ]);

    // إجمالي الدفعات
    const payouts: Array<{ totalPayouts: number }> =
      await this.payoutBatchModel.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            status: { $in: ['completed', 'processing'] },
          },
        },
        {
          $group: {
            _id: null,
            totalPayouts: { $sum: '$totalAmount' },
          },
        },
      ]);

    return {
      totalOrders: orders[0]?.totalOrders || 0,
      totalRevenue: orders[0]?.totalRevenue || 0,
      totalCommissions: commissions[0]?.totalCommissions || 0,
      totalPayouts: payouts[0]?.totalPayouts || 0,
      totalRefunds: 0, // TODO: حساب المرتجعات
    };
  }

  /**
   * توليد رقم مطابقة فريد
   */
  private async generateReconciliationNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');

    const last = await this.reconciliationModel
      .findOne({
        reconciliationNumber: new RegExp(`^RC-${year}${month}`),
      })
      .sort({ createdAt: -1 });

    let sequence = 1;
    if (last) {
      const lastSequence = parseInt(last.reconciliationNumber.split('-')[2]);
      sequence = lastSequence + 1;
    }

    return `RC-${year}${month}-${String(sequence).padStart(4, '0')}`;
  }

  /**
   * إضافة الإجماليات الفعلية (من البنك)
   */
  async addActualTotals(
    id: string,
    actualTotals: {
      totalDeposits: number;
      totalWithdrawals: number;
      totalFees: number;
    },
  ): Promise<Reconciliation> {
    const reconciliation = await this.reconciliationModel.findById(id);
    if (!reconciliation) {
      throw new NotFoundException('المطابقة غير موجودة');
    }

    reconciliation.actualTotals = actualTotals;
    reconciliation.status = 'in_progress';

    // حساب الفروقات
    const revenueDifference =
      actualTotals.totalDeposits - reconciliation.systemTotals.totalRevenue;
    const payoutDifference =
      actualTotals.totalWithdrawals - reconciliation.systemTotals.totalPayouts;

    reconciliation.discrepancies = {
      revenueDifference,
      commissionDifference: 0,
      payoutDifference,
      unexplainedTransactions: 0,
    };

    // إضافة مشاكل إذا كانت هناك فروقات كبيرة
    if (Math.abs(revenueDifference) > 100) {
      reconciliation.issues = reconciliation.issues || [];
      reconciliation.issues.push({
        type: 'amount_mismatch',
        description: `فرق في الإيرادات: ${revenueDifference} ريال`,
        expectedAmount: reconciliation.systemTotals.totalRevenue,
        actualAmount: actualTotals.totalDeposits,
        resolved: false,
      });
    }

    if (Math.abs(payoutDifference) > 100) {
      reconciliation.issues = reconciliation.issues || [];
      reconciliation.issues.push({
        type: 'amount_mismatch',
        description: `فرق في الدفعات: ${payoutDifference} ريال`,
        expectedAmount: reconciliation.systemTotals.totalPayouts,
        actualAmount: actualTotals.totalWithdrawals,
        resolved: false,
      });
    }

    return reconciliation.save();
  }

  /**
   * إضافة مشكلة يدوياً
   */
  async addIssue(
    id: string,
    issue: {
      type: 'missing_transaction' | 'amount_mismatch' | 'duplicate' | 'other';
      description: string;
      expectedAmount?: number;
      actualAmount?: number;
      transactionRef?: string;
    },
  ): Promise<Reconciliation> {
    const reconciliation = await this.reconciliationModel.findById(id);
    if (!reconciliation) {
      throw new NotFoundException('المطابقة غير موجودة');
    }

    reconciliation.issues = reconciliation.issues || [];
    reconciliation.issues.push({
      ...issue,
      resolved: false,
    });

    reconciliation.status = 'requires_attention';
    return reconciliation.save();
  }

  /**
   * حل مشكلة
   */
  async resolveIssue(
    id: string,
    issueIndex: number,
    resolution: string,
    resolvedBy: string,
  ): Promise<Reconciliation> {
    const reconciliation = await this.reconciliationModel.findById(id);
    if (!reconciliation) {
      throw new NotFoundException('المطابقة غير موجودة');
    }

    if (!reconciliation.issues || !reconciliation.issues[issueIndex]) {
      throw new BadRequestException('المشكلة غير موجودة');
    }

    reconciliation.issues[issueIndex].resolved = true;
    reconciliation.issues[issueIndex].resolvedAt = new Date();
    reconciliation.issues[issueIndex].resolvedBy = new Types.ObjectId(
      resolvedBy,
    );
    reconciliation.issues[issueIndex].resolution = resolution;

    // التحقق إذا تم حل كل المشاكل
    const allResolved = reconciliation.issues.every((issue) => issue.resolved);
    if (allResolved) {
      reconciliation.status = 'completed';
      reconciliation.completedAt = new Date();
    }

    return reconciliation.save();
  }

  /**
   * الحصول على مطابقة
   */
  async findById(id: string): Promise<Reconciliation> {
    const reconciliation = await this.reconciliationModel.findById(id);
    if (!reconciliation) {
      throw new NotFoundException('المطابقة غير موجودة');
    }
    return reconciliation;
  }

  /**
   * الحصول على كل المطابقات
   */
  async findAll(status?: string): Promise<any[]> {
    const query: Record<string, any> = {};
    if (status) query.status = status;

    return this.reconciliationModel
      .find(query)
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  /**
   * إحصائيات المطابقات
   */
  async getStatistics() {
    const stats: Array<{
      _id: string;
      count: number;
      totalIssues: number;
    }> = await this.reconciliationModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalIssues: { $sum: { $size: { $ifNull: ['$issues', []] } } },
        },
      },
    ]);

    return stats;
  }
}
