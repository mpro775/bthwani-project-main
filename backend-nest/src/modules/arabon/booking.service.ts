import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { Types } from 'mongoose';
import { Booking, BookingStatus } from './entities/booking.entity';
import { Arabon } from './entities/arabon.entity';
import { BookingSlot } from './entities/booking-slot.entity';
import { WalletService } from '../wallet/wallet.service';
import { BookingSlotService } from './booking-slot.service';

const LIST_LIMIT = 25;
const VALID_STATUSES = Object.values(BookingStatus);

@Injectable()
export class BookingService {
  constructor(
    @InjectModel(Booking.name) private readonly bookingModel: Model<Booking>,
    @InjectModel(Arabon.name) private readonly arabonModel: Model<Arabon>,
    @InjectModel(BookingSlot.name) private readonly slotModel: Model<BookingSlot>,
    private readonly walletService: WalletService,
    private readonly bookingSlotService: BookingSlotService,
  ) {}

  /**
   * تأكيد حجز: إنشاء سجل حجز، حجز المبلغ من المحفظة، ربط الـ slot بالمستخدم
   */
  async confirmBooking(
    arabonId: string,
    userId: string,
    dto: { slotId: string; depositAmount?: number },
  ): Promise<Booking> {
    const arabon = await this.arabonModel.findById(arabonId).lean<{ ownerId: Types.ObjectId; depositAmount?: number }>().exec();
    if (!arabon) throw new NotFoundException('العربون غير موجود');
    if (String(arabon.ownerId) === String(userId)) {
      throw new BadRequestException('صاحب المنشأة لا يمكنه حجز عربونه');
    }

    const amount = dto.depositAmount ?? arabon.depositAmount ?? 0;
    if (amount < 0) throw new BadRequestException('مبلغ العربون غير صالح');

    const slot = await this.slotModel.findById(dto.slotId).lean<{ arabonId: Types.ObjectId; isBooked: boolean }>().exec();
    if (!slot) throw new NotFoundException('الوقت غير موجود');
    if (String(slot.arabonId) !== String(arabonId)) {
      throw new BadRequestException('الوقت لا يتبع هذا العربون');
    }
    if (slot.isBooked) throw new BadRequestException('هذا الوقت محجوز بالفعل');

    // إنشاء سجل الحجز أولاً (لنستخدم _id في hold)
    const booking = await this.bookingModel.create({
      userId: new Types.ObjectId(userId),
      arabonId: new Types.ObjectId(arabonId),
      slotId: new Types.ObjectId(dto.slotId),
      status: BookingStatus.CONFIRMED,
      depositAmount: amount,
      metadata: {},
    });

    try {
      if (amount > 0) {
        const tx = await this.walletService.holdFunds(userId, amount, String(booking._id));
        await this.bookingModel.findByIdAndUpdate(booking._id, {
          walletTxId: tx?._id ? String(tx._id) : undefined,
        });
        booking.walletTxId = tx?._id ? String(tx._id) : undefined;
      }
      await this.bookingSlotService.reserveSlot(dto.slotId, userId);
    } catch (err) {
      await this.bookingModel.findByIdAndDelete(booking._id);
      throw err;
    }

    return this.bookingModel.findById(booking._id).exec() as Promise<Booking>;
  }

  async findOne(bookingId: string, userId?: string): Promise<Booking> {
    const doc = await this.bookingModel
      .findById(bookingId)
      .populate('arabonId', 'title depositAmount ownerId')
      .populate('slotId', 'datetime durationMinutes')
      .lean()
      .exec();
    if (!doc) throw new NotFoundException('الحجز غير موجود');
    // يمكن السماح لصاحب الحجز أو مالك العربون بعرض التفاصيل
    const booking = doc as Booking & { userId: Types.ObjectId; arabonId: { ownerId: Types.ObjectId } };
    if (userId && String(booking.userId) !== userId && String((booking.arabonId as any)?.ownerId) !== userId) {
      throw new ForbiddenException('غير مصرح بعرض هذا الحجز');
    }
    return doc as Booking;
  }

  async getMyBookings(
    userId: string,
    opts: { status?: string; cursor?: string; limit?: number } = {},
  ): Promise<{ items: Booking[]; nextCursor: string | null }> {
    const filter: Record<string, unknown> = { userId: new Types.ObjectId(userId) };
    if (opts.status && VALID_STATUSES.includes(opts.status as BookingStatus)) {
      filter.status = opts.status;
    }
    const limit = Math.min(opts.limit ?? LIST_LIMIT, 50);
    const cursorId = opts.cursor && Types.ObjectId.isValid(opts.cursor) ? new Types.ObjectId(opts.cursor) : null;
    if (cursorId) (filter as any)._id = { $lt: cursorId };
    const items = await this.bookingModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .populate('arabonId', 'title depositAmount')
      .populate('slotId', 'datetime durationMinutes')
      .lean()
      .exec();
    const hasMore = items.length > limit;
    const result = hasMore ? items.slice(0, -1) : items;
    const nextCursor = hasMore && result.length ? String((result[result.length - 1] as any)._id) : null;
    return { items: result as Booking[], nextCursor };
  }

  async getBookingsByArabon(arabonId: string, userId: string): Promise<{ items: Booking[]; nextCursor: string | null }> {
    const arabon = await this.arabonModel.findById(arabonId).lean<{ ownerId: Types.ObjectId }>().exec();
    if (!arabon) throw new NotFoundException('العربون غير موجود');
    if (String(arabon.ownerId) !== String(userId)) {
      throw new ForbiddenException('عرض حجوزات العربون مسموح لصاحب المنشأة فقط');
    }
    const filter = { arabonId: new Types.ObjectId(arabonId) };
    const items = await this.bookingModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(LIST_LIMIT + 1)
      .populate('userId', 'fullName phone')
      .populate('slotId', 'datetime durationMinutes')
      .lean()
      .exec();
    const hasMore = items.length > LIST_LIMIT;
    const result = hasMore ? items.slice(0, -1) : items;
    const nextCursor = hasMore && result.length ? String((result[result.length - 1] as any)._id) : null;
    return { items: result as Booking[], nextCursor };
  }

  /**
   * تحديث حالة الحجز (للمالك فقط): completed | cancelled | no_show
   * - cancelled: استرداد المبلغ للمستخدم + تحرير الـ slot
   * - completed: إتمام الخصم من المحفظة (المبلغ يُحسب مكتمل)
   * - no_show: إتمام الخصم بدون استرداد + تحرير الـ slot
   */
  async updateStatus(bookingId: string, status: BookingStatus, userId: string): Promise<Booking> {
    const booking = await this.bookingModel.findById(bookingId).lean<{
      userId: Types.ObjectId;
      arabonId: Types.ObjectId;
      slotId: Types.ObjectId;
      status: string;
      depositAmount: number;
    }>().exec();
    if (!booking) throw new NotFoundException('الحجز غير موجود');
    const arabon = await this.arabonModel.findById(booking.arabonId).lean<{ ownerId: Types.ObjectId }>().exec();
    if (!arabon || String(arabon.ownerId) !== String(userId)) {
      throw new ForbiddenException('تحديث الحالة مسموح لصاحب المنشأة فقط');
    }
    if (!VALID_STATUSES.includes(status)) throw new BadRequestException('حالة غير صالحة');
    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException('لا يمكن تغيير حالة حجز غير مؤكد');
    }

    const userIdStr = String(booking.userId);
    const amount = booking.depositAmount ?? 0;
    const orderId = String(bookingId);

    if (status === BookingStatus.CANCELLED) {
      if (amount > 0) await this.walletService.refundHeldFunds(userIdStr, amount, orderId);
      await this.bookingSlotService.releaseSlot(String(booking.slotId));
    } else if (status === BookingStatus.COMPLETED || status === BookingStatus.NO_SHOW) {
      if (amount > 0) await this.walletService.releaseFunds(userIdStr, amount, orderId);
      if (status === BookingStatus.NO_SHOW) {
        await this.bookingSlotService.releaseSlot(String(booking.slotId));
      }
    }

    const updated = await this.bookingModel
      .findByIdAndUpdate(bookingId, { status }, { new: true })
      .populate('arabonId', 'title depositAmount')
      .populate('slotId', 'datetime durationMinutes')
      .exec();
    if (!updated) throw new NotFoundException('الحجز غير موجود');
    return updated;
  }
}
