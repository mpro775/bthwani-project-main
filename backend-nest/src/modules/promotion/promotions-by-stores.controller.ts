import {
  Controller,
  Get,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../../common/decorators/auth.decorator';

@ApiTags('Promotions')
@Controller({ path: 'delivery/promotions', version: ['1', '2'] })
export class PromotionsByStoresController {
  @Public()
  @Get('by-stores')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiOperation({ summary: 'جلب العروض حسب المتاجر' })
  async getPromotionsByStores() {
    // TODO: Implement get promotions by stores logic
    return {
      success: true,
      data: [],
      message: 'لا توجد عروض متاحة حالياً',
    };
  }
}

