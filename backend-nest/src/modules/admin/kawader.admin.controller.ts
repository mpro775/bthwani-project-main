import { Controller, Get, Patch, Delete, Param, Query, UseGuards, Body, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { UnifiedAuthGuard } from '../../common/guards/unified-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Auth, Roles, CurrentUser } from '../../common/decorators/auth.decorator';
import { AuthType } from '../../common/guards/unified-auth.guard';
import { CursorPaginationDto } from '../../common/dto/pagination.dto';
import { KawaderService } from '../kawader/kawader.service';
import {
  KawaderAdminQueryDto,
  KawaderStatusUpdateAdminDto,
  KawaderListResponseDto,
  KawaderStatsDto,
  KawaderAdminActionResponseDto
} from './dto/kawader.dto';
import { KawaderStatus, KawaderWithOwner } from './interfaces/admin.interfaces';

@ApiTags('Admin:Kawader')
@ApiBearerAuth()
@Controller({ path: 'admin/kawader', version: ['2'] })
@UseGuards(UnifiedAuthGuard, RolesGuard)
@Auth(AuthType.JWT)
@Roles('admin','superadmin')
export class AdminKawaderController {
  constructor(private readonly service: KawaderService) { }

  @Get()
  @ApiOperation({
    summary: 'إدارة عروض الكوادر',
    description: 'استرجاع قائمة عروض الكوادر مع إمكانية الفلترة والتنقل بالcursor'
  })
  @ApiQuery({ name: 'cursor', required: false, description: 'مؤشر الصفحة التالية' })
  @ApiQuery({ name: 'limit', required: false, description: 'عدد العناصر في الصفحة', example: 25 })
  @ApiQuery({ name: 'status', required: false, enum: KawaderStatus, description: 'فلترة حسب الحالة' })
  @ApiQuery({ name: 'ownerId', required: false, description: 'فلترة حسب معرف المالك' })
  @ApiQuery({ name: 'budgetMin', required: false, description: 'فلترة حسب الحد الأدنى للميزانية' })
  @ApiQuery({ name: 'budgetMax', required: false, description: 'فلترة حسب الحد الأقصى للميزانية' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'تم استرجاع قائمة العروض بنجاح',
    type: KawaderListResponseDto
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'غير مسموح' })
  list(@Query() q: CursorPaginationDto, @Query() filters: KawaderAdminQueryDto) {
    return this.service.list(filters, q.cursor, q.limit);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'تحديث حالة عرض كادر',
    description: 'تغيير حالة عرض الكادر (مسودة، معلق، مؤكد، مكتمل، ملغي)'
  })
  @ApiParam({ name: 'id', description: 'معرف عرض الكادر', example: '507f1f77bcf86cd799439012' })
  @ApiBody({
    description: 'بيانات تحديث الحالة',
    type: KawaderStatusUpdateAdminDto,
    schema: {
      type: 'object',
      required: ['status'],
      properties: {
        status: { type: 'string', enum: ['draft','pending','confirmed','completed','cancelled'] },
        notes: { type: 'string', example: 'تم الاعتماد من قبل الإدارة' }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'تم تحديث حالة العرض بنجاح',
    type: KawaderAdminActionResponseDto
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'العرض غير موجود' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'بيانات غير صحيحة' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'غير مسموح' })
  setStatus(@Param('id') id: string, @Body() dto: KawaderStatusUpdateAdminDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'حذف عرض كادر إدارياً',
    description: 'حذف عرض الكادر نهائياً من قاعدة البيانات (عملية إدارية)'
  })
  @ApiParam({ name: 'id', description: 'معرف عرض الكادر', example: '507f1f77bcf86cd799439012' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'تم حذف العرض بنجاح',
    type: KawaderAdminActionResponseDto
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'العرض غير موجود' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'غير مسموح' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'تفاصيل عرض كادر',
    description: 'استرجاع تفاصيل عرض كادر محدد مع معلومات المالك'
  })
  @ApiParam({ name: 'id', description: 'معرف عرض الكادر', example: '507f1f77bcf86cd799439012' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'تم استرجاع تفاصيل العرض بنجاح',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string', example: '507f1f77bcf86cd799439012' },
        ownerId: { type: 'string', example: '507f1f77bcf86cd799439011' },
        title: { type: 'string', example: 'مطور Full Stack مطلوب' },
        description: { type: 'string', example: 'نحتاج مطور بخبرة 3+ سنوات' },
        scope: { type: 'string', example: 'مشروع 6 أشهر' },
        budget: { type: 'number', example: 15000 },
        metadata: { type: 'object', example: { experience: '3+ years', skills: ['React', 'Node.js'] } },
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
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'العرض غير موجود' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'غير مسموح' })
  getOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get('stats/overview')
  @ApiOperation({
    summary: 'إحصائيات عروض الكوادر',
    description: 'استرجاع إحصائيات عامة عن عروض الكوادر'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'تم استرجاع الإحصائيات بنجاح',
    type: KawaderStatsDto
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'غير مسموح' })
  getStats() {
    return this.service.getStats();
  }
}
