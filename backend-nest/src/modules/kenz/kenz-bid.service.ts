import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import type { Model } from 'mongoose';
import { Types } from 'mongoose';
import { Kenz } from './entities/kenz.entity';
import { KenzBid } from './entities/kenz-bid.entity';
import type PlaceBidDto from './dto/place-bid.dto';

@Injectable()
export class KenzBidService {
  constructor(
    @InjectModel(Kenz.name) private readonly kenzModel: Model<Kenz>,
    @InjectModel(KenzBid.name) private readonly bidModel: Model<KenzBid>,
  ) {}

  /** إضافة مزايدة */
  async placeBid(kenzId: string, bidderId: string, dto: PlaceBidDto) {
    const kenz = await this.kenzModel.findById(kenzId).exec();
    if (!kenz) throw new NotFoundException('الإعلان غير موجود');
    if (!kenz.isAuction) throw new BadRequestException('هذا الإعلان ليس مزاداً');
    if (!kenz.auctionEndAt) throw new BadRequestException('المزاد غير مكوّن بشكل صحيح');

    const now = new Date();
    if (new Date(kenz.auctionEndAt) <= now) {
      throw new BadRequestException('انتهى وقت المزاد');
    }

    const ownerId = String(kenz.ownerId);
    if (ownerId === bidderId) {
      throw new BadRequestException('لا يمكنك المزايدة على إعلانك');
    }

    const minAmount = kenz.startingPrice ?? 0;
    const highestBid = await this.bidModel
      .findOne({ kenzId: new Types.ObjectId(kenzId) })
      .sort({ amount: -1 })
      .lean()
      .exec();

    const requiredMin = highestBid ? (highestBid as any).amount : minAmount;
    if (dto.amount <= requiredMin) {
      throw new BadRequestException(
        `المبلغ يجب أن يكون أكبر من ${requiredMin}`,
      );
    }

    const bid = await this.bidModel.create({
      kenzId: new Types.ObjectId(kenzId),
      bidderId: new Types.ObjectId(bidderId),
      amount: dto.amount,
    });

    const populated = await this.bidModel
      .findById(bid._id)
      .populate('bidderId', 'fullName phone')
      .lean()
      .exec();

    return {
      success: true,
      message: 'تمت المزايدة بنجاح',
      bid: populated,
    };
  }

  /** جلب مزايدات إعلان */
  async getBids(kenzId: string, cursor?: string, limit: number = 25) {
    const kenz = await this.kenzModel.findById(kenzId).exec();
    if (!kenz) throw new NotFoundException('الإعلان غير موجود');

    const query = this.bidModel
      .find({ kenzId: new Types.ObjectId(kenzId) })
      .sort({ amount: -1, createdAt: -1 })
      .populate('bidderId', 'fullName phone');

    if (cursor) {
      try {
        query.where({ _id: { $lt: new Types.ObjectId(cursor) } });
      } catch {
        // ignore invalid cursor
      }
    }

    const items = await query.limit(limit + 1).lean().exec();
    const hasNext = items.length > limit;
    const list = hasNext ? items.slice(0, -1) : items;
    const nextCursor = hasNext ? String(list[list.length - 1]._id) : null;

    const highest = list[0];
    return {
      items: list,
      nextCursor,
      highestBid: highest ? (highest as any).amount : null,
      bidCount: await this.bidModel.countDocuments({
        kenzId: new Types.ObjectId(kenzId),
      }),
    };
  }

  /** جلب أعلى مزايدة لإعلان */
  async getHighestBid(kenzId: string) {
    const bid = await this.bidModel
      .findOne({ kenzId: new Types.ObjectId(kenzId) })
      .sort({ amount: -1 })
      .populate('bidderId', 'fullName phone')
      .lean()
      .exec();
    return bid;
  }

  /** إغلاق المزادات المنتهية (Cron كل دقيقة) */
  @Cron(CronExpression.EVERY_MINUTE)
  async closeExpiredAuctions(): Promise<{ closed: number }> {
    const now = new Date();
    const expired = await this.kenzModel
      .find({
        isAuction: true,
        auctionEndAt: { $lte: now },
        status: { $nin: ['completed', 'cancelled'] },
        winnerId: { $exists: false },
      })
      .lean()
      .exec();

    let closed = 0;
    for (const kenz of expired) {
      const highestBid = await this.bidModel
        .findOne({ kenzId: kenz._id })
        .sort({ amount: -1 })
        .lean()
        .exec();

      await this.kenzModel.findByIdAndUpdate(kenz._id, {
        status: 'completed',
        winnerId: highestBid ? (highestBid as any).bidderId : undefined,
        winningBidAmount: highestBid ? (highestBid as any).amount : undefined,
      });
      closed++;
    }
    return { closed };
  }
}
