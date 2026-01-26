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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { StoreService } from './store.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { CursorPaginationDto } from '../../common/dto/pagination.dto';
import { UnifiedAuthGuard } from '../../common/guards/unified-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Auth, Roles, Public } from '../../common/decorators/auth.decorator';
import { AuthType } from '../../common/guards/unified-auth.guard';

@ApiTags('Admin - Stores')
@Controller('admin/stores')
@UseGuards(UnifiedAuthGuard, RolesGuard)
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Auth(AuthType.JWT)
  @ApiBearerAuth()
  @Roles('admin', 'superadmin')
  @Post()
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'إنشاء متجر' })
  async createStore(@Body() createStoreDto: CreateStoreDto) {
    return this.storeService.createStore(createStoreDto);
  }

  @Auth(AuthType.JWT)
  @ApiBearerAuth()
  @Roles('admin', 'superadmin')
  @Get()
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'جلب المتاجر - الإدارة' })
  async findStores(
    @Query() pagination: CursorPaginationDto,
    @Query('isActive') isActive?: string,
    @Query('usageType') usageType?: string,
    @Query('q') q?: string,
  ) {
    return this.storeService.findStoresAdmin(pagination, { isActive, usageType, q });
  }

  @Auth(AuthType.JWT)
  @ApiBearerAuth()
  @Roles('admin', 'superadmin')
  @Get(':id')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'جلب متجر محدد - الإدارة' })
  async findStore(@Param('id') id: string) {
    return this.storeService.findStoreById(id);
  }

  @Auth(AuthType.JWT)
  @ApiBearerAuth()
  @Roles('admin', 'superadmin', 'vendor')
  @Post('products')
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'إنشاء منتج' })
  async createProduct(@Body() createProductDto: CreateProductDto) {
    return this.storeService.createProduct(createProductDto);
  }

  @Auth(AuthType.JWT)
  @ApiBearerAuth()
  @Roles('admin', 'superadmin')
  @Get(':id/products')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'جلب منتجات المتجر - الإدارة' })
  async getProducts(
    @Param('id') storeId: string,
    @Query() pagination: CursorPaginationDto,
  ) {
    return this.storeService.findProductsByStore(storeId, pagination);
  }

  @Auth(AuthType.JWT)
  @ApiBearerAuth()
  @Roles('admin', 'superadmin')
  @Patch(':id')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'تحديث متجر' })
  async updateStore(@Param('id') storeId: string, @Body() updates: any) {
    return this.storeService.updateStore(storeId, updates);
  }

  @Auth(AuthType.JWT)
  @ApiBearerAuth()
  @Roles('admin', 'superadmin')
  @Post(':id/activate')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'تفعيل متجر' })
  async activateStore(@Param('id') storeId: string) {
    return this.storeService.activateStore(storeId);
  }

  @Auth(AuthType.JWT)
  @ApiBearerAuth()
  @Roles('admin', 'superadmin')
  @Post(':id/deactivate')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'تعطيل متجر' })
  async deactivateStore(@Param('id') storeId: string) {
    return this.storeService.deactivateStore(storeId);
  }

  @Auth(AuthType.JWT)
  @ApiBearerAuth()
  @Roles('admin', 'superadmin')
  @Post(':id/force-close')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'إغلاق قسري للمتجر' })
  async forceCloseStore(@Param('id') storeId: string) {
    return this.storeService.forceCloseStore(storeId);
  }

  @Auth(AuthType.JWT)
  @ApiBearerAuth()
  @Roles('admin', 'superadmin')
  @Post(':id/force-open')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'فتح قسري للمتجر' })
  async forceOpenStore(@Param('id') storeId: string) {
    return this.storeService.forceOpenStore(storeId);
  }

  @Auth(AuthType.JWT)
  @ApiBearerAuth()
  @Roles('admin', 'superadmin', 'vendor')
  @Patch('products/:id')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'تحديث منتج' })
  async updateProduct(@Param('id') productId: string, @Body() updates: any) {
    return this.storeService.updateProduct(productId, updates);
  }

  // ==================== Store Extended Features ====================

  @Auth(AuthType.JWT)
  @ApiBearerAuth()
  @Roles('admin', 'superadmin')
  @Get(':id/analytics')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'تحليلات المتجر - الإدارة' })
  async getStoreAnalytics(
    @Param('id') storeId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.storeService.getStoreAnalytics(storeId, startDate, endDate);
  }

  @Auth(AuthType.JWT)
  @ApiBearerAuth()
  @Roles('admin', 'superadmin')
  @Get('products/:id/variants')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'متغيرات المنتج' })
  async getProductVariants(@Param('id') productId: string) {
    return this.storeService.getProductVariants(productId);
  }

  @Auth(AuthType.JWT)
  @ApiBearerAuth()
  @Roles('admin', 'superadmin', 'vendor')
  @Post('products/:id/variants')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'إضافة متغير' })
  async addProductVariant(
    @Param('id') productId: string,
    @Body() variant: any,
  ) {
    return this.storeService.addProductVariant(productId, variant);
  }

  @Auth(AuthType.JWT)
  @ApiBearerAuth()
  @Roles('admin', 'superadmin')
  @Get(':id/inventory')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'جرد المتجر - الإدارة' })
  async getStoreInventory(@Param('id') storeId: string) {
    return this.storeService.getStoreInventory(storeId);
  }

  @Auth(AuthType.JWT)
  @ApiBearerAuth()
  @Roles('admin', 'superadmin')
  @Delete(':id')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Deleted' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'حذف متجر' })
  async deleteStore(@Param('id') storeId: string) {
    return this.storeService.deleteStore(storeId);
  }

  // ==================== Store Approval & Moderation ====================

  @Auth(AuthType.JWT)
  @ApiBearerAuth()
  @Roles('admin', 'superadmin')
  @Get('pending')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'المتاجر المعلقة - تحتاج موافقة' })
  async getPendingStores() {
    return this.storeService.getPendingStores();
  }

  @Auth(AuthType.JWT)
  @ApiBearerAuth()
  @Roles('admin', 'superadmin')
  @Post(':id/approve')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'الموافقة على متجر' })
  async approveStore(@Param('id') storeId: string) {
    return this.storeService.approveStore(storeId);
  }

  @Auth(AuthType.JWT)
  @ApiBearerAuth()
  @Roles('admin', 'superadmin')
  @Post(':id/reject')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'رفض متجر' })
  async rejectStore(
    @Param('id') storeId: string,
    @Body() body: { reason: string },
  ) {
    return this.storeService.rejectStore(storeId, body.reason);
  }

  @Auth(AuthType.JWT)
  @ApiBearerAuth()
  @Roles('admin', 'superadmin')
  @Post(':id/suspend')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'تعليق متجر' })
  async suspendStore(
    @Param('id') storeId: string,
    @Body() body: { reason: string },
  ) {
    return this.storeService.suspendStore(storeId, body.reason);
  }
}
