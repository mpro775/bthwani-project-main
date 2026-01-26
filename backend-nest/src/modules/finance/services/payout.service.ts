import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PayoutBatch } from '../entities/payout-batch.entity';
import { PayoutItem } from '../entities/payout-item.entity';
import { Commission } from '../entities/commission.entity';
import {
  CreatePayoutBatchDto,
  ApprovePayoutBatchDto,
} from '../dto/create-payout-batch.dto';

@Injectable()
export class PayoutService {
  constructor(
    @InjectModel(PayoutBatch.name)
    private payoutBatchModel: Model<PayoutBatch>,
    @InjectModel(PayoutItem.name)
    private payoutItemModel: Model<PayoutItem>,
    @InjectModel(Commission.name)
    private commissionModel: Model<Commission>,
  ) {}

  /**
   * إنشاء دفعة دفع جديدة من العمولات المعتمدة
   */
  async createBatchFromCommissions(
    commissionIds: string[],
    dto: CreatePayoutBatchDto,
    createdBy: string,
  ): Promise<PayoutBatch> {
    // 1. التحقق من العمولات
    const commissions = await this.commissionModel.find({
      _id: { $in: commissionIds },
      status: 'approved',
      payoutBatch: { $exists: false },
    });

    if (commissions.length === 0) {
      throw new BadRequestException('لا توجد عمولات معتمدة ومتاحة للدفع');
    }

    // 2. حساب الإجماليات
    const totalAmount = commissions.reduce((sum, c) => sum + c.amount, 0);

    // 3. توليد رقم الدفعة
    const batchNumber = await this.generateBatchNumber();

    // 4. إنشاء الدفعة
    const batch = new this.payoutBatchModel({
      batchNumber,
      totalAmount,
      itemsCount: commissions.length,
      status: 'pending',
      paymentMethod: dto.paymentMethod,
      scheduledFor: dto.scheduledFor,
      notes: dto.notes,
      createdBy,
    });

    await batch.save();

    // 5. إنشاء عناصر الدفعة وتحديث العمولات
    const payoutItems: any[] = [];
    for (const commission of commissions) {
      const item = new this.payoutItemModel({
        batchId: batch._id,
        recipient: commission.beneficiary,
        recipientModel:
          commission.beneficiaryType === 'driver'
            ? 'Driver'
            : commission.beneficiaryType === 'vendor'
              ? 'Vendor'
              : commission.beneficiaryType === 'marketer'
                ? 'Marketer'
                : 'User',
        amount: commission.amount,
        status: 'pending',
        type: 'commission',
        metadata: {
          commissionId: commission._id,
          entityId: commission.entityId,
          entityModel: commission.entityModel,
        },
      });
      payoutItems.push(item.save());

      // تحديث العمولة
      commission.payoutBatch = batch._id as Types.ObjectId;
      await commission.save();
    }

    await Promise.all(payoutItems);

    return batch;
  }

  /**
   * توليد رقم دفعة فريد
   */
  private async generateBatchNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');

    // البحث عن آخر رقم دفعة في هذا الشهر
    const lastBatch = await this.payoutBatchModel
      .findOne({
        batchNumber: new RegExp(`^PB-${year}${month}`),
      })
      .sort({ createdAt: -1 });

    let sequence = 1;
    if (lastBatch) {
      const lastSequence = parseInt(lastBatch.batchNumber.split('-')[2]);
      sequence = lastSequence + 1;
    }

    return `PB-${year}${month}-${String(sequence).padStart(4, '0')}`;
  }

  /**
   * الحصول على دفعة بالمعرف
   */
  async findById(id: string): Promise<PayoutBatch> {
    const batch = await this.payoutBatchModel.findById(id);
    if (!batch) {
      throw new NotFoundException('الدفعة غير موجودة');
    }
    return batch;
  }

  /**
   * الحصول على كل الدفعات مع فلترة
   */
  async findAll(status?: string, limit = 20, cursor?: string): Promise<any> {
    const query: Record<string, any> = {};
    if (status) query.status = status;
    if (cursor) query._id = { $lt: cursor };

    const batches = await this.payoutBatchModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .lean()
      .exec();

    const hasMore = batches.length > limit;
    const results = hasMore ? batches.slice(0, -1) : batches;

    return {
      data: results,
      pagination: {
        nextCursor: hasMore ? results[results.length - 1]._id : null,
        hasMore,
        limit,
      },
    };
  }

  /**
   * الحصول على عناصر دفعة
   */
  async getBatchItems(batchId: string): Promise<any[]> {
    return this.payoutItemModel.find({ batchId }).lean().exec();
  }

  /**
   * الموافقة على دفعة
   */
  async approve(
    id: string,
    dto: ApprovePayoutBatchDto,
    approvedBy: string,
  ): Promise<PayoutBatch> {
    const batch = await this.payoutBatchModel.findById(id);
    if (!batch) {
      throw new NotFoundException('الدفعة غير موجودة');
    }

    if (batch.status !== 'pending') {
      throw new BadRequestException('الدفعة تم معالجتها مسبقاً');
    }

    batch.status = 'processing';
    batch.approvedBy = approvedBy as unknown as Types.ObjectId;
    batch.approvedAt = new Date();
    batch.bankReference = dto.bankReference;
    if (dto.notes) batch.notes = dto.notes;

    return batch.save();
  }

  /**
   * إكمال معالجة دفعة (تم الدفع)
   */
  async complete(
    id: string,
    transactionIds: Record<string, string>,
  ): Promise<PayoutBatch> {
    const batch = await this.payoutBatchModel.findById(id);
    if (!batch) {
      throw new NotFoundException('الدفعة غير موجودة');
    }

    if (batch.status !== 'processing') {
      throw new BadRequestException('الدفعة يجب أن تكون قيد المعالجة');
    }

    // تحديث عناصر الدفعة
    const items = await this.payoutItemModel.find({ batchId: id });

    for (const item of items) {
      const itemId = String(item._id);
      if (transactionIds[itemId]) {
        item.status = 'processed';
        item.transactionId = transactionIds[itemId];
        item.processedAt = new Date();
        await item.save();

        // تحديث العمولة إلى مدفوعة
        if (item.metadata?.commissionId) {
          await this.commissionModel.findByIdAndUpdate(
            item.metadata.commissionId,
            { status: 'paid', paidAt: new Date() },
          );
        }
      }
    }

    batch.status = 'completed';
    batch.processedAt = new Date();
    return batch.save();
  }

  /**
   * إلغاء دفعة
   */
  async cancel(id: string, reason: string): Promise<PayoutBatch> {
    const batch = await this.payoutBatchModel.findById(id);
    if (!batch) {
      throw new NotFoundException('الدفعة غير موجودة');
    }

    if (batch.status === 'completed') {
      throw new BadRequestException('لا يمكن إلغاء دفعة مكتملة');
    }

    // إلغاء كل العناصر
    await this.payoutItemModel.updateMany(
      { batchId: id },
      { status: 'failed', failureReason: reason },
    );

    // إزالة ربط العمولات بالدفعة
    await this.commissionModel.updateMany(
      { payoutBatch: id },
      { $unset: { payoutBatch: 1 } },
    );

    batch.status = 'cancelled';
    batch.notes = `${batch.notes || ''}\nسبب الإلغاء: ${reason}`;
    return batch.save();
  }

  /**
   * إحصائيات الدفعات
   */
  async getStatistics(startDate?: Date, endDate?: Date) {
    const matchStage: {
      createdAt?: { $gte?: Date; $lte?: Date };
    } = {};
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = startDate;
      if (endDate) matchStage.createdAt.$lte = endDate;
    }

    const stats: Array<{
      _id: string;
      totalAmount: number;
      count: number;
    }> = await this.payoutBatchModel.aggregate([
      ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
      {
        $group: {
          _id: '$status',
          totalAmount: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {
      pending: { totalAmount: 0, count: 0 },
      processing: { totalAmount: 0, count: 0 },
      completed: { totalAmount: 0, count: 0 },
      failed: { totalAmount: 0, count: 0 },
      cancelled: { totalAmount: 0, count: 0 },
    };

    stats.forEach((stat) => {
      if (result[stat._id]) {
        result[stat._id] = {
          totalAmount: stat.totalAmount,
          count: stat.count,
        };
      }
    });

    return result;
  }
}
