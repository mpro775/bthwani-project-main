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
import { DriverService } from './driver.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { CursorPaginationDto } from '../../common/dto/pagination.dto';
import { UnifiedAuthGuard } from '../../common/guards/unified-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import {
  Auth,
  Roles,
  CurrentUser,
} from '../../common/decorators/auth.decorator';
import { AuthType } from '../../common/guards/unified-auth.guard';

@ApiTags('Driver')
@ApiBearerAuth()
@Controller('drivers')
@UseGuards(UnifiedAuthGuard, RolesGuard)
export class DriverController {
  constructor(private readonly driverService: DriverService) {}

  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @Post()
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'إنشاء سائق جديد (للإدارة)' })
  async create(@Body() createDriverDto: CreateDriverDto) {
    return this.driverService.create(createDriverDto);
  }

  @Auth(AuthType.JWT)
  @Get('available')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'جلب السائقين المتاحين' })
  async findAvailable(@Query() pagination: CursorPaginationDto) {
    return this.driverService.findAvailable(pagination);
  }

  @Auth(AuthType.JWT)
  @Roles('driver')
  @Get('me')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'بيانات السائق الحالي' })
  async getCurrentDriver(@CurrentUser('id') driverId: string) {
    return this.driverService.getCurrentDriver(driverId);
  }

  @Auth(AuthType.JWT)
  @Roles('driver')
  @Post('locations')
  @ApiBody({ schema: { type: 'object', required: ['lat', 'lng'], properties: { lat: { type: 'number' }, lng: { type: 'number' }, accuracy: { type: 'number' } } } })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'تحديث موقع السائق' })
  async updateLocation(
    @CurrentUser('id') driverId: string,
    @Body() locationData: { lat: number; lng: number; accuracy?: number },
  ) {
    return this.driverService.updateLocation(driverId, locationData);
  }

  @Auth(AuthType.JWT)
  @Roles('driver')
  @Get('withdrawals/my')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'سحوباتي' })
  async getMyWithdrawals(@CurrentUser('id') driverId: string) {
    return this.driverService.getMyWithdrawals(driverId);
  }

  @Auth(AuthType.JWT)
  @Roles('driver')
  @Post('withdrawals/request')
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'طلب سحب أموال' })
  async requestWithdrawal(
    @CurrentUser('id') driverId: string,
    @Body() body: { amount: number; method: string; details?: any },
  ) {
    return this.driverService.requestWithdrawal(driverId, body);
  }

  @Auth(AuthType.JWT)
  @Roles('driver')
  @Post('sos')
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'إرسال إشارة SOS' })
  async sendSOS(
    @CurrentUser('id') driverId: string,
    @Body() body: { message?: string; location?: { lat: number; lng: number } },
  ) {
    return this.driverService.sendSOS(driverId, body);
  }

  @Auth(AuthType.JWT)
  @Get(':id')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'جلب سائق محدد' })
  async findOne(@Param('id') id: string) {
    return this.driverService.findOne(id);
  }


  @Auth(AuthType.JWT)
  @Roles('driver')
  @Patch('availability')
  @ApiBody({ schema: { type: 'object', properties: { isAvailable: { type: 'boolean' } } } })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'تحديث حالة التوفر' })
  async updateAvailability(
    @CurrentUser('id') driverId: string,
    @Body('isAvailable') isAvailable: boolean,
  ) {
    return this.driverService.updateAvailability(driverId, isAvailable);
  }

  // ==================== Driver Profile ====================

  @Auth(AuthType.JWT)
  @Roles('driver')
  @Get('profile')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'ملفي الشخصي' })
  async getProfile(@CurrentUser('id') driverId: string) {
    return this.driverService.getProfile(driverId);
  }

  @Auth(AuthType.JWT)
  @Roles('driver')
  @Patch('profile')
  @ApiBody({ schema: { type: 'object', properties: { name: { type: 'string' }, phone: { type: 'string' }, vehicle: { type: 'object' } } } })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'تحديث الملف الشخصي' })
  async updateProfile(@CurrentUser('id') driverId: string, @Body() body: any) {
    return this.driverService.updateProfile(driverId, body);
  }

  // ==================== Driver Earnings ====================

  @Auth(AuthType.JWT)
  @Roles('driver')
  @Get('earnings')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'أرباحي' })
  async getEarnings(
    @CurrentUser('id') driverId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.driverService.getEarnings(driverId, startDate, endDate);
  }

  @Auth(AuthType.JWT)
  @Roles('driver')
  @Get('earnings/daily')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'أرباح اليوم' })
  async getDailyEarnings(@CurrentUser('id') driverId: string) {
    return this.driverService.getDailyEarnings(driverId);
  }

  @Auth(AuthType.JWT)
  @Roles('driver')
  @Get('earnings/weekly')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'أرباح الأسبوع' })
  async getWeeklyEarnings(@CurrentUser('id') driverId: string) {
    return this.driverService.getWeeklyEarnings(driverId);
  }

  // ==================== Driver Statistics ====================

  @Auth(AuthType.JWT)
  @Roles('driver')
  @Get('statistics')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'إحصائياتي' })
  async getStatistics(@CurrentUser('id') driverId: string) {
    return this.driverService.getStatistics(driverId);
  }

  // ==================== Driver Documents ====================

  @Auth(AuthType.JWT)
  @Roles('driver')
  @Post('documents/upload')
  @ApiBody({ schema: { type: 'object', properties: { type: { type: 'string' }, file: { type: 'string' }, number: { type: 'string' } } } })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'رفع مستند' })
  async uploadDocument(
    @CurrentUser('id') driverId: string,
    @Body()
    body: {
      type: string;
      fileUrl: string;
      expiryDate?: string;
    },
  ) {
    return this.driverService.uploadDocument(driverId, body);
  }

  @Auth(AuthType.JWT)
  @Roles('driver')
  @Get('documents')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'مستنداتي' })
  async getDocuments(@CurrentUser('id') driverId: string) {
    return this.driverService.getDocuments(driverId);
  }

  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @Get(':driverId/documents')
  @ApiParam({ name: 'driverId', type: String })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'مستندات سائق (Admin)' })
  async getDriverDocumentsAdmin(@Param('driverId') driverId: string) {
    return this.driverService.getDocuments(driverId);
  }

  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @Post(':driverId/documents/:docId/verify')
  @ApiParam({ name: 'driverId', type: String })
  @ApiParam({ name: 'docId', type: String })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'التحقق من مستند (Admin)' })
  async verifyDocument(
    @Param('driverId') driverId: string,
    @Param('docId') docId: string,
    @Body() body: { verified: boolean; notes?: string },
    @CurrentUser('id') adminId: string,
  ) {
    // استدعاء service method
    return { message: 'تم التحقق من المستند', driverId, docId, verified: body.verified, adminId };
  }

  // ==================== Driver Vacations ====================

  @Auth(AuthType.JWT)
  @Roles('driver')
  @Post('vacations/request')
  @ApiBody({ schema: { type: 'object', properties: { startDate: { type: 'string' }, endDate: { type: 'string' }, reason: { type: 'string' } } } })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'طلب إجازة' })
  async requestVacation(
    @CurrentUser('id') driverId: string,
    @Body()
    body: {
      startDate: string;
      endDate: string;
      type: string;
      reason?: string;
    },
  ) {
    return this.driverService.requestVacation(driverId, body);
  }

  @Auth(AuthType.JWT)
  @Roles('driver')
  @Get('vacations/my')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'إجازاتي' })
  async getMyVacations(@CurrentUser('id') driverId: string) {
    return this.driverService.getMyVacations(driverId);
  }

  @Auth(AuthType.JWT)
  @Roles('driver')
  @Patch('vacations/:id/cancel')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'إلغاء طلب إجازة' })
  async cancelVacation(
    @Param('id') vacationId: string,
    @CurrentUser('id') driverId: string,
  ) {
    return this.driverService.cancelVacation(vacationId, driverId);
  }

  @Auth(AuthType.JWT)
  @Roles('driver')
  @Get('vacations/balance')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'رصيد الإجازات' })
  async getVacationBalance(@CurrentUser('id') driverId: string) {
    return this.driverService.getVacationBalance(driverId);
  }

  @Auth(AuthType.JWT)
  @Roles('driver')
  @Get('vacations/policy')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'سياسة الإجازات' })
  async getVacationPolicy() {
    return this.driverService.getVacationPolicy();
  }

  // ==================== Driver Withdrawals ====================
  // ✅ تم نقل طلبات السحب إلى WalletController - استخدم /wallet/withdraw/request بدلاً من ذلك

  // ==================== Driver Orders (Advanced) ====================

  @Auth(AuthType.JWT)
  @Roles('driver')
  @Get('orders/available')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'الطلبات المتاحة للاستلام' })
  async getAvailableOrders(@CurrentUser('id') driverId: string) {
    return this.driverService.getAvailableOrders(driverId);
  }

  @Auth(AuthType.JWT)
  @Roles('driver')
  @Post('orders/:id/accept')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'قبول طلب' })
  async acceptOrder(
    @Param('id') orderId: string,
    @CurrentUser('id') driverId: string,
  ) {
    return this.driverService.acceptOrder(orderId, driverId);
  }

  @Auth(AuthType.JWT)
  @Roles('driver')
  @Post('orders/:id/reject')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'رفض طلب' })
  async rejectOrder(
    @Param('id') orderId: string,
    @CurrentUser('id') driverId: string,
    @Body() body: { reason: string },
  ) {
    return this.driverService.rejectOrder(orderId, driverId, body.reason);
  }

  @Auth(AuthType.JWT)
  @Roles('driver')
  @Post('orders/:id/start-delivery')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'بدء التوصيل' })
  async startDelivery(
    @Param('id') orderId: string,
    @CurrentUser('id') driverId: string,
  ) {
    return this.driverService.startDelivery(orderId, driverId);
  }

  @Auth(AuthType.JWT)
  @Roles('driver')
  @Post('orders/:id/complete')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'إتمام التوصيل' })
  async completeDelivery(
    @Param('id') orderId: string,
    @CurrentUser('id') driverId: string,
  ) {
    return this.driverService.completeDelivery(orderId, driverId);
  }

  @Auth(AuthType.JWT)
  @Roles('driver')
  @Get('orders/history')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'سجل الطلبات' })
  async getOrdersHistory(
    @CurrentUser('id') driverId: string,
    @Query() pagination: CursorPaginationDto,
  ) {
    return this.driverService.getOrdersHistory(driverId, pagination);
  }

  // ==================== Driver Issues ====================

  @Auth(AuthType.JWT)
  @Roles('driver')
  @Post('issues/report')
  @ApiBody({ schema: { type: 'object', properties: { type: { type: 'string' }, description: { type: 'string' }, orderId: { type: 'string' } } } })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'الإبلاغ عن مشكلة' })
  async reportIssue(
    @CurrentUser('id') driverId: string,
    @Body() body: { type: string; description: string; orderId?: string },
  ) {
    return this.driverService.reportIssue(driverId, body);
  }

  @Auth(AuthType.JWT)
  @Roles('driver')
  @Post('change-password')
  @ApiBody({ schema: { type: 'object', properties: { oldPassword: { type: 'string' }, newPassword: { type: 'string' } } } })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'تغيير كلمة المرور' })
  async changePassword(
    @CurrentUser('id') driverId: string,
    @Body() body: { oldPassword: string; newPassword: string },
  ) {
    return this.driverService.changePassword(
      driverId,
      body.oldPassword,
      body.newPassword,
    );
  }
}
