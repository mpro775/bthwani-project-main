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
import { BookingSlotService } from './booking-slot.service';
import { BookingService } from './booking.service';
import CreateArabonDto from './dto/create-arabon.dto';
import UpdateArabonDto from './dto/update-arabon.dto';
import { CreateSlotsDto } from './dto/create-slots.dto';
import { ConfirmBookingDto } from './dto/confirm-booking.dto';
import { BookingStatus } from './entities/booking.entity';

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
  constructor(
    private readonly service: ArabonService,
    private readonly bookingSlotService: BookingSlotService,
    private readonly bookingService: BookingService,
  ) {}

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
  create(
    @Req() req: Request & { user?: { id?: string } },
    @Body() dto: CreateArabonDto,
  ) {
    const uid = req?.user?.id;
    if (uid) {
      (dto as any).ownerId = uid;
    }
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
    @Req() req: Request & { user?: { id?: string } },
    @Query('cursor') cursor?: string,
    @Query('status') status?: string,
  ) {
    const uid = req?.user?.id;
    if (!uid) {
      return toListResponse({ items: [], nextCursor: null });
    }
    const result = await this.service.findByOwner(uid, { cursor, status });
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
    @Req() req: Request & { user?: { id?: string } },
    @Query('scope') scope?: string,
  ) {
    if (scope === 'my') {
      const uid = req?.user?.id;
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
      return this.service.getStatsForOwner(uid);
    }
    return this.service.getStats();
  }

  @Get('bookings/my')
  @ApiOperation({
    summary: 'حجوزاتي',
    description: 'قائمة حجوزات المستخدم الحالي',
  })
  @ApiQuery({ name: 'status', required: false, description: 'فلترة حسب الحالة', enum: ['confirmed', 'completed', 'cancelled', 'no_show'] })
  @ApiQuery({ name: 'cursor', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED })
  async getMyBookings(
    @Req() req: Request & { user?: { id?: string } },
    @Query('status') status?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    const uid = req?.user?.id;
    if (!uid) throw new BadRequestException('يجب تسجيل الدخول');
    const result = await this.bookingService.getMyBookings(uid, {
      status,
      cursor,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
    return toListResponse(result);
  }

  @Get('bookings/:bookingId')
  @ApiOperation({ summary: 'تفاصيل حجز', description: 'استرجاع حجز بواسطة المعرف' })
  @ApiParam({ name: 'bookingId', description: 'معرف الحجز' })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiResponse({ status: HttpStatus.NOT_FOUND })
  @ApiResponse({ status: HttpStatus.FORBIDDEN })
  async getBooking(
    @Req() req: Request & { user?: { id?: string } },
    @Param('bookingId') bookingId: string,
  ) {
    const uid = req?.user?.id;
    return this.bookingService.findOne(bookingId, uid);
  }

  @Patch('bookings/:bookingId/status')
  @ApiOperation({
    summary: 'تحديث حالة الحجز (للمالك)',
    description: 'تحديث حالة الحجز: completed | cancelled | no_show. لصاحب المنشأة فقط.',
  })
  @ApiParam({ name: 'bookingId', description: 'معرف الحجز' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['status'],
      properties: { status: { type: 'string', enum: ['completed', 'cancelled', 'no_show'] } },
    },
  })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiResponse({ status: HttpStatus.NOT_FOUND })
  @ApiResponse({ status: HttpStatus.FORBIDDEN })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST })
  async updateBookingStatus(
    @Req() req: Request & { user?: { id?: string } },
    @Param('bookingId') bookingId: string,
    @Body() body: { status: string },
  ) {
    const uid = req?.user?.id;
    if (!uid) throw new BadRequestException('يجب تسجيل الدخول');
    const status = body.status as BookingStatus;
    return this.bookingService.updateStatus(bookingId, status, uid);
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

  @Post(':id/request')
  @ApiOperation({
    summary: 'تقديم طلب على عربون',
    description: 'تقديم طلب من قبل مستخدم (غير صاحب المنشأة) على عربون',
  })
  @ApiParam({ name: 'id', description: 'معرف العربون', example: '507f1f77bcf86cd799439012' })
  @ApiBody({
    description: 'الرسالة الاختيارية',
    schema: { type: 'object', properties: { message: { type: 'string', example: 'أود الحجز لهذا الموعد' } } },
  })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'تم تقديم الطلب بنجاح' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'غير موجود' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'طلب مسبق أو صاحب المنشأة' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  async submitRequest(
    @Req() req: Request & { user?: { id?: string } },
    @Param('id') id: string,
    @Body() body: { message?: string },
  ) {
    const uid = req?.user?.id;
    if (!uid) throw new BadRequestException('يجب تسجيل الدخول لتقديم طلب');
    return this.service.submitRequest(id, uid, body?.message);
  }

  @Get(':id/requests')
  @ApiOperation({
    summary: 'قائمة طلبات العربون',
    description: 'عرض الطلبات المقدمة على العربون (لصاحب المنشأة فقط)',
  })
  @ApiParam({ name: 'id', description: 'معرف العربون', example: '507f1f77bcf86cd799439012' })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم الاسترجاع بنجاح' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'غير موجود' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'مسموح لصاحب المنشأة فقط' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  async getRequests(
    @Req() req: Request & { user?: { id?: string } },
    @Param('id') id: string,
  ) {
    const uid = req?.user?.id;
    if (!uid) throw new BadRequestException('يجب تسجيل الدخول');
    const result = await this.service.getRequests(id, uid);
    return { data: result.items };
  }

  @Get(':id/slots')
  @ApiOperation({
    summary: 'الأوقات المتاحة للحجز',
    description: 'استرجاع قائمة الـ slots غير المحجوزة للعربون في المدى الزمني (اختياري)',
  })
  @ApiParam({ name: 'id', description: 'معرف العربون', example: '507f1f77bcf86cd799439012' })
  @ApiQuery({ name: 'from', required: false, description: 'بداية المدى (ISO 8601)', example: '2025-06-01T00:00:00.000Z' })
  @ApiQuery({ name: 'to', required: false, description: 'نهاية المدى (ISO 8601)', example: '2025-06-30T23:59:59.999Z' })
  @ApiResponse({ status: HttpStatus.OK, description: 'قائمة الأوقات المتاحة' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'العربون غير موجود' })
  async getSlots(
    @Param('id') id: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const slots = await this.bookingSlotService.getAvailableSlots(id, from, to);
    return { data: slots };
  }

  @Post(':id/slots')
  @ApiOperation({
    summary: 'إنشاء أوقات حجز (للمالك)',
    description: 'إضافة slots لعربون إما قائمة صريحة أو نطاق زمني + فاصل. مسموح لصاحب المنشأة فقط.',
  })
  @ApiParam({ name: 'id', description: 'معرف العربون', example: '507f1f77bcf86cd799439012' })
  @ApiBody({
    description: 'إما slots: [{ datetime, durationMinutes? }] أو range: { start, end, intervalMinutes, durationMinutes? }',
    type: CreateSlotsDto,
  })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'تم إنشاء الأوقات بنجاح' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'بيانات غير صحيحة' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'العربون غير موجود' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'مسموح لصاحب المنشأة فقط' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  async createSlots(
    @Req() req: Request & { user?: { id?: string } },
    @Param('id') id: string,
    @Body() dto: CreateSlotsDto,
  ) {
    const uid = req?.user?.id;
    if (!uid) throw new BadRequestException('يجب تسجيل الدخول');
    return this.bookingSlotService.createSlots(id, uid, dto);
  }

  @Post(':id/book')
  @ApiOperation({
    summary: 'تأكيد حجز',
    description: 'حجز وقت لعربون: خصم العربون من المحفظة وربط الـ slot. يتطلب تسجيل الدخول.',
  })
  @ApiParam({ name: 'id', description: 'معرف العربون' })
  @ApiBody({ type: ConfirmBookingDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'تم الحجز بنجاح' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST })
  @ApiResponse({ status: HttpStatus.NOT_FOUND })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED })
  async confirmBooking(
    @Req() req: Request & { user?: { id?: string } },
    @Param('id') id: string,
    @Body() dto: ConfirmBookingDto,
  ) {
    const uid = req?.user?.id;
    if (!uid) throw new BadRequestException('يجب تسجيل الدخول');
    return this.bookingService.confirmBooking(id, uid, dto);
  }

  @Get(':id/bookings')
  @ApiOperation({
    summary: 'حجوزات العربون (للمالك)',
    description: 'قائمة الحجوزات على هذا العربون. لصاحب المنشأة فقط.',
  })
  @ApiParam({ name: 'id', description: 'معرف العربون' })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiResponse({ status: HttpStatus.NOT_FOUND })
  @ApiResponse({ status: HttpStatus.FORBIDDEN })
  async getArabonBookings(
    @Req() req: Request & { user?: { id?: string } },
    @Param('id') id: string,
  ) {
    const uid = req?.user?.id;
    if (!uid) throw new BadRequestException('يجب تسجيل الدخول');
    const result = await this.bookingService.getBookingsByArabon(id, uid);
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
    @Req() req: Request & { user?: { id?: string } },
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    const uid = req?.user?.id;
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
    @Req() req: Request & { user?: { id?: string } },
    @Param('id') id: string,
    @Body() dto: UpdateArabonDto,
  ) {
    const uid = req?.user?.id;
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
