import { Controller, Get, Patch, Delete, Param, Query, UseGuards, Body, Req, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { UnifiedAuthGuard } from '../../common/guards/unified-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Auth, Roles } from '../../common/decorators/auth.decorator';
import { AuthType } from '../../common/guards/unified-auth.guard';
import { CursorPaginationDto } from '../../common/dto/pagination.dto';
import { ArabonService } from '../arabon/arabon.service';
import { BookingService } from '../arabon/booking.service';
import { BookingStatus } from '../arabon/entities/booking.entity';

@ApiTags('Admin:Arabon')
@ApiBearerAuth()
@Controller({ path: 'admin/arabon', version: '1' })
@UseGuards(UnifiedAuthGuard, RolesGuard)
@Auth(AuthType.JWT)
@Roles('admin','superadmin')
export class AdminArabonController {
  constructor(
    private readonly service: ArabonService,
    private readonly bookingService: BookingService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'إدارة العناصر' })
  list(@Query() q: CursorPaginationDto) {
    return this.service.list({}, q.cursor, q.limit);
  }

  @Get('bookings/kpis')
  @ApiOperation({
    summary: 'مؤشرات أداء الحجوزات (KPIs)',
    description: 'عدد الحجوزات المدفوعة، معدل التحويل، معدل no-show، دقة التقويم',
  })
  getBookingsKpis(@Query('arabonId') arabonId?: string) {
    return this.bookingService.getBookingsKpis(arabonId);
  }

  @Patch('bookings/:bookingId/status')
  @ApiOperation({
    summary: 'تحديث حالة الحجز (للأدمن)',
    description: 'تحديث حالة الحجز: completed | cancelled | no_show. صلاحية أدمن/سوبرأدمن.',
  })
  updateBookingStatus(
    @Req() req: Request & { user?: { id?: string; role?: string } },
    @Param('bookingId') bookingId: string,
    @Body() body: { status: string },
  ) {
    const uid = req?.user?.id;
    if (!uid) throw new BadRequestException('يجب تسجيل الدخول');
    return this.bookingService.updateStatus(
      bookingId,
      body.status as BookingStatus,
      uid,
      req?.user?.role,
    );
  }

  @Get(':id/kpis')
  @ApiOperation({ summary: 'مؤشرات أداء عربون محدد' })
  getArabonKpis(@Param('id') id: string) {
    return this.bookingService.getBookingsKpis(id);
  }

  @Get(':id/bookings')
  @ApiOperation({
    summary: 'حجوزات العربون (للأدمن)',
    description: 'قائمة الحجوزات على هذا العربون. للأدمن فقط.',
  })
  async getArabonBookings(@Param('id') id: string) {
    const result = await this.bookingService.getBookingsByArabonForAdmin(id);
    return { data: result.items, nextCursor: result.nextCursor, hasMore: !!result.nextCursor };
  }

  @Get(':id')
  @ApiOperation({ summary: 'تفاصيل العنصر' })
  getOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'تغيير الحالة' })
  setStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.service.update(id, { status: body.status } as any);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف إداري' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
