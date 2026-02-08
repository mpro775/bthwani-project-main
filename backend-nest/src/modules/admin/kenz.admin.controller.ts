import { Controller, Get, Post, Patch, Delete, Param, Query, UseGuards, Body, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { UnifiedAuthGuard } from '../../common/guards/unified-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Auth, Roles, CurrentUser } from '../../common/decorators/auth.decorator';
import { AuthType } from '../../common/guards/unified-auth.guard';
import { CursorPaginationDto } from '../../common/dto/pagination.dto';
import { KenzService } from '../kenz/kenz.service';
import { KenzDealService } from '../kenz/kenz-deal.service';
import { KenzBidService } from '../kenz/kenz-bid.service';
import CreateKenzBoostDto from '../kenz/dto/create-kenz-boost.dto';
import {
  KenzAdminQueryDto,
  KenzStatusUpdateAdminDto,
  KenzListResponseDto,
  KenzStatsDto,
  KenzAdminActionResponseDto
} from './dto/kenz.dto';
import { KenzStatus, KenzWithOwner } from './interfaces/admin.interfaces';

@ApiTags('Admin:Kenz')
@ApiBearerAuth()
@Controller({ path: 'admin/kenz', version: '1' })
@UseGuards(UnifiedAuthGuard, RolesGuard)
@Auth(AuthType.JWT)
@Roles('admin','superadmin')
export class AdminKenzController {
  constructor(
    private readonly service: KenzService,
    private readonly dealService: KenzDealService,
    private readonly bidService: KenzBidService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'إدارة إعلانات الكنز',
    description: 'استرجاع قائمة إعلانات الكنز مع إمكانية الفلترة والتنقل بالcursor'
  })
  @ApiQuery({ name: 'cursor', required: false, description: 'مؤشر الصفحة التالية' })
  @ApiQuery({ name: 'limit', required: false, description: 'عدد العناصر في الصفحة', example: 25 })
  @ApiQuery({ name: 'status', required: false, enum: KenzStatus, description: 'فلترة حسب الحالة' })
  @ApiQuery({ name: 'ownerId', required: false, description: 'فلترة حسب معرف المالك' })
  @ApiQuery({ name: 'category', required: false, description: 'فلترة حسب الفئة' })
  @ApiQuery({ name: 'priceMin', required: false, description: 'فلترة حسب الحد الأدنى للسعر' })
  @ApiQuery({ name: 'priceMax', required: false, description: 'فلترة حسب الحد الأقصى للسعر' })
  @ApiQuery({ name: 'search', required: false, description: 'بحث في العنوان والوصف والكلمات المفتاحية' })
  @ApiQuery({ name: 'sort', required: false, enum: ['newest', 'price_asc', 'price_desc', 'views_desc'] })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'تم استرجاع قائمة الإعلانات بنجاح',
    type: KenzListResponseDto
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'غير مسموح' })
  list(@Query() q: CursorPaginationDto, @Query() filters: KenzAdminQueryDto) {
    return this.service.list(filters, q.cursor, q.limit);
  }

  @Get('reports')
  @ApiOperation({
    summary: 'قائمة بلاغات إعلانات الكنز',
    description: 'استرجاع البلاغات مع دعم الفلترة حسب الحالة'
  })
  @ApiQuery({ name: 'cursor', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false, description: 'حالة البلاغ', enum: ['pending', 'reviewed', 'rejected', 'action_taken'] })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم الاسترجاع بنجاح' })
  listReports(
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 25;
    return this.service.listReports({ status }, cursor, limitNum);
  }

  @Get('stats/overview')
  @ApiOperation({
    summary: 'إحصائيات إعلانات الكنز',
    description: 'استرجاع إحصائيات عامة عن إعلانات الكنز'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'تم استرجاع الإحصائيات بنجاح',
    type: KenzStatsDto
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'غير مسموح' })
  getStats() {
    return this.service.getStats();
  }

  @Get('deals')
  @ApiOperation({
    summary: 'قائمة صفقات كنز (الإيكرو)',
    description: 'استرجاع قائمة صفقات الإيكرو مع الفلترة'
  })
  @ApiQuery({ name: 'cursor', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'completed', 'cancelled'] })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم الاسترجاع بنجاح' })
  listDeals(
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 25;
    return this.dealService.listAllDeals({ status }, cursor, limitNum);
  }

  @Get('boosts')
  @ApiOperation({
    summary: 'قائمة ترويجات إعلانات الكنز',
    description: 'استرجاع قائمة الترويجات مع الفلترة'
  })
  @ApiQuery({ name: 'cursor', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'expired', 'cancelled'] })
  @ApiQuery({ name: 'kenzId', required: false, description: 'معرف الإعلان' })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم الاسترجاع بنجاح' })
  listBoosts(
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('kenzId') kenzId?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 25;
    return this.service.listBoosts({ status, kenzId }, cursor, limitNum);
  }

  @Post('boosts')
  @ApiOperation({
    summary: 'إنشاء ترويج إعلان',
    description: 'إضافة ترويج لإعلان (highlight, pin, top)'
  })
  @ApiBody({ type: CreateKenzBoostDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'تم إنشاء الترويج' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'الإعلان غير موجود' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'بيانات غير صحيحة' })
  createBoost(
    @Body() dto: CreateKenzBoostDto,
    @CurrentUser('id') adminId?: string,
  ) {
    return this.service.createBoost(dto, adminId);
  }

  @Patch('boosts/:id/cancel')
  @ApiOperation({
    summary: 'إلغاء ترويج إعلان',
    description: 'إلغاء ترويج نشط'
  })
  @ApiParam({ name: 'id', description: 'معرف الترويج' })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم الإلغاء' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'الترويج غير موجود' })
  cancelBoost(@Param('id') id: string) {
    return this.service.cancelBoost(id);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'تحديث حالة إعلان الكنز',
    description: 'تغيير حالة إعلان الكنز (مسودة، معلق، مؤكد، مكتمل، ملغي)'
  })
  @ApiParam({ name: 'id', description: 'معرف إعلان الكنز', example: '507f1f77bcf86cd799439012' })
  @ApiBody({
    description: 'بيانات تحديث الحالة',
    type: KenzStatusUpdateAdminDto,
    schema: {
      type: 'object',
      required: ['status'],
      properties: {
        status: { type: 'string', enum: ['draft','pending','confirmed','completed','cancelled'] },
        notes: { type: 'string', example: 'تم الموافقة على الإعلان من قبل الإدارة' }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'تم تحديث حالة الإعلان بنجاح',
    type: KenzAdminActionResponseDto
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'الإعلان غير موجود' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'بيانات غير صحيحة' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'غير مسموح' })
  setStatus(@Param('id') id: string, @Body() dto: KenzStatusUpdateAdminDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'حذف إعلان كنز إدارياً',
    description: 'حذف إعلان الكنز نهائياً من قاعدة البيانات (عملية إدارية)'
  })
  @ApiParam({ name: 'id', description: 'معرف إعلان الكنز', example: '507f1f77bcf86cd799439012' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'تم حذف الإعلان بنجاح',
    type: KenzAdminActionResponseDto
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'الإعلان غير موجود' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'غير مسموح' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Get(':id/bids')
  @ApiOperation({
    summary: 'قائمة مزايدات إعلان مزاد',
    description: 'استرجاع مزايدات إعلان كنز (للمزادات فقط)'
  })
  @ApiParam({ name: 'id', description: 'معرف إعلان الكنز' })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم الاسترجاع بنجاح' })
  getBids(@Param('id') id: string) {
    return this.bidService.getBids(id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'تفاصيل إعلان الكنز',
    description: 'استرجاع تفاصيل إعلان كنز محدد مع معلومات المالك'
  })
  @ApiParam({ name: 'id', description: 'معرف إعلان الكنز', example: '507f1f77bcf86cd799439012' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'تم استرجاع تفاصيل الإعلان بنجاح',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string', example: '507f1f77bcf86cd799439012' },
        ownerId: { type: 'string', example: '507f1f77bcf86cd799439011' },
        title: { type: 'string', example: 'iPhone 14 Pro مستعمل' },
        description: { type: 'string', example: 'استخدام خفيف مع ضمان متبقي' },
        price: { type: 'number', example: 3500 },
        category: { type: 'string', example: 'إلكترونيات' },
        metadata: { type: 'object', example: { color: 'فضي', storage: '256GB' } },
        status: { type: 'string', enum: ['draft','pending','confirmed','completed','cancelled'] },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        owner: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'الإعلان غير موجود' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'غير مسموح' })
  getOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
