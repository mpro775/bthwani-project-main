import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Driver } from './entities/driver.entity';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { Withdrawal } from '../withdrawal/entities/withdrawal.entity';
import { Order } from '../order/entities/order.entity';
import { CursorPaginationDto } from '../../common/dto/pagination.dto';
import { WalletService } from '../wallet/wallet.service';
import { OrderService } from '../order/order.service';
import { OrderStatus } from '../order/enums/order-status.enum';
import { PaymentMethod } from '../order/enums/order-status.enum';
import { OrderGateway } from '../../gateways/order.gateway';
import {
  PaginationHelper,
  EntityHelper,
  SanitizationHelper,
} from '../../common/utils';

@Injectable()
export class DriverService {
  constructor(
    @InjectModel(Driver.name) private driverModel: Model<Driver>,
    @InjectModel(Withdrawal.name) private withdrawalModel: Model<Withdrawal>,
    @InjectModel(Order.name) private orderModel: Model<Order>, // ✅ إضافة Order Model
    private walletService: WalletService,
    @Inject(forwardRef(() => OrderService))
    private orderService: OrderService, // ✅ إضافة OrderService
    private orderGateway: OrderGateway, // ✅ إضافة OrderGateway للإشعارات الفورية
  ) {}

  // إنشاء سائق جديد
  async create(createDriverDto: CreateDriverDto) {
    // التحقق من وجود السائق
    const existing = await this.driverModel.findOne({
      $or: [{ email: createDriverDto.email }, { phone: createDriverDto.phone }],
    });

    if (existing) {
      throw new ConflictException({
        code: 'DRIVER_EXISTS',
        message: 'Driver already exists',
        userMessage: 'السائق موجود مسبقاً',
        suggestedAction: 'يرجى استخدام بريد أو هاتف مختلف',
      });
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(createDriverDto.password, 10);

    // إنشاء السائق
    const driver = await this.driverModel.create({
      ...createDriverDto,
      password: hashedPassword,
    });

    return SanitizationHelper.sanitize<Driver>(driver);
  }

  // جلب كل السائقين المتاحين
  async findAvailable(pagination: CursorPaginationDto) {
    const result = await PaginationHelper.paginate(
      this.driverModel,
      { isAvailable: true, isBanned: false },
      pagination,
    );

    return {
      ...result,
      data: SanitizationHelper.sanitizeMany<Driver>(result.data),
    };
  }

  // جلب سائق محدد
  async findOne(id: string) {
    const driver = await EntityHelper.findByIdOrFail(
      this.driverModel,
      id,
      'Driver',
    );

    return SanitizationHelper.sanitize<Driver>(driver);
  }


  // تحديث حالة التوفر
  async updateAvailability(driverId: string, isAvailable: boolean) {
    const driver = await this.driverModel.findByIdAndUpdate(
      driverId,
      { isAvailable },
      { new: true },
    );

    if (!driver) {
      throw new NotFoundException({
        code: 'DRIVER_NOT_FOUND',
        message: 'Driver not found',
        userMessage: 'السائق غير موجود',
      });
    }

    return SanitizationHelper.sanitize<Driver>(driver);
  }

  // تحديث إحصائيات التوصيل
  async updateDeliveryStats(driverId: string, delivered: boolean = true) {
    const updateField = delivered
      ? 'deliveryStats.deliveredCount'
      : 'deliveryStats.canceledCount';

    const driver = await this.driverModel.findByIdAndUpdate(
      driverId,
      { $inc: { [updateField]: 1 } },
      { new: true },
    );

    return SanitizationHelper.sanitize<Driver>(driver);
  }

  // تم استبدال هذه الدالة بـ SanitizationHelper
  // private sanitizeDriver - Removed (now using SanitizationHelper)

  // ==================== Profile Management ====================

  async getProfile(driverId: string) {
    return this.findOne(driverId);
  }

  async updateProfile(driverId: string, updates: any) {
    const driver = await this.driverModel
      .findByIdAndUpdate(driverId, updates as Record<string, any>, {
        new: true,
      })
      .select('-password');
    if (!driver) {
      throw new NotFoundException({
        code: 'DRIVER_NOT_FOUND',
        message: 'Driver not found',
        userMessage: 'السائق غير موجود',
      });
    }
    return SanitizationHelper.sanitize<Driver>(driver);
  }

  // ==================== Earnings ====================

  async getEarnings(driverId: string, startDate?: string, endDate?: string) {
    // TODO: Aggregate from Order model
    void driverId;
    void startDate;
    void endDate;
    await Promise.resolve();
    return { totalEarnings: 0, ordersCount: 0, averagePerOrder: 0 };
  }

  async getDailyEarnings(driverId: string) {
    // TODO: Today's earnings
    void driverId;
    await Promise.resolve();
    return { earnings: 0, ordersCount: 0 };
  }

  async getWeeklyEarnings(driverId: string) {
    // TODO: This week's earnings
    void driverId;
    await Promise.resolve();
    return { earnings: 0, ordersCount: 0 };
  }

  async getStatistics(driverId: string) {
    // TODO: Aggregate statistics
    void driverId;
    await Promise.resolve();
    return {
      totalOrders: 0,
      completedOrders: 0,
      cancelledOrders: 0,
      totalEarnings: 0,
      averageRating: 0,
    };
  }

  // ==================== Documents ====================

  async uploadDocument(driverId: string, docData: any) {
    const driver = await this.driverModel.findById(driverId);
    if (!driver) {
      throw new NotFoundException({
        code: 'DRIVER_NOT_FOUND',
        message: 'Driver not found',
        userMessage: 'السائق غير موجود',
      });
    }

    const documents =
      (driver as unknown as { documents: any[] }).documents || [];
    documents.push({ ...docData, uploadedAt: new Date(), verified: false });
    (driver as unknown as { documents: any[] }).documents = documents;
    await driver.save();

    return { success: true, message: 'تم رفع المستند' };
  }

  async getDocuments(driverId: string) {
    const driver = await this.driverModel
      .findById(driverId)
      .select('documents');
    if (!driver) {
      throw new NotFoundException({
        code: 'DRIVER_NOT_FOUND',
        message: 'Driver not found',
        userMessage: 'السائق غير موجود',
      });
    }
    return {
      documents:
        ((driver as unknown as { documents: any[] }).documents as unknown[]) ||
        [],
    };
  }

  // ==================== Vacations ====================

  async requestVacation(driverId: string, vacationData: any) {
    // TODO: Implement VacationRequest model
    void driverId;
    void vacationData;
    await Promise.resolve();
    return {
      success: true,
      message: 'تم تقديم طلب الإجازة',
      requestId: 'vacation_' + Date.now(),
    };
  }

  async getMyVacations(driverId: string) {
    // TODO: Implement
    void driverId;
    await Promise.resolve();
    return { data: [] };
  }

  async cancelVacation(vacationId: string, driverId: string) {
    // TODO: Implement
    void vacationId;
    void driverId;
    await Promise.resolve();
    return { success: true, message: 'تم إلغاء طلب الإجازة' };
  }

  async getVacationBalance(driverId: string) {
    // TODO: Implement
    void driverId;
    await Promise.resolve();
    return { annual: 30, sick: 15, used: 0, remaining: 30 };
  }

  async getVacationPolicy() {
    await Promise.resolve();
    return {
      annualLeave: 30,
      sickLeave: 15,
      emergencyLeave: 5,
      rules: 'يجب التقديم قبل 7 أيام',
    };
  }

  // ==================== Withdrawals ====================


  async getWithdrawalStatus(withdrawalId: string, driverId: string) {
    // TODO: Implement
    void withdrawalId;
    void driverId;
    await Promise.resolve();
    return { status: 'pending', amount: 0 };
  }

  // ==================== Orders (Advanced) ====================

  /**
   * حساب المسافة بين نقطتين باستخدام Haversine formula
   */
  private calculateDistance(
    point1: { lat: number; lng: number },
    point2: { lat: number; lng: number },
  ): number {
    const R = 6371; // نصف قطر الأرض بالكيلومتر
    const dLat = this.toRad(point2.lat - point1.lat);
    const dLon = this.toRad(point2.lng - point1.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(point1.lat)) *
        Math.cos(this.toRad(point2.lat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * تحويل الدرجات إلى راديان
   */
  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * جلب الطلبات المتاحة للسائق
   */
  async getAvailableOrders(driverId: string) {
    // 1. جلب بيانات السائق والتحقق من وجوده
    const driver = await this.driverModel.findById(driverId);
    if (!driver) {
      throw new NotFoundException({
        code: 'DRIVER_NOT_FOUND',
        message: 'Driver not found',
        userMessage: 'السائق غير موجود',
      });
    }

    // 2. التحقق من أن السائق متاح
    if (!driver.isAvailable || driver.isBanned) {
      return { data: [] };
    }

    // 3. جلب الطلبات الجاهزة بدون سائق
    const orders = await this.orderModel
      .find({
        status: OrderStatus.READY,
        driver: { $exists: false },
      })
      .populate('user', 'fullName phone')
      .populate('items.store', 'name')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    // 4. إذا كان للسائق موقع، احسب المسافة وفلتر حسب القرب
    if (driver.currentLocation) {
      const currentLoc = driver.currentLocation;
      const ordersWithDistance = orders
        .map((order: any) => {
          if (order.address?.location) {
            const distance = this.calculateDistance(
              {
                lat: currentLoc.lat,
                lng: currentLoc.lng,
              },
              {
                lat: order.address.location.lat,
                lng: order.address.location.lng,
              },
            );
            return { ...order, distance };
          }
          return { ...order, distance: null };
        })
        .filter((order: any) => {
          // فلترة حسب المدينة إذا كانت متوفرة
          if (driver.residenceLocation?.city && order.address?.city) {
            return driver.residenceLocation.city === order.address.city;
          }
          return true;
        })
        .sort((a: any, b: any) => {
          // ترتيب حسب المسافة (الأقرب أولاً)
          if (a.distance === null) return 1;
          if (b.distance === null) return -1;
          return a.distance - b.distance;
        });

      return { data: ordersWithDistance };
    }

    return { data: orders };
  }

  /**
   * قبول طلب من قبل السائق
   */
  async acceptOrder(orderId: string, driverId: string) {
    // 1. التحقق من وجود الطلب
    const order = await this.orderService.findOne(orderId);
    if (!order) {
      throw new NotFoundException({
        code: 'ORDER_NOT_FOUND',
        message: 'Order not found',
        userMessage: 'الطلب غير موجود',
      });
    }

    // 2. التحقق من حالة الطلب
    if (order.status !== OrderStatus.READY) {
      throw new BadRequestException({
        code: 'INVALID_ORDER_STATUS',
        message: 'Order must be ready to accept',
        userMessage: 'الطلب غير جاهز للقبول',
        suggestedAction: 'الطلب يجب أن يكون في حالة "جاهز"',
      });
    }

    // 3. التحقق من أن الطلب ليس له سائق بالفعل
    if (order.driver) {
      throw new BadRequestException({
        code: 'ORDER_ALREADY_ASSIGNED',
        message: 'Order already has a driver',
        userMessage: 'الطلب مكلف لسائق آخر',
      });
    }

    // 4. التحقق من أن السائق متاح
    const driver = await this.driverModel.findById(driverId);
    if (!driver) {
      throw new NotFoundException({
        code: 'DRIVER_NOT_FOUND',
        message: 'Driver not found',
        userMessage: 'السائق غير موجود',
      });
    }

    if (!driver.isAvailable || driver.isBanned) {
      throw new BadRequestException({
        code: 'DRIVER_NOT_AVAILABLE',
        message: 'Driver is not available',
        userMessage: 'السائق غير متاح',
      });
    }

    // 5. تعيين السائق للطلب
    await this.orderService.assignDriver(orderId, driverId);

    // 6. إرجاع الطلب المحدث
    const updatedOrder = await this.orderService.findOne(orderId);

    return {
      success: true,
      message: 'تم قبول الطلب بنجاح',
      order: updatedOrder,
    };
  }

  /**
   * رفض طلب من قبل السائق
   */
  async rejectOrder(orderId: string, driverId: string, reason: string) {
    // 1. التحقق من وجود الطلب
    const order = await this.orderService.findOne(orderId);
    if (!order) {
      throw new NotFoundException({
        code: 'ORDER_NOT_FOUND',
        message: 'Order not found',
        userMessage: 'الطلب غير موجود',
      });
    }

    // 2. التحقق من أن السائق موجود
    const driver = await this.driverModel.findById(driverId);
    if (!driver) {
      throw new NotFoundException({
        code: 'DRIVER_NOT_FOUND',
        message: 'Driver not found',
        userMessage: 'السائق غير موجود',
      });
    }

    // 3. تسجيل سبب الرفض كملاحظة داخلية
    await this.orderService.addNote(
      orderId,
      `رفض السائق: ${reason}`,
      'internal',
      { role: 'driver', id: driverId },
    );

    return {
      success: true,
      message: 'تم رفض الطلب',
    };
  }

  /**
   * بدء التوصيل من قبل السائق
   */
  async startDelivery(orderId: string, driverId: string) {
    // 1. التحقق من وجود الطلب
    const order = await this.orderService.findOne(orderId);
    if (!order) {
      throw new NotFoundException({
        code: 'ORDER_NOT_FOUND',
        message: 'Order not found',
        userMessage: 'الطلب غير موجود',
      });
    }

    // 2. التحقق من أن السائق هو المكلف بالطلب
    if (!order.driver || order.driver.toString() !== driverId) {
      throw new ForbiddenException({
        code: 'NOT_YOUR_ORDER',
        message: 'This order is not assigned to you',
        userMessage: 'هذا الطلب غير مكلف لك',
      });
    }

    // 3. التحقق من حالة الطلب
    if (order.status !== OrderStatus.PICKED_UP) {
      throw new BadRequestException({
        code: 'INVALID_ORDER_STATUS',
        message: 'Order must be picked up before starting delivery',
        userMessage: 'يجب استلام الطلب أولاً',
        suggestedAction: 'الطلب يجب أن يكون في حالة "تم الاستلام"',
      });
    }

    // 4. تحديث حالة الطلب إلى ON_THE_WAY
    await this.orderService.updateStatus(orderId, {
      status: OrderStatus.ON_THE_WAY,
      changedBy: 'driver',
    });

    // 5. إرجاع الطلب المحدث
    const updatedOrder = await this.orderService.findOne(orderId);

    // ✅ إرسال إشعار WebSocket عند بدء التوصيل
    try {
      const orderDoc = await this.orderModel
        .findById(orderId)
        .populate('user', 'fullName phone')
        .populate('driver', 'fullName phone')
        .lean();

      this.orderGateway.broadcastOrderStatusChange(
        orderId,
        OrderStatus.ON_THE_WAY,
        orderDoc,
      );
    } catch (error) {
      console.error('Error broadcasting delivery start:', error);
    }

    return {
      success: true,
      message: 'بدأ التوصيل',
      order: updatedOrder,
    };
  }

  /**
   * إتمام التوصيل من قبل السائق
   */
  async completeDelivery(orderId: string, driverId: string) {
    // 1. التحقق من وجود الطلب
    const order = await this.orderService.findOne(orderId);
    if (!order) {
      throw new NotFoundException({
        code: 'ORDER_NOT_FOUND',
        message: 'Order not found',
        userMessage: 'الطلب غير موجود',
      });
    }

    // 2. التحقق من أن السائق هو المكلف بالطلب
    if (!order.driver || order.driver.toString() !== driverId) {
      throw new ForbiddenException({
        code: 'NOT_YOUR_ORDER',
        message: 'This order is not assigned to you',
        userMessage: 'هذا الطلب غير مكلف لك',
      });
    }

    // 3. التحقق من حالة الطلب
    if (
      ![
        OrderStatus.PICKED_UP,
        OrderStatus.ON_THE_WAY,
        OrderStatus.ARRIVED,
      ].includes(order.status as OrderStatus)
    ) {
      throw new BadRequestException({
        code: 'INVALID_ORDER_STATUS',
        message: 'Order cannot be completed in this status',
        userMessage: 'حالة الطلب غير صحيحة للإتمام',
        suggestedAction: 'الطلب يجب أن يكون في حالة "تم الاستلام" أو "في الطريق" أو "وصل"',
      });
    }

    // 4. تحديث حالة الطلب إلى DELIVERED
    await this.orderService.updateStatus(orderId, {
      status: OrderStatus.DELIVERED,
      changedBy: 'driver',
    });

    // 5. تحديث تاريخ التسليم
    await this.orderModel.findByIdAndUpdate(orderId, {
      deliveredAt: new Date(),
    });

    // 6. تحديث إحصائيات السائق
    await this.updateDeliveryStats(driverId, true);

    // 7. ✅ إطلاق المبلغ المحجوز من المحفظة (إذا كان دفع بالمحفظة)
    // ملاحظة: يتم إطلاق المبلغ تلقائياً عند تحديث الحالة إلى DELIVERED في OrderService
    // لكن يمكننا التأكد هنا أيضاً
    if (
      order.paymentMethod === PaymentMethod.WALLET ||
      order.paymentMethod === PaymentMethod.MIXED
    ) {
      if (order.walletUsed > 0) {
        try {
          await this.walletService.releaseFunds(
            order.user.toString(),
            order.walletUsed,
            orderId,
          );
        } catch (error) {
          // تسجيل الخطأ ولكن لا نمنع الإتمام
          console.error('Error releasing wallet funds:', error);
        }
      }
    }

    // 8. إرجاع الطلب المحدث
    const updatedOrder = await this.orderService.findOne(orderId);

    return {
      success: true,
      message: 'تم إتمام التوصيل بنجاح',
      order: updatedOrder,
    };
  }

  /**
   * جلب سجل طلبات السائق
   */
  async getOrdersHistory(driverId: string, pagination: CursorPaginationDto) {
    // استخدام OrderService الموجود بالفعل
    return this.orderService.findDriverOrders(driverId, pagination);
  }

  async reportIssue(driverId: string, issueData: any) {
    // TODO: Create issue/support ticket
    void driverId;
    void issueData;
    await Promise.resolve();
    return {
      success: true,
      message: 'تم الإبلاغ عن المشكلة',
      issueId: 'issue_' + Date.now(),
    };
  }

  async changePassword(
    driverId: string,
    oldPassword: string,
    newPassword: string,
  ) {
    const driver = await this.driverModel.findById(driverId);
    if (!driver) {
      throw new NotFoundException({
        code: 'DRIVER_NOT_FOUND',
        message: 'Driver not found',
        userMessage: 'السائق غير موجود',
      });
    }

    // التحقق من كلمة المرور القديمة
    const isMatch = await bcrypt.compare(oldPassword, driver.password);
    if (!isMatch) {
      throw new ConflictException({
        code: 'INVALID_PASSWORD',
        message: 'Invalid old password',
        userMessage: 'كلمة المرور القديمة غير صحيحة',
      });
    }

    // تشفير كلمة المرور الجديدة
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    driver.password = hashedPassword;
    await driver.save();

    return {
      success: true,
      message: 'تم تغيير كلمة المرور بنجاح',
    };
  }

  // جلب بيانات السائق الحالي
  async getCurrentDriver(driverId: string) {
    const driver = await EntityHelper.findByIdOrFail(
      this.driverModel,
      driverId,
      'Driver',
    );

    return SanitizationHelper.sanitize<Driver>(driver);
  }

  // تحديث موقع السائق
  async updateLocation(
    driverId: string,
    locationData: { lat: number; lng: number; accuracy?: number },
  ) {
    const driver = await EntityHelper.findByIdOrFail(
      this.driverModel,
      driverId,
      'Driver',
    );

    // تحديث الموقع
    driver.currentLocation = {
      lat: locationData.lat,
      lng: locationData.lng,
      updatedAt: new Date(),
    };

    await driver.save();

    return {
      success: true,
      message: 'تم تحديث الموقع بنجاح',
      location: driver.currentLocation,
      updatedAt: driver.currentLocation.updatedAt,
    };
  }

  // جلب سحوبات السائق
  async getMyWithdrawals(driverId: string) {
    const withdrawals = await this.withdrawalModel.find({
      userId: driverId,
      userModel: 'Driver',
    }).sort({ createdAt: -1 });

    return {
      data: withdrawals,
      total: withdrawals.length,
    };
  }

  // طلب سحب أموال
  async requestWithdrawal(
    driverId: string,
    body: { amount: number; method: string; details?: any },
  ) {
    const driver = await EntityHelper.findByIdOrFail(
      this.driverModel,
      driverId,
      'Driver',
    );

    // التحقق من الرصيد الكافي
    const walletBalance = await this.walletService.getWalletBalance(driverId);
    if (walletBalance.availableBalance < body.amount) {
      throw new BadRequestException('Insufficient balance');
    }

    // إنشاء طلب السحب
    const withdrawal = await this.withdrawalModel.create({
      userId: driverId,
      userModel: 'Driver',
      amount: body.amount,
      currency: 'SAR',
      method: body.method,
      status: 'pending',
      bankDetails: body.details?.bankDetails,
      cryptoDetails: body.details?.cryptoDetails,
      walletDetails: body.details?.walletDetails,
    });

    // حجز الأموال
    await this.walletService.holdFunds(
      driverId,
      body.amount,
      `withdrawal-${withdrawal._id}`,
    );

    return withdrawal;
  }

  // إرسال إشارة SOS
  async sendSOS(
    driverId: string,
    body: { message?: string; location?: { lat: number; lng: number } },
  ) {
    const driver = await EntityHelper.findByIdOrFail(
      this.driverModel,
      driverId,
      'Driver',
    );

    // إنشاء إشعار SOS (يمكن أن يكون إشعار أو رسالة أو مكالمة)
    // TODO: Implement actual SOS logic (notifications, emergency contacts, etc.)

    return {
      success: true,
      message: 'تم إرسال إشارة SOS بنجاح',
      timestamp: new Date().toISOString(),
      driver: {
        id: driver._id,
        name: driver.fullName,
        phone: driver.phone,
        location: body.location || driver.currentLocation,
      },
      emergencyContacts: [], // TODO: Add emergency contacts
    };
  }
}
