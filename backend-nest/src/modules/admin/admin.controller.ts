import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Put,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { UnifiedAuthGuard } from '../../common/guards/unified-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import {
  Auth,
  Roles,
  CurrentUser,
} from '../../common/decorators/auth.decorator';
import { AuthType } from '../../common/guards/unified-auth.guard';
import {
  ExportReportResponseDto,
  GetRolesResponseDto,
  CreateRoleResponseDto,
  UpdateRoleResponseDto,
  GetRoleByIdResponseDto,
  CreateRoleDto,
  UpdateRoleDto
} from './dto';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(UnifiedAuthGuard, RolesGuard)
@Auth(AuthType.JWT)
@Roles('admin', 'superadmin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ==================== Dashboard ====================

  @Get('dashboard')
  @ApiOperation({ summary: 'لوحة التحكم - الإحصائيات العامة' })
  async getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('stats/today')
  @ApiOperation({ summary: 'إحصائيات اليوم' })
  async getTodayStats() {
    return this.adminService.getTodayStats();
  }

  @Get('stats/financial')
  @ApiOperation({ summary: 'الإحصائيات المالية' })
  async getFinancialStats() {
    return this.adminService.getFinancialStats();
  }

  @Get('dashboard/orders-by-status')
  @ApiOperation({ summary: 'الطلبات حسب الحالة' })
  async getOrdersByStatus(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.adminService.getOrdersByStatus({ startDate, endDate });
  }

  @Get('dashboard/revenue')
  @ApiOperation({ summary: 'تحليلات الإيرادات' })
  async getRevenueAnalytics(
    @Query('period') period: 'daily' | 'weekly' | 'monthly' = 'daily',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.adminService.getRevenueAnalytics({
      period,
      startDate,
      endDate,
    });
  }

  @Get('dashboard/live-metrics')
  @ApiOperation({ summary: 'المقاييس الحية' })
  async getLiveMetrics() {
    return this.adminService.getLiveMetrics();
  }

  @Get('dashboard/summary')
  @ApiOperation({ summary: 'ملخص لوحة التحكم - إحصائيات أساسية' })
  async getDashboardSummary(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('tz') tz: string = 'Asia/Aden'
  ) {
    return this.adminService.getDashboardSummary({ from, to, tz });
  }

  @Get('dashboard/timeseries')
  @ApiOperation({ summary: 'البيانات الزمنية للتحليلات' })
  async getDashboardTimeseries(
    @Query('metric') metric: 'orders' | 'gmv' | 'revenue',
    @Query('interval') interval: 'day' | 'hour' = 'day',
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('tz') tz: string = 'Asia/Aden'
  ) {
    return this.adminService.getDashboardTimeseries({ metric, interval, from, to, tz });
  }

  @Get('dashboard/top')
  @ApiOperation({ summary: 'أعلى الأداء حسب المعايير' })
  async getDashboardTop(
    @Query('by') by: 'stores' | 'cities' | 'categories',
    @Query('limit') limit: number = 10,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('tz') tz: string = 'Asia/Aden'
  ) {
    return this.adminService.getDashboardTop({ by, limit, from, to, tz });
  }

  @Get('dashboard/alerts')
  @ApiOperation({ summary: 'التنبيهات والإشعارات المهمة' })
  async getDashboardAlerts() {
    return this.adminService.getDashboardAlerts();
  }

  // ==================== Drivers Management ====================

  @Get('drivers')
  @ApiOperation({ summary: 'جلب كل السائقين' })
  async getAllDrivers(
    @Query('status') status?: string,
    @Query('isAvailable') isAvailable?: boolean,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.adminService.getAllDrivers({
      status,
      isAvailable,
      page,
      limit,
    });
  }

  @Get('drivers/:id')
  @ApiOperation({ summary: 'تفاصيل سائق محدد' })
  async getDriverDetails(@Param('id') driverId: string) {
    return this.adminService.getDriverDetails(driverId);
  }

  @Get('drivers/:id/performance')
  @ApiOperation({ summary: 'أداء السائق' })
  async getDriverPerformance(
    @Param('id') driverId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<any> {
    return this.adminService.getDriverPerformance(driverId, {
      startDate,
      endDate,
    });
  }

  @Delete('drivers/:id')
  @ApiParam({ name: 'id', type: String })
  @ApiOperation({ summary: 'حذف سائق' })
  @ApiResponse({ status: 200, description: 'Deleted' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteDriver(@Param('id') driverId: string) {
    return this.adminService.deleteDriver(driverId);
  }

  @Get('drivers/:id/financials')
  @ApiOperation({ summary: 'مالية السائق' })
  async getDriverFinancials(@Param('id') driverId: string) {
    return this.adminService.getDriverFinancials(driverId);
  }

  @Post('drivers/:id/ban')
  @ApiOperation({ summary: 'حظر سائق' })
  async banDriver(
    @Param('id') driverId: string,
    @Body() body: { reason: string },
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminService.banDriver({
      driverId,
      reason: body.reason,
      adminId,
    });
  }

  @Post('drivers/:id/unban')
  @ApiOperation({ summary: 'إلغاء حظر سائق' })
  async unbanDriver(
    @Param('id') driverId: string,
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminService.unbanDriver(driverId, adminId);
  }

  @Patch('drivers/:id/adjust-balance')
  @ApiOperation({ summary: 'تعديل رصيد السائق' })
  async adjustDriverBalance(
    @Param('id') driverId: string,
    @Body() body: { amount: number; reason: string; type: 'credit' | 'debit' },
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminService.adjustDriverBalance({
      driverId,
      amount: body.amount,
      type: body.type,
      reason: body.reason,
      adminId,
    });
  }

  // ==================== Withdrawals Management ====================

  // ✅ تم نقل إلى /wallet/admin/withdrawals

  // ✅ تم نقل إلى /wallet/admin/withdrawals/pending

  // ✅ تم نقل إلى /wallet/admin/withdrawals/:id/approve

  // ✅ تم نقل إلى /wallet/admin/withdrawals/:id/reject

  // ==================== Store Moderation ====================

  // ==================== Vendor Moderation ====================

  @Get('vendors/pending')
  @ApiOperation({ summary: 'التجار المعلقين' })
  async getPendingVendors() {
    return this.adminService.getPendingVendors();
  }

  @Post('vendors/:id/approve')
  @ApiOperation({ summary: 'الموافقة على تاجر' })
  async approveVendor(
    @Param('id') vendorId: string,
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminService.approveVendor(vendorId, adminId);
  }

  @Post('vendors/:id/reject')
  @ApiOperation({ summary: 'رفض تاجر' })
  async rejectVendor(
    @Param('id') vendorId: string,
    @Body() body: { reason: string },
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminService.rejectVendor(vendorId, body.reason, adminId);
  }

  @Post('vendors/:id/suspend')
  @ApiOperation({ summary: 'تعليق تاجر' })
  async suspendVendor(
    @Param('id') vendorId: string,
    @Body() body: { reason: string },
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminService.suspendVendor(vendorId, body.reason, adminId);
  }

  // ==================== Users Management ====================

  @Get('users')
  @ApiOperation({ summary: 'جلب المستخدمين' })
  async getUsers(
    @Query('search') search?: string,
    @Query('isActive') isActive?: boolean,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.adminService.getUsers({
      search,
      isActive,
      page,
      limit,
    });
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'تفاصيل مستخدم' })
  async getUserDetails(@Param('id') userId: string) {
    return this.adminService.getUserDetails(userId);
  }

  @Post('users/:id/ban')
  @ApiOperation({ summary: 'حظر مستخدم' })
  async banUser(
    @Param('id') userId: string,
    @Body() body: { reason: string },
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminService.banUser({
      userId,
      reason: body.reason,
      adminId,
    });
  }

  @Post('users/:id/unban')
  @ApiOperation({ summary: 'إلغاء حظر مستخدم' })
  async unbanUser(
    @Param('id') userId: string,
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminService.unbanUser(userId, adminId);
  }

  // ==================== Reports ====================

  @Get('reports/daily')
  @ApiOperation({ summary: 'تقرير يومي' })
  async getDailyReport(@Query('date') date?: string) {
    return this.adminService.getDailyReport({ date });
  }

  @Post('reports/export/:type/:format')
  @ApiOperation({ summary: 'تصدير تقارير' })
  @ApiResponse({ 
    status: 200, 
    description: 'تصدير التقارير بصيغة Excel أو PDF',
    content: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {},
      'application/pdf': {}
    }
  })
  async exportReport(
    @Param('type') type: string,
    @Param('format') format: string,
    @Body() filters?: any,
  ): Promise<ExportReportResponseDto> {
    return this.adminService.exportReport(type, format, filters);
  }

  // TODO: Implement getWeeklyReport
  // TODO: Implement getMonthlyReport

  // ==================== Notifications ====================
  // ✅ تم نقل الإشعارات إلى NotificationController - استخدم /notifications

  // ==================== Driver Assets ====================
  // TODO: Implement Driver Assets Management

  // ==================== Driver Documents ====================
  // ✅ تم دمج إدارة المستندات في DriverController - استخدم /drivers/documents

  // ==================== Driver Attendance ====================

  @Get('drivers/:id/attendance')
  @ApiOperation({ summary: 'سجل حضور السائق' })
  async getDriverAttendance(
    @Param('id') driverId: string,
    @Query('month') month?: number,
    @Query('year') year?: number,
  ) {
    return this.adminService.getDriverAttendance(driverId, { month, year });
  }

  @Get('drivers/attendance/summary')
  @ApiOperation({ summary: 'ملخص الحضور لكل السائقين' })
  async getAttendanceSummary(@Query('date') date?: string) {
    return this.adminService.getAttendanceSummary(date);
  }

  @Post('drivers/:id/attendance/adjust')
  @ApiOperation({ summary: 'تعديل حضور السائق' })
  async adjustAttendance(
    @Param('id') driverId: string,
    @Body()
    body: {
      date: string;
      checkIn?: string;
      checkOut?: string;
      reason: string;
    },
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminService.adjustAttendance({
      driverId,
      data: body,
      adminId,
    });
  }

  // ==================== Driver Shifts ====================
  // ✅ تم نقل إدارة الورديات إلى ShiftController - استخدم /shifts

  @Delete('drivers/shifts/:id')
  @ApiParam({ name: 'id', type: String })
  @ApiOperation({ summary: 'حذف وردية' })
  @ApiResponse({ status: 200, description: 'Deleted' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteShift(@Param('id') shiftId: string) {
    return this.adminService.deleteShift(shiftId);
  }

  // ==================== Driver Assets ====================

  @Delete('drivers/assets/:id')
  @ApiParam({ name: 'id', type: String })
  @ApiOperation({ summary: 'حذف أصل سائق' })
  @ApiResponse({ status: 200, description: 'Deleted' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteDriverAsset(@Param('id') assetId: string) {
    return this.adminService.deleteDriverAsset(assetId);
  }

  // ==================== Driver Leave & Vacations ====================

  @Get('drivers/leave-requests')
  @ApiOperation({ summary: 'طلبات الإجازات' })
  async getLeaveRequests(
    @Query('status') status?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.adminService.getLeaveRequests(status, page, limit);
  }

  @Patch('drivers/leave-requests/:id/approve')
  @ApiOperation({ summary: 'الموافقة على طلب إجازة' })
  async approveLeaveRequest(
    @Param('id') requestId: string,
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminService.approveLeaveRequest(requestId, adminId);
  }

  @Patch('drivers/leave-requests/:id/reject')
  @ApiOperation({ summary: 'رفض طلب إجازة' })
  async rejectLeaveRequest(
    @Param('id') requestId: string,
    @Body() body: { reason: string },
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminService.rejectLeaveRequest(
      requestId,
      body.reason,
      adminId,
    );
  }

  @Delete('drivers/leave-requests/:id')
  @ApiParam({ name: 'id', type: String })
  @ApiOperation({ summary: 'حذف طلب إجازة' })
  @ApiResponse({ status: 200, description: 'Deleted' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteLeaveRequest(@Param('id') requestId: string) {
    return this.adminService.deleteLeaveRequest(requestId);
  }

  @Get('drivers/:id/leave-balance')
  @ApiOperation({ summary: 'رصيد إجازات السائق' })
  async getDriverLeaveBalance(@Param('id') driverId: string) {
    return this.adminService.getDriverLeaveBalance(driverId);
  }

  @Patch('drivers/:id/leave-balance/adjust')
  @ApiOperation({ summary: 'تعديل رصيد الإجازات' })
  async adjustLeaveBalance(
    @Param('id') driverId: string,
    @Body() body: { days: number; type: 'add' | 'deduct' },
  ) {
    return this.adminService.adjustLeaveBalance(driverId, body.days, body.type);
  }

  // ==================== Quality & Reviews ====================
  // TODO: Implement Quality & Reviews Management

  @Get('quality/metrics')
  @ApiOperation({ summary: 'مقاييس الجودة' })
  async getQualityMetrics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.adminService.getQualityMetrics(startDate, endDate);
  }

  // ==================== Support Tickets ====================
  // ✅ تم نقل تذاكر الدعم إلى SupportController - استخدم /support/tickets

  // ==================== Settings ====================

  @Get('settings')
  @ApiOperation({ summary: 'إعدادات النظام' })
  async getSettings() {
    return this.adminService.getSettings();
  }

  @Patch('settings')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        maintenanceMode: { type: 'boolean' },
        allowRegistration: { type: 'boolean' },
        minAppVersion: { type: 'string' },
        maxOrderRadius: { type: 'number' },
      },
    },
  })
  @ApiOperation({ summary: 'تحديث الإعدادات' })
  async updateSettings(@Body() body: any, @CurrentUser('id') adminId: string) {
    return this.adminService.updateSettings(body, adminId);
  }

  @Get('settings/feature-flags')
  @ApiOperation({ summary: 'أعلام الميزات' })
  async getFeatureFlags() {
    return this.adminService.getFeatureFlags();
  }

  @Patch('settings/feature-flags/:flag')
  @ApiOperation({ summary: 'تحديث علم ميزة' })
  async updateFeatureFlag(
    @Param('flag') flag: string,
    @Body() body: { enabled: boolean },
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminService.updateFeatureFlag(flag, body.enabled, adminId);
  }

  // ==================== Backup System ====================

  @Post('backup/create')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        collections: { type: 'array', items: { type: 'string' } },
        description: { type: 'string', example: 'نسخة احتياطية يومية' },
      },
    },
  })
  @ApiOperation({ summary: 'إنشاء نسخة احتياطية' })
  async createBackup(
    @Body() body: { collections?: string[]; description?: string },
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminService.createBackup(
      body.collections,
      body.description,
      adminId,
    );
  }

  @Get('backup/list')
  @ApiOperation({ summary: 'قائمة النسخ الاحتياطية' })
  async listBackups(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.adminService.listBackups(page, limit);
  }

  @Post('backup/:id/restore')
  @ApiOperation({ summary: 'استعادة نسخة احتياطية' })
  async restoreBackup(
    @Param('id') backupId: string,
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminService.restoreBackup(backupId, adminId);
  }

  @Get('backup/:id/download')
  @ApiOperation({ summary: 'تحميل نسخة احتياطية' })
  async downloadBackup(@Param('id') backupId: string) {
    return this.adminService.downloadBackup(backupId);
  }

  // ==================== Data Deletion ====================

  @Get('data-deletion/requests')
  @ApiOperation({ summary: 'طلبات حذف البيانات' })
  async getDataDeletionRequests(@Query('status') status?: string) {
    return this.adminService.getDataDeletionRequests(status);
  }

  @Patch('data-deletion/:id/approve')
  @ApiOperation({ summary: 'الموافقة على حذف البيانات' })
  async approveDataDeletion(
    @Param('id') requestId: string,
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminService.approveDataDeletion(requestId, adminId);
  }

  @Patch('data-deletion/:id/reject')
  @ApiOperation({ summary: 'رفض حذف البيانات' })
  async rejectDataDeletion(
    @Param('id') requestId: string,
    @Body() body: { reason: string },
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminService.rejectDataDeletion(
      requestId,
      body.reason,
      adminId,
    );
  }

  // ==================== Password Security ====================

  @Get('security/password-attempts')
  @ApiOperation({ summary: 'محاولات كلمات المرور الفاشلة' })
  async getFailedPasswordAttempts(@Query('threshold') threshold: number = 5) {
    return this.adminService.getFailedPasswordAttempts(threshold);
  }

  @Post('security/reset-password/:userId')
  @ApiOperation({ summary: 'إعادة تعيين كلمة مرور مستخدم' })
  async resetUserPassword(
    @Param('userId') userId: string,
    @Body() body: { tempPassword?: string },
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminService.resetUserPassword({
      userId,
      tempPassword: body.tempPassword,
      adminId,
    });
  }

  @Post('security/unlock-account/:userId')
  @ApiOperation({ summary: 'فتح حساب مقفل' })
  async unlockAccount(
    @Param('userId') userId: string,
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminService.unlockAccount({ userId, adminId });
  }

  // ==================== Activation Codes ====================
  // TODO: Implement Activation Codes Management

  // ==================== Marketer Management ====================

  @Get('marketers')
  @ApiOperation({ summary: 'جلب المسوقين الميدانيين' })
  async getAllMarketers(
    @Query('status') status?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.adminService.getAllMarketers({ status, page, limit });
  }

  @Get('marketers/:id')
  @ApiOperation({ summary: 'تفاصيل مسوق' })
  async getMarketerDetails(@Param('id') marketerId: string) {
    return this.adminService.getMarketerDetails(marketerId);
  }

  @Post('marketers')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['fullName', 'phone'],
      properties: {
        fullName: { type: 'string', example: 'أحمد محمد' },
        phone: { type: 'string', example: '+966501234567' },
        email: { type: 'string', example: 'marketer@bthwani.com' },
        territory: { type: 'string', example: 'الرياض' },
      },
    },
  })
  @ApiOperation({ summary: 'إضافة مسوق جديد' })
  async createMarketer(
    @Body()
    body: {
      fullName: string;
      phone: string;
      email?: string;
      territory?: string;
    },
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminService.createMarketer(
      {
        name: body.fullName,
        email: body.email || '',
        phone: body.phone,
      },
      adminId,
    );
  }

  @Patch('marketers/:id')
  @ApiOperation({ summary: 'تحديث مسوق' })
  async updateMarketer(
    @Param('id') marketerId: string,
    @Body() body: any,
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminService.updateMarketer({
      marketerId,
      updates: body as unknown,
      adminId,
    });
  }

  @Get('marketers/:id/performance')
  @ApiOperation({ summary: 'أداء المسوق' })
  async getMarketerPerformance(
    @Param('id') marketerId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.adminService.getMarketerPerformance(marketerId, {
      startDate,
      endDate,
    });
  }

  @Get('marketers/:id/stores')
  @ApiOperation({ summary: 'متاجر المسوق' })
  async getMarketerStores(@Param('id') marketerId: string) {
    return this.adminService.getMarketerStores(marketerId);
  }

  // ✅ تم نقل إدارة العمولات إلى FinanceController - استخدم /finance/commissions

  @Post('marketers/:id/activate')
  @ApiOperation({ summary: 'تفعيل مسوق' })
  async activateMarketer(
    @Param('id') marketerId: string,
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminService.activateMarketer({ marketerId, adminId });
  }

  @Post('marketers/:id/deactivate')
  @ApiOperation({ summary: 'تعطيل مسوق' })
  async deactivateMarketer(
    @Param('id') marketerId: string,
    @Body() body: { reason: string },
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminService.deactivateMarketer({
      marketerId,
      reason: body.reason,
      adminId,
    });
  }

  @Get('marketers/statistics')
  @ApiOperation({ summary: 'إحصائيات المسوقين' })
  async getMarketersStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.adminService.getMarketersStatistics({ startDate, endDate });
  }

  @Get('marketers/export')
  @ApiOperation({ summary: 'تصدير المسوقين' })
  async exportMarketers() {
    return await this.adminService.exportMarketers();
  }

  // ==================== Onboarding Management ====================
  // ✅ تم نقل إدارة الانضمام إلى OnboardingController - استخدم /onboarding

  // ==================== Commission Plans ====================
  // ✅ تم نقل خطط العمولات إلى FinanceController - استخدم /finance/commission-plans

  // ==================== Admin Users Management ====================
  // TODO: Implement Admin Users Management

  // ==================== Audit Logs ====================

  @Get('audit-logs')
  @ApiOperation({ summary: 'سجلات المراجعة' })
  async getAuditLogs(
    @Query('action') action?: string,
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.adminService.getAuditLogs(action, userId, startDate, endDate);
  }

  @Get('audit-logs/:id')
  @ApiOperation({ summary: 'تفاصيل سجل مراجعة' })
  async getAuditLogDetails(@Param('id') logId: string) {
    return this.adminService.getAuditLogDetails(logId);
  }

  // ==================== System Health ====================

  @Get('system/health')
  @ApiOperation({ summary: 'صحة النظام' })
  getSystemHealth() {
    return this.adminService.getSystemHealth();
  }

  @Get('system/metrics')
  @ApiOperation({ summary: 'مقاييس النظام' })
  getSystemMetrics() {
    return this.adminService.getSystemMetrics();
  }

  // TODO: Implement getSystemErrors

  // ==================== Database Management ====================

  @Get('database/stats')
  @ApiOperation({ summary: 'إحصائيات قاعدة البيانات' })
  async getDatabaseStats() {
    return this.adminService.getDatabaseStats();
  }

  // TODO: Implement cleanupDatabase

  // ==================== Payments Management ====================
  // TODO: Implement Payments Management

  // ==================== Promotions Management ====================
  // TODO: Implement Promotions Management

  // ==================== Coupons Management ====================
  // TODO: Implement Coupons Management

  // ==================== Notifications Management ====================
  // TODO: Implement Notifications Management

  // ==================== Orders Advanced ====================

  @Get('orders/stats/by-city')
  @ApiOperation({ summary: 'الطلبات حسب المدينة' })
  async getOrdersByCity(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.adminService.getOrdersByCity(startDate, endDate);
  }

  @Get('orders/stats/by-payment-method')
  @ApiOperation({ summary: 'الطلبات حسب طريقة الدفع' })
  async getOrdersByPaymentMethod() {
    return this.adminService.getOrdersByPaymentMethod();
  }

  // TODO: Implement getDisputedOrders
  // TODO: Implement resolveDispute

  // ==================== Drivers Advanced ====================
  // TODO: Implement Advanced Driver Statistics

  @Get('drivers/stats/by-status')
  @ApiOperation({ summary: 'السائقين حسب الحالة' })
  async getDriversByStatus() {
    return this.adminService.getDriversByStatus();
  }

  // ==================== Stores Advanced ====================
  // TODO: Implement Stores Advanced Features

  // ==================== Vendors Advanced ====================
  // TODO: Implement Vendors Advanced Features

  // ==================== Users Advanced ====================

  @Get('users/:id/orders-history')
  @ApiOperation({ summary: 'سجل طلبات المستخدم' })
  async getUserOrdersHistory(@Param('id') userId: string) {
    return this.adminService.getUserOrdersHistory(userId);
  }

  // TODO: Implement getUserWalletHistory
  // TODO: Implement adjustUserWallet

  // ==================== Reports Advanced ====================
  // TODO: Implement Advanced Reports

  // ==================== Analytics Dashboard ====================
  // TODO: Implement Analytics Dashboard

  // ==================== Content Management ====================
  // TODO: Implement Content Management System

  // ==================== Emergency Actions ====================
  // TODO: Implement Emergency Actions (System Pause/Resume)

  // ==================== Export & Import ====================
  // TODO: Implement Export & Import Data

  // ==================== Cache Management ====================

  @Post('cache/clear')
  @ApiOperation({ summary: 'مسح الكاش' })
  clearCache() {
    return this.adminService.clearCache();
  }

  @Get('cache/stats')
  @ApiOperation({ summary: 'إحصائيات الكاش' })
  getCacheStats() {
    return this.adminService.getCacheStats();
  }

  // ==================== Permissions & Roles ====================

  @Get('roles')
  @ApiOperation({ summary: 'الأدوار' })
  async getRoles(): Promise<any> {
    return this.adminService.getRoles();
  }

  @Post('roles')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name', 'displayName'],
      properties: {
        name: { type: 'string', example: 'manager' },
        displayName: { type: 'string', example: 'مدير' },
        description: { type: 'string', example: 'دور المدير' },
        permissions: {
          type: 'object',
          example: { 'users.read': true, 'orders.manage': true }
        },
      },
    },
  })
  @ApiOperation({ summary: 'إنشاء دور' })
  async createRole(
    @Body() body: CreateRoleDto,
    @CurrentUser('id') adminId: string,
  ): Promise<any> {
    return this.adminService.createRole(body, adminId);
  }

  @Patch('roles/:id')
  @ApiOperation({ summary: 'تحديث دور' })
  async updateRole(
    @Param('id') roleId: string,
    @Body() updates: UpdateRoleDto,
    @CurrentUser('id') adminId: string,
  ): Promise<any> {
    return this.adminService.updateRole(roleId, updates, adminId);
  }

  @Get('roles/:id')
  @ApiOperation({ summary: 'جلب دور محدد' })
  async getRoleById(@Param('id') roleId: string): Promise<any> {
    return this.adminService.getRoleById(roleId);
  }

  @Delete('roles/:id')
  @ApiOperation({ summary: 'حذف دور' })
  async deleteRole(
    @Param('id') roleId: string,
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminService.deleteRole(roleId, adminId);
  }

  // ==================== Admin User Profile ====================

  @Get('me')
  @ApiOperation({ summary: 'بيانات المستخدم الإداري الحالي' })
  async getCurrentAdminUser(@CurrentUser() user: any) {
    return this.adminService.getCurrentAdminUser(user);
  }

  // ==================== Admin Users List ====================

  @Get('users/list')
  @ApiOperation({ summary: 'قائمة المستخدمين الإداريين' })
  async getAdminUsersList(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('search') search?: string,
  ) {
    return this.adminService.getAdminUsersList({ page, limit, search });
  }

  // ==================== Admin Modules/Roles ====================

  @Get('modules')
  @ApiOperation({ summary: 'الأدوار والصلاحيات' })
  async getModules() {
    return this.adminService.getModules();
  }

  @Get('list')
  @ApiOperation({ summary: 'قائمة المستخدمين الإداريين' })
  async getAdminsList(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.adminService.getAdminsList({ page, limit });
  }

  @Post('create')
  @ApiOperation({ summary: 'إنشاء مستخدم إداري جديد' })
  async createAdmin(
    @Body() body: { email: string; password: string; role: string; fullName: string },
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminService.createAdmin(body, adminId);
  }

  // ==================== Drivers Finance ====================

  @Get('drivers/finance')
  @ApiOperation({ summary: 'إحصائيات مالية السائقين' })
  async getDriversFinance(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.adminService.getDriversFinance({ startDate, endDate, page, limit });
  }

  @Post('drivers/finance/run')
  @ApiOperation({ summary: 'تشغيل حسابات المالية' })
  async runFinanceCalculations(
    @Body() body: { period: string; force?: boolean },
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminService.runFinanceCalculations(body, adminId);
  }

  // ==================== Drivers Attendance ====================

  @Get('drivers/attendance')
  @ApiOperation({ summary: 'حضور جميع السائقين' })
  async getAllDriversAttendance(
    @Query('date') date?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.adminService.getAllDriversAttendance({ date, page, limit });
  }

  // ==================== Vendors Management ====================

  @Get('vendors')
  @ApiOperation({ summary: 'قائمة التجار' })
  async getVendorsList(
    @Query('status') status?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.adminService.getVendorsList({ status, page, limit });
  }

  // ==================== Settings Appearance ====================

  @Get('settings/appearance')
  @ApiOperation({ summary: 'إعدادات المظهر' })
  async getAppearanceSettings() {
    return this.adminService.getAppearanceSettings();
  }

  @Put('settings/appearance')
  @ApiOperation({ summary: 'تحديث إعدادات المظهر' })
  async updateAppearanceSettings(
    @Body() body: any,
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminService.updateAppearanceSettings(body, adminId);
  }

  // ==================== Support Stats ====================

  @Get('support/stats')
  @ApiOperation({ summary: 'إحصائيات الدعم الفني' })
  async getSupportStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.adminService.getSupportStats({ startDate, endDate });
  }

  // ==================== Audit Logs Stats ====================

  @Get('audit-logs/stats')
  @ApiOperation({ summary: 'إحصائيات سجلات المراجعة' })
  async getAuditLogsStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.adminService.getAuditLogsStats({ startDate, endDate });
  }

  @Get('audit-logs/my-actions')
  @ApiOperation({ summary: 'إجراءاتي في سجلات المراجعة' })
  async getMyAuditActions(
    @Query('limit') limit: number = 10,
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminService.getMyAuditActions({ limit, adminId });
  }

  // ==================== Pending Activations ====================

  @Get('pending-activations')
  @ApiOperation({ summary: 'التفعيلات المعلقة' })
  async getPendingActivations(
    @Query('type') type?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.adminService.getPendingActivations({ type, page, limit });
  }

  // ==================== Drivers Documents ====================

  @Get('drivers/docs')
  @ApiOperation({ summary: 'وثائق السائقين' })
  async getDriversDocuments(
    @Query('status') status?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.adminService.getDriversDocuments({ status, page, limit });
  }

  // ==================== Drivers Payouts ====================

  @Get('drivers/payouts')
  @ApiOperation({ summary: 'دفعات السائقين' })
  async getDriversPayouts(
    @Query('status') status?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.adminService.getDriversPayouts({ status, page, limit });
  }

  // ==================== Drivers Shifts ====================

  @Get('drivers/shifts')
  @ApiOperation({ summary: 'ورديات السائقين' })
  async getDriversShifts(
    @Query('status') status?: string,
    @Query('date') date?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.adminService.getDriversShifts({ status, date, page, limit });
  }

  // ==================== Drivers Vacations ====================

  @Get('drivers/vacations/stats')
  @ApiOperation({ summary: 'إحصائيات إجازات السائقين' })
  async getDriversVacationsStats(
    @Query('year') year?: number,
  ) {
    return this.adminService.getDriversVacationsStats({ year });
  }

  // ==================== Wallet Coupons ====================

  @Get('wallet/coupons')
  @ApiOperation({ summary: 'كوبونات المحفظة' })
  async getWalletCoupons(
    @Query('status') status?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.adminService.getWalletCoupons({ status, page, limit });
  }

  // ==================== Ops Drivers Realtime ====================

  @Get('ops/drivers/realtime')
  @ApiOperation({ summary: 'سائقو العمليات في الوقت الفعلي' })
  async getOpsDriversRealtime(
    @Query('area') area?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.getOpsDriversRealtime({ area, status });
  }

  // ==================== Ops Heatmap ====================

  @Get('ops/heatmap')
  @ApiOperation({ summary: 'خريطة الحرارة للعمليات' })
  async getOpsHeatmap(
    @Query('hours') hours: number = 24,
    @Query('resolution') resolution: string = 'medium',
  ) {
    return this.adminService.getOpsHeatmap({ hours, resolution });
  }

  // ==================== Commission Plans ====================

  @Post('commission-plans')
  @ApiOperation({ summary: 'إنشاء خطة عمولة جديدة' })
  async createCommissionPlan(
    @Body() body: any,
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminService.createCommissionPlan(body, adminId);
  }
}
