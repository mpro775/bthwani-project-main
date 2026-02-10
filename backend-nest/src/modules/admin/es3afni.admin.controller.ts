import { Controller, Get, Patch, Delete, Param, Query, UseGuards, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UnifiedAuthGuard } from '../../common/guards/unified-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Auth, Roles } from '../../common/decorators/auth.decorator';
import { AuthType } from '../../common/guards/unified-auth.guard';
import { CursorPaginationDto } from '../../common/dto/pagination.dto';
import { Es3afniService } from '../es3afni/es3afni.service';
import { Es3afniDonorService } from '../es3afni/es3afni-donor.service';

@ApiTags('Admin:Es3afni')
@ApiBearerAuth()
@Controller({ path: 'admin/es3afni', version: '1' })
@UseGuards(UnifiedAuthGuard, RolesGuard)
@Auth(AuthType.JWT)
@Roles('admin','superadmin')
export class AdminEs3afniController {
  constructor(
    private readonly service: Es3afniService,
    private readonly donorService: Es3afniDonorService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'إدارة العناصر' })
  @ApiQuery({ name: 'cursor', required: false })
  @ApiQuery({ name: 'bloodType', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'urgency', required: false })
  list(
    @Query() q: CursorPaginationDto,
    @Query('bloodType') bloodType?: string,
    @Query('status') status?: string,
    @Query('urgency') urgency?: string,
  ) {
    return this.service.findAll({
      cursor: q.cursor,
      bloodType,
      status,
      urgency,
    });
  }

  @Get('donors')
  @ApiOperation({ summary: 'قائمة المتبرعين (قراءة فقط)' })
  @ApiQuery({ name: 'cursor', required: false })
  @ApiQuery({ name: 'bloodType', required: false })
  @ApiQuery({ name: 'available', required: false, enum: ['true', 'false'] })
  donors(
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('bloodType') bloodType?: string,
    @Query('available') available?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 25;
    const availableBool = available === 'true' ? true : available === 'false' ? false : undefined;
    return this.donorService.findAllForAdmin({
      cursor,
      limit: limitNum,
      bloodType,
      available: availableBool,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'تفاصيل بلاغ' })
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
