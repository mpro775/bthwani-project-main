import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FinancialCoupon } from '../entities/financial-coupon.entity';
import {
  CreateFinancialCouponDto,
  UpdateFinancialCouponDto,
  ValidateCouponDto,
} from '../dto/create-coupon.dto';

@Injectable()
export class CouponService {
  constructor(
    @InjectModel(FinancialCoupon.name)
    private couponModel: Model<FinancialCoupon>,
  ) {}

  /**
   * إنشاء كوبون جديد
   */
  async create(
    dto: CreateFinancialCouponDto,
    createdBy: string,
  ): Promise<FinancialCoupon> {
    // التحقق من عدم وجود كود مكرر
    const existing = await this.couponModel.findOne({
      code: dto.code.toUpperCase(),
    });

    if (existing) {
      throw new BadRequestException('كود الكوبون مستخدم بالفعل');
    }

    // التحقق من التواريخ
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (endDate <= startDate) {
      throw new BadRequestException(
        'تاريخ النهاية يجب أن يكون بعد تاريخ البداية',
      );
    }

    const coupon = new this.couponModel({
      ...dto,
      code: dto.code.toUpperCase(),
      startDate,
      endDate,
      currentUsage: 0,
      createdByAdmin: createdBy,
    });

    return coupon.save();
  }

  /**
   * التحقق من صلاحية كوبون وحساب الخصم
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async validate(dto: ValidateCouponDto, _userId?: string) {
    const coupon = await this.couponModel.findOne({
      code: dto.code.toUpperCase(),
      isActive: true,
    });

    if (!coupon) {
      return {
        valid: false,
        message: 'الكوبون غير موجود أو غير نشط',
      };
    }

    // التحقق من التاريخ
    const now = new Date();
    if (now < coupon.startDate || now > coupon.endDate) {
      return {
        valid: false,
        message: 'الكوبون منتهي أو لم يبدأ بعد',
      };
    }

    // التحقق من الاستخدام الإجمالي
    if (coupon.currentUsage >= coupon.maxUsage) {
      return {
        valid: false,
        message: 'الكوبون وصل للحد الأقصى من الاستخدامات',
      };
    }

    // التحقق من الحد الأدنى للطلب
    if (coupon.minOrderAmount && dto.orderAmount < coupon.minOrderAmount) {
      return {
        valid: false,
        message: `الحد الأدنى لقيمة الطلب ${coupon.minOrderAmount} ريال`,
      };
    }

    // التحقق من المدينة
    if (coupon.allowedCities && coupon.allowedCities.length > 0) {
      if (dto.city && !coupon.allowedCities.includes(dto.city)) {
        return {
          valid: false,
          message: 'الكوبون غير متاح في هذه المدينة',
        };
      }
    }

    // التحقق من القناة
    if (coupon.allowedChannels && coupon.allowedChannels.length > 0) {
      if (dto.channel && !coupon.allowedChannels.includes(dto.channel)) {
        return {
          valid: false,
          message: 'الكوبون غير متاح في هذه القناة',
        };
      }
    }

    // حساب الخصم
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (dto.orderAmount * coupon.discountValue) / 100;
      // تطبيق الحد الأقصى إذا كان موجوداً
      if (
        coupon.maxDiscountAmount &&
        discountAmount > coupon.maxDiscountAmount
      ) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    // التأكد من أن الخصم لا يتجاوز قيمة الطلب
    if (discountAmount > dto.orderAmount) {
      discountAmount = dto.orderAmount;
    }

    return {
      valid: true,
      discountAmount: Math.round(discountAmount * 100) / 100,
      couponId: coupon._id,
      code: coupon.code,
      description: coupon.description,
    };
  }

  /**
   * تطبيق كوبون (زيادة العداد)
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async apply(couponId: string, userId?: string): Promise<FinancialCoupon> {
    const coupon = await this.couponModel.findById(couponId);
    if (!coupon) {
      throw new NotFoundException('الكوبون غير موجود');
    }

    if (coupon.currentUsage >= coupon.maxUsage) {
      throw new BadRequestException('الكوبون وصل للحد الأقصى');
    }

    coupon.currentUsage += 1;
    return coupon.save();
  }

  /**
   * الحصول على كوبون بالكود
   */
  async findByCode(code: string): Promise<FinancialCoupon> {
    const coupon = await this.couponModel.findOne({
      code: code.toUpperCase(),
    });
    if (!coupon) {
      throw new NotFoundException('الكوبون غير موجود');
    }
    return coupon;
  }

  /**
   * الحصول على كل الكوبونات
   */
  async findAll(isActive?: boolean): Promise<any[]> {
    const query: Record<string, any> = {};
    if (isActive !== undefined) {
      query.isActive = isActive;
    }
    return this.couponModel.find(query).sort({ createdAt: -1 }).lean().exec();
  }

  /**
   * تحديث كوبون
   */
  async update(
    id: string,
    dto: UpdateFinancialCouponDto,
  ): Promise<FinancialCoupon> {
    const coupon = await this.couponModel.findById(id);
    if (!coupon) {
      throw new NotFoundException('الكوبون غير موجود');
    }

    if (dto.description) coupon.description = dto.description;
    if (dto.isActive !== undefined) coupon.isActive = dto.isActive;
    if (dto.endDate) coupon.endDate = new Date(dto.endDate);
    if (dto.maxUsage) coupon.maxUsage = dto.maxUsage;

    return coupon.save();
  }

  /**
   * حذف كوبون
   */
  async delete(id: string): Promise<void> {
    const result = await this.couponModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('الكوبون غير موجود');
    }
  }

  /**
   * إحصائيات الكوبونات
   */
  async getStatistics() {
    const stats: Array<{
      _id: boolean;
      count: number;
      totalUsage: number;
      totalMaxUsage: number;
    }> = await this.couponModel.aggregate([
      {
        $group: {
          _id: '$isActive',
          count: { $sum: 1 },
          totalUsage: { $sum: '$currentUsage' },
          totalMaxUsage: { $sum: '$maxUsage' },
        },
      },
    ]);

    return {
      active: stats.find((s) => s._id === true) || { count: 0, totalUsage: 0 },
      inactive: stats.find((s) => s._id === false) || {
        count: 0,
        totalUsage: 0,
      },
    };
  }
}
