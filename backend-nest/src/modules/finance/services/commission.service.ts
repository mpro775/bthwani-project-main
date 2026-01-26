import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Commission } from '../entities/commission.entity';
import { CreateCommissionDto } from '../dto/create-commission.dto';

@Injectable()
export class CommissionService {
  constructor(
    @InjectModel(Commission.name)
    private commissionModel: Model<Commission>,
  ) {}

  /**
   * إنشاء عمولة جديدة
   */
  async create(dto: CreateCommissionDto): Promise<Commission> {
    const commission = new this.commissionModel({
      ...dto,
      status: 'pending',
    });
    return commission.save();
  }

  /**
   * حساب عمولة تلقائياً بناءً على النسبة
   */
  calculateCommission(
    baseAmount: number,
    rate: number,
    calculationType: 'percentage' | 'fixed',
  ): number {
    if (calculationType === 'percentage') {
      return (baseAmount * rate) / 100;
    }
    return rate; // Fixed amount
  }

  /**
   * الحصول على عمولات كيان معين
   */
  async getByEntity(entityId: string, entityModel: string): Promise<any[]> {
    return this.commissionModel
      .find({ entityId, entityModel })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  /**
   * الحصول على عمولات مستفيد معين
   */
  async getByBeneficiary(beneficiary: string, status?: string): Promise<any[]> {
    const query: Record<string, any> = { beneficiary };
    if (status) {
      query.status = status;
    }
    return this.commissionModel
      .find(query)
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  /**
   * الموافقة على عمولة
   */
  async approve(id: string): Promise<Commission> {
    const commission = await this.commissionModel.findById(id);
    if (!commission) {
      throw new NotFoundException('العمولة غير موجودة');
    }
    if (commission.status !== 'pending') {
      throw new BadRequestException('العمولة تم معالجتها مسبقاً');
    }
    commission.status = 'approved';
    return commission.save();
  }

  /**
   * إلغاء عمولة
   */
  async cancel(id: string): Promise<Commission> {
    const commission = await this.commissionModel.findById(id);
    if (!commission) {
      throw new NotFoundException('العمولة غير موجودة');
    }
    if (commission.status === 'paid') {
      throw new BadRequestException('لا يمكن إلغاء عمولة مدفوعة');
    }
    commission.status = 'cancelled';
    return commission.save();
  }

  /**
   * الحصول على إحصائيات العمولات
   */
  async getStatistics(beneficiary: string) {
    const stats: Array<{ _id: string; total: number; count: number }> =
      await this.commissionModel.aggregate([
        { $match: { beneficiary: beneficiary } },
        {
          $group: {
            _id: '$status',
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]);

    return {
      pending: stats.find((s) => s._id === 'pending') || {
        total: 0,
        count: 0,
      },
      approved: stats.find((s) => s._id === 'approved') || {
        total: 0,
        count: 0,
      },
      paid: stats.find((s) => s._id === 'paid') || { total: 0, count: 0 },
    };
  }
}
