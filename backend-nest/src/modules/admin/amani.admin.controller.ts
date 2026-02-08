import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  Body,
  Post,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { UnifiedAuthGuard } from '../../common/guards/unified-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import {
  Auth,
  Roles,
  CurrentUser,
} from '../../common/decorators/auth.decorator';
import { AuthType } from '../../common/guards/unified-auth.guard';
import { CursorPaginationDto } from '../../common/dto/pagination.dto';
import { AmaniService } from '../amani/amani.service';
import AssignDriverDto from '../amani/dto/assign-driver.dto';

@ApiTags('Admin:Amani')
@ApiBearerAuth()
@Controller({ path: 'admin/amani', version: '1' })
@UseGuards(UnifiedAuthGuard, RolesGuard)
@Auth(AuthType.JWT)
@Roles('admin', 'superadmin')
export class AdminAmaniController {
  constructor(private readonly service: AmaniService) {}

  @Get()
  @ApiOperation({ summary: 'إدارة العناصر' })
  list(
    @Query() q: CursorPaginationDto,
    @Query('status') status?: string,
  ) {
    return this.service.findAll({ cursor: q.cursor, status, populateDriver: true });
  }

  @Get('pricing')
  @ApiOperation({ summary: 'الحصول على إعدادات أسعار أماني' })
  getPricing() {
    return this.service.getPricingSettings();
  }

  @Patch('pricing')
  @ApiOperation({ summary: 'تحديث إعدادات أسعار أماني' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['baseFee', 'perKm'],
      properties: {
        baseFee: { type: 'number', description: 'الرسوم الأساسية بالريال' },
        perKm: { type: 'number', description: 'سعر الكيلومتر بالريال' },
      },
    },
  })
  updatePricing(
    @Body() body: { baseFee: number; perKm: number },
    @CurrentUser('id') adminId?: string,
  ) {
    return this.service.updatePricingSettings(body, adminId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'جلب تفاصيل الطلب' })
  getOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post(':id/assign-driver')
  @ApiOperation({ summary: 'تعيين سائق للطلب يدوياً' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['driverId'],
      properties: {
        driverId: { type: 'string', description: 'معرف السائق' },
        note: { type: 'string', description: 'ملاحظة اختيارية' },
      },
    },
  })
  assignDriver(
    @Param('id') id: string,
    @Body() dto: AssignDriverDto,
    @CurrentUser('id') adminId?: string,
  ) {
    return this.service.assignDriver(id, dto, adminId);
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
