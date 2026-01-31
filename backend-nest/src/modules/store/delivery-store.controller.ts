import {
  Controller,
  Get,
  Put,
  Body,
  Query,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation , ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { StoreService } from './store.service';
import { CursorPaginationDto } from '../../common/dto/pagination.dto';
import { FindStoresQueryDto } from './dto/find-stores-query.dto';
import { Public } from '../../common/decorators/auth.decorator';

@ApiTags('Delivery - Stores')
@Controller({ path: 'delivery/stores', version: '1' })
export class DeliveryStoreController {
  constructor(private readonly storeService: StoreService) {}

  @Public()
  @Get()
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'جلب المتاجر - عام' })
  async findStores(@Query() dto: FindStoresQueryDto) {
    const pagination: CursorPaginationDto = {
      cursor: dto.cursor,
      limit: dto.limit ?? 20,
    };
    return this.storeService.findStores(pagination, {
      categoryId: dto.categoryId,
      isTrending: dto.isTrending,
      isFeatured: dto.isFeatured,
      usageType: dto.usageType,
    });
  }

  @Public()
  @Get('search')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'البحث عن متاجر' })
  async searchStores(
    @Query('q') query: string,
    @Query() pagination: CursorPaginationDto,
  ) {
    return this.storeService.searchStores(query, pagination);
  }

  @Public()
  @Get(':id')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'جلب متجر محدد' })
  async findStore(@Param('id') id: string) {
    return this.storeService.findStoreById(id);
  }

  @Public()
  @Get(':id/products')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'جلب منتجات المتجر' })
  async getProducts(
    @Param('id') storeId: string,
    @Query() pagination: CursorPaginationDto,
  ) {
    return this.storeService.findProductsByStore(storeId, pagination);
  }

  @Public()
  @Get(':id/statistics')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'إحصائيات المتجر - عامة' })
  async getStoreStatistics(@Param('id') storeId: string) {
    return this.storeService.getStoreStatistics(storeId);
  }

  @Public()
  @Get(':id/reviews')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'مراجعات المتجر' })
  async getStoreReviews(
    @Param('id') storeId: string,
    @Query() pagination: CursorPaginationDto,
  ) {
    return this.storeService.getStoreReviews(storeId, pagination);
  }

  @Put(':id')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'تحديث متجر' })
  async updateStore(@Param('id') id: string, @Body() body: any) {
    return this.storeService.updateStore(id, body);
  }
}

