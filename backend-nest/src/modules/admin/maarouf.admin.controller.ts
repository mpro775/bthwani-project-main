import { Controller, Get, Patch, Delete, Param, Query, UseGuards, Body, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { UnifiedAuthGuard } from '../../common/guards/unified-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Auth, Roles, CurrentUser } from '../../common/decorators/auth.decorator';
import { AuthType } from '../../common/guards/unified-auth.guard';
import { CursorPaginationDto } from '../../common/dto/pagination.dto';
import { MaaroufService } from '../maarouf/maarouf.service';
import {
  MaaroufAdminQueryDto,
  MaaroufStatusUpdateAdminDto,
  MaaroufListResponseDto,
  MaaroufStatsDto,
  MaaroufAdminActionResponseDto
} from './dto/maarouf.dto';
import { MaaroufStatus, MaaroufKind, MaaroufWithOwner } from './interfaces/admin.interfaces';

@ApiTags('Admin:Maarouf')
@ApiBearerAuth()
@Controller({ path: 'admin/maarouf', version: ['2'] })
@UseGuards(UnifiedAuthGuard, RolesGuard)
@Auth(AuthType.JWT)
@Roles('admin','superadmin')
export class AdminMaaroufController {
  constructor(private readonly service: MaaroufService) { }

  @Get()
  @ApiOperation({
    summary: 'إدارة إعلانات معروف',
    description: 'استرجاع قائمة إعلانات معروف (مفقودات/موجودات) مع إمكانية الفلترة والتنقل بالcursor'
  })
  @ApiQuery({ name: 'cursor', required: false, description: 'مؤشر الصفحة التالية' })
  @ApiQuery({ name: 'limit', required: false, description: 'عدد العناصر في الصفحة', example: 25 })
  @ApiQuery({ name: 'status', required: false, enum: MaaroufStatus, description: 'فلترة حسب الحالة' })
  @ApiQuery({ name: 'kind', required: false, enum: MaaroufKind, description: 'فلترة حسب النوع (مفقود/موجود)' })
  @ApiQuery({ name: 'ownerId', required: false, description: 'فلترة حسب معرف المالك' })
  @ApiQuery({ name: 'tags', required: false, description: 'فلترة حسب العلامات' })
  @ApiQuery({ name: 'search', required: false, description: 'البحث في العناوين والأوصاف' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'تم استرجاع قائمة الإعلانات بنجاح',
    type: MaaroufListResponseDto
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'غير مسموح' })
  list(@Query() q: CursorPaginationDto, @Query() filters: MaaroufAdminQueryDto) {
    return this.service.list(filters, q.cursor, q.limit);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'تحديث حالة إعلان معروف',
    description: 'تغيير حالة إعلان معروف (مسودة، معلق، مؤكد، مكتمل، ملغي)'
  })
  @ApiParam({ name: 'id', description: 'معرف إعلان معروف', example: '507f1f77bcf86cd799439012' })
  @ApiBody({
    description: 'بيانات تحديث الحالة',
    type: MaaroufStatusUpdateAdminDto,
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
    type: MaaroufAdminActionResponseDto
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'الإعلان غير موجود' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'بيانات غير صحيحة' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'غير مسموح' })
  setStatus(@Param('id') id: string, @Body() dto: MaaroufStatusUpdateAdminDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'حذف إعلان معروف إدارياً',
    description: 'حذف إعلان معروف نهائياً من قاعدة البيانات (عملية إدارية)'
  })
  @ApiParam({ name: 'id', description: 'معرف إعلان معروف', example: '507f1f77bcf86cd799439012' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'تم حذف الإعلان بنجاح',
    type: MaaroufAdminActionResponseDto
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'الإعلان غير موجود' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'غير مسموح' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'تفاصيل إعلان معروف',
    description: 'استرجاع تفاصيل إعلان معروف محدد مع معلومات المالك'
  })
  @ApiParam({ name: 'id', description: 'معرف إعلان معروف', example: '507f1f77bcf86cd799439012' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'تم استرجاع تفاصيل الإعلان بنجاح',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string', example: '507f1f77bcf86cd799439012' },
        ownerId: { type: 'string', example: '507f1f77bcf86cd799439011' },
        title: { type: 'string', example: 'محفظة سوداء مفقودة' },
        description: { type: 'string', example: 'محفظة سوداء صغيرة تحتوي على بطاقات شخصية' },
        kind: { type: 'string', enum: ['lost','found'], example: 'lost' },
        tags: { type: 'array', items: { type: 'string' }, example: ['محفظة', 'بطاقات'] },
        metadata: { type: 'object', example: { color: 'أسود', location: 'النرجس' } },
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
    summary: 'إحصائيات إعلانات معروف',
    description: 'استرجاع إحصائيات عامة عن إعلانات معروف (مفقودات/موجودات)'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'تم استرجاع الإحصائيات بنجاح',
    type: MaaroufStatsDto
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'غير مسموح' })
  getStats() {
    return this.service.getStats();
  }
}
