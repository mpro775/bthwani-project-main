import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { MarketerService } from './marketer.service';
import { UnifiedAuthGuard } from '../../common/guards/unified-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Auth, CurrentUser } from '../../common/decorators/auth.decorator';
import { AuthType } from '../../common/guards/unified-auth.guard';

@ApiTags('Marketer')
@Controller('marketer')
@UseGuards(UnifiedAuthGuard, RolesGuard)
export class MarketerController {
  constructor(private readonly marketerService: MarketerService) {}

  // ==================== Marketer Profile ====================

  @Auth(AuthType.MARKETER_JWT)
  @ApiBearerAuth()
  @Get('profile')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'ملفي الشخصي' })
  async getProfile(@CurrentUser('id') marketerId: string) {
    return this.marketerService.getProfile(marketerId);
  }

  @Auth(AuthType.MARKETER_JWT)
  @ApiBearerAuth()
  @Patch('profile')
  @ApiBody({ schema: { type: 'object', properties: { name: { type: 'string' }, phone: { type: 'string' }, email: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'تحديث الملف الشخصي' })
  async updateProfile(
    @CurrentUser('id') marketerId: string,
    @Body() body: any,
  ) {
    return this.marketerService.updateProfile(marketerId, body);
  }

  // ==================== Onboarding ====================
  // ✅ تم نقل الانضمام إلى OnboardingController - استخدم /onboarding

  // ==================== Referrals ====================

  @Auth(AuthType.MARKETER_JWT)
  @ApiBearerAuth()
  @Post('referrals/generate-code')
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'إنشاء كود إحالة' })
  async generateReferralCode(@CurrentUser('id') marketerId: string) {
    return this.marketerService.generateReferralCode(marketerId);
  }

  @Auth(AuthType.MARKETER_JWT)
  @ApiBearerAuth()
  @Get('referrals/my')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'إحالاتي' })
  async getMyReferrals(@CurrentUser('id') marketerId: string) {
    return this.marketerService.getMyReferrals(marketerId);
  }

  @Auth(AuthType.MARKETER_JWT)
  @ApiBearerAuth()
  @Get('referrals/statistics')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'إحصائيات الإحالات' })
  async getReferralStatistics(@CurrentUser('id') marketerId: string) {
    return this.marketerService.getReferralStatistics(marketerId);
  }

  // ==================== Stores Management ====================

  @Auth(AuthType.MARKETER_JWT)
  @ApiBearerAuth()
  @Get('stores/my')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'متاجري' })
  async getMyStores(@CurrentUser('id') marketerId: string) {
    return this.marketerService.getMyStores(marketerId);
  }

  @Auth(AuthType.MARKETER_JWT)
  @ApiBearerAuth()
  @Get('stores/:id')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'تفاصيل متجر' })
  async getStoreDetails(@Param('id') storeId: string) {
    return this.marketerService.getStoreDetails(storeId);
  }

  @Auth(AuthType.MARKETER_JWT)
  @ApiBearerAuth()
  @Get('stores/:id/performance')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'أداء المتجر' })
  async getStorePerformance(
    @Param('id') storeId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.marketerService.getStorePerformance(
      storeId,
      startDate,
      endDate,
    );
  }

  // ==================== Vendors Management ====================

  @Auth(AuthType.MARKETER_JWT)
  @ApiBearerAuth()
  @Get('vendors/my')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'تجاري' })
  async getMyVendors(@CurrentUser('id') marketerId: string) {
    return this.marketerService.getMyVendors(marketerId);
  }

  @Auth(AuthType.MARKETER_JWT)
  @ApiBearerAuth()
  @Get('vendors/:id')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'تفاصيل تاجر' })
  async getVendorDetails(@Param('id') vendorId: string) {
    return this.marketerService.getVendorDetails(vendorId);
  }

  // ==================== Commissions ====================
  // ✅ تم نقل Commissions إلى FinanceController - استخدم /finance/commissions/my
  // السبب: Finance هو المكان المناسب لجميع العمليات المالية

  @Auth(AuthType.MARKETER_JWT)
  @ApiBearerAuth()
  @Get('commissions/statistics')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'إحصائيات العمولات' })
  async getCommissionStatistics(@CurrentUser('id') marketerId: string) {
    return this.marketerService.getCommissionStatistics(marketerId);
  }

  @Auth(AuthType.MARKETER_JWT)
  @ApiBearerAuth()
  @Get('commissions/pending')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'العمولات المعلقة' })
  async getPendingCommissions(@CurrentUser('id') marketerId: string) {
    return this.marketerService.getPendingCommissions(marketerId);
  }

  // ==================== Overview & Statistics ====================

  @Auth(AuthType.MARKETER_JWT)
  @ApiBearerAuth()
  @Get('overview')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'نظرة عامة' })
  async getOverview(@CurrentUser('id') marketerId: string) {
    return this.marketerService.getOverview(marketerId);
  }

  @Auth(AuthType.MARKETER_JWT)
  @ApiBearerAuth()
  @Get('statistics/today')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'إحصائيات اليوم' })
  async getTodayStatistics(@CurrentUser('id') marketerId: string) {
    return this.marketerService.getTodayStatistics(marketerId);
  }

  @Auth(AuthType.MARKETER_JWT)
  @ApiBearerAuth()
  @Get('statistics/month')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'إحصائيات الشهر' })
  async getMonthStatistics(@CurrentUser('id') marketerId: string) {
    return this.marketerService.getMonthStatistics(marketerId);
  }

  // ==================== Earnings ====================

  @Auth(AuthType.MARKETER_JWT)
  @ApiBearerAuth()
  @Get('earnings')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'أرباحي' })
  async getEarnings(
    @CurrentUser('id') marketerId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.marketerService.getEarnings(marketerId, startDate, endDate);
  }

  @Auth(AuthType.MARKETER_JWT)
  @ApiBearerAuth()
  @Get('earnings/breakdown')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'تفصيل الأرباح' })
  async getEarningsBreakdown(@CurrentUser('id') marketerId: string) {
    return this.marketerService.getEarningsBreakdown(marketerId);
  }

  // ==================== Documents & Files ====================

  @Auth(AuthType.MARKETER_JWT)
  @ApiBearerAuth()
  @Post('files/upload')
  @ApiBody({ schema: { type: 'object', properties: { fileUrl: { type: 'string' }, type: { type: 'string' }, relatedTo: { type: 'string' } } } })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'رفع ملف' })
  async uploadFile(
    @CurrentUser('id') marketerId: string,
    @Body() body: { fileUrl: string; type: string; relatedTo?: string },
  ) {
    return this.marketerService.uploadFile(marketerId, body);
  }

  @Auth(AuthType.MARKETER_JWT)
  @ApiBearerAuth()
  @Get('files')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'ملفاتي' })
  async getFiles(@CurrentUser('id') marketerId: string) {
    return this.marketerService.getFiles(marketerId);
  }

  // ==================== Notifications ====================

  @Auth(AuthType.MARKETER_JWT)
  @ApiBearerAuth()
  @Get('notifications')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'إشعاراتي' })
  async getNotifications(@CurrentUser('id') marketerId: string) {
    return this.marketerService.getNotifications(marketerId);
  }

  @Auth(AuthType.MARKETER_JWT)
  @ApiBearerAuth()
  @Patch('notifications/:id/read')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'تحديد إشعار كمقروء' })
  async markNotificationRead(@Param('id') notificationId: string) {
    return this.marketerService.markNotificationRead(notificationId);
  }

  // ==================== Territories ====================

  @Auth(AuthType.MARKETER_JWT)
  @ApiBearerAuth()
  @Get('territory/stats')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'إحصائيات المنطقة' })
  async getTerritoryStats(@CurrentUser('id') marketerId: string) {
    return this.marketerService.getTerritoryStats(marketerId);
  }
}
