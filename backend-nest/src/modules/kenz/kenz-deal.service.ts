import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { Types } from 'mongoose';
import { Kenz } from './entities/kenz.entity';
import { KenzDeal, KenzDealStatus } from './entities/kenz-deal.entity';
import { WalletService } from '../wallet/wallet.service';
import type BuyWithEscrowDto from './dto/buy-with-escrow.dto';

@Injectable()
export class KenzDealService {
  constructor(
    @InjectModel(Kenz.name) private readonly kenzModel: Model<Kenz>,
    @InjectModel(KenzDeal.name) private readonly dealModel: Model<KenzDeal>,
    private readonly walletService: WalletService,
  ) {}

  /** شراء بالإيكرو: إنشاء صفقة + حجز المبلغ من محفظة المشتري */
  async buyWithEscrow(kenzId: string, buyerId: string, dto: BuyWithEscrowDto) {
    const kenz = await this.kenzModel.findById(kenzId).exec();
    if (!kenz) throw new NotFoundException('الإعلان غير موجود');
    if (!kenz.acceptsEscrow) {
      throw new BadRequestException('هذا الإعلان لا يقبل الدفع بالإيكرو');
    }
    if (kenz.status === 'completed' || kenz.status === 'cancelled') {
      throw new BadRequestException('الإعلان غير متاح للشراء');
    }

    const sellerId = String(kenz.ownerId);
    if (sellerId === buyerId) {
      throw new BadRequestException('لا يمكن شراء إعلانك الخاص');
    }

    const amount = dto.amount;
    if (amount <= 0) {
      throw new BadRequestException('المبلغ يجب أن يكون أكبر من صفر');
    }

    // إنشاء الصفقة أولاً
    const deal = await this.dealModel.create({
      kenzId: new Types.ObjectId(kenzId),
      buyerId: new Types.ObjectId(buyerId),
      sellerId: new Types.ObjectId(sellerId),
      amount,
      status: KenzDealStatus.PENDING,
    });

    try {
      const holdTransaction = await this.walletService.holdFunds(
        buyerId,
        amount,
        String(deal._id),
      );
      const txId = (holdTransaction as any)?._id?.toString?.();
      if (txId) {
        await this.dealModel
          .findByIdAndUpdate(deal._id, {
            walletHoldTransactionId: txId,
          })
          .exec();
      }

      const populated = await this.dealModel
        .findById(deal._id)
        .populate('kenzId', 'title price images')
        .populate('buyerId', 'fullName phone')
        .populate('sellerId', 'fullName phone')
        .lean()
        .exec();

      return {
        success: true,
        message: 'تم إنشاء الصفقة وحجز المبلغ بنجاح',
        deal: populated,
      };
    } catch (err) {
      await this.dealModel.findByIdAndDelete(deal._id).exec();
      throw err;
    }
  }

  /** تأكيد الاستلام (للمشتري فقط) — تحويل المبلغ للبائع */
  async confirmReceived(dealId: string, userId: string) {
    const deal = await this.dealModel
      .findById(dealId)
      .populate('kenzId', 'title')
      .exec();
    if (!deal) throw new NotFoundException('الصفقة غير موجودة');
    if (deal.status !== KenzDealStatus.PENDING) {
      throw new BadRequestException('الصفقة ليست قيد الانتظار');
    }

    const buyerId = String(deal.buyerId);
    if (buyerId !== userId) {
      throw new ForbiddenException('فقط المشتري يمكنه تأكيد الاستلام');
    }

    await this.walletService.completeEscrowTransfer(
      buyerId,
      String(deal.sellerId),
      deal.amount,
      String(deal._id),
    );

    await this.dealModel
      .findByIdAndUpdate(dealId, {
        status: KenzDealStatus.COMPLETED,
        completedAt: new Date(),
      })
      .exec();

    const updated = await this.dealModel
      .findById(dealId)
      .populate('kenzId', 'title price')
      .populate('buyerId', 'fullName phone')
      .populate('sellerId', 'fullName phone')
      .lean()
      .exec();

    return {
      success: true,
      message: 'تم تأكيد الاستلام وتحويل المبلغ للبائع',
      deal: updated,
    };
  }

  /** إلغاء الصفقة (المشتري أو البائع) — إرجاع المبلغ للمشتري */
  async cancelDeal(dealId: string, userId: string) {
    const deal = await this.dealModel.findById(dealId).exec();
    if (!deal) throw new NotFoundException('الصفقة غير موجودة');
    if (deal.status !== KenzDealStatus.PENDING) {
      throw new BadRequestException('لا يمكن إلغاء هذه الصفقة');
    }

    const buyerId = String(deal.buyerId);
    const sellerId = String(deal.sellerId);
    if (buyerId !== userId && sellerId !== userId) {
      throw new ForbiddenException('غير مصرح لك بإلغاء هذه الصفقة');
    }

    await this.walletService.refundHeldFunds(
      buyerId,
      deal.amount,
      String(deal._id),
    );

    await this.dealModel
      .findByIdAndUpdate(dealId, {
        status: KenzDealStatus.CANCELLED,
        cancelledAt: new Date(),
      })
      .exec();

    const updated = await this.dealModel
      .findById(dealId)
      .populate('kenzId', 'title price')
      .populate('buyerId', 'fullName phone')
      .populate('sellerId', 'fullName phone')
      .lean()
      .exec();

    return {
      success: true,
      message: 'تم إلغاء الصفقة وإرجاع المبلغ للمشتري',
      deal: updated,
    };
  }

  /** قائمة صفقات المستخدم (كمشتري أو بائع) */
  async listMyDeals(
    userId: string,
    cursor?: string,
    limit: number = 25,
    role?: 'buyer' | 'seller',
  ) {
    const query: any = {};
    if (role === 'buyer') {
      query.buyerId = new Types.ObjectId(userId);
    } else if (role === 'seller') {
      query.sellerId = new Types.ObjectId(userId);
    } else {
      query.$or = [
        { buyerId: new Types.ObjectId(userId) },
        { sellerId: new Types.ObjectId(userId) },
      ];
    }

    const q = this.dealModel
      .find(query)
      .sort({ createdAt: -1 })
      .populate('kenzId', 'title price images status')
      .populate('buyerId', 'fullName phone')
      .populate('sellerId', 'fullName phone');

    if (cursor) {
      try {
        q.where('_id').lt(new Types.ObjectId(cursor));
      } catch {
        // ignore invalid cursor
      }
    }

    const items = await q.limit(limit + 1).lean().exec();
    const hasNext = items.length > limit;
    const list = hasNext ? items.slice(0, -1) : items;
    const nextCursor = hasNext ? String(list[list.length - 1]._id) : null;

    return { items: list, nextCursor };
  }

  /** تفاصيل صفقة واحدة (للطرفين) */
  async getDealById(dealId: string, userId: string) {
    const deal = await this.dealModel
      .findById(dealId)
      .populate('kenzId', 'title price images status ownerId')
      .populate('buyerId', 'fullName phone')
      .populate('sellerId', 'fullName phone')
      .lean()
      .exec();

    if (!deal) throw new NotFoundException('الصفقة غير موجودة');

    const buyerId = String((deal as any).buyerId?._id ?? (deal as any).buyerId);
    const sellerId = String((deal as any).sellerId?._id ?? (deal as any).sellerId);

    if (buyerId !== userId && sellerId !== userId) {
      throw new ForbiddenException('غير مصرح بعرض هذه الصفقة');
    }

    return deal;
  }

  /** قائمة جميع الصفقات (للأدمن) */
  async listAllDeals(
    filters: { status?: string } = {},
    cursor?: string,
    limit: number = 25,
  ) {
    const query = this.dealModel
      .find()
      .sort({ createdAt: -1 })
      .populate('kenzId', 'title price status')
      .populate('buyerId', 'fullName phone')
      .populate('sellerId', 'fullName phone');

    if (filters.status) {
      query.where('status').equals(filters.status);
    }

    if (cursor) {
      try {
        query.where('_id').lt(new Types.ObjectId(cursor));
      } catch {
        // ignore
      }
    }

    const items = await query.limit(limit + 1).lean().exec();
    const hasNext = items.length > limit;
    const list = hasNext ? items.slice(0, -1) : items;
    const nextCursor = hasNext ? String(list[list.length - 1]._id) : null;

    return { items: list, nextCursor };
  }
}
