import {
  Controller,
  Get,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../../common/decorators/auth.decorator';

@ApiTags('Groceries')
@Controller({ path: 'groceries', version: ['1', '2'] })
export class GroceriesController {
  @Public()
  @Get('catalog')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiOperation({ summary: 'جلب كتالوج البقالة' })
  async getGroceriesCatalog() {
    // TODO: Implement get groceries catalog logic
    return {
      success: true,
      data: [],
      message: 'لا توجد منتجات متاحة حالياً',
    };
  }
}

