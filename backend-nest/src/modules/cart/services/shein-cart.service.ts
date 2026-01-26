import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SheinCart, SheinCartItem } from '../entities/shein-cart.entity';
import {
  AddToSheinCartDto,
  UpdateSheinCartItemDto,
  UpdateSheinShippingDto,
} from '../dto/shein-cart.dto';

@Injectable()
export class SheinCartService {
  constructor(
    @InjectModel(SheinCart.name)
    private sheinCartModel: Model<SheinCart>,
  ) {}

  /**
   * الحصول على سلة Shein أو إنشاء واحدة
   */
  async getOrCreateCart(userId: string): Promise<SheinCart> {
    let cart = await this.sheinCartModel.findOne({ user: userId });
    if (!cart) {
      cart = new this.sheinCartModel({
        user: userId,
        items: [],
        subtotal: 0,
        internationalShipping: 0,
        localShipping: 0,
        serviceFee: 0,
        total: 0,
      });
      await cart.save();
    }
    return cart;
  }

  /**
   * إضافة منتج Shein للسلة
   */
  async addItem(userId: string, dto: AddToSheinCartDto): Promise<SheinCart> {
    const cart = await this.getOrCreateCart(userId);

    // التحقق من وجود المنتج
    const existingIndex = cart.items.findIndex(
      (item) =>
        item.sheinProductId === dto.sheinProductId &&
        item.size === dto.size &&
        item.color === dto.color,
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += dto.quantity;
    } else {
      cart.items.push(dto as unknown as SheinCartItem);
    }

    return cart.save();
  }

  /**
   * تحديث كمية منتج
   */
  async updateItemQuantity(
    userId: string,
    sheinProductId: string,
    dto: UpdateSheinCartItemDto,
  ): Promise<SheinCart> {
    const cart = await this.getOrCreateCart(userId);

    const itemIndex = cart.items.findIndex(
      (item) => item.sheinProductId === sheinProductId,
    );

    if (itemIndex === -1) {
      throw new NotFoundException('المنتج غير موجود في السلة');
    }

    cart.items[itemIndex].quantity = dto.quantity;
    return cart.save();
  }

  /**
   * حذف منتج
   */
  async removeItem(userId: string, sheinProductId: string): Promise<SheinCart> {
    const cart = await this.getOrCreateCart(userId);

    cart.items = cart.items.filter(
      (item) => item.sheinProductId !== sheinProductId,
    );

    return cart.save();
  }

  /**
   * تحديث تكاليف الشحن
   */
  async updateShipping(
    userId: string,
    dto: UpdateSheinShippingDto,
  ): Promise<SheinCart> {
    const cart = await this.getOrCreateCart(userId);

    cart.internationalShipping = dto.internationalShipping;
    cart.localShipping = dto.localShipping;
    cart.serviceFee = dto.serviceFee;
    if (dto.exchangeRate) cart.exchangeRate = dto.exchangeRate;

    return cart.save();
  }

  /**
   * تفريغ السلة
   */
  async clearCart(userId: string): Promise<SheinCart> {
    const cart = await this.getOrCreateCart(userId);
    cart.items = [];
    cart.subtotal = 0;
    cart.total = 0;
    return cart.save();
  }

  /**
   * إضافة ملاحظة
   */
  async addNote(userId: string, note: string): Promise<SheinCart> {
    const cart = await this.getOrCreateCart(userId);
    cart.note = note;
    return cart.save();
  }
}
