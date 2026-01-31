import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Public } from '../../common/decorators/auth.decorator';
import { PromotionService } from './services/promotion.service';

@ApiTags('Promotions')
@Controller({ path: 'delivery/promotions', version: '1' })
export class PromotionsByStoresController {
  constructor(private readonly promotionService: PromotionService) {}

  @Public()
  @Get('by-stores')
  @ApiQuery({ name: 'ids', required: true, description: 'معرّفات المتاجر مفصولة بفاصلة' })
  @ApiQuery({ name: 'channel', required: false, type: String, enum: ['app', 'web'] })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiOperation({ summary: 'جلب العروض حسب المتاجر' })
  async getPromotionsByStores(
    @Query('ids') ids: string,
    @Query('channel') channel?: string,
  ) {
    const storeIds = ids
      ? ids.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
    const promotions = await this.promotionService.getByStores(
      storeIds,
      channel || 'app',
    );
    return { data: promotions };
  }
}

