import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Promotion } from '../entities/promotion.entity';
import {
  CreatePromotionDto,
  UpdatePromotionDto,
  GetPromotionsByPlacementDto,
} from '../dto/create-promotion.dto';

@Injectable()
export class PromotionService {
  constructor(
    @InjectModel(Promotion.name)
    private promotionModel: Model<Promotion>,
  ) {}

  /**
   * إنشاء عرض ترويجي جديد
   */
  async create(dto: CreatePromotionDto, createdBy: string): Promise<Promotion> {
    // التحقق من التواريخ
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (endDate <= startDate) {
      throw new BadRequestException(
        'تاريخ النهاية يجب أن يكون بعد تاريخ البداية',
      );
    }

    // التحقق من وجود الهدف المطلوب
    if ((dto.target as string) === 'product' && !dto.product) {
      throw new BadRequestException('معرف المنتج مطلوب');
    }
    if ((dto.target as string) === 'store' && !dto.store) {
      throw new BadRequestException('معرف المتجر مطلوب');
    }
    if ((dto.target as string) === 'category' && !dto.category) {
      throw new BadRequestException('معرف الفئة مطلوب');
    }

    const promotion = new this.promotionModel({
      ...dto,
      startDate,
      endDate,
      createdBy,
      viewsCount: 0,
      clicksCount: 0,
      conversionsCount: 0,
    });

    return promotion.save();
  }

  /**
   * الحصول على عروض حسب الموضع
   */
  async getByPlacement(dto: GetPromotionsByPlacementDto): Promise<Promotion[]> {
    const now = new Date();
    const query: Record<string, unknown> = {
      placements: dto.placement,
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    };

    // تصفية حسب المدينة
    if (dto.city) {
      query.$or = [{ cities: { $size: 0 } }, { cities: dto.city }];
    } else {
      query.cities = { $size: 0 }; // فقط العروض العامة
    }

    // تصفية حسب القناة
    if (dto.channel) {
      query.channels = dto.channel;
    }

    const promotions = await this.promotionModel
      .find(query)
      .sort({ order: 1, createdAt: -1 })
      .populate('product store category')
      .lean()
      .exec();

    // زيادة عداد المشاهدات
    await this.promotionModel.updateMany(
      {
        _id: {
          $in: promotions.map((p) => (p as { _id: unknown })._id),
        },
      },
      { $inc: { viewsCount: 1 } },
    );

    return promotions as unknown as Promotion[];
  }

  /**
   * تسجيل نقرة على عرض
   */
  async recordClick(id: string): Promise<void> {
    await this.promotionModel.findByIdAndUpdate(id, {
      $inc: { clicksCount: 1 },
    });
  }

  /**
   * تسجيل تحويل (طلب من العرض)
   */
  async recordConversion(id: string): Promise<void> {
    await this.promotionModel.findByIdAndUpdate(id, {
      $inc: { conversionsCount: 1 },
    });
  }

  /**
   * حساب الخصم من العرض
   */
  calculateDiscount(
    promotion: {
      minOrderSubtotal?: number;
      minQty?: number;
      valueType: string;
      value: number;
      maxDiscountAmount?: number;
    },
    orderSubtotal: number,
    itemQty?: number,
  ): number {
    // التحقق من الحد الأدنى للطلب
    if (
      promotion.minOrderSubtotal &&
      orderSubtotal < promotion.minOrderSubtotal
    ) {
      return 0;
    }

    // التحقق من الحد الأدنى للكمية
    if (promotion.minQty && itemQty && itemQty < promotion.minQty) {
      return 0;
    }

    let discount = 0;

    if (promotion.valueType === 'percentage') {
      discount = (orderSubtotal * promotion.value) / 100;

      // تطبيق السقف إذا كان موجوداً
      if (
        promotion.maxDiscountAmount &&
        discount > promotion.maxDiscountAmount
      ) {
        discount = promotion.maxDiscountAmount;
      }
    } else {
      // Fixed amount
      discount = promotion.value;
    }

    // التأكد من أن الخصم لا يتجاوز قيمة الطلب
    if (discount > orderSubtotal) {
      discount = orderSubtotal;
    }

    return Math.round(discount * 100) / 100;
  }

  /**
   * الحصول على كل العروض (admin)
   */
  async findAll(isActive?: boolean): Promise<Promotion[]> {
    const query: Record<string, unknown> = {};
    if (isActive !== undefined) {
      query.isActive = isActive;
    }

    const result = await this.promotionModel
      .find(query)
      .sort({ createdAt: -1 })
      .populate('product store category')
      .lean()
      .exec();

    return result as unknown as Promotion[];
  }

  /**
   * الحصول على عرض محدد
   */
  async findById(id: string): Promise<Promotion> {
    const promotion = await this.promotionModel
      .findById(id)
      .populate('product store category');

    if (!promotion) {
      throw new NotFoundException('العرض غير موجود');
    }

    return promotion;
  }

  /**
   * تحديث عرض
   */
  async update(id: string, dto: UpdatePromotionDto): Promise<Promotion> {
    const promotion = await this.promotionModel.findById(id);
    if (!promotion) {
      throw new NotFoundException('العرض غير موجود');
    }

    if (dto.title) promotion.title = dto.title;
    if (dto.description) promotion.description = dto.description;
    if (dto.image) promotion.image = dto.image;
    if (dto.isActive !== undefined) promotion.isActive = dto.isActive;
    if (dto.endDate) promotion.endDate = new Date(dto.endDate);
    if (dto.placements) promotion.placements = dto.placements as never;
    if (dto.order !== undefined) promotion.order = dto.order;

    return promotion.save();
  }

  /**
   * حذف عرض
   */
  async delete(id: string): Promise<void> {
    const result = await this.promotionModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('العرض غير موجود');
    }
  }

  /**
   * إحصائيات العروض
   */
  async getStatistics(): Promise<{
    active: {
      _id: boolean;
      count: number;
      totalViews: number;
      totalClicks: number;
      totalConversions: number;
    };
    inactive: {
      _id: boolean;
      count: number;
      totalViews: number;
      totalClicks: number;
      totalConversions: number;
    };
    ctr: number;
    conversionRate: number;
  }> {
    interface StatItem {
      _id: boolean;
      count: number;
      totalViews: number;
      totalClicks: number;
      totalConversions: number;
    }

    const stats = await this.promotionModel.aggregate<StatItem>([
      {
        $group: {
          _id: '$isActive',
          count: { $sum: 1 },
          totalViews: { $sum: '$viewsCount' },
          totalClicks: { $sum: '$clicksCount' },
          totalConversions: { $sum: '$conversionsCount' },
        },
      },
    ]);

    const active: StatItem = stats.find((s) => s._id === true) || {
      _id: true,
      count: 0,
      totalViews: 0,
      totalClicks: 0,
      totalConversions: 0,
    };

    const inactive: StatItem = stats.find((s) => s._id === false) || {
      _id: false,
      count: 0,
      totalViews: 0,
      totalClicks: 0,
      totalConversions: 0,
    };

    return {
      active,
      inactive,
      ctr:
        active.totalViews > 0
          ? (active.totalClicks / active.totalViews) * 100
          : 0,
      conversionRate:
        active.totalClicks > 0
          ? (active.totalConversions / active.totalClicks) * 100
          : 0,
    };
  }
}
