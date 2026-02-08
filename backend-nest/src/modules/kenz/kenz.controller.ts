import { Controller, Get, Post, Body, Param, Query, Patch, Delete, HttpStatus, UseGuards, Req } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
  ApiConsumes,
  ApiProduces
} from '@nestjs/swagger';
import { Request } from 'express';
import { KenzService, KenzSortOption } from './kenz.service';
import { KenzCategoryService } from './kenz-category.service';
import { KenzDealService } from './kenz-deal.service';
import { KenzBidService } from './kenz-bid.service';
import CreateKenzDto from './dto/create-kenz.dto';
import UpdateKenzDto from './dto/update-kenz.dto';
import ReportKenzDto from './dto/report-kenz.dto';
import BuyWithEscrowDto from './dto/buy-with-escrow.dto';
import PlaceBidDto from './dto/place-bid.dto';
import { UnifiedAuthGuard } from '../../common/guards/unified-auth.guard';

interface AuthenticatedRequest extends Request {
  user?: { _id?: string; id?: string };
}

@ApiTags('كنز — السوق المفتوح')
@ApiBearerAuth()
@ApiConsumes('application/json')
@ApiProduces('application/json')
@Controller('kenz')
export class KenzController {
  constructor(
    private readonly service: KenzService,
    private readonly categoryService: KenzCategoryService,
    private readonly dealService: KenzDealService,
    private readonly bidService: KenzBidService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'إنشاء إعلان سوق', description: 'إضافة إعلان جديد في سوق كنز' })
  @ApiBody({
    description: 'بيانات الإعلان',
    schema: {
      type: 'object',
      required: ['ownerId', 'title'],
      properties: {
        ownerId: { type: 'string', example: '507f1f77bcf86cd799439011' },
        title: { type: 'string', example: 'iPhone 14 Pro مستعمل بحالة ممتازة' },
        description: { type: 'string', example: 'استخدام خفيف مع ضمان متبقي 6 أشهر' },
        price: { type: 'number', example: 3500 },
        category: { type: 'string', example: 'إلكترونيات' },
        metadata: { type: 'object', example: { color: 'فضي', storage: '256GB' } },
        status: { type: 'string', enum: ['draft', 'pending', 'confirmed', 'completed', 'cancelled'], default: 'draft' },
        images: { type: 'array', items: { type: 'string' }, example: ['https://cdn.bthwani.com/kenz/1-img.jpg'] },
        city: { type: 'string', example: 'صنعاء' },
        keywords: { type: 'array', items: { type: 'string' }, example: ['جوال', 'أيفون'] },
        currency: { type: 'string', example: 'ريال يمني', default: 'ريال يمني' },
        quantity: { type: 'number', example: 1, default: 1 }
      }
    }
  })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'تم إنشاء الإعلان بنجاح' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'بيانات غير صحيحة' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  create(@Body() dto: CreateKenzDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'قائمة الإعلانات', description: 'استرجاع الإعلانات مع دعم الفلترة والبحث والترتيب و cursor' })
  @ApiQuery({ name: 'cursor', required: false, description: 'مؤشر الصفحة التالية' })
  @ApiQuery({ name: 'category', required: false, description: 'الفئة (نص)', example: 'إلكترونيات' })
  @ApiQuery({ name: 'categoryId', required: false, description: 'معرف الفئة من شجرة الفئات' })
  @ApiQuery({ name: 'status', required: false, description: 'حالة الإعلان', enum: ['draft', 'pending', 'confirmed', 'completed', 'cancelled'] })
  @ApiQuery({ name: 'city', required: false, description: 'المدينة', example: 'صنعاء' })
  @ApiQuery({ name: 'condition', required: false, description: 'حالة السلعة', enum: ['new', 'used', 'refurbished'] })
  @ApiQuery({ name: 'deliveryOption', required: false, description: 'طريقة التسليم', enum: ['meetup', 'delivery', 'both'] })
  @ApiQuery({ name: 'acceptsEscrow', required: false, description: 'إعلانات تقبل الإيكرو فقط', type: Boolean })
  @ApiQuery({ name: 'isAuction', required: false, description: 'إعلانات المزادات فقط', type: Boolean })
  @ApiQuery({ name: 'search', required: false, description: 'بحث في العنوان والوصف والكلمات المفتاحية' })
  @ApiQuery({ name: 'sort', required: false, description: 'الترتيب', enum: ['newest', 'price_asc', 'price_desc', 'views_desc'] })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم الاسترجاع بنجاح' })
  list(
    @Query('cursor') cursor?: string,
    @Query('category') category?: string,
    @Query('categoryId') categoryId?: string,
    @Query('status') status?: string,
    @Query('city') city?: string,
    @Query('condition') condition?: string,
    @Query('deliveryOption') deliveryOption?: string,
    @Query('acceptsEscrow') acceptsEscrow?: string,
    @Query('isAuction') isAuction?: string,
    @Query('search') search?: string,
    @Query('sort') sort?: string,
  ) {
    const filters: any = {};
    if (category) filters.category = category;
    if (categoryId) filters.categoryId = categoryId;
    if (status) filters.status = status;
    if (city) filters.city = city;
    if (condition && ['new', 'used', 'refurbished'].includes(condition)) filters.condition = condition;
    if (deliveryOption && ['meetup', 'delivery', 'both'].includes(deliveryOption)) filters.deliveryOption = deliveryOption;
    if (acceptsEscrow === 'true' || acceptsEscrow === '1') filters.acceptsEscrow = true;
    if (isAuction === 'true' || isAuction === '1') filters.isAuction = true;
    if (search) filters.search = search;
    const sortOption: KenzSortOption = ['newest', 'price_asc', 'price_desc', 'views_desc'].includes(sort || '')
      ? (sort as KenzSortOption)
      : 'newest';
    return this.service.list(filters, cursor, 25, sortOption);
  }

  @Get('categories')
  @ApiOperation({ summary: 'شجرة فئات كنز', description: 'استرجاع الفئات بشكل شجري (للتطبيق والويب)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'شجرة الفئات' })
  getCategoriesTree() {
    return this.categoryService.getTree();
  }

  @Get('favorites')
  @UseGuards(UnifiedAuthGuard)
  @ApiOperation({ summary: 'إعلاناتي المفضلة', description: 'قائمة إعلانات المستخدم المفضلة (يتطلب مصادقة)' })
  @ApiQuery({ name: 'cursor', required: false, description: 'مؤشر الصفحة التالية' })
  @ApiResponse({ status: HttpStatus.OK, description: 'قائمة الإعلانات المفضلة' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  getFavorites(
    @Query('cursor') cursor: string | undefined,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user?._id ?? req.user?.id ?? '';
    return this.service.listFavorites(String(userId), cursor, 25);
  }

  @Post(':id/favorite')
  @UseGuards(UnifiedAuthGuard)
  @ApiOperation({ summary: 'إضافة للمفضلة', description: 'إضافة إعلان إلى المفضلة (يتطلب مصادقة)' })
  @ApiParam({ name: 'id', description: 'معرف الإعلان' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'تمت الإضافة' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'الإعلان غير موجود' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  addFavorite(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const userId = req.user?._id ?? req.user?.id ?? '';
    return this.service.addFavorite(id, String(userId));
  }

  @Delete(':id/favorite')
  @UseGuards(UnifiedAuthGuard)
  @ApiOperation({ summary: 'إزالة من المفضلة', description: 'إزالة إعلان من المفضلة (يتطلب مصادقة)' })
  @ApiParam({ name: 'id', description: 'معرف الإعلان' })
  @ApiResponse({ status: HttpStatus.OK, description: 'تمت الإزالة' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  removeFavorite(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const userId = req.user?._id ?? req.user?.id ?? '';
    return this.service.removeFavorite(id, String(userId));
  }

  // ——— صفقات الإيكرو (يجب أن تأتي قبل :id) ———
  @Get('deals')
  @UseGuards(UnifiedAuthGuard)
  @ApiOperation({ summary: 'صفقاتي', description: 'قائمة صفقات المستخدم (كمشتري أو بائع)' })
  @ApiQuery({ name: 'cursor', required: false })
  @ApiQuery({ name: 'role', required: false, enum: ['buyer', 'seller'] })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED })
  getMyDeals(
    @Query('cursor') cursor: string | undefined,
    @Query('role') role: 'buyer' | 'seller' | undefined,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user?._id ?? req.user?.id ?? '';
    return this.dealService.listMyDeals(String(userId), cursor, 25, role);
  }

  @Get('deals/:dealId')
  @UseGuards(UnifiedAuthGuard)
  @ApiOperation({ summary: 'تفاصيل صفقة', description: 'تفاصيل صفقة إيكرو' })
  @ApiParam({ name: 'dealId', description: 'معرف الصفقة' })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiResponse({ status: HttpStatus.FORBIDDEN })
  @ApiResponse({ status: HttpStatus.NOT_FOUND })
  getDealById(
    @Param('dealId') dealId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user?._id ?? req.user?.id ?? '';
    return this.dealService.getDealById(dealId, String(userId));
  }

  @Post(':id/buy-with-escrow')
  @UseGuards(UnifiedAuthGuard)
  @ApiOperation({ summary: 'شراء بالإيكرو', description: 'إنشاء صفقة وحجز المبلغ من المحفظة' })
  @ApiParam({ name: 'id', description: 'معرف الإعلان' })
  @ApiBody({ type: BuyWithEscrowDto })
  @ApiResponse({ status: HttpStatus.CREATED })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST })
  @ApiResponse({ status: HttpStatus.NOT_FOUND })
  buyWithEscrow(
    @Param('id') id: string,
    @Body() dto: BuyWithEscrowDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user?._id ?? req.user?.id ?? '';
    return this.dealService.buyWithEscrow(id, String(userId), dto);
  }

  @Post('deals/:dealId/confirm-received')
  @UseGuards(UnifiedAuthGuard)
  @ApiOperation({ summary: 'تأكيد الاستلام', description: 'للمشتري فقط — تحويل المبلغ للبائع' })
  @ApiParam({ name: 'dealId', description: 'معرف الصفقة' })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiResponse({ status: HttpStatus.FORBIDDEN })
  confirmReceived(
    @Param('dealId') dealId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user?._id ?? req.user?.id ?? '';
    return this.dealService.confirmReceived(dealId, String(userId));
  }

  @Post('deals/:dealId/cancel')
  @UseGuards(UnifiedAuthGuard)
  @ApiOperation({ summary: 'إلغاء صفقة', description: 'إلغاء الصفقة وإرجاع المبلغ (المشتري أو البائع)' })
  @ApiParam({ name: 'dealId', description: 'معرف الصفقة' })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiResponse({ status: HttpStatus.FORBIDDEN })
  cancelDeal(
    @Param('dealId') dealId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user?._id ?? req.user?.id ?? '';
    return this.dealService.cancelDeal(dealId, String(userId));
  }

  @Post(':id/bid')
  @UseGuards(UnifiedAuthGuard)
  @ApiOperation({ summary: 'مزايدة', description: 'إضافة مزايدة على إعلان مزاد' })
  @ApiParam({ name: 'id', description: 'معرف الإعلان (المزاد)' })
  @ApiBody({ type: PlaceBidDto })
  @ApiResponse({ status: HttpStatus.CREATED })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST })
  placeBid(
    @Param('id') id: string,
    @Body() dto: PlaceBidDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user?._id ?? req.user?.id ?? '';
    return this.bidService.placeBid(id, String(userId), dto);
  }

  @Get(':id/bids')
  @ApiOperation({ summary: 'مزايدات إعلان', description: 'جلب مزايدات إعلان مزاد' })
  @ApiParam({ name: 'id', description: 'معرف الإعلان' })
  @ApiQuery({ name: 'cursor', required: false })
  @ApiResponse({ status: HttpStatus.OK })
  getBids(
    @Param('id') id: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.bidService.getBids(id, cursor, 25);
  }

  @Get(':id')
  @ApiOperation({ summary: 'تفاصيل إعلان', description: 'استرجاع إعلان بواسطة المعرف' })
  @ApiParam({ name: 'id', description: 'معرف الإعلان', example: '507f1f77bcf86cd799439012' })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم الاسترجاع بنجاح' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'غير موجود' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id/sold')
  @UseGuards(UnifiedAuthGuard)
  @ApiOperation({ summary: 'تعليم الإعلان كمباع', description: 'للمالك فقط — يضع الحالة مكتمل ويسجل تاريخ البيع' })
  @ApiParam({ name: 'id', description: 'معرف الإعلان' })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم تعليم الإعلان كمباع' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'ليس مالك الإعلان' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'غير موجود' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  markAsSold(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const userId = req.user?._id ?? req.user?.id ?? '';
    return this.service.markAsSold(id, String(userId));
  }

  @Post(':id/report')
  @UseGuards(UnifiedAuthGuard)
  @ApiOperation({ summary: 'الإبلاغ عن إعلان', description: 'إرسال بلاغ عن إعلان (مرة واحدة لكل مستخدم لكل إعلان)' })
  @ApiParam({ name: 'id', description: 'معرف الإعلان' })
  @ApiBody({ type: ReportKenzDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'تم استلام البلاغ' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'تم الإبلاغ مسبقاً عن هذا الإعلان' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'الإعلان غير موجود' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  report(
    @Param('id') id: string,
    @Body() dto: ReportKenzDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user?._id ?? req.user?.id ?? '';
    return this.service.report(id, String(userId), dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'تحديث إعلان', description: 'تحديث بيانات الإعلان' })
  @ApiParam({ name: 'id', description: 'معرف الإعلان', example: '507f1f77bcf86cd799439012' })
  @ApiBody({
    description: 'الحقول الممكن تحديثها',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'iPhone 14 Pro محدث' },
        description: { type: 'string', example: 'تفاصيل محدثة' },
        price: { type: 'number', example: 3400 },
        category: { type: 'string', example: 'إلكترونيات' },
        metadata: { type: 'object', example: { color: 'أسود' } },
        status: { type: 'string', enum: ['draft', 'pending', 'confirmed', 'completed', 'cancelled'], example: 'confirmed' },
        images: { type: 'array', items: { type: 'string' } },
        city: { type: 'string', example: 'صنعاء' },
        keywords: { type: 'array', items: { type: 'string' } },
        currency: { type: 'string', example: 'ريال يمني' },
        quantity: { type: 'number', example: 1 }
      }
    }
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم التحديث بنجاح' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'غير موجود' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'بيانات غير صحيحة' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  update(@Param('id') id: string, @Body() dto: UpdateKenzDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف إعلان', description: 'حذف الإعلان نهائياً' })
  @ApiParam({ name: 'id', description: 'معرف الإعلان', example: '507f1f77bcf86cd799439012' })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم الحذف بنجاح' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'غير موجود' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
