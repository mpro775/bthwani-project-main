import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  SetMetadata,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { UtilityService } from './services/utility.service';
import { UtilityOrderService } from './services/utility-order.service';
import {
  CreateUtilityPricingDto,
  UpdateUtilityPricingDto,
  CalculateUtilityPriceDto,
} from './dto/create-utility-pricing.dto';
import { CreateDailyPriceDto } from './dto/daily-price.dto';
import { CreateUtilityOrderDto } from './dto/create-utility-order.dto';
import { Auth, CurrentUser } from '../../common/decorators/auth.decorator';
import { AuthType } from '../../common/guards/unified-auth.guard';

const Roles = (...roles: string[]) => SetMetadata('roles', roles);

@ApiTags('Utility')
@Controller(['utility', 'api'])
export class UtilityController {
  constructor(
    private readonly utilityService: UtilityService,
    private readonly utilityOrderService: UtilityOrderService,
  ) {}

  // ==================== Public Endpoints ====================

  @Get('options')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'الحصول على خيارات الغاز والماء (public)' })
  async getUtilityOptions(@Query('city') city?: string) {
    return this.utilityService.getOptions(city);
  }

  @Post('calculate-price')
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'حساب سعر خدمة الغاز أو الماء' })
  async calculatePrice(@Body() dto: CalculateUtilityPriceDto) {
    return this.utilityService.calculatePrice(dto);
  }

  // ==================== Admin Endpoints ====================

  @Post('pricing')
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'إنشاء تسعير لمدينة' })
  async createPricing(@Body() dto: CreateUtilityPricingDto) {
    return this.utilityService.create(dto);
  }

  @Get('pricing')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'الحصول على كل التسعيرات' })
  async getAllPricing() {
    return this.utilityService.findAll();
  }

  @Get('pricing/:city')
  @ApiParam({ name: 'city', type: String })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'الحصول على تسعير مدينة' })
  async getPricingByCity(@Param('city') city: string) {
    return this.utilityService.findByCity(city);
  }

  @Patch('pricing/:city')
  @ApiParam({ name: 'city', type: String })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'تحديث تسعير مدينة' })
  async updatePricing(
    @Param('city') city: string,
    @Body() dto: UpdateUtilityPricingDto,
  ) {
    return this.utilityService.update(city, dto);
  }

  @Delete('pricing/:city')
  @ApiParam({ name: 'city', type: String })
  @ApiResponse({ status: 200, description: 'Deleted' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'حذف تسعير مدينة' })
  async deletePricing(@Param('city') city: string) {
    await this.utilityService.delete(city);
    return { message: 'تم حذف التسعير بنجاح' };
  }

  // ==================== Admin Dashboard Compatibility Endpoints ====================

  @Patch('options/gas')
  @ApiBody({ schema: { type: 'object', properties: { price: { type: 'number' }, unit: { type: 'string' }, provider: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'تحديث/إنشاء إعدادات الغاز' })
  async upsertGas(@Body() dto: any) {
    // نفس منطق create أو update
    const existing = await this.utilityService.findByCity(dto.city).catch(() => null);
    if (existing) {
      return this.utilityService.update(dto.city, { gas: dto });
    } else {
      return this.utilityService.create({
        city: dto.city,
        gas: dto,
        isActive: true,
      });
    }
  }

  @Patch('options/water')
  @ApiBody({ schema: { type: 'object', properties: { price: { type: 'number' }, unit: { type: 'string' }, provider: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'تحديث/إنشاء إعدادات الماء' })
  async upsertWater(@Body() dto: any) {
    const existing = await this.utilityService.findByCity(dto.city).catch(() => null);
    if (existing) {
      return this.utilityService.update(dto.city, { water: dto });
    } else {
      return this.utilityService.create({
        city: dto.city,
        water: dto,
        isActive: true,
      });
    }
  }

  // ==================== Daily Pricing Endpoints ====================

  @Get('daily')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'الحصول على قائمة الأسعار اليومية' })
  async listDaily(
    @Query('kind') kind: 'gas' | 'water',
    @Query('city') city: string,
  ) {
    return this.utilityService.listDailyPrices(kind, city);
  }

  @Post('daily')
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'إضافة/تحديث سعر يومي' })
  async upsertDaily(@Body() dto: CreateDailyPriceDto) {
    return this.utilityService.upsertDailyPrice(dto);
  }

  @Delete('daily/:id')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Deleted' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'حذف سعر يومي حسب ID' })
  async deleteDaily(@Param('id') id: string) {
    await this.utilityService.deleteDailyPrice(id);
    return { message: 'تم حذف السعر اليومي بنجاح' };
  }

  @Delete('daily')
  @ApiResponse({ status: 200, description: 'Deleted' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'حذف سعر يومي حسب المفتاح المركب' })
  async deleteDailyByKey(
    @Query('kind') kind: 'gas' | 'water',
    @Query('city') city: string,
    @Query('date') date: string,
    @Query('variant') variant?: string,
  ) {
    await this.utilityService.deleteDailyPriceByKey(kind, city, date, variant);
    return { message: 'تم حذف السعر اليومي بنجاح' };
  }

  // ==================== Utility Orders Endpoints ====================

  @Post('order')
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.FIREBASE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'إنشاء طلب غاز أو ماء' })
  async createOrder(
    @Body() dto: CreateUtilityOrderDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.utilityOrderService.create(dto, userId);
  }

  @Get('orders')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.FIREBASE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'جلب طلبات المستخدم' })
  async getUserOrders(@CurrentUser('id') userId: string) {
    return this.utilityOrderService.findUserOrders(userId);
  }

  @Get('order/:id')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.FIREBASE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'جلب تفاصيل طلب' })
  async getOrder(@Param('id') orderId: string) {
    return this.utilityOrderService.findOne(orderId);
  }

  @Patch('order/:id/status')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin', 'driver')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'تحديث حالة الطلب' })
  async updateOrderStatus(
    @Param('id') orderId: string,
    @Body() body: { status: string },
    @CurrentUser('role') role: string,
  ) {
    return this.utilityOrderService.updateStatus(orderId, body.status, role);
  }

  @Patch('order/:id/cancel')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.FIREBASE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'إلغاء الطلب' })
  async cancelOrder(
    @Param('id') orderId: string,
    @Body() body: { reason: string },
  ) {
    return this.utilityOrderService.cancel(orderId, body.reason, 'customer');
  }

  @Post('order/:id/rate')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.FIREBASE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'تقييم الطلب' })
  async rateOrder(
    @Param('id') orderId: string,
    @Body() body: { rating: number; review?: string },
  ) {
    return this.utilityOrderService.rate(orderId, body.rating, body.review);
  }

  @Post('order/:id/assign-driver')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'تعيين سائق للطلب' })
  async assignDriver(
    @Param('id') orderId: string,
    @Body() body: { driverId: string },
  ) {
    return this.utilityOrderService.assignDriver(orderId, body.driverId);
  }

  @Get('admin/orders')
  @ApiQuery({ name: 'cursor', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'جلب جميع الطلبات (admin)' })
  async getAllOrders(@Query() filters: any) {
    return this.utilityOrderService.findAll(filters);
  }

  // ==================== Next.js API Routes Compatibility ====================

  @Get('placeholder/:width/:height')
  @ApiParam({ name: 'width', description: 'عرض الصورة', example: '300' })
  @ApiParam({ name: 'height', description: 'ارتفاع الصورة', example: '200' })
  @ApiQuery({ name: 'text', required: false, description: 'النص المعروض على الصورة' })
  @ApiQuery({ name: 'bg', required: false, description: 'لون الخلفية', example: 'cccccc' })
  @ApiQuery({ name: 'fg', required: false, description: 'لون النص', example: '000000' })
  @ApiResponse({ status: 200, description: 'Success', content: { 'image/png': {} } })
  @ApiOperation({ summary: 'توليد صور placeholder (compatibility with Next.js API routes)' })
  async getPlaceholder(
    @Param('width') width: string,
    @Param('height') height: string,
    @Query('text') text?: string,
    @Query('bg') bg?: string,
    @Query('fg') fg?: string,
  ) {
    return this.utilityService.generatePlaceholderImage(
      parseInt(width),
      parseInt(height),
      text,
      bg,
      fg,
    );
  }
}
