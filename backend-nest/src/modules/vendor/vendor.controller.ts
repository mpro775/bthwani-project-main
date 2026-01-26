import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { VendorService } from './vendor.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { CursorPaginationDto } from '../../common/dto/pagination.dto';
import { UnifiedAuthGuard } from '../../common/guards/unified-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import {
  Auth,
  Roles,
  CurrentUser,
} from '../../common/decorators/auth.decorator';
import { AuthType } from '../../common/guards/unified-auth.guard';

@ApiTags('Vendor')
@ApiBearerAuth()
@Controller(['vendors', 'vendor'])
@UseGuards(UnifiedAuthGuard, RolesGuard)
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  // ==================== Vendor Authentication ====================

  @Post('auth/vendor-login')
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'تسجيل دخول التاجر' })
  async vendorLogin(@Body() loginDto: { email: string; password: string }) {
    return this.vendorService.vendorLogin(loginDto.email, loginDto.password);
  }

  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin', 'marketer')
  @Post()
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'إنشاء تاجر جديد' })
  async create(@Body() createVendorDto: CreateVendorDto) {
    return this.vendorService.create(createVendorDto);
  }

  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @Get()
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'جلب كل التجار' })
  async findAll(@Query() pagination: CursorPaginationDto) {
    return this.vendorService.findAll(pagination);
  }

  @Auth(AuthType.VENDOR_JWT)
  @Get('me')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'جلب بيانات التاجر الحالي' })
  async getProfile(@CurrentUser('id') vendorId: string) {
    return this.vendorService.findOne(vendorId);
  }

  @Auth(AuthType.JWT)
  @Get(':id')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'جلب تاجر محدد' })
  async findOne(@Param('id') id: string) {
    return this.vendorService.findOne(id);
  }

  @Auth(AuthType.VENDOR_JWT)
  @Patch('me')
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'تحديث بيانات التاجر' })
  async update(
    @CurrentUser('id') vendorId: string,
    @Body() updateVendorDto: UpdateVendorDto,
  ) {
    return this.vendorService.update(vendorId, updateVendorDto);
  }

  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @Patch(':id')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'تحديث تاجر (للإدارة)' })
  async updateVendor(
    @Param('id') id: string,
    @Body() updateVendorDto: UpdateVendorDto,
  ) {
    return this.vendorService.update(id, updateVendorDto);
  }

  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @Patch(':id/status')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'تحديث حالة التاجر' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { isActive: boolean },
  ) {
    return this.vendorService.update(id, { isActive: body.isActive });
  }

  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @Post(':id/reset-password')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'إعادة تعيين كلمة مرور التاجر' })
  async resetPassword(
    @Param('id') id: string,
    @Body() body: { password: string },
  ) {
    return this.vendorService.resetPassword(id, body.password);
  }

  @Auth(AuthType.VENDOR_JWT)
  @Get('dashboard/overview')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'لوحة معلومات التاجر' })
  async getDashboard(@CurrentUser('id') vendorId: string) {
    return this.vendorService.getDashboard(vendorId);
  }

  @Auth(AuthType.VENDOR_JWT)
  @Get('account/statement')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'كشف حساب التاجر' })
  async getAccountStatement(@CurrentUser('id') vendorId: string) {
    return this.vendorService.getAccountStatement(vendorId);
  }

  @Auth(AuthType.VENDOR_JWT)
  @Get('settlements')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'طلبات التسوية المالية' })
  async getSettlements(@CurrentUser('id') vendorId: string) {
    return this.vendorService.getSettlements(vendorId);
  }

  @Auth(AuthType.VENDOR_JWT)
  @Post('settlements')
  @ApiBody({ schema: { type: 'object', properties: { amount: { type: 'number' }, bankAccount: { type: 'string' } } } })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'طلب تسوية مالية' })
  async createSettlement(
    @CurrentUser('id') vendorId: string,
    @Body() body: { amount: number; bankAccount?: string },
  ) {
    return this.vendorService.createSettlement(vendorId, body);
  }

  @Auth(AuthType.VENDOR_JWT)
  @Get('sales')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'سجل المبيعات' })
  async getSales(
    @CurrentUser('id') vendorId: string,
    @Query('limit') limit?: number,
  ) {
    return this.vendorService.getSales(vendorId, limit);
  }

  @Auth(AuthType.VENDOR_JWT)
  @Post('account/delete-request')
  @ApiBody({ schema: { type: 'object', properties: { reason: { type: 'string' }, exportData: { type: 'boolean' } } } })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'طلب حذف الحساب' })
  async requestAccountDeletion(
    @CurrentUser('id') vendorId: string,
    @Body() body: { reason?: string; exportData?: boolean },
  ) {
    return this.vendorService.requestAccountDeletion(vendorId, body);
  }
}
