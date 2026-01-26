import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart, CartItem } from '../entities/cart.entity';
import { AddToCartDto, UpdateCartItemDto } from '../dto/add-to-cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name)
    private cartModel: Model<Cart>,
  ) {}

  /**
   * الحصول على سلة المستخدم أو إنشاء واحدة جديدة
   */
  async getOrCreateCart(userId: string): Promise<Cart> {
    let cart = await this.cartModel.findOne({ user: userId });
    if (!cart) {
      cart = new this.cartModel({
        user: userId,
        items: [],
        total: 0,
      });
      await cart.save();
    }
    return cart;
  }

  /**
   * إضافة منتج للسلة
   */
  async addItem(userId: string, dto: AddToCartDto): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId);

    // التحقق من وجود المنتج في السلة
    const existingItemIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === dto.productId &&
        item.productType === dto.productType,
    );

    if (existingItemIndex > -1) {
      // زيادة الكمية إذا كان موجوداً
      cart.items[existingItemIndex].quantity += dto.quantity;
    } else {
      // إضافة منتج جديد
      cart.items.push(dto as unknown as CartItem);
    }

    return cart.save();
  }

  /**
   * تحديث كمية منتج
   */
  async updateItemQuantity(
    userId: string,
    productId: string,
    dto: UpdateCartItemDto,
  ): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId);

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId,
    );

    if (itemIndex === -1) {
      throw new NotFoundException('المنتج غير موجود في السلة');
    }

    cart.items[itemIndex].quantity = dto.quantity;
    return cart.save();
  }

  /**
   * حذف منتج من السلة
   */
  async removeItem(userId: string, productId: string): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId);

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId,
    );

    return cart.save();
  }

  /**
   * تفريغ السلة
   */
  async clearCart(userId: string): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId);
    cart.items = [];
    cart.total = 0;
    return cart.save();
  }

  /**
   * إضافة ملاحظة
   */
  async addNote(userId: string, note: string): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId);
    cart.note = note;
    return cart.save();
  }

  /**
   * إضافة عنوان التوصيل
   */
  async addDeliveryAddress(
    userId: string,
    address: {
      street: string;
      city: string;
      building?: string;
      floor?: string;
      apartment?: string;
      location?: { lat: number; lng: number };
    },
  ): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId);
    cart.deliveryAddress = address;
    return cart.save();
  }

  /**
   * عدد العناصر في السلة
   */
  async getItemsCount(userId: string): Promise<number> {
    const cart = await this.getOrCreateCart(userId);
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  }
}
