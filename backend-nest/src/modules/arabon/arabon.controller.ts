import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
  Delete,
  HttpStatus,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
  ApiConsumes,
  ApiProduces,
} from '@nestjs/swagger';
import { Request } from 'express';
import { UnifiedAuthGuard } from '../../common/guards/unified-auth.guard';
import { ArabonService } from './arabon.service';
import CreateArabonDto from './dto/create-arabon.dto';
import UpdateArabonDto from './dto/update-arabon.dto';

function toListResponse<T>(result: { items: T[]; nextCursor: string | null }) {
  return {
    data: result.items,
    nextCursor: result.nextCursor ?? undefined,
    hasMore: !!result.nextCursor,
  };
}

@ApiTags('عربون — العروض والحجوزات بعربون')
@ApiBearerAuth()
@ApiConsumes('application/json')
@ApiProduces('application/json')
@UseGuards(UnifiedAuthGuard)
@Controller('arabon')
export class ArabonController {
  constructor(private readonly service: ArabonService) {}

  @Post()
  @ApiOperation({
    summary: 'إنشاء عرض/حجز بعربون',
    description: 'إنشاء سجل جديد لعربون يتضمن المبلغ والجدولة',
  })
  @ApiBody({
    description: 'بيانات العربون',
    schema: {
      type: 'object',
      required: ['ownerId', 'title'],
      properties: {
        ownerId: { type: 'string', example: '507f1f77bcf86cd799439011' },
        title: { type: 'string', example: 'عربون لحجز عرض سياحي' },
        description: { type: 'string', example: 'حجز عرض لمدة نهاية الأسبوع' },
        depositAmount: { type: 'number', example: 250.5, description: 'قيمة العربون' },
        scheduleAt: { type: 'string', format: 'date-time', example: '2025-06-01T10:00:00.000Z' },
        metadata: { type: 'object', example: { guests: 2, notes: 'بدون تدخين' } },
        status: {
          type: 'string',
          enum: ['draft', 'pending', 'confirmed', 'completed', 'cancelled'],
          default: 'draft',
        },
      },
    },
  })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'تم إنشاء العربون بنجاح' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'بيانات غير صحيحة' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  create(@Body() dto: CreateArabonDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'قائمة العربونات',
    description: 'استرجاع قائمة العربونات مع دعم التنقل بالـ cursor والفلترة',
  })
  @ApiQuery({ name: 'cursor', required: false, description: 'مؤشر الصفحة التالية', example: '507f1f77bcf86cd799439012' })
  @ApiQuery({ name: 'status', required: false, description: 'فلترة حسب الحالة', enum: ['draft', 'pending', 'confirmed', 'completed', 'cancelled'] })
  @ApiQuery({ name: 'ownerId', required: false, description: 'فلترة حسب المالك (معرف المستخدم)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم الاسترجاع بنجاح' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  async findAll(
    @Query('cursor') cursor?: string,
    @Query('status') status?: string,
    @Query('ownerId') ownerId?: string,
  ) {
    const result = await this.service.findAll({ cursor, status, ownerId });
    return toListResponse(result);
  }

  @Get('my')
  @ApiOperation({
    summary: 'العربونات الخاصة بي',
    description: 'استرجاع العربونات التي يملكها المستخدم الحالي',
  })
  @ApiQuery({ name: 'cursor', required: false, description: 'مؤشر الصفحة التالية', example: '507f1f77bcf86cd799439012' })
  @ApiQuery({ name: 'status', required: false, description: 'فلترة حسب الحالة', enum: ['draft', 'pending', 'confirmed', 'completed', 'cancelled'] })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم الاسترجاع بنجاح' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  async getMy(
    @Req() req: Request & { user?: { id?: string; uid?: string } },
    @Query('cursor') cursor?: string,
    @Query('status') status?: string,
  ) {
    const uid = req?.user?.uid ?? req?.user?.id;
    if (!uid) {
      return toListResponse({ items: [], nextCursor: null });
    }
    const result = await this.service.findByOwnerFirebaseUid(uid, { cursor, status });
    return toListResponse(result);
  }

  @Get('search')
  @ApiOperation({
    summary: 'البحث في العربونات',
    description: 'البحث في العربونات بناءً على استعلام النص',
  })
  @ApiQuery({ name: 'q', required: true, description: 'استعلام البحث', example: 'عرض سياحي' })
  @ApiQuery({ name: 'status', required: false, description: 'فلترة حسب الحالة', enum: ['draft', 'pending', 'confirmed', 'completed', 'cancelled'] })
  @ApiQuery({ name: 'cursor', required: false, description: 'مؤشر الصفحة التالية', example: '507f1f77bcf86cd799439012' })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم البحث بنجاح' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'استعلام البحث مطلوب' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  async search(
    @Query('q') q: string,
    @Query('status') status?: string,
    @Query('cursor') cursor?: string,
  ) {
    const qTrim = typeof q === 'string' ? q.trim() : '';
    if (!qTrim) {
      throw new BadRequestException('استعلام البحث مطلوب');
    }
    const result = await this.service.search(qTrim, { cursor, status });
    return toListResponse(result);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'إحصائيات العربونات',
    description: 'إحصائيات عامة أو إحصائيات عربوناتي عند scope=my',
  })
  @ApiQuery({ name: 'scope', required: false, description: 'my = عربوناتي فقط', enum: ['my'] })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم الاسترجاع بنجاح' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  async getStats(
    @Req() req: Request & { user?: { id?: string; uid?: string } },
    @Query('scope') scope?: string,
  ) {
    if (scope === 'my') {
      const uid = req?.user?.uid ?? req?.user?.id;
      if (!uid) {
        return {
          total: 0,
          draft: 0,
          pending: 0,
          confirmed: 0,
          completed: 0,
          cancelled: 0,
          totalDepositAmount: 0,
        };
      }
      return this.service.getStatsForFirebaseUid(uid);
    }
    return this.service.getStats();
  }

  @Get(':id/activity')
  @ApiOperation({
    summary: 'سجل تغيير الحالة',
    description: 'قائمة تغييرات حالة العربون (إشعارات بالحالة)',
  })
  @ApiParam({ name: 'id', description: 'معرف العربون', example: '507f1f77bcf86cd799439012' })
  @ApiQuery({ name: 'cursor', required: false, description: 'مؤشر الصفحة التالية' })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم الاسترجاع بنجاح' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'غير موجود' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  async getActivity(@Param('id') id: string, @Query('cursor') cursor?: string) {
    const result = await this.service.getActivity(id, { cursor });
    return toListResponse(result);
  }

  @Get(':id')
  @ApiOperation({ summary: 'تفاصيل عربون', description: 'استرجاع عربون بواسطة المعرف' })
  @ApiParam({ name: 'id', description: 'معرف العربون', example: '507f1f77bcf86cd799439012' })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم الاسترجاع بنجاح' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'غير موجود' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'تحديث حالة عربون', description: 'تحديث حالة العربون فقط' })
  @ApiParam({ name: 'id', description: 'معرف العربون', example: '507f1f77bcf86cd799439012' })
  @ApiBody({
    description: 'الحالة الجديدة',
    schema: {
      type: 'object',
      required: ['status'],
      properties: {
        status: {
          type: 'string',
          enum: ['draft', 'pending', 'confirmed', 'completed', 'cancelled'],
          example: 'confirmed',
        },
      },
    },
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم التحديث بنجاح' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'غير موجود' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'حالة غير صحيحة' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  updateStatus(
    @Req() req: Request & { user?: { id?: string; uid?: string } },
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    const uid = req?.user?.uid ?? req?.user?.id;
    return this.service.updateStatus(id, body.status, uid);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'تحديث عربون', description: 'تحديث بيانات العربون' })
  @ApiParam({ name: 'id', description: 'معرف العربون', example: '507f1f77bcf86cd799439012' })
  @ApiBody({
    description: 'الحقول الممكن تحديثها',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'عربون محدث' },
        description: { type: 'string', example: 'تفاصيل محدثة' },
        depositAmount: { type: 'number', example: 300 },
        scheduleAt: { type: 'string', format: 'date-time', example: '2025-06-10T12:00:00.000Z' },
        metadata: { type: 'object', example: { guests: 3 } },
        status: {
          type: 'string',
          enum: ['draft', 'pending', 'confirmed', 'completed', 'cancelled'],
          example: 'confirmed',
        },
      },
    },
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم التحديث بنجاح' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'غير موجود' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'بيانات غير صحيحة' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  update(
    @Req() req: Request & { user?: { id?: string; uid?: string } },
    @Param('id') id: string,
    @Body() dto: UpdateArabonDto,
  ) {
    const uid = req?.user?.uid ?? req?.user?.id;
    return this.service.update(id, dto, uid);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف عربون', description: 'حذف سجل العربون نهائياً' })
  @ApiParam({ name: 'id', description: 'معرف العربون', example: '507f1f77bcf86cd799439012' })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم الحذف بنجاح' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'غير موجود' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
