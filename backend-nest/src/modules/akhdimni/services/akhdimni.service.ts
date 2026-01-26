import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ErrandOrder } from '../entities/errand-order.entity';
import {
  CreateErrandDto,
  UpdateErrandStatusDto,
} from '../dto/create-errand.dto';
import {
  CalculateFeeDto,
  FeeCalculationResult,
} from '../dto/calculate-fee.dto';
import { getDistance } from 'geolib';

interface OrderQuery {
  user?: string;
  driver?: string;
  status?: string;
  _id?: { $lt: string };
}

export interface PaginatedOrdersResult {
  data: any[];
  pagination: {
    nextCursor: string | null;
    hasMore: boolean;
    limit: number;
  };
}

@Injectable()
export class AkhdimniService {
  constructor(
    @InjectModel(ErrandOrder.name)
    private errandOrderModel: Model<ErrandOrder>,
  ) {}

  /**
   * إنشاء طلب مهمة جديد
   */
  async create(userId: string, dto: CreateErrandDto): Promise<ErrandOrder> {
    // 1. حساب المسافة
    const distanceMeters = getDistance(
      {
        latitude: dto.pickup.location.lat,
        longitude: dto.pickup.location.lng,
      },
      {
        latitude: dto.dropoff.location.lat,
        longitude: dto.dropoff.location.lng,
      },
    );

    const distanceKm = distanceMeters / 1000;

    // 2. حساب رسوم التوصيل (بسيط: 300 رسوم أساسية + 150/كم)
    const deliveryFee = Math.round(300 + distanceKm * 150);

    // 3. الإجمالي
    const tip = dto.tip || 0;
    const totalPrice = deliveryFee + tip;

    // 4. توليد رقم الطلب
    const orderNumber = await this.generateOrderNumber();

    // 5. تحويل GeoJSON
    const pickup = {
      ...dto.pickup,
      geo: {
        type: 'Point' as const,
        coordinates: [dto.pickup.location.lng, dto.pickup.location.lat],
      },
    };

    const dropoff = {
      ...dto.dropoff,
      geo: {
        type: 'Point' as const,
        coordinates: [dto.dropoff.location.lng, dto.dropoff.location.lat],
      },
    };

    // 6. إنشاء الطلب
    const errandOrder = new this.errandOrderModel({
      orderNumber,
      user: userId,
      errand: {
        ...dto,
        pickup,
        dropoff,
        distanceKm,
      },
      deliveryFee,
      totalPrice,
      paymentMethod: dto.paymentMethod,
      paid: false,
      walletUsed: 0,
      cashDue: totalPrice,
      status: 'created',
      scheduledFor: dto.scheduledFor ? new Date(dto.scheduledFor) : undefined,
      notes: dto.notes,
      statusHistory: [
        {
          status: 'created',
          timestamp: new Date(),
        },
      ],
    });

    return errandOrder.save();
  }

  /**
   * توليد رقم طلب فريد
   */
  private async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');

    const last = await this.errandOrderModel
      .findOne({
        orderNumber: new RegExp(`^ERR-${year}${month}`),
      })
      .sort({ createdAt: -1 });

    let sequence = 1;
    if (last) {
      const lastSequence = parseInt(last.orderNumber.split('-')[2]);
      sequence = lastSequence + 1;
    }

    return `ERR-${year}${month}-${String(sequence).padStart(4, '0')}`;
  }

  /**
   * الحصول على طلبات المستخدم
   */
  async getMyOrders(userId: string, status?: string): Promise<any[]> {
    const query: OrderQuery = { user: userId };
    if (status) query.status = status;

    return this.errandOrderModel
      .find(query)
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  /**
   * الحصول على طلب محدد
   */
  async findById(id: string): Promise<ErrandOrder> {
    const order = await this.errandOrderModel.findById(id).populate('driver');
    if (!order) {
      throw new NotFoundException('الطلب غير موجود');
    }
    return order;
  }

  /**
   * تعيين سائق
   */
  async assignDriver(id: string, driverId: string): Promise<ErrandOrder> {
    const order = await this.errandOrderModel.findById(id);
    if (!order) {
      throw new NotFoundException('الطلب غير موجود');
    }

    if (order.status !== 'created') {
      throw new BadRequestException('الطلب تم تعيينه بالفعل أو ملغي');
    }

    order.driver = new Types.ObjectId(driverId);
    order.status = 'assigned';
    order.assignedAt = new Date();
    order.statusHistory?.push({
      status: 'assigned',
      timestamp: new Date(),
      note: `تم تعيين السائق ${driverId}`,
    });

    return order.save();
  }

  /**
   * تحديث حالة الطلب
   */
  async updateStatus(
    id: string,
    dto: UpdateErrandStatusDto,
  ): Promise<ErrandOrder> {
    const order = await this.errandOrderModel.findById(id);
    if (!order) {
      throw new NotFoundException('الطلب غير موجود');
    }

    order.status = dto.status;

    // تحديث التواريخ الخاصة
    if (dto.status === 'picked_up') {
      order.pickedUpAt = new Date();
    } else if (dto.status === 'delivered') {
      order.deliveredAt = new Date();
    }

    order.statusHistory?.push({
      status: dto.status,
      timestamp: new Date(),
      note: dto.note,
    });

    return order.save();
  }

  /**
   * إلغاء طلب
   */
  async cancel(id: string, reason: string): Promise<ErrandOrder> {
    const order = await this.errandOrderModel.findById(id);
    if (!order) {
      throw new NotFoundException('الطلب غير موجود');
    }

    if (order.status === 'delivered') {
      throw new BadRequestException('لا يمكن إلغاء طلب تم توصيله');
    }

    order.status = 'cancelled';
    order.cancellationReason = reason;
    order.statusHistory?.push({
      status: 'cancelled',
      timestamp: new Date(),
      note: reason,
    });

    return order.save();
  }

  /**
   * تقييم المهمة
   */
  async rate(
    id: string,
    rating: { driver: number; service: number; comments?: string },
  ): Promise<ErrandOrder> {
    const order = await this.errandOrderModel.findById(id);
    if (!order) {
      throw new NotFoundException('الطلب غير موجود');
    }

    if (order.status !== 'delivered') {
      throw new BadRequestException('يجب أن يكون الطلب مكتمل للتقييم');
    }

    order.rating = {
      ...rating,
      ratedAt: new Date(),
    };

    return order.save();
  }

  /**
   * الحصول على طلبات السائق
   */
  async getDriverOrders(driverId: string, status?: string): Promise<any[]> {
    const query: OrderQuery = { driver: driverId };
    if (status) query.status = status;

    return this.errandOrderModel
      .find(query)
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  /**
   * الحصول على طلبات الإدارة
   */
  async getAllOrders(
    status?: string,
    limit = 20,
    cursor?: string,
  ): Promise<PaginatedOrdersResult> {
    const query: OrderQuery = {};
    if (status) query.status = status;
    if (cursor) query._id = { $lt: cursor };

    const orders = await this.errandOrderModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .populate('user driver')
      .lean()
      .exec();

    const hasMore = orders.length > limit;
    const results = hasMore ? orders.slice(0, -1) : orders;

    return {
      data: results,
      pagination: {
        nextCursor: hasMore
          ? (results[results.length - 1]._id as string)
          : null,
        hasMore,
        limit,
      },
    };
  }

  /**
   * حساب رسوم المهمة
   */
  async calculateFee(dto: CalculateFeeDto): Promise<FeeCalculationResult> {
    // 1. حساب المسافة
    const distanceMeters = getDistance(
      {
        latitude: dto.pickup.location.lat,
        longitude: dto.pickup.location.lng,
      },
      {
        latitude: dto.dropoff.location.lat,
        longitude: dto.dropoff.location.lng,
      },
    );

    const distanceKm = distanceMeters / 1000;

    // 2. حساب الرسوم بناءً على المعايير المختلفة
    const baseFee = 300; // رسوم أساسية

    // رسوم المسافة: 150 ريال لكل كيلومتر
    const distanceFee = Math.round(distanceKm * 150);

    // رسوم الحجم
    const sizeMultipliers = {
      small: 1,
      medium: 1.3,
      large: 1.6,
    };
    const sizeMultiplier = sizeMultipliers[dto.size] || 1;
    const sizeFee = Math.round(baseFee * (sizeMultiplier - 1));

    // رسوم الوزن (إذا كان أكثر من 5 كجم)
    let weightFee = 0;
    if (dto.weightKg && dto.weightKg > 5) {
      weightFee = Math.round((dto.weightKg - 5) * 50);
    }

    // 3. حساب الرسوم الكلية
    const deliveryFee = Math.round(
      baseFee + distanceFee + sizeFee + weightFee,
    );

    const tip = dto.tip || 0;
    const totalWithTip = deliveryFee + tip;

    return {
      distanceKm: Math.round(distanceKm * 100) / 100, // تقريب لرقمين عشريين
      deliveryFee,
      totalWithTip,
      breakdown: {
        baseFee,
        distanceFee,
        sizeFee,
        weightFee,
        tip,
      },
    };
  }
}
