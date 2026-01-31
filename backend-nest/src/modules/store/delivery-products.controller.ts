import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { StoreService } from './store.service';
import { CreateProductDto } from './dto/create-product.dto';
import { DeliveryProductCreateDto } from './dto/delivery-product.dto';
import { CursorPaginationDto } from '../../common/dto/pagination.dto';
import { Types } from 'mongoose';

function toCreateProductDto(body: DeliveryProductCreateDto): CreateProductDto {
  const storeId = body.storeId ?? '';
  return {
    name: body.name ?? '',
    description: body.description,
    price: body.price ?? 0,
    store: storeId,
    subCategory: body.subCategoryId,
    image: body.image,
    images: body.image ? [body.image] : [],
    inStock: body.isAvailable ?? true,
    stockQuantity: 0,
    discount: 0,
  };
}

function toProductUpdates(body: DeliveryProductCreateDto): Record<string, unknown> {
  const updates: Record<string, unknown> = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.description !== undefined) updates.description = body.description;
  if (body.price !== undefined) updates.price = body.price;
  if (body.isAvailable !== undefined) updates.isActive = body.isAvailable;
  if (body.image !== undefined) updates.image = body.image;
  if (body.subCategoryId !== undefined) {
    updates.subCategory = body.subCategoryId
      ? new Types.ObjectId(body.subCategoryId)
      : null;
  }
  return updates;
}

@ApiTags('Delivery - Products')
@Controller({ path: 'delivery/products', version: '1' })
export class DeliveryProductsController {
  constructor(private readonly storeService: StoreService) {}

  @Get()
  @ApiQuery({ name: 'storeId', required: false, description: 'تصفية حسب المتجر' })
  @ApiQuery({ name: 'subCategoryId', required: false, description: 'تصفية حسب الفئة الفرعية' })
  @ApiResponse({ status: 200, description: 'قائمة المنتجات' })
  @ApiOperation({ summary: 'قائمة منتجات التوصيل (للإدارة)' })
  async list(
    @Query() pagination: CursorPaginationDto,
    @Query('storeId') storeId?: string,
    @Query('subCategoryId') subCategoryId?: string,
  ) {
    return this.storeService.findProductsForAdmin(
      pagination,
      storeId,
      subCategoryId,
    );
  }

  @Post()
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiOperation({ summary: 'إنشاء منتج توصيل' })
  async create(@Body() body: DeliveryProductCreateDto) {
    const dto = toCreateProductDto(body);
    const product = await this.storeService.createProduct(dto);
    return { data: product };
  }

  @Put(':id')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiOperation({ summary: 'تحديث منتج توصيل' })
  async update(@Param('id') id: string, @Body() body: DeliveryProductCreateDto) {
    const updates = toProductUpdates(body);
    const product = await this.storeService.updateProduct(id, updates);
    return { data: product };
  }

  @Delete(':id')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Deleted' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiOperation({ summary: 'حذف منتج توصيل' })
  async delete(@Param('id') id: string) {
    return this.storeService.deleteProduct(id);
  }
}
