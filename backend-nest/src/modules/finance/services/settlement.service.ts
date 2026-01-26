import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Types, Connection, ClientSession } from 'mongoose';
import { Settlement } from '../entities/settlement.entity';
import { Order } from '../../order/entities/order.entity';
import {
  CreateSettlementDto,
  ApproveSettlementDto,
} from '../dto/create-settlement.dto';
import { TransactionHelper } from '../../../common/utils';

@Injectable()
export class SettlementService {
  constructor(
    @InjectModel(Settlement.name)
    private settlementModel: Model<Settlement>,
    @InjectModel(Order.name)
    private orderModel: Model<Order>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  /**
   * إنشاء تسوية جديدة - مع Transaction
   */
  async create(dto: CreateSettlementDto): Promise<Settlement> {
    return TransactionHelper.executeInTransaction(
      this.connection,
      async (session) => {
        // 1. التحقق من الطلبات إذا كانت محددة
        let orders: Order[] = [];
        if (dto.orders && dto.orders.length > 0) {
          orders = await this.orderModel
            .find({
              _id: { $in: dto.orders },
              status: 'delivered',
            })
            .session(session);
        } else {
          // إذا لم تُحدد طلبات، جلب كل طلبات الفترة
          orders = await this.orderModel
            .find({
              [dto.entityModel === 'Vendor' ? 'vendor' : 'driver']: dto.entity,
              status: 'delivered',
              createdAt: {
                $gte: new Date(dto.periodStart),
                $lte: new Date(dto.periodEnd),
              },
            })
            .session(session);
        }

        if (orders.length === 0) {
          throw new BadRequestException('لا توجد طلبات مكتملة في هذه الفترة');
        }

        // 2. حساب الإجماليات
        const calculations = this.calculateSettlement(orders, dto.entityModel);

        // 3. توليد رقم التسوية
        const settlementNumber = await this.generateSettlementNumber(session);

        // 4. إنشاء التسوية
        const [settlement] = await this.settlementModel.create(
          [
            {
              settlementNumber,
              entity: dto.entity,
              entityModel: dto.entityModel,
              periodStart: new Date(dto.periodStart),
              periodEnd: new Date(dto.periodEnd),
              totalRevenue: calculations.totalRevenue,
              totalCommission: calculations.totalCommission,
              totalDeductions: calculations.totalDeductions,
              netAmount: calculations.netAmount,
              ordersCount: orders.length,
              orders: orders.map((o) => o._id),
              status: 'draft',
              notes: dto.notes,
              breakdown: calculations.breakdown,
            },
          ],
          { session },
        );

        return settlement;
      },
    );
  }

  /**
   * حساب التسوية
   */
  private calculateSettlement(orders: Order[], entityModel: string) {
    let totalRevenue = 0;
    let totalCommission = 0;
    const totalDeductions = 0;
    let deliveryFees = 0;
    let tips = 0;

    for (const order of orders) {
      if (entityModel === 'Vendor') {
        // تسوية التاجر
        totalRevenue += order.price || 0;
        totalCommission += order.platformShare || 0;
      } else if (entityModel === 'Driver') {
        // تسوية السائق
        deliveryFees += order.deliveryFee || 0;
        tips += 0; // TODO: Add tip field to Order entity
        totalRevenue = deliveryFees + tips;
        totalCommission += 0; // TODO: Add driver commission calculation
      }
    }

    const netAmount = totalRevenue - totalCommission - totalDeductions;

    return {
      totalRevenue,
      totalCommission,
      totalDeductions,
      netAmount,
      breakdown: {
        deliveryFees: entityModel === 'Driver' ? deliveryFees : 0,
        tips: entityModel === 'Driver' ? tips : 0,
        bonuses: 0,
        penalties: 0,
        adjustments: 0,
      },
    };
  }

  /**
   * توليد رقم تسوية فريد
   */
  private async generateSettlementNumber(
    session?: ClientSession,
  ): Promise<string> {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');

    const query = this.settlementModel
      .findOne({
        settlementNumber: new RegExp(`^ST-${year}${month}`),
      })
      .sort({ createdAt: -1 });

    if (session) {
      query.session(session);
    }

    const lastSettlement = await query;

    let sequence = 1;
    if (lastSettlement) {
      const lastSequence = parseInt(
        lastSettlement.settlementNumber.split('-')[2],
      );
      sequence = lastSequence + 1;
    }

    return `ST-${year}${month}-${String(sequence).padStart(4, '0')}`;
  }

  /**
   * الحصول على تسوية
   */
  async findById(id: string): Promise<Settlement> {
    const settlement = await this.settlementModel
      .findById(id)
      .populate('orders');
    if (!settlement) {
      throw new NotFoundException('التسوية غير موجودة');
    }
    return settlement;
  }

  /**
   * الحصول على تسويات كيان معين
   */
  async findByEntity(
    entity: string,
    entityModel: string,
    status?: string,
  ): Promise<any[]> {
    const query: Record<string, any> = { entity, entityModel };
    if (status) query.status = status;

    return this.settlementModel
      .find(query)
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  /**
   * الموافقة على تسوية - مع Transaction
   */
  async approve(
    id: string,
    dto: ApproveSettlementDto,
    approvedBy: string,
  ): Promise<Settlement> {
    return TransactionHelper.executeInTransaction(
      this.connection,
      async (session) => {
        const settlement = await this.settlementModel
          .findById(id)
          .session(session);
        if (!settlement) {
          throw new NotFoundException('التسوية غير موجودة');
        }

        if (
          settlement.status !== 'draft' &&
          settlement.status !== 'pending_approval'
        ) {
          throw new BadRequestException('التسوية تم معالجتها مسبقاً');
        }

        settlement.status = 'approved';
        settlement.approvedBy = approvedBy as unknown as Types.ObjectId;
        settlement.approvedAt = new Date();
        if (dto.notes) {
          settlement.notes = `${settlement.notes || ''}\n${dto.notes}`;
        }

        return settlement.save({ session });
      },
    );
  }

  /**
   * ربط تسوية بدفعة دفع - مع Transaction
   */
  async linkToPayoutBatch(
    id: string,
    payoutBatchId: string,
  ): Promise<Settlement> {
    return TransactionHelper.executeInTransaction(
      this.connection,
      async (session) => {
        const settlement = await this.settlementModel
          .findById(id)
          .session(session);
        if (!settlement) {
          throw new NotFoundException('التسوية غير موجودة');
        }

        if (settlement.status !== 'approved') {
          throw new BadRequestException('يجب الموافقة على التسوية أولاً');
        }

        settlement.payoutBatch = payoutBatchId as unknown as Types.ObjectId;
        settlement.status = 'paid';
        settlement.paidAt = new Date();

        return settlement.save({ session });
      },
    );
  }

  /**
   * إلغاء تسوية
   */
  async cancel(id: string, reason: string): Promise<Settlement> {
    const settlement = await this.settlementModel.findById(id);
    if (!settlement) {
      throw new NotFoundException('التسوية غير موجودة');
    }

    if (settlement.status === 'paid') {
      throw new BadRequestException('لا يمكن إلغاء تسوية مدفوعة');
    }

    settlement.status = 'cancelled';
    settlement.notes = `${settlement.notes || ''}\nسبب الإلغاء: ${reason}`;

    return settlement.save();
  }

  /**
   * إحصائيات التسويات
   */
  async getStatistics(entity: string, entityModel: string) {
    const stats: Array<{
      _id: string;
      totalNet: number;
      totalRevenue: number;
      totalCommission: number;
      count: number;
    }> = await this.settlementModel.aggregate([
      { $match: { entity, entityModel } },
      {
        $group: {
          _id: '$status',
          totalNet: { $sum: '$netAmount' },
          totalRevenue: { $sum: '$totalRevenue' },
          totalCommission: { $sum: '$totalCommission' },
          count: { $sum: 1 },
        },
      },
    ]);

    return stats;
  }
}
