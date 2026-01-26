import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../../common/decorators/auth.decorator';

@ApiTags('Delivery - Categories')
@Controller({ path: 'delivery/categories', version: ['1', '2'] })
export class DeliveryCategoriesController {
  @Public()
  @Get()
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiOperation({ summary: 'جلب فئات التوصيل' })
  async getDeliveryCategories() {
    // TODO: Implement get delivery categories logic
    return {
      success: true,
      data: [
        { id: '1', name: 'مطاعم', icon: '🍽️' },
        { id: '2', name: 'سوبرماركت', icon: '🛒' },
        { id: '3', name: 'صيدليات', icon: '💊' },
        { id: '4', name: 'محلات', icon: '🏪' },
      ],
    };
  }
}

