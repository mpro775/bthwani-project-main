import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import type { Model } from 'mongoose';
import { Types } from 'mongoose';
import { Amani, AmaniStatus } from './entities/amani.entity';
import { Driver } from '../driver/entities/driver.entity';
import { AppSettings } from '../admin/entities/app-settings.entity';
import type CreateAmaniDto from './dto/create-amani.dto';
import type UpdateAmaniDto from './dto/update-amani.dto';
import AssignDriverDto from './dto/assign-driver.dto';
import UpdateAmaniStatusDto from './dto/update-status.dto';
import { InjectModel } from '@nestjs/mongoose';
import { validateStatusTransition } from './utils/status-transitions';
import { getDistance } from 'geolib';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AmaniDriverAssignedEvent } from './events/amani-driver-assigned.event';
import { AmaniStatusChangedEvent } from './events/amani-status-changed.event';

const DEFAULT_BASE_FEE = 250;
const DEFAULT_PER_KM = 120;

@Injectable()
export class AmaniService {
  constructor(
    @InjectModel(Amani.name) private readonly model: Model<Amani>,
    @InjectModel(Driver.name) private readonly driverModel: Model<Driver>,
    @InjectModel(AppSettings.name) private readonly settingsModel: Model<AppSettings>,
    private eventEmitter: EventEmitter2,
  ) {} 

  async create(dto: CreateAmaniDto) {
    const payload: Record<string, unknown> = {
      ...dto,
      statusHistory: [{
        status: dto.status || AmaniStatus.DRAFT,
        timestamp: new Date(),
        note: 'تم إنشاء الطلب',
      }],
    };
    if (dto.origin?.lat != null && dto.origin?.lng != null && dto.destination?.lat != null && dto.destination?.lng != null) {
      const feeResult = await this.calculateFee(
        { lat: dto.origin.lat, lng: dto.origin.lng },
        { lat: dto.destination.lat, lng: dto.destination.lng },
      );
      payload.estimatedPrice = feeResult.estimatedPrice;
    }
    const doc = new this.model(payload);
    return await doc.save();
  }

  async findAll(opts: { cursor?: string; status?: string }) {
    const limit = 25;
    const filter: Record<string, unknown> = {};
    if (opts?.status) {
      filter.status = opts.status;
    }
    const query = this.model.find(filter).sort({ _id: -1 }).limit(limit);
    if (opts?.cursor) {
      try {
        query.where('_id').lt(new Types.ObjectId(opts.cursor) as any);
      } catch {
        // تجاهل cursor غير صالح
      }
    }
    const items = await query.exec();
    const nextCursor = items.length === limit ? String(items[items.length - 1]._id) : null;
    return { items, nextCursor, hasMore: !!nextCursor };
  }

  async findOne(id: string) {
    const doc = await this.model.findById(id).populate('driver').exec();
    if (!doc) throw new NotFoundException('Not found');
    return doc;
  }

  async update(id: string, dto: UpdateAmaniDto) {
    const doc = await this.model.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!doc) throw new NotFoundException('Not found');
    return doc;
  }

  async remove(id: string) {
    const doc = await this.model.findByIdAndDelete(id).exec();
    if (!doc) throw new NotFoundException('Not found');
    return { ok: true };
  }

  /**
   * تعيين سائق للطلب
   */
  async assignDriver(id: string, dto: AssignDriverDto, assignedBy?: string): Promise<Amani> {
    const amani = await this.model.findById(id);
    if (!amani) {
      throw new NotFoundException('الطلب غير موجود');
    }

    // التحقق من حالة الطلب
    if (amani.status !== AmaniStatus.PENDING && amani.status !== AmaniStatus.CONFIRMED) {
      throw new BadRequestException(
        `لا يمكن تعيين سائق للطلب في الحالة "${amani.status}". يجب أن يكون الطلب في حالة pending أو confirmed`
      );
    }

    // التحقق من وجود السائق
    const driver = await this.driverModel.findById(dto.driverId);
    if (!driver) {
      throw new NotFoundException('السائق غير موجود');
    }

    // التحقق من توفر السائق
    if (!driver.isAvailable || driver.isBanned) {
      throw new BadRequestException('السائق غير متاح حالياً');
    }

    // تعيين السائق
    amani.driver = new Types.ObjectId(dto.driverId);
    amani.status = AmaniStatus.CONFIRMED;
    amani.assignedAt = new Date();
    
    amani.statusHistory = amani.statusHistory || [];
    amani.statusHistory.push({
      status: AmaniStatus.CONFIRMED,
      timestamp: new Date(),
      note: dto.note || `تم تعيين السائق ${driver.fullName || dto.driverId}`,
      changedBy: assignedBy,
    });

    const savedAmani = await amani.save();

    // إرسال Event
    this.eventEmitter.emit(
      'amani.driver.assigned',
      new AmaniDriverAssignedEvent(
        String(savedAmani._id),
        dto.driverId,
        savedAmani.ownerId.toString(),
      ),
    );

    return savedAmani;
  }

  /**
   * قبول الطلب من السائق (تعيين ذاتي)
   */
  async acceptByDriver(amaniId: string, driverId: string): Promise<Amani> {
    const amani = await this.model.findById(amaniId);
    if (!amani) {
      throw new NotFoundException('الطلب غير موجود');
    }

    if (amani.status !== AmaniStatus.PENDING) {
      throw new BadRequestException(
        `لا يمكن قبول الطلب في الحالة "${amani.status}". يجب أن يكون الطلب في حالة pending`,
      );
    }

    const driver = await this.driverModel.findById(driverId);
    if (!driver) {
      throw new NotFoundException('السائق غير موجود');
    }

    if (!driver.isAvailable || driver.isBanned) {
      throw new BadRequestException('أنت غير متاح لاستقبال طلبات جديدة');
    }

    if (amani.metadata?.womenOnly === true) {
      const isFemaleDriver =
        driver.role === 'women_driver' || driver.isFemaleDriver === true;
      if (!isFemaleDriver) {
        throw new BadRequestException(
          'هذا الطلب يتطلب سائقة أنثى فقط',
        );
      }
    }

    return this.assignDriver(
      amaniId,
      {
        driverId,
        note: 'قبول الطلب من السائقة',
      },
      driverId,
    );
  }

  /**
   * تعيين سائق تلقائياً (أقرب سائق متاح)
   */
  async assignDriverAuto(id: string): Promise<Amani> {
    const amani = await this.model.findById(id);
    if (!amani) {
      throw new NotFoundException('الطلب غير موجود');
    }

    if (!amani.origin || !amani.origin.lat || !amani.origin.lng) {
      throw new BadRequestException('يجب تحديد موقع الانطلاق للبحث عن سائق');
    }

    // البحث عن السائقين المتاحين
    const driverFilter: Record<string, unknown> = {
      isAvailable: true,
      isBanned: false,
      currentLocation: { $exists: true },
    };

    // عند طلب سائقة أنثى فقط: فلترة حسب role أو isFemaleDriver
    if (amani.metadata?.womenOnly === true) {
      driverFilter.$or = [
        { role: 'women_driver' },
        { isFemaleDriver: true },
      ];
    }

    const availableDrivers = await this.driverModel.find(driverFilter).exec();

    if (availableDrivers.length === 0) {
      throw new NotFoundException(
        amani.metadata?.womenOnly
          ? 'لا توجد سائقات متاحات حالياً'
          : 'لا يوجد سائقون متاحون حالياً',
      );
    }

    // حساب المسافة لكل سائق
    const driversWithDistance = availableDrivers
      .map(driver => {
        if (!driver.currentLocation?.lat || !driver.currentLocation?.lng) {
          return null;
        }

        const distance = getDistance(
          {
            latitude: amani.origin.lat,
            longitude: amani.origin.lng,
          },
          {
            latitude: driver.currentLocation.lat,
            longitude: driver.currentLocation.lng,
          }
        );

        return {
          driver,
          distance,
        };
      })
      .filter(item => item !== null)
      .sort((a, b) => a.distance - b.distance);

    if (driversWithDistance.length === 0) {
      throw new NotFoundException('لا يوجد سائقون بموقع متاح حالياً');
    }

    // تعيين أقرب سائق
    const nearestDriver = driversWithDistance[0].driver;
    return this.assignDriver(id, {
      driverId: String(nearestDriver._id),
      note: 'تم التعيين تلقائياً - أقرب سائق متاح',
    });
  }

  /**
   * تحديث حالة الطلب
   */
  async updateStatus(
    id: string,
    dto: UpdateAmaniStatusDto,
    updatedBy?: string,
  ): Promise<Amani> {
    const amani = await this.model.findById(id);
    if (!amani) {
      throw new NotFoundException('الطلب غير موجود');
    }

    // التحقق من صحة انتقال الحالة
    validateStatusTransition(amani.status, dto.status);

    const oldStatus = amani.status;
    amani.status = dto.status;

    // تحديث التواريخ الخاصة
    if (dto.status === AmaniStatus.IN_PROGRESS && !amani.pickedUpAt) {
      amani.pickedUpAt = new Date();
    } else if (dto.status === AmaniStatus.COMPLETED) {
      amani.completedAt = new Date();
    }

    // إضافة سجل في statusHistory
    amani.statusHistory = amani.statusHistory || [];
    amani.statusHistory.push({
      status: dto.status,
      timestamp: new Date(),
      note: dto.note || `تم تغيير الحالة من ${oldStatus} إلى ${dto.status}`,
      changedBy: updatedBy,
    });

    const savedAmani = await amani.save();

    // إرسال Event
    this.eventEmitter.emit(
      'amani.status.changed',
      new AmaniStatusChangedEvent(
        String(savedAmani._id),
        oldStatus,
        dto.status,
        updatedBy,
      ),
    );

    return savedAmani;
  }

  /**
   * جلب طلبات السائق
   */
  async getDriverOrders(driverId: string, status?: string): Promise<Amani[]> {
    const query: any = { driver: new Types.ObjectId(driverId) };
    if (status) {
      query.status = status;
    }
    return this.model.find(query).sort({ createdAt: -1 }).exec();
  }

  /**
   * إلغاء الطلب
   */
  async cancel(id: string, reason: string, cancelledBy: string): Promise<Amani> {
    const amani = await this.model.findById(id);
    if (!amani) {
      throw new NotFoundException('الطلب غير موجود');
    }

    if (amani.status === AmaniStatus.COMPLETED) {
      throw new BadRequestException('لا يمكن إلغاء طلب تم إكماله');
    }

    if (amani.status === AmaniStatus.CANCELLED) {
      throw new BadRequestException('الطلب ملغي بالفعل');
    }

    amani.status = AmaniStatus.CANCELLED;
    amani.cancellationReason = reason;

    amani.statusHistory = amani.statusHistory || [];
    amani.statusHistory.push({
      status: AmaniStatus.CANCELLED,
      timestamp: new Date(),
      note: reason,
      changedBy: cancelledBy,
    });

    return await amani.save();
  }

  /**
   * الحصول على إعدادات أسعار أماني
   */
  async getPricingSettings(): Promise<{ baseFee: number; perKm: number }> {
    const [baseFeeSetting, perKmSetting] = await Promise.all([
      this.settingsModel.findOne({ key: 'amani_base_fee' }).lean().exec(),
      this.settingsModel.findOne({ key: 'amani_per_km' }).lean().exec(),
    ]);
    const baseFee = baseFeeSetting?.value != null ? Number(baseFeeSetting.value) : DEFAULT_BASE_FEE;
    const perKm = perKmSetting?.value != null ? Number(perKmSetting.value) : DEFAULT_PER_KM;
    return { baseFee, perKm };
  }

  /**
   * تحديث إعدادات أسعار أماني
   */
  async updatePricingSettings(dto: { baseFee: number; perKm: number }, adminId?: string): Promise<{ baseFee: number; perKm: number }> {
    const updateBy = adminId ? new Types.ObjectId(adminId) : undefined;
    await Promise.all([
      this.settingsModel.findOneAndUpdate(
        { key: 'amani_base_fee' },
        {
          key: 'amani_base_fee',
          value: dto.baseFee,
          type: 'number',
          category: 'amani',
          description: 'رسوم أماني الأساسية بالريال',
          isPublic: false,
          updatedBy: updateBy,
        },
        { upsert: true, new: true },
      ).exec(),
      this.settingsModel.findOneAndUpdate(
        { key: 'amani_per_km' },
        {
          key: 'amani_per_km',
          value: dto.perKm,
          type: 'number',
          category: 'amani',
          description: 'سعر الكيلومتر لأماني بالريال',
          isPublic: false,
          updatedBy: updateBy,
        },
        { upsert: true, new: true },
      ).exec(),
    ]);
    return { baseFee: dto.baseFee, perKm: dto.perKm };
  }

  /**
   * حساب رسوم التوصيل بناءً على المسافة
   */
  async calculateFee(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
  ): Promise<{ distanceKm: number; estimatedPrice: number; breakdown: { baseFee: number; distanceFee: number } }> {
    const { baseFee, perKm } = await this.getPricingSettings();
    const distanceMeters = getDistance(
      { latitude: origin.lat, longitude: origin.lng },
      { latitude: destination.lat, longitude: destination.lng },
    );
    const distanceKm = Math.round((distanceMeters / 1000) * 100) / 100;
    const distanceFee = Math.round(distanceKm * perKm);
    const estimatedPrice = Math.round(baseFee + distanceFee);
    return {
      distanceKm,
      estimatedPrice,
      breakdown: { baseFee, distanceFee },
    };
  }

  /**
   * تحديث موقع السائق
   */
  async updateDriverLocation(
    amaniId: string,
    location: { lat: number; lng: number },
  ): Promise<void> {
    const amani = await this.model.findById(amaniId);
    if (!amani) {
      throw new NotFoundException('الطلب غير موجود');
    }

    amani.driverLocation = {
      lat: location.lat,
      lng: location.lng,
      updatedAt: new Date(),
    };

    // إضافة إلى سجل المسار
    amani.routeHistory = amani.routeHistory || [];
    amani.routeHistory.push({
      lat: location.lat,
      lng: location.lng,
      timestamp: new Date(),
    });

    // الاحتفاظ بآخر 100 نقطة فقط
    if (amani.routeHistory.length > 100) {
      amani.routeHistory = amani.routeHistory.slice(-100);
    }

    await amani.save();
  }
}
