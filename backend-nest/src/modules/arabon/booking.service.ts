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
import { CouponService } from '../finance/services/coupon.service';

const LIST_LIMIT = 25;
const VALID_STATUSES = Object.values(BookingStatus);

/**
 * سياسة الاسترداد للحجوزات (توثيق للمرحلة 4):
 * - cancelled (قبل الموعد): استرداد كامل للمستخدم + تحرير الـ slot
 * - completed: تحويل المبلغ المحجوز للمالك (الإيكرو يُكتمل)
 * - no_show: عدم استرداد للمستخدم؛ المبلغ يُحوّل للمالك + تحرير الـ slot
 */

@Injectable()
export class BookingService {
  constructor(
    @InjectModel(Booking.name) private readonly bookingModel: Model<Booking>,
    @InjectModel(Arabon.name) private readonly arabonModel: Model<Arabon>,
    @InjectModel(BookingSlot.name) private readonly slotModel: Model<BookingSlot>,
    private readonly walletService: WalletService,
    private readonly bookingSlotService: BookingSlotService,
    private readonly couponService: CouponService,
  ) {}

  /**
   * تأكيد حجز: إنشاء سجل حجز، حجز المبلغ من المحفظة، ربط الـ slot بالمستخدم
   * يدعم كوبونات الخصم (بما فيها كوبونات أول حجز)
   */
  async confirmBooking(
    arabonId: string,
    userId: string,
    dto: { slotId: string; depositAmount?: number; couponCode?: string; couponId?: string },
  ): Promise<Booking> {
    const arabon = await this.arabonModel.findById(arabonId).lean<{ ownerId: Types.ObjectId; depositAmount?: number }>().exec();
    if (!arabon) throw new NotFoundException('العربون غير موجود');
    if (String(arabon.ownerId) === String(userId)) {
      throw new BadRequestException('صاحب المنشأة لا يمكنه حجز عربونه');
    }

    let amount = dto.depositAmount ?? arabon.depositAmount ?? 0;
    if (amount < 0) throw new BadRequestException('مبلغ العربون غير صالح');

    const slot = await this.slotModel.findById(dto.slotId).lean<{ arabonId: Types.ObjectId; isBooked: boolean }>().exec();
    if (!slot) throw new NotFoundException('الوقت غير موجود');
    if (String(slot.arabonId) !== String(arabonId)) {
      throw new BadRequestException('الوقت لا يتبع هذا العربون');
    }
    if (slot.isBooked) throw new BadRequestException('هذا الوقت محجوز بالفعل');

    // التحقق من الكوبون وتطبيق الخصم
    let couponCode: string | undefined;
    let couponId: string | undefined;
    let discountAmount = 0;
    if (dto.couponCode || dto.couponId) {
      const code = dto.couponCode || (dto.couponId ? (await this.couponService.findById(dto.couponId))?.code : undefined);
      if (!code) throw new BadRequestException('كود الكوبون غير صالح');
      const hasPreviousBooking = await this.bookingModel
        .countDocuments({ userId: new Types.ObjectId(userId) })
        .exec();
      const validation = await this.couponService.validate(
        { code, orderAmount: amount },
        userId,
        { hasPreviousBooking: hasPreviousBooking > 0 },
      );
      if (!validation.valid) {
        throw new BadRequestException(validation.message || 'الكوبون غير صالح');
      }
      discountAmount = validation.discountAmount ?? 0;
      couponCode = validation.code;
      couponId = validation.couponId ? String(validation.couponId) : undefined;
      amount = Math.max(0, amount - discountAmount);
    }

    const metadata: Record<string, unknown> = {};
    if (couponId) metadata.couponId = couponId;
    if (couponCode) metadata.couponCode = couponCode;
    if (discountAmount > 0) metadata.discountAmount = discountAmount;

    // إنشاء سجل الحجز أولاً (لنستخدم _id في hold)
    const booking = await this.bookingModel.create({
      userId: new Types.ObjectId(userId),
      arabonId: new Types.ObjectId(arabonId),
      slotId: new Types.ObjectId(dto.slotId),
      status: BookingStatus.CONFIRMED,
      depositAmount: amount,
      metadata,
    });

    try {
      if (amount > 0) {
        const tx = await this.walletService.holdFunds(
          userId,
          amount,
          String(booking._id),
          'booking_deposit',
        );
        await this.bookingModel.findByIdAndUpdate(booking._id, {
          walletTxId: tx?._id ? String(tx._id) : undefined,
        });
        booking.walletTxId = tx?._id ? String(tx._id) : undefined;
      }
      if (couponId) {
        await this.couponService.apply(couponId, userId);
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
    const booking = doc as unknown as Booking & { userId: Types.ObjectId; arabonId: { ownerId: Types.ObjectId } };
    if (userId && String(booking.userId) !== userId && String((booking.arabonId as any)?.ownerId) !== userId) {
      throw new ForbiddenException('غير مصرح بعرض هذا الحجز');
    }
    return doc as unknown as Booking;
  }

  async getMyBookings(
    userId: string,
    opts: { status?: string; cursor?: string; limit?: number; from?: string; to?: string } = {},
  ): Promise<{ items: Booking[]; nextCursor: string | null }> {
    const filter: Record<string, unknown> = { userId: new Types.ObjectId(userId) };
    if (opts.status && VALID_STATUSES.includes(opts.status as BookingStatus)) {
      filter.status = opts.status;
    }
    if (opts.from || opts.to) {
      filter.createdAt = {};
      if (opts.from) {
        const from = new Date(opts.from);
        if (!isNaN(from.getTime())) (filter.createdAt as Record<string, Date>).$gte = from;
      }
      if (opts.to) {
        const to = new Date(opts.to);
        if (!isNaN(to.getTime())) (filter.createdAt as Record<string, Date>).$lte = to;
      }
      if (Object.keys(filter.createdAt as object).length === 0) delete filter.createdAt;
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
    return { items: result as unknown as Booking[], nextCursor };
  }

  async getBookingsByArabon(arabonId: string, userId: string): Promise<{ items: Booking[]; nextCursor: string | null }> {
    const arabon = await this.arabonModel.findById(arabonId).lean<{ ownerId: Types.ObjectId }>().exec();
    if (!arabon) throw new NotFoundException('العربون غير موجود');
    if (String(arabon.ownerId) !== String(userId)) {
      throw new ForbiddenException('عرض حجوزات العربون مسموح لصاحب المنشأة فقط');
    }
    return this.getBookingsByArabonForAdmin(arabonId);
  }

  /** حجوزات العربون (للأدمن - بدون التحقق من المالك) */
  async getBookingsByArabonForAdmin(arabonId: string): Promise<{ items: Booking[]; nextCursor: string | null }> {
    const arabon = await this.arabonModel.findById(arabonId).exec();
    if (!arabon) throw new NotFoundException('العربون غير موجود');
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
    return { items: result as unknown as Booking[], nextCursor };
  }

  /**
   * تحديث حالة الحجز: completed | cancelled | no_show
   * صلاحيات: مالك العربون أو أدمن/سوبرأدمن
   * - cancelled: استرداد كامل للمستخدم + تحرير الـ slot
   * - completed: تحويل المبلغ للمالك
   * - no_show: عدم استرداد؛ المبلغ للمالك + تحرير الـ slot
   */
  async updateStatus(
    bookingId: string,
    status: BookingStatus,
    userId: string,
    userRole?: string,
  ): Promise<Booking> {
    const booking = await this.bookingModel.findById(bookingId).lean<{
      userId: Types.ObjectId;
      arabonId: Types.ObjectId;
      slotId: Types.ObjectId;
      status: string;
      depositAmount: number;
    }>().exec();
    if (!booking) throw new NotFoundException('الحجز غير موجود');
    const arabon = await this.arabonModel.findById(booking.arabonId).lean<{ ownerId: Types.ObjectId }>().exec();
    if (!arabon) throw new NotFoundException('العربون غير موجود');
    const isOwner = String(arabon.ownerId) === String(userId);
    const isAdmin = userRole === 'admin' || userRole === 'superadmin';
    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('تحديث الحالة مسموح لصاحب المنشأة أو الأدمن فقط');
    }
    if (!VALID_STATUSES.includes(status)) throw new BadRequestException('حالة غير صالحة');
    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException('لا يمكن تغيير حالة حجز غير مؤكد');
    }

    const userIdStr = String(booking.userId);
    const amount = booking.depositAmount ?? 0;
    const orderId = String(bookingId);
    const ownerIdStr = String(arabon.ownerId);

    if (status === BookingStatus.CANCELLED) {
      if (amount > 0) {
        await this.walletService.refundHeldFunds(
          userIdStr,
          amount,
          orderId,
          'booking_refund',
        );
      }
      await this.bookingSlotService.releaseSlot(String(booking.slotId));
    } else if (status === BookingStatus.COMPLETED || status === BookingStatus.NO_SHOW) {
      if (amount > 0) {
        await this.walletService.completeEscrowTransfer(
          userIdStr,
          ownerIdStr,
          amount,
          orderId,
          'booking_complete',
        );
      }
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

  /**
   * التحقق من صلاحية كوبون للحجز (معاينة الخصم)
   */
  async validateCouponForBooking(
    userId: string,
    code: string,
    orderAmount: number,
  ): Promise<{ valid: boolean; message?: string; discountAmount?: number; finalAmount?: number }> {
    const hasPreviousBooking = await this.bookingModel
      .countDocuments({ userId: new Types.ObjectId(userId) })
      .exec();
    const validation = await this.couponService.validate(
      { code, orderAmount },
      userId,
      { hasPreviousBooking: hasPreviousBooking > 0 },
    );
    if (!validation.valid) {
      return { valid: false, message: validation.message };
    }
    const discountAmount = validation.discountAmount ?? 0;
    const finalAmount = Math.max(0, orderAmount - discountAmount);
    return {
      valid: true,
      discountAmount,
      finalAmount,
    };
  }

  /**
   * مؤشرات أداء الحجوزات (KPIs)
   * - عدد الحجوزات المدفوعة
   * - معدل التحويل (مكتمل من المؤكد)
   * - معدل no-show
   * - دقة التقويم (الحضور من المؤكد)
   */
  async getBookingsKpis(arabonId?: string): Promise<{
    paidBookingsCount: number;
    conversionRate: number;
    noShowRate: number;
    calendarAccuracy: number;
    byStatus: { confirmed: number; completed: number; cancelled: number; no_show: number };
  }> {
    const filter: Record<string, unknown> = {};
    if (arabonId) filter.arabonId = new Types.ObjectId(arabonId);

    const [byStatus, total] = await Promise.all([
      this.bookingModel.aggregate<{ _id: string; count: number }>([
        { $match: filter },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]).exec(),
      this.bookingModel.countDocuments(filter).exec(),
    ]);

    const statusCounts = { confirmed: 0, completed: 0, cancelled: 0, no_show: 0 };
    for (const g of byStatus) {
      if (g._id && g._id in statusCounts) {
        (statusCounts as Record<string, number>)[g._id] = g.count;
      }
    }

    const paidCount = statusCounts.confirmed + statusCounts.completed + statusCounts.no_show;
    const finished = statusCounts.completed + statusCounts.no_show;
    const conversionRate = total > 0 ? (finished / total) * 100 : 0;
    const noShowRate = finished > 0 ? (statusCounts.no_show / finished) * 100 : 0;
    const calendarAccuracy = finished > 0 ? (statusCounts.completed / finished) * 100 : 0;

    return {
      paidBookingsCount: paidCount,
      conversionRate: Math.round(conversionRate * 100) / 100,
      noShowRate: Math.round(noShowRate * 100) / 100,
      calendarAccuracy: Math.round(calendarAccuracy * 100) / 100,
      byStatus: statusCounts,
    };
  }
}
