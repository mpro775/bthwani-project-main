import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { Types } from 'mongoose';
import { BookingSlot } from './entities/booking-slot.entity';
import { Arabon } from './entities/arabon.entity';
import type { CreateSlotsDto, SlotItemDto } from './dto/create-slots.dto';

@Injectable()
export class BookingSlotService {
  constructor(
    @InjectModel(BookingSlot.name) private readonly slotModel: Model<BookingSlot>,
    @InjectModel(Arabon.name) private readonly arabonModel: Model<Arabon>,
  ) {}

  /**
   * التحقق من أن المستخدم هو مالك العربون
   */
  private async assertOwner(arabonId: string, userId: string): Promise<void> {
    const arabon = await this.arabonModel
      .findById(arabonId)
      .lean<{ ownerId: Types.ObjectId }>()
      .exec();
    if (!arabon) throw new NotFoundException('العربون غير موجود');
    if (String(arabon.ownerId) !== String(userId)) {
      throw new ForbiddenException('السماح لصاحب المنشأة فقط');
    }
  }

  /**
   * إنشاء slots إما من قائمة صريحة أو من نطاق زمني + فاصل
   */
  async createSlots(
    arabonId: string,
    userId: string,
    dto: CreateSlotsDto,
  ): Promise<{ created: number; slots: BookingSlot[] }> {
    await this.assertOwner(arabonId, userId);

    const arabonOid = new Types.ObjectId(arabonId);
    let toInsert: Array<{ arabonId: Types.ObjectId; datetime: Date; durationMinutes: number }> = [];

    if (dto.slots?.length) {
      for (const s of dto.slots as SlotItemDto[]) {
        const dt = new Date(s.datetime);
        if (isNaN(dt.getTime())) throw new BadRequestException('تاريخ غير صالح: ' + s.datetime);
        toInsert.push({
          arabonId: arabonOid,
          datetime: dt,
          durationMinutes: s.durationMinutes ?? 60,
        });
      }
    } else if (dto.range) {
      const start = new Date(dto.range.start);
      const end = new Date(dto.range.end);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new BadRequestException('نطاق التاريخ غير صالح');
      }
      if (start >= end) {
        throw new BadRequestException('يجب أن يكون تاريخ البداية قبل النهاية');
      }
      const interval = dto.range.intervalMinutes ?? 60;
      const duration = dto.range.durationMinutes ?? interval;
      const current = new Date(start);
      while (current < end) {
        toInsert.push({
          arabonId: arabonOid,
          datetime: new Date(current),
          durationMinutes: duration,
        });
        current.setMinutes(current.getMinutes() + interval);
      }
    } else {
      throw new BadRequestException('يجب تقديم slots أو range');
    }

    if (toInsert.length === 0) {
      return { created: 0, slots: [] };
    }

    // تجنب تكرار slot لنفس العربون ونفس الوقت
    const existing = await this.slotModel
      .find({
        arabonId: arabonOid,
        datetime: { $in: toInsert.map((x) => x.datetime) },
      })
      .lean()
      .exec();
    const existingSet = new Set(existing.map((e) => e.datetime.getTime()));
    const filtered = toInsert.filter((x) => !existingSet.has(x.datetime.getTime()));
    if (filtered.length === 0) {
      return { created: 0, slots: [] };
    }

    const inserted = await this.slotModel.insertMany(filtered);
    return { created: inserted.length, slots: inserted };
  }

  /**
   * استرجاع الـ slots المتاحة (غير المحجوزة) لعربون في مدى زمني
   */
  async getAvailableSlots(
    arabonId: string,
    dateFrom?: string,
    dateTo?: string,
  ): Promise<BookingSlot[]> {
    if (!Types.ObjectId.isValid(arabonId)) {
      throw new BadRequestException('معرف العربون غير صالح');
    }
    const arabon = await this.arabonModel.findById(arabonId).exec();
    if (!arabon) throw new NotFoundException('العربون غير موجود');

    const filter: Record<string, unknown> = {
      arabonId: new Types.ObjectId(arabonId),
      isBooked: false,
    };

    if (dateFrom || dateTo) {
      filter.datetime = {};
      if (dateFrom) {
        const from = new Date(dateFrom);
        if (!isNaN(from.getTime())) (filter.datetime as any).$gte = from;
      }
      if (dateTo) {
        const to = new Date(dateTo);
        if (!isNaN(to.getTime())) (filter.datetime as any).$lte = to;
      }
      if (Object.keys(filter.datetime as object).length === 0) delete filter.datetime;
    }

    const items = await this.slotModel
      .find(filter)
      .sort({ datetime: 1 })
      .lean()
      .exec();
    return items as BookingSlot[];
  }

  /**
   * حجز slot لمستخدم (يُستدعى لاحقاً من خدمة الحجز عند وجود كيان Booking)
   */
  async reserveSlot(slotId: string, userId: string): Promise<BookingSlot> {
    const slot = await this.slotModel.findById(slotId).exec();
    if (!slot) throw new NotFoundException('الـ slot غير موجود');
    if (slot.isBooked) {
      throw new BadRequestException('هذا الوقت محجوز بالفعل');
    }
    slot.isBooked = true;
    slot.bookedBy = new Types.ObjectId(userId);
    await slot.save();
    return slot;
  }

  /**
   * إلغاء حجز slot (تحرير الوقت)
   */
  async releaseSlot(slotId: string, userId?: string): Promise<BookingSlot> {
    const slot = await this.slotModel.findById(slotId).exec();
    if (!slot) throw new NotFoundException('الـ slot غير موجود');
    // يمكن تقييد الإلغاء لصاحب الحجز أو مالك العربون لاحقاً
    slot.isBooked = false;
    slot.bookedBy = undefined;
    await slot.save();
    return slot;
  }
}
