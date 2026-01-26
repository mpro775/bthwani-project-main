import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  SetMetadata,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation , ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import {
  AkhdimniService,
  PaginatedOrdersResult,
} from './services/akhdimni.service';
import {
  CreateErrandDto,
  UpdateErrandStatusDto,
  AssignDriverDto,
  RateErrandDto,
} from './dto/create-errand.dto';
import { CalculateFeeDto } from './dto/calculate-fee.dto';
import { Auth, CurrentUser } from '../../common/decorators/auth.decorator';
import { AuthType } from '../../common/guards/unified-auth.guard';

const Roles = (...roles: string[]) => SetMetadata('roles', roles);

@ApiTags('Akhdimni')
@Controller({ path: 'akhdimni', version: ['1', '2'] })
@ApiBearerAuth()
export class AkhdimniController {
  constructor(private readonly akhdimniService: AkhdimniService) {}

  // ==================== Customer Endpoints ====================

  @Post('errands/calculate-fee')
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.FIREBASE)
  @ApiOperation({ summary: 'حساب رسوم المهمة قبل إنشائها' })
  async calculateFee(@Body() dto: CalculateFeeDto) {
    return this.akhdimniService.calculateFee(dto);
  }

  @Post('errands')
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.FIREBASE)
  @ApiOperation({ summary: 'إنشاء طلب مهمة (أخدمني)' })
  async createErrand(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateErrandDto,
  ) {
    return this.akhdimniService.create(userId, dto);
  }

  @Get('my-errands')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.FIREBASE)
  @ApiOperation({ summary: 'طلباتي من أخدمني' })
  async getMyErrands(
    @CurrentUser('id') userId: string,
    @Query('status') status?: string,
  ) {
    return this.akhdimniService.getMyOrders(userId, status);
  }

  @Get('errands/:id')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.FIREBASE)
  @ApiOperation({ summary: 'الحصول على طلب محدد' })
  async getErrand(@Param('id') id: string) {
    return this.akhdimniService.findById(id);
  }

  @Patch('errands/:id/cancel')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.FIREBASE)
  @ApiOperation({ summary: 'إلغاء طلب' })
  async cancelErrand(@Param('id') id: string, @Body() dto: { reason: string }) {
    return this.akhdimniService.cancel(id, dto.reason);
  }

  @Post('errands/:id/rate')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.FIREBASE)
  @ApiOperation({ summary: 'تقييم المهمة' })
  async rateErrand(@Param('id') id: string, @Body() dto: RateErrandDto) {
    return this.akhdimniService.rate(id, dto);
  }

  // ==================== Driver Endpoints ====================

  @Get('driver/my-errands')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.FIREBASE)
  @Roles('driver')
  @ApiOperation({ summary: 'مهماتي كسائق' })
  async getMyDriverErrands(
    @CurrentUser('id') driverId: string,
    @Query('status') status?: string,
  ) {
    return this.akhdimniService.getDriverOrders(driverId, status);
  }

  @Patch('errands/:id/status')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.FIREBASE)
  @Roles('driver')
  @ApiOperation({ summary: 'تحديث حالة المهمة (سائق)' })
  async updateErrandStatus(
    @Param('id') id: string,
    @Body() dto: UpdateErrandStatusDto,
  ) {
    return this.akhdimniService.updateStatus(id, dto);
  }

  // ==================== Admin Endpoints ====================

  @Get('admin/errands')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'كل طلبات أخدمني (إدارة)' })
  async getAllErrands(
    @Query('status') status?: string,
    @Query('limit') limit?: number,
    @Query('cursor') cursor?: string,
  ): Promise<PaginatedOrdersResult> {
    return this.akhdimniService.getAllOrders(status, limit, cursor);
  }

  @Post('admin/errands/:id/assign-driver')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'تعيين سائق لمهمة' })
  async assignDriver(@Param('id') id: string, @Body() dto: AssignDriverDto) {
    return this.akhdimniService.assignDriver(id, dto.driverId);
  }
}
