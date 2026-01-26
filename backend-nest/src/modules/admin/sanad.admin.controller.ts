import { Controller, Get, Patch, Delete, Param, Query, UseGuards, Body, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { UnifiedAuthGuard } from '../../common/guards/unified-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Auth, Roles, CurrentUser } from '../../common/decorators/auth.decorator';
import { AuthType } from '../../common/guards/unified-auth.guard';
import { CursorPaginationDto } from '../../common/dto/pagination.dto';
import { SanadService } from '../sanad/sanad.service';
import {
  SanadAdminQueryDto,
  SanadStatusUpdateAdminDto,
  SanadListResponseDto,
  SanadStatsDto,
  SanadAdminActionResponseDto
} from './dto/sanad.dto';
import { SanadStatus, SanadKind, SanadWithOwner } from './interfaces/admin.interfaces';

@ApiTags('Admin:Sanad')
@ApiBearerAuth()
@Controller({ path: 'admin/sanad', version: ['2'] })
@UseGuards(UnifiedAuthGuard, RolesGuard)
@Auth(AuthType.JWT)
@Roles('admin','superadmin')
export class AdminSanadController {
  constructor(private readonly service: SanadService) { }

  @Get()
  @ApiOperation({
    summary: 'إدارة طلبات الصناد',
    description: 'استرجاع قائمة طلبات الصناد مع إمكانية الفلترة والتنقل بالcursor'
  })
  @ApiQuery({ name: 'cursor', required: false, description: 'مؤشر الصفحة التالية' })
  @ApiQuery({ name: 'limit', required: false, description: 'عدد العناصر في الصفحة', example: 25 })
  @ApiQuery({ name: 'status', required: false, enum: SanadStatus, description: 'فلترة حسب الحالة' })
  @ApiQuery({ name: 'kind', required: false, enum: SanadKind, description: 'فلترة حسب النوع (متخصص/طوارئ/خيري)' })
  @ApiQuery({ name: 'ownerId', required: false, description: 'فلترة حسب معرف المالك' })
  @ApiQuery({ name: 'search', required: false, description: 'البحث في العناوين والأوصاف' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'تم استرجاع قائمة الطلبات بنجاح',
    type: SanadListResponseDto
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'غير مسموح' })
  list(@Query() q: CursorPaginationDto, @Query() filters: SanadAdminQueryDto) {
    return this.service.list(filters, q.cursor, q.limit);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'تحديث حالة طلب الصناد',
    description: 'تغيير حالة طلب الصناد (مسودة، معلق، مؤكد، مكتمل، ملغي)'
  })
  @ApiParam({ name: 'id', description: 'معرف طلب الصناد', example: '507f1f77bcf86cd799439012' })
  @ApiBody({
    description: 'بيانات تحديث الحالة',
    type: SanadStatusUpdateAdminDto,
    schema: {
      type: 'object',
      required: ['status'],
      properties: {
        status: { type: 'string', enum: ['draft','pending','confirmed','completed','cancelled'] },
        notes: { type: 'string', example: 'تم الموافقة على الطلب من قبل الإدارة' }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'تم تحديث حالة الطلب بنجاح',
    type: SanadAdminActionResponseDto
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'الطلب غير موجود' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'بيانات غير صحيحة' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'غير مسموح' })
  setStatus(@Param('id') id: string, @Body() dto: SanadStatusUpdateAdminDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'حذف طلب صناد إدارياً',
    description: 'حذف طلب الصناد نهائياً من قاعدة البيانات (عملية إدارية)'
  })
  @ApiParam({ name: 'id', description: 'معرف طلب الصناد', example: '507f1f77bcf86cd799439012' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'تم حذف الطلب بنجاح',
    type: SanadAdminActionResponseDto
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'الطلب غير موجود' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'غير مسموح' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'تفاصيل طلب الصناد',
    description: 'استرجاع تفاصيل طلب صناد محدد مع معلومات المالك'
  })
  @ApiParam({ name: 'id', description: 'معرف طلب الصناد', example: '507f1f77bcf86cd799439012' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'تم استرجاع تفاصيل الطلب بنجاح',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string', example: '507f1f77bcf86cd799439012' },
        ownerId: { type: 'string', example: '507f1f77bcf86cd799439011' },
        title: { type: 'string', example: 'طلب فزعة لإسعاف عاجل' },
        description: { type: 'string', example: 'حالة طبية تحتاج نقل عاجل' },
        kind: { type: 'string', enum: ['specialist','emergency','charity'], example: 'emergency' },
        metadata: { type: 'object', example: { location: 'الرياض', contact: '+9665XXXXXXX' } },
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
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'الطلب غير موجود' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'غير مسموح' })
  getOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get('stats/overview')
  @ApiOperation({
    summary: 'إحصائيات طلبات الصناد',
    description: 'استرجاع إحصائيات عامة عن طلبات الصناد'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'تم استرجاع الإحصائيات بنجاح',
    type: SanadStatsDto
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'غير مسموح' })
  getStats() {
    return this.service.getStats();
  }
}
