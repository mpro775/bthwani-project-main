import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { UnifiedAuthGuard } from '../../common/guards/unified-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Auth, Roles } from '../../common/decorators/auth.decorator';
import { AuthType } from '../../common/guards/unified-auth.guard';

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(UnifiedAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  // ==================== ROAS ====================

  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @Get('roas/daily')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'ROAS اليومي' })
  async getDailyRoas(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('platform') platform?: string,
  ) {
    return this.analyticsService.getDailyRoas(startDate, endDate, platform);
  }

  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @Get('roas/summary')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'ملخص ROAS' })
  async getRoasSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getRoasSummary(startDate, endDate);
  }

  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @Get('roas/by-platform')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'ROAS حسب المنصة' })
  async getRoasByPlatform(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getRoasByPlatform(startDate, endDate);
  }

  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @Post('roas/calculate')
  @ApiBody({ schema: { type: 'object', properties: { date: { type: 'string', format: 'date' } } } })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'حساب ROAS' })
  async calculateRoas(@Body() body: { date: string }) {
    return this.analyticsService.calculateRoas(body.date);
  }

  // ==================== Ad Spend ====================

  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @Post('adspend')
  @ApiBody({ schema: { type: 'object', properties: { date: { type: 'string' }, platform: { type: 'string' }, amount: { type: 'number' }, campaign: { type: 'string' } } } })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'تسجيل إنفاق إعلاني' })
  async recordAdSpend(
    @Body()
    body: {
      date: string;
      platform: string;
      campaignName: string;
      amount: number;
      impressions?: number;
      clicks?: number;
      conversions?: number;
    },
  ) {
    return this.analyticsService.recordAdSpend(body);
  }

  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @Get('adspend')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'الإنفاق الإعلاني' })
  async getAdSpend(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('platform') platform?: string,
  ) {
    return this.analyticsService.getAdSpend(startDate, endDate, platform);
  }

  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @Get('adspend/summary')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'ملخص الإنفاق الإعلاني' })
  async getAdSpendSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getAdSpendSummary(startDate, endDate);
  }

  // ==================== KPIs ====================

  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @Get('kpis')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'مؤشرات الأداء الرئيسية' })
  async getKPIs(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getKPIs(startDate, endDate);
  }

  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @Get('kpis/real-time')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'مؤشرات الأداء الحية' })
  async getRealTimeKPIs() {
    return this.analyticsService.getRealTimeKPIs();
  }

  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @Get('kpis/trends')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'اتجاهات الأداء' })
  async getKPITrends(
    @Query('metric') metric: string,
    @Query('period') period: 'daily' | 'weekly' | 'monthly',
  ) {
    return this.analyticsService.getKPITrends(metric, period);
  }

  // ==================== Marketing Events ====================

  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @Post('events/track')
  @ApiBody({ schema: { type: 'object', properties: { eventType: { type: 'string' }, eventData: { type: 'object' }, userId: { type: 'string' } } } })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'تتبع حدث تسويقي' })
  async trackEvent(
    @Body()
    body: {
      eventType: string;
      userId?: string;
      source?: string;
      medium?: string;
      campaign?: string;
      metadata?: any;
    },
  ) {
    return this.analyticsService.trackEvent(body);
  }

  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @Get('events')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'الأحداث التسويقية' })
  async getEvents(
    @Query('eventType') eventType?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getEvents(eventType, startDate, endDate);
  }

  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @Get('events/summary')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'ملخص الأحداث' })
  async getEventsSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getEventsSummary(startDate, endDate);
  }

  // ==================== Conversion Funnel ====================

  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @Get('funnel/conversion')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'قمع التحويل' })
  async getConversionFunnel(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getConversionFunnel(startDate, endDate);
  }

  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @Get('funnel/drop-off')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'نقاط الانسحاب' })
  async getDropOffPoints() {
    return this.analyticsService.getDropOffPoints();
  }

  // ==================== User Analytics ====================

  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @Get('users/growth')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'نمو المستخدمين' })
  async getUserGrowth(@Query('period') period: 'daily' | 'weekly' | 'monthly') {
    return this.analyticsService.getUserGrowth(period);
  }

  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @Get('users/retention')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'معدل الاحتفاظ' })
  async getUserRetention() {
    return this.analyticsService.getUserRetention();
  }

  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @Get('users/cohort')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'تحليل الأفواج' })
  async getCohortAnalysis(@Query('cohortDate') cohortDate: string) {
    return this.analyticsService.getCohortAnalysis(cohortDate);
  }

  // ==================== Revenue Analytics ====================

  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @Get('revenue/forecast')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'توقعات الإيرادات' })
  async getRevenueForecast() {
    return this.analyticsService.getRevenueForecast();
  }

  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @Get('revenue/breakdown')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'تفصيل الإيرادات' })
  async getRevenueBreakdown(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getRevenueBreakdown(startDate, endDate);
  }

  // ==================== Advanced Analytics ====================

  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @Get('advanced/dashboard-overview')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'نظرة عامة متقدمة' })
  async getDashboardOverview(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getDashboardOverview(startDate, endDate);
  }

  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @Get('advanced/cohort-analysis-advanced')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'تحليل المجموعات المتقدم' })
  async getCohortAnalysisAdvanced(@Query('type') type: string = 'monthly') {
    return this.analyticsService.getCohortAnalysisAdvanced(type);
  }

  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @Get('advanced/funnel-analysis')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'تحليل القمع' })
  async getFunnelAnalysis(@Query('funnelType') funnelType: string) {
    return this.analyticsService.getFunnelAnalysis(funnelType);
  }

  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @Get('advanced/retention')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'معدل الاحتفاظ' })
  async getRetentionRate(@Query('period') period: string = 'monthly') {
    return this.analyticsService.getRetentionRate(period);
  }

  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @Get('advanced/ltv')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'القيمة الدائمة للعميل' })
  async getCustomerLTV() {
    return this.analyticsService.getCustomerLTV();
  }

  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @Get('advanced/churn-rate')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'معدل التراجع' })
  async getChurnRate(@Query('period') period: string = 'monthly') {
    return this.analyticsService.getChurnRate(period);
  }

  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @Get('advanced/geographic-distribution')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'التوزيع الجغرافي' })
  async getGeographicDistribution(@Query('metric') metric: string = 'orders') {
    return this.analyticsService.getGeographicDistribution(metric);
  }

  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @Get('advanced/peak-hours')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'ساعات الذروة' })
  async getPeakHours() {
    return this.analyticsService.getPeakHours();
  }

  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @Get('advanced/product-performance')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'أداء المنتجات' })
  async getProductPerformance(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getProductPerformance(startDate, endDate);
  }

  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @Get('advanced/driver-performance')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'أداء السائقين' })
  async getDriverPerformance(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getDriverPerformance(startDate, endDate);
  }
}
