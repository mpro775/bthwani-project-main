import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UtilityOrder } from '../entities/utility-order.entity';
import { CreateUtilityOrderDto } from '../dto/create-utility-order.dto';
import { UtilityService } from './utility.service';

@Injectable()
export class UtilityOrderService {
  constructor(
    @InjectModel(UtilityOrder.name)
    private utilityOrderModel: Model<UtilityOrder>,
    private readonly utilityService: UtilityService,
  ) {}

  /**
   * إنشاء طلب غاز أو ماء
   */
  async create(dto: CreateUtilityOrderDto, userId: string): Promise<any> {
    // 1. التحقق من وجود التسعير للمدينة
    const pricing = await this.utilityService.findByCity(dto.city).catch(() => {
      throw new BadRequestException(
        `لا توجد إعدادات تسعير لمدينة ${dto.city}`,
      );
    });

    // 2. التحقق من تفعيل الخدمة
    if (dto.kind === 'gas' && !pricing.gas?.enabled) {
      throw new BadRequestException('خدمة الغاز غير متاحة في هذه المدينة');
    }
    if (dto.kind === 'water' && !pricing.water?.enabled) {
      throw new BadRequestException('خدمة الماء غير متاحة في هذه المدينة');
    }

    // 3. حساب السعر
    const priceCalculation = await this.utilityService.calculatePrice({
      serviceType: dto.kind,
      city: dto.city,
      quantity: dto.kind === 'gas' ? dto.quantity : undefined,
      size: dto.kind === 'water' ? (dto.variant as any) : undefined,
      half: dto.kind === 'water' && dto.quantity === 0.5,
      customerLocation: dto.customerLocation,
    });

    // 4. جلب معلومات العنوان من profile المستخدم (يمكن استخدام user service)
    // لكن للآن سنفترض أن العنوان يُرسل في الـ request
    // في التطبيق الفعلي، يجب جلب العنوان من user.addresses بناءً على addressId

    const address = {
      label: 'عنوان افتراضي', // يجب جلبه من user
      city: dto.city,
      location: dto.customerLocation || { lat: 0, lng: 0 },
    };

    // 5. معالجة طريقة الدفع
    let walletUsed = 0;
    let cashDue = priceCalculation.total;

    if (dto.paymentMethod === 'wallet') {
      walletUsed = priceCalculation.total;
      cashDue = 0;
      // TODO: يجب التحقق من رصيد المحفظة
    } else if (dto.paymentMethod === 'mixed') {
      // TODO: يجب حساب المبلغ من المحفظة والكاش
    }

    // 6. إنشاء الطلب
    const order = await this.utilityOrderModel.create({
      user: new Types.ObjectId(userId),
      kind: dto.kind,
      city: dto.city,
      variant: dto.variant,
      quantity: dto.quantity,
      productPrice: priceCalculation.productPrice,
      deliveryFee: priceCalculation.deliveryFee,
      total: priceCalculation.total,
      address,
      paymentMethod: dto.paymentMethod,
      status: 'created',
      statusHistory: [
        {
          status: 'created',
          changedAt: new Date(),
          changedBy: 'customer',
        },
      ],
      notes: dto.notes || [],
      scheduledFor: dto.scheduledFor ? new Date(dto.scheduledFor) : undefined,
      walletUsed,
      cashDue,
      paid: false,
    });

    return order;
  }

  /**
   * جلب طلبات المستخدم
   */
  async findUserOrders(userId: string): Promise<UtilityOrder[]> {
    return this.utilityOrderModel
      .find({ user: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .populate('driver', 'fullName phone profileImage')
      .exec() as Promise<UtilityOrder[]>;
  }

  /**
   * جلب طلب محدد
   */
  async findOne(orderId: string): Promise<UtilityOrder> {
    const order = await this.utilityOrderModel
      .findById(orderId)
      .populate('user', 'fullName phone email')
      .populate('driver', 'fullName phone profileImage')
      .lean()
      .exec();

    if (!order) {
      throw new NotFoundException('الطلب غير موجود');
    }

    return order as any;
  }

  /**
   * تحديث حالة الطلب
   */
  async updateStatus(
    orderId: string,
    status: string,
    changedBy: string = 'system',
  ): Promise<UtilityOrder> {
    const order = await this.utilityOrderModel.findById(orderId);
    if (!order) {
      throw new NotFoundException('الطلب غير موجود');
    }

    order.status = status;
    order.statusHistory.push({
      status,
      changedAt: new Date(),
      changedBy,
    } as any);

    if (status === 'delivered') {
      order.deliveredAt = new Date();
    } else if (status === 'cancelled') {
      order.canceledAt = new Date();
    } else if (status === 'assigned') {
      order.assignedAt = new Date();
    }

    return order.save();
  }

  /**
   * إلغاء طلب
   */
  async cancel(
    orderId: string,
    reason: string,
    canceledBy: string,
  ): Promise<UtilityOrder> {
    const order = await this.utilityOrderModel.findById(orderId);
    if (!order) {
      throw new NotFoundException('الطلب غير موجود');
    }

    if (['delivered', 'cancelled'].includes(order.status)) {
      throw new BadRequestException('لا يمكن إلغاء هذا الطلب');
    }

    order.status = 'cancelled';
    order.cancelReason = reason;
    order.canceledBy = canceledBy;
    order.canceledAt = new Date();
    order.statusHistory.push({
      status: 'cancelled',
      changedAt: new Date(),
      changedBy: canceledBy,
    } as any);

    return order.save();
  }

  /**
   * تقييم الطلب
   */
  async rate(
    orderId: string,
    rating: number,
    comment?: string,
  ): Promise<UtilityOrder> {
    const order = await this.utilityOrderModel.findById(orderId);
    if (!order) {
      throw new NotFoundException('الطلب غير موجود');
    }

    if (order.status !== 'delivered') {
      throw new BadRequestException('يمكن تقييم الطلبات المسلّمة فقط');
    }

    order.rating = rating;
    order.ratingComment = comment;
    order.ratedAt = new Date();

    return order.save();
  }

  /**
   * تعيين سائق للطلب (admin)
   */
  async assignDriver(orderId: string, driverId: string): Promise<UtilityOrder> {
    const order = await this.utilityOrderModel.findById(orderId);
    if (!order) {
      throw new NotFoundException('الطلب غير موجود');
    }

    order.driver = new Types.ObjectId(driverId);
    order.status = 'assigned';
    order.assignedAt = new Date();
    order.statusHistory.push({
      status: 'assigned',
      changedAt: new Date(),
      changedBy: 'admin',
    } as any);

    return order.save();
  }

  /**
   * جلب جميع الطلبات (admin)
   */
  async findAll(filters?: any): Promise<UtilityOrder[]> {
    const query = this.utilityOrderModel.find(filters || {});

    return query
      .sort({ createdAt: -1 })
      .populate('user', 'fullName phone email')
      .populate('driver', 'fullName phone')
      .lean()
      .exec() as any;
  }
}

