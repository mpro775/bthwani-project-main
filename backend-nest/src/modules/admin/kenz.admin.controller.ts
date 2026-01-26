import { Controller, Get, Patch, Delete, Param, Query, UseGuards, Body, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { UnifiedAuthGuard } from '../../common/guards/unified-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Auth, Roles, CurrentUser } from '../../common/decorators/auth.decorator';
import { AuthType } from '../../common/guards/unified-auth.guard';
import { CursorPaginationDto } from '../../common/dto/pagination.dto';
import { KenzService } from '../kenz/kenz.service';
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
@Controller({ path: 'admin/kenz', version: ['2'] })
@UseGuards(UnifiedAuthGuard, RolesGuard)
@Auth(AuthType.JWT)
@Roles('admin','superadmin')
export class AdminKenzController {
  constructor(private readonly service: KenzService) { }

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
}
