import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { getDistance } from 'geolib';
import { Cart, CartItem } from '../entities/cart.entity';
import { AddToCartDto, UpdateCartItemDto } from '../dto/add-to-cart.dto';
import { PricingStrategyService } from '../../pricing-strategy/pricing-strategy.service';
import { UserService } from '../../user/user.service';
import { StoreService } from '../../store/store.service';

const DEFAULT_FALLBACK_FEE = 500;

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name)
    private cartModel: Model<Cart>,
    private readonly pricingStrategyService: PricingStrategyService,
    private readonly userService: UserService,
    private readonly storeService: StoreService,
  ) {}

  /**
   * الحصول على سلة المستخدم أو إنشاء واحدة جديدة
   */
  async getOrCreateCart(userId: string): Promise<Cart> {
    if (!userId || typeof userId !== 'string' || !String(userId).trim()) {
      throw new BadRequestException({
        code: 'USER_ID_REQUIRED',
        message: 'User ID is required to get or create a cart',
        userMessage: 'يجب تحديد المستخدم',
      });
    }
    const uid = String(userId).trim();
    let cart = await this.cartModel.findOne({ user: uid });
    if (!cart) {
      cart = new this.cartModel({
        user: uid,
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

  /**
   * قائمة كل السلات (للأدمن فقط)
   */
  async listAllCarts(limit = 200): Promise<Cart[]> {
    return this.cartModel
      .find({})
      .populate('user', 'name phone email fullName')
      .sort({ lastModified: -1 })
      .limit(limit)
      .lean()
      .exec() as unknown as Promise<Cart[]>;
  }

  /**
   * حساب رسوم التوصيل بناءً على المسافة واستراتيجية التسعير
   */
  async calculateDeliveryFee(
    userId: string,
    addressId?: string | null,
  ): Promise<{ subtotal: number; deliveryFee: number; total: number }> {
    const cart = await this.getOrCreateCart(userId);
    const subtotal = cart.total ?? 0;

    if (!cart.items?.length) {
      return {
        subtotal,
        deliveryFee: 0,
        total: subtotal,
      };
    }

    if (!addressId) {
      return {
        subtotal,
        deliveryFee: DEFAULT_FALLBACK_FEE,
        total: subtotal + DEFAULT_FALLBACK_FEE,
      };
    }

    const address = await this.userService.getAddressById(userId, addressId);
    if (!address?.location?.lat || !address?.location?.lng) {
      return {
        subtotal,
        deliveryFee: DEFAULT_FALLBACK_FEE,
        total: subtotal + DEFAULT_FALLBACK_FEE,
      };
    }

    const firstStoreId = cart.items[0]?.store?.toString?.() ?? cart.items[0]?.store;
    if (!firstStoreId) {
      return {
        subtotal,
        deliveryFee: DEFAULT_FALLBACK_FEE,
        total: subtotal + DEFAULT_FALLBACK_FEE,
      };
    }

    let store: { location?: { lat: number; lng: number }; deliveryRadiusKm?: number };
    try {
      store = await this.storeService.findStoreById(firstStoreId);
    } catch {
      return {
        subtotal,
        deliveryFee: DEFAULT_FALLBACK_FEE,
        total: subtotal + DEFAULT_FALLBACK_FEE,
      };
    }

    const storeLocation = store?.location;
    if (!storeLocation?.lat || !storeLocation?.lng) {
      return {
        subtotal,
        deliveryFee: DEFAULT_FALLBACK_FEE,
        total: subtotal + DEFAULT_FALLBACK_FEE,
      };
    }

    const distanceMeters = getDistance(
      { latitude: storeLocation.lat, longitude: storeLocation.lng },
      { latitude: address.location.lat, longitude: address.location.lng },
    );
    const distanceKm = Math.round((distanceMeters / 1000) * 100) / 100;

    if (
      store.deliveryRadiusKm != null &&
      store.deliveryRadiusKm > 0 &&
      distanceKm > store.deliveryRadiusKm
    ) {
      throw new BadRequestException({
        code: 'DELIVERY_OUT_OF_RANGE',
        message: `المسافة (${distanceKm} كم) تتجاوز نصف قطر التوصيل (${store.deliveryRadiusKm} كم)`,
        userMessage: 'العنوان خارج نطاق التوصيل للمتجر',
        details: { distanceKm, deliveryRadiusKm: store.deliveryRadiusKm },
      });
    }

    const deliveryFee = await this.pricingStrategyService.calculateDeliveryFee(
      distanceKm,
    );

    return {
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
    };
  }
}
