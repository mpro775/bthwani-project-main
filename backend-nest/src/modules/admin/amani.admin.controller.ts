import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  Body,
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
  list(@Query() q: CursorPaginationDto) {
    return this.service.findAll({ cursor: q.cursor });
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
