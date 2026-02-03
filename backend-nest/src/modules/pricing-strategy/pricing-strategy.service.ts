import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PricingStrategy } from './entities/pricing-strategy.entity';
import {
  CreatePricingStrategyDto,
  UpdatePricingStrategyDto,
} from './dto/create-pricing-strategy.dto';

const DEFAULT_FALLBACK_FEE = 500;

@Injectable()
export class PricingStrategyService {
  constructor(
    @InjectModel(PricingStrategy.name)
    private pricingStrategyModel: Model<PricingStrategy>,
  ) {}

  async findAll(): Promise<PricingStrategy[]> {
    const list = await this.pricingStrategyModel
      .find()
      .sort({ isDefault: -1, name: 1 })
      .lean()
      .exec();
    return list as unknown as PricingStrategy[];
  }

  async findById(id: string): Promise<PricingStrategy | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    const doc = await this.pricingStrategyModel.findById(id).lean().exec();
    return doc as unknown as PricingStrategy | null;
  }

  async getDefaultStrategy(): Promise<PricingStrategy | null> {
    const defaultStrategy = await this.pricingStrategyModel
      .findOne({ isDefault: true })
      .lean()
      .exec();
    if (defaultStrategy) return defaultStrategy as unknown as PricingStrategy;

    const first = await this.pricingStrategyModel
      .findOne()
      .sort({ createdAt: 1 })
      .lean()
      .exec();
    return (first ?? null) as unknown as PricingStrategy | null;
  }

  async create(dto: CreatePricingStrategyDto): Promise<PricingStrategy> {
    if (dto.isDefault) {
      await this.pricingStrategyModel.updateMany({}, { $set: { isDefault: false } }).exec();
    }
    const strategy = new this.pricingStrategyModel({
      name: dto.name,
      baseDistance: dto.baseDistance ?? 0,
      basePrice: dto.basePrice ?? 0,
      tiers: dto.tiers ?? [],
      defaultPricePerKm: dto.defaultPricePerKm ?? 0,
      isDefault: dto.isDefault ?? false,
    });
    return strategy.save();
  }

  async update(
    id: string,
    dto: UpdatePricingStrategyDto,
  ): Promise<PricingStrategy> {
    const strategy = await this.pricingStrategyModel.findById(id).exec();
    if (!strategy) {
      throw new NotFoundException({
        code: 'PRICING_STRATEGY_NOT_FOUND',
        message: 'Pricing strategy not found',
        userMessage: 'استراتيجية التسعير غير موجودة',
      });
    }

    if (dto.isDefault === true) {
      await this.pricingStrategyModel
        .updateMany({ _id: { $ne: id } }, { $set: { isDefault: false } })
        .exec();
    }

    if (dto.name !== undefined) strategy.name = dto.name;
    if (dto.baseDistance !== undefined) strategy.baseDistance = dto.baseDistance;
    if (dto.basePrice !== undefined) strategy.basePrice = dto.basePrice;
    if (dto.tiers !== undefined) strategy.tiers = dto.tiers as never[];
    if (dto.defaultPricePerKm !== undefined)
      strategy.defaultPricePerKm = dto.defaultPricePerKm;
    if (dto.isDefault !== undefined) strategy.isDefault = dto.isDefault;

    return strategy.save();
  }

  async delete(id: string): Promise<void> {
    const result = await this.pricingStrategyModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException({
        code: 'PRICING_STRATEGY_NOT_FOUND',
        message: 'Pricing strategy not found',
        userMessage: 'استراتيجية التسعير غير موجودة',
      });
    }
  }

  /**
   * حساب رسوم التوصيل بناءً على المسافة والاستراتيجية
   * 1. إذا distanceKm <= baseDistance → fee = basePrice
   * 2. إذا وقعت ضمن tier → fee = basePrice + (d - baseDistance) * tier.pricePerKm
   * 3. وإلا → fee = basePrice + (d - baseDistance) * defaultPricePerKm
   */
  calculateFee(
    distanceKm: number,
    strategy:
      | PricingStrategy
      | {
          baseDistance: number;
          basePrice: number;
          tiers?: Array<{ minDistance: number; maxDistance: number; pricePerKm: number }>;
          defaultPricePerKm: number;
        },
  ): number {
    const baseDistance = strategy.baseDistance ?? 0;
    const basePrice = strategy.basePrice ?? 0;
    const tiers = strategy.tiers ?? [];
    const defaultPricePerKm = strategy.defaultPricePerKm ?? 0;

    if (distanceKm <= baseDistance) {
      return Math.round(basePrice);
    }

    const extraKm = distanceKm - baseDistance;
    let pricePerKm = defaultPricePerKm;

    for (const tier of tiers) {
      if (distanceKm >= tier.minDistance && distanceKm < tier.maxDistance) {
        pricePerKm = tier.pricePerKm;
        break;
      }
    }

    const fee = basePrice + extraKm * pricePerKm;
    return Math.round(Math.max(0, fee));
  }

  /**
   * حساب رسوم التوصيل باستخدام الاستراتيجية الافتراضية.
   * إذا لم توجد استراتيجية، يُرجع DEFAULT_FALLBACK_FEE.
   */
  async calculateDeliveryFee(distanceKm: number): Promise<number> {
    const strategy = await this.getDefaultStrategy();
    if (!strategy) {
      return DEFAULT_FALLBACK_FEE;
    }
    return this.calculateFee(distanceKm, strategy);
  }
}
