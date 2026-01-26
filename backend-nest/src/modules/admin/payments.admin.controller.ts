import { Controller, Get, Patch, Delete, Param, Query, UseGuards, Body, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { UnifiedAuthGuard } from '../../common/guards/unified-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Auth, Roles, CurrentUser } from '../../common/decorators/auth.decorator';
import { AuthType } from '../../common/guards/unified-auth.guard';
import { CursorPaginationDto } from '../../common/dto/pagination.dto';
import { PaymentsService } from '../payments/payments.service';
import {
  PaymentsAdminQueryDto,
  PaymentsStatusUpdateAdminDto,
  PaymentsListResponseDto,
  PaymentsStatsDto,
  PaymentsAdminActionResponseDto
} from './dto/payments.dto';
import { PaymentStatus, PaymentType, PaymentMethod, PaymentsWithOwner } from './interfaces/admin.interfaces';

@ApiTags('Admin:Payments')
@ApiBearerAuth()
@Controller({ path: 'admin/payments', version: ['2'] })
@UseGuards(UnifiedAuthGuard, RolesGuard)
@Auth(AuthType.JWT)
@Roles('admin','superadmin')
export class AdminPaymentsController {
  constructor(private readonly service: PaymentsService) { }

  @Get()
  @ApiOperation({
    summary: 'إدارة المدفوعات',
    description: 'استرجاع قائمة المدفوعات مع إمكانية الفلترة والتنقل بالcursor'
  })
  @ApiQuery({ name: 'cursor', required: false, description: 'مؤشر الصفحة التالية' })
  @ApiQuery({ name: 'limit', required: false, description: 'عدد العناصر في الصفحة', example: 25 })
  @ApiQuery({ name: 'status', required: false, enum: PaymentStatus, description: 'فلترة حسب الحالة' })
  @ApiQuery({ name: 'type', required: false, enum: PaymentType, description: 'فلترة حسب النوع' })
  @ApiQuery({ name: 'method', required: false, enum: PaymentMethod, description: 'فلترة حسب طريقة الدفع' })
  @ApiQuery({ name: 'ownerId', required: false, description: 'فلترة حسب معرف المالك' })
  @ApiQuery({ name: 'amountMin', required: false, description: 'فلترة حسب الحد الأدنى للمبلغ' })
  @ApiQuery({ name: 'amountMax', required: false, description: 'فلترة حسب الحد الأقصى للمبلغ' })
  @ApiQuery({ name: 'reference', required: false, description: 'فلترة حسب رقم المرجع' })
  @ApiQuery({ name: 'search', required: false, description: 'البحث في العناوين والأوصاف' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'تم استرجاع قائمة المدفوعات بنجاح',
    type: PaymentsListResponseDto
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'غير مسموح' })
  list(@Query() q: CursorPaginationDto, @Query() filters: PaymentsAdminQueryDto) {
    return this.service.list(filters, q.cursor, q.limit);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'تحديث حالة الدفع',
    description: 'تغيير حالة الدفع (في الانتظار، قيد المعالجة، مكتمل، فاشل، ملغي، مسترد)'
  })
  @ApiParam({ name: 'id', description: 'معرف الدفع', example: '507f1f77bcf86cd799439012' })
  @ApiBody({
    description: 'بيانات تحديث الحالة',
    type: PaymentsStatusUpdateAdminDto,
    schema: {
      type: 'object',
      required: ['status'],
      properties: {
        status: { type: 'string', enum: ['pending','processing','completed','failed','cancelled','refunded'] },
        notes: { type: 'string', example: 'تم تأكيد الدفع من قبل الإدارة' },
        transactionId: { type: 'string', example: 'TXN-123456789' }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'تم تحديث حالة الدفع بنجاح',
    type: PaymentsAdminActionResponseDto
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'الدفع غير موجود' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'بيانات غير صحيحة' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'غير مسموح' })
  setStatus(@Param('id') id: string, @Body() dto: PaymentsStatusUpdateAdminDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'حذف دفع إدارياً',
    description: 'حذف الدفع نهائياً من قاعدة البيانات (عملية إدارية)'
  })
  @ApiParam({ name: 'id', description: 'معرف الدفع', example: '507f1f77bcf86cd799439012' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'تم حذف الدفع بنجاح',
    type: PaymentsAdminActionResponseDto
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'الدفع غير موجود' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'غير مسموح' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'تفاصيل الدفع',
    description: 'استرجاع تفاصيل دفع محدد مع معلومات المالك'
  })
  @ApiParam({ name: 'id', description: 'معرف الدفع', example: '507f1f77bcf86cd799439012' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'تم استرجاع تفاصيل الدفع بنجاح',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string', example: '507f1f77bcf86cd799439012' },
        ownerId: { type: 'string', example: '507f1f77bcf86cd799439011' },
        title: { type: 'string', example: 'دفع فاتورة خدمة' },
        description: { type: 'string', example: 'دفع شهري لخدمة الإعلانات' },
        type: { type: 'string', enum: ['deposit','withdrawal','transfer','payment','refund','commission'], example: 'payment' },
        amount: { type: 'number', example: 500 },
        currency: { type: 'string', example: 'SAR' },
        method: { type: 'string', enum: ['cash','card','bank_transfer','wallet','digital'], example: 'card' },
        status: { type: 'string', enum: ['pending','processing','completed','failed','cancelled','refunded'] },
        reference: { type: 'string', example: 'TXN-12345' },
        transactionId: { type: 'string', example: 'TXN-67890' },
        metadata: { type: 'object', example: { service: 'advertising', period: 'monthly' } },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        processedAt: { type: 'string', format: 'date-time' },
        completedAt: { type: 'string', format: 'date-time' },
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
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'الدفع غير موجود' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'غير مسموح' })
  getOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get('stats/overview')
  @ApiOperation({
    summary: 'إحصائيات المدفوعات',
    description: 'استرجاع إحصائيات عامة عن المدفوعات'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'تم استرجاع الإحصائيات بنجاح',
    type: PaymentsStatsDto
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'غير مسموح' })
  getStats() {
    return this.service.getStats();
  }
}
