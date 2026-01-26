import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DailySettlementService } from '../../common/services/daily-settlement.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UnifiedAuthGuard } from '../../common/guards';
import { SettlementRecord } from '../../common/entities/settlement.entity';
import { Roles } from '../../common/decorators/auth.decorator';

@ApiTags('التسوية والتقارير المالية')
@ApiBearerAuth()
@Controller('finance/settlement')
@UseGuards(UnifiedAuthGuard, RolesGuard)
export class SettlementController {
  constructor(private readonly settlementService: DailySettlementService) {}

  @Post('trigger')
  @Roles('admin', 'finance')
  @ApiOperation({ summary: 'تشغيل التسوية اليومية يدوياً', description: 'تشغيل عملية التسوية اليومية لتاريخ محدد أو اليوم الحالي' })
  @ApiQuery({ name: 'date', required: false, description: 'التاريخ بتنسيق YYYY-MM-DD (اختياري، الافتراضي: اليوم)', example: '2024-01-15' })
  @ApiResponse({ status: 200, description: 'تم تشغيل التسوية بنجاح' })
  @ApiResponse({ status: 400, description: 'بيانات غير صحيحة' })
  @ApiResponse({ status: 403, description: 'غير مصرح لك' })
  async triggerSettlement(@Query('date') date?: string) {
    return this.settlementService.triggerManualSettlement(date);
  }

  @Post('retry/:date')
  @Roles('admin', 'finance')
  @ApiOperation({ summary: 'إعادة محاولة تسوية فاشلة', description: 'إعادة تشغيل التسوية ليوم فاشل' })
  @ApiParam({ name: 'date', description: 'التاريخ بتنسيق YYYY-MM-DD', example: '2024-01-15' })
  @ApiResponse({ status: 200, description: 'تم إعادة تشغيل التسوية بنجاح' })
  @ApiResponse({ status: 404, description: 'لم يتم العثور على تسوية فاشلة لهذا التاريخ' })
  @ApiResponse({ status: 403, description: 'غير مصرح لك' })
  async retrySettlement(@Param('date') date: string) {
    return this.settlementService.retryFailedSettlement(date);
  }

  @Get('history')
  @Roles('admin', 'finance')
  @ApiOperation({ summary: 'سجل التسويات', description: 'الحصول على سجل التسويات اليومية' })
  @ApiQuery({ name: 'limit', description: 'عدد السجلات المطلوبة (الافتراضي: 30)', example: 30 })
  @ApiResponse({ status: 200, description: 'تم استرجاع سجل التسويات بنجاح' })
  @ApiResponse({ status: 403, description: 'غير مصرح لك' })
  async getSettlementHistory(@Query('limit') limit?: number): Promise<SettlementRecord[]> {
    const limitNum = limit ? parseInt(limit.toString(), 10) : 30;
    return this.settlementService.getSettlementHistory(limitNum);
  }

  @Get(':date')
  @Roles('admin', 'finance')
  @ApiOperation({ summary: 'تفاصيل تسوية يوم محدد', description: 'الحصول على تفاصيل تسوية يوم محدد' })
  @ApiParam({ name: 'date', description: 'التاريخ بتنسيق YYYY-MM-DD', example: '2024-01-15' })
  @ApiResponse({ status: 200, description: 'تم استرجاع تفاصيل التسوية بنجاح' })
  @ApiResponse({ status: 404, description: 'لم يتم العثور على تسوية لهذا التاريخ' })
  @ApiResponse({ status: 403, description: 'غير مصرح لك' })
  async getSettlementByDate(@Param('date') date: string): Promise<SettlementRecord>  {
    const settlement = await this.settlementService.getSettlementByDate(date);
    if (!settlement) {
      throw new Error(`No settlement found for date: ${date}`);
    }
    return settlement;
  }

  @Get('stats/summary')
  @Roles('admin', 'finance')
  @ApiOperation({ summary: 'ملخص إحصائيات التسويات', description: 'ملخص إحصائيات التسويات للفترة الأخيرة' })
  @ApiResponse({ status: 200, description: 'تم استرجاع الملخص الإحصائي بنجاح' })
  @ApiResponse({ status: 403, description: 'غير مصرح لك' })
  async getSettlementStats() {
    const history = await this.settlementService.getSettlementHistory(30);

    const stats = {
      totalSettlements: history.length,
      successfulSettlements: history.filter(s => s.status === 'completed').length,
      failedSettlements: history.filter(s => s.status === 'failed').length,
      totalVolume: history.reduce((sum, s) => sum + (s.totalVolume || 0), 0),
      totalNetAmount: history.reduce((sum, s) => sum + (s.netAmount || 0), 0),
      averageTransactionsPerDay: history.length > 0
        ? history.reduce((sum, s) => sum + (s.totalTransactions || 0), 0) / history.length
        : 0,
      lastSettlementDate: history[0]?.date || null,
    };

    return stats;
  }
}
