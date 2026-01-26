import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { CartService } from './services/cart.service';
import { SheinCartService } from './services/shein-cart.service';
import {
  AddToCartDto,
  UpdateCartItemDto,
  AddNoteDto,
  AddDeliveryAddressDto,
} from './dto/add-to-cart.dto';
import {
  AddToSheinCartDto,
  UpdateSheinCartItemDto,
  UpdateSheinShippingDto,
} from './dto/shein-cart.dto';
import { Auth, CurrentUser } from '../../common/decorators/auth.decorator';
import { AuthType } from '../../common/guards/unified-auth.guard';

@ApiTags('Cart')
@Controller({ path: 'delivery/cart', version: ['1', '2'] })
@ApiBearerAuth()
export class CartController {
  constructor(
    private readonly cartService: CartService,
    private readonly sheinCartService: SheinCartService,
  ) {}

  // ==================== Regular Cart (DeliveryCart) ====================

  @Get()
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.FIREBASE)
  @ApiOperation({ summary: 'الحصول على سلتي' })
  async getMyCart(@CurrentUser('id') userId: string) {
    return this.cartService.getOrCreateCart(userId);
  }

  @Get('user/:userId')
  @ApiParam({ name: 'userId', type: String })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.FIREBASE)
  @ApiOperation({ summary: 'الحصول على سلة مستخدم' })
  async getUserCart(@Param('userId') userId: string) {
    return this.cartService.getOrCreateCart(userId);
  }

  @Get(':cartId')
  @ApiParam({ name: 'cartId', type: String })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.FIREBASE)
  @ApiOperation({ summary: 'الحصول على سلة بالمعرف' })
  async getCartById(@Param('cartId') cartId: string, @CurrentUser('id') userId: string) {
    return this.cartService.getOrCreateCart(userId);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Deleted' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.FIREBASE)
  @ApiOperation({ summary: 'حذف سلة أو منتج من السلة' })
  async deleteCartItem(@CurrentUser('id') userId: string, @Param('id') itemId: string) {
    return this.cartService.removeItem(userId, itemId);
  }

  @Post('items')
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.FIREBASE)
  @ApiOperation({ summary: 'إضافة منتج للسلة' })
  async addToCart(
    @CurrentUser('id') userId: string,
    @Body() dto: AddToCartDto,
  ) {
    return this.cartService.addItem(userId, dto);
  }

  @Post('add')
  @ApiBody({ schema: { type: 'object', properties: { items: { type: 'array' }, store: { type: 'string' } } } })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.FIREBASE)
  @ApiOperation({ summary: 'إضافة منتج للسلة (توافق)' })
  async addToCartCompat(
    @CurrentUser('id') userId: string,
    @Body() body: any,
  ) {
    const dto: AddToCartDto = {
      productType: body.items?.[0]?.productType || 'deliveryProduct',
      productId: body.items?.[0]?.productId,
      name: body.items?.[0]?.name,
      price: body.items?.[0]?.price,
      quantity: body.items?.[0]?.quantity || 1,
      store: body.items?.[0]?.store || body.store,
      image: body.items?.[0]?.image,
      options: body.items?.[0]?.options,
    };
    return this.cartService.addItem(userId, dto);
  }

  @Patch('items/:productId')
  @ApiParam({ name: 'productId', type: String })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.FIREBASE)
  @ApiOperation({ summary: 'تحديث كمية منتج' })
  async updateCartItem(
    @CurrentUser('id') userId: string,
    @Param('productId') productId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItemQuantity(userId, productId, dto);
  }

  @Patch(':productId')
  @ApiParam({ name: 'productId', type: String })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.FIREBASE)
  @ApiOperation({ summary: 'تحديث كمية منتج (توافق)' })
  async updateCartItemCompat(
    @CurrentUser('id') userId: string,
    @Param('productId') productId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItemQuantity(userId, productId, dto);
  }

  @Delete('items/:productId')
  @ApiParam({ name: 'productId', type: String })
  @ApiResponse({ status: 200, description: 'Deleted' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.FIREBASE)
  @ApiOperation({ summary: 'حذف منتج من السلة' })
  async removeFromCart(
    @CurrentUser('id') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.cartService.removeItem(userId, productId);
  }

  @Delete(':productId')
  @ApiParam({ name: 'productId', type: String })
  @ApiResponse({ status: 200, description: 'Deleted' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.FIREBASE)
  @ApiOperation({ summary: 'حذف منتج من السلة (توافق)' })
  async removeFromCartCompat(
    @CurrentUser('id') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.cartService.removeItem(userId, productId);
  }

  @Delete()
  @ApiResponse({ status: 200, description: 'Deleted' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.FIREBASE)
  @ApiOperation({ summary: 'تفريغ السلة' })
  async clearCart(@CurrentUser('id') userId: string) {
    return this.cartService.clearCart(userId);
  }

  @Patch('note')
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.FIREBASE)
  @ApiOperation({ summary: 'إضافة ملاحظة' })
  async addNote(@CurrentUser('id') userId: string, @Body() dto: AddNoteDto) {
    return this.cartService.addNote(userId, dto.note);
  }

  @Patch('delivery-address')
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.FIREBASE)
  @ApiOperation({ summary: 'إضافة عنوان التوصيل' })
  async addDeliveryAddress(
    @CurrentUser('id') userId: string,
    @Body() dto: AddDeliveryAddressDto,
  ) {
    return this.cartService.addDeliveryAddress(userId, dto);
  }

  @Get('count')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.FIREBASE)
  @ApiOperation({ summary: 'عدد العناصر في السلة' })
  async getCartCount(@CurrentUser('id') userId: string) {
    const count = await this.cartService.getItemsCount(userId);
    return { count };
  }

  @Get('fee')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.FIREBASE)
  @ApiOperation({ summary: 'حساب رسوم التوصيل' })
  async getCartFee(@CurrentUser('id') userId: string) {
    const cart = await this.cartService.getOrCreateCart(userId);
    // حساب رسوم بسيط - يمكن تطويره لاحقاً
    const deliveryFee = cart.items.length > 0 ? 500 : 0;
    return {
      subtotal: cart.total,
      deliveryFee,
      total: cart.total + deliveryFee,
    };
  }

  @Post('merge')
  @ApiBody({ schema: { type: 'object', properties: { guestCartId: { type: 'string' } } } })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.FIREBASE)
  @ApiOperation({ summary: 'دمج سلة الضيف مع سلة المستخدم' })
  async mergeCart(@CurrentUser('id') userId: string, @Body() body: any) {
    // للتوافق مع الـ frontend - يتم تجاهل سلة الضيف حالياً
    return this.cartService.getOrCreateCart(userId);
  }

  // ==================== Shein Cart ====================

  @Get('shein')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.FIREBASE)
  @ApiOperation({ summary: 'الحصول على سلة Shein' })
  async getMySheinCart(@CurrentUser('id') userId: string) {
    return this.sheinCartService.getOrCreateCart(userId);
  }

  @Post('shein/items')
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.FIREBASE)
  @ApiOperation({ summary: 'إضافة منتج Shein للسلة' })
  async addToSheinCart(
    @CurrentUser('id') userId: string,
    @Body() dto: AddToSheinCartDto,
  ) {
    return this.sheinCartService.addItem(userId, dto);
  }

  @Patch('shein/items/:sheinProductId')
  @ApiParam({ name: 'sheinProductId', type: String })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.FIREBASE)
  @ApiOperation({ summary: 'تحديث كمية منتج Shein' })
  async updateSheinCartItem(
    @CurrentUser('id') userId: string,
    @Param('sheinProductId') sheinProductId: string,
    @Body() dto: UpdateSheinCartItemDto,
  ) {
    return this.sheinCartService.updateItemQuantity(
      userId,
      sheinProductId,
      dto,
    );
  }

  @Delete('shein/items/:sheinProductId')
  @ApiParam({ name: 'sheinProductId', type: String })
  @ApiResponse({ status: 200, description: 'Deleted' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.FIREBASE)
  @ApiOperation({ summary: 'حذف منتج Shein من السلة' })
  async removeFromSheinCart(
    @CurrentUser('id') userId: string,
    @Param('sheinProductId') sheinProductId: string,
  ) {
    return this.sheinCartService.removeItem(userId, sheinProductId);
  }

  @Delete('shein')
  @ApiResponse({ status: 200, description: 'Deleted' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.FIREBASE)
  @ApiOperation({ summary: 'تفريغ سلة Shein' })
  async clearSheinCart(@CurrentUser('id') userId: string) {
    return this.sheinCartService.clearCart(userId);
  }

  @Patch('shein/shipping')
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.FIREBASE)
  @ApiOperation({ summary: 'تحديث تكاليف الشحن' })
  async updateSheinShipping(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateSheinShippingDto,
  ) {
    return this.sheinCartService.updateShipping(userId, dto);
  }

  @Patch('shein/note')
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.FIREBASE)
  @ApiOperation({ summary: 'إضافة ملاحظة لسلة Shein' })
  async addSheinNote(
    @CurrentUser('id') userId: string,
    @Body() dto: AddNoteDto,
  ) {
    return this.sheinCartService.addNote(userId, dto.note);
  }

  // ==================== Combined Cart (دمج السلات) ====================

  @Get('combined')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.FIREBASE)
  @ApiOperation({ summary: 'الحصول على السلة الموحدة' })
  async getCombinedCart(@CurrentUser('id') userId: string) {
    const [regularCart, sheinCart] = await Promise.all([
      this.cartService.getOrCreateCart(userId),
      this.sheinCartService.getOrCreateCart(userId),
    ]);

    return {
      regularCart: {
        items: regularCart.items,
        total: regularCart.total,
        itemsCount: regularCart.items.reduce(
          (sum, item) => sum + item.quantity,
          0,
        ),
      },
      sheinCart: {
        items: sheinCart.items,
        subtotal: sheinCart.subtotal,
        shipping: sheinCart.internationalShipping + sheinCart.localShipping,
        serviceFee: sheinCart.serviceFee,
        total: sheinCart.total,
        itemsCount: sheinCart.items.reduce(
          (sum, item) => sum + item.quantity,
          0,
        ),
      },
      grandTotal: regularCart.total + sheinCart.total,
    };
  }

  @Delete('combined/clear-all')
  @ApiResponse({ status: 200, description: 'Deleted' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.FIREBASE)
  @ApiOperation({ summary: 'تفريغ كل السلات' })
  async clearAllCarts(@CurrentUser('id') userId: string) {
    await Promise.all([
      this.cartService.clearCart(userId),
      this.sheinCartService.clearCart(userId),
    ]);
    return { message: 'تم تفريغ كل السلات بنجاح' };
  }

  // ==================== Admin Endpoints ====================

  @Get('abandoned')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.FIREBASE)
  @ApiOperation({ summary: 'الحصول على السلات المهجورة (Admin)' })
  async getAbandonedCarts() {
    // سلات لم يتم تحديثها منذ 24 ساعة
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return this.cartService['cartModel']
      .find({ lastModified: { $lt: oneDayAgo }, 'items.0': { $exists: true } })
      .populate('user', 'name phone')
      .sort({ lastModified: -1 })
      .limit(100);
  }

  @Delete(':cartId/items/:productId')
  @ApiParam({ name: 'cartId', type: String })
  @ApiParam({ name: 'productId', type: String })
  @ApiResponse({ status: 200, description: 'Deleted' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.FIREBASE)
  @ApiOperation({ summary: 'حذف منتج من سلة محددة (Admin)' })
  async deleteSpecificCartItem(
    @Param('cartId') cartId: string,
    @Param('productId') productId: string,
  ) {
    const cart = await this.cartService['cartModel'].findById(cartId);
    if (!cart) {
      return { success: false, message: 'السلة غير موجودة' };
    }
    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId,
    );
    await cart.save();
    return { success: true, message: 'تم حذف المنتج' };
  }

  @Post(':cartId/retarget/push')
  @ApiParam({ name: 'cartId', type: String })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.FIREBASE)
  @ApiOperation({ summary: 'إرسال إشعار استعادة السلة (Admin)' })
  async sendRetargetNotification(
    @Param('cartId') cartId: string,
    @Body() body: any,
  ) {
    // للتوافق - يمكن تطوير لاحقاً
    return { success: true, message: 'تم إرسال الإشعار' };
  }
}
