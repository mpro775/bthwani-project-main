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
import { DeliverySubCategoryService } from './delivery-subcategory.service';

@ApiTags('Delivery - Subcategories')
@Controller({ path: 'delivery/subcategories', version: '1' })
export class DeliverySubCategoriesController {
  constructor(private readonly subCategoryService: DeliverySubCategoryService) {}

  @Get()
  @ApiQuery({ name: 'storeId', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiOperation({ summary: 'جلب الفئات الداخلية لمتجر' })
  async list(@Query('storeId') storeId: string) {
    const list = await this.subCategoryService.findAllByStore(storeId);
    return { data: list };
  }

  @Post()
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiOperation({ summary: 'إنشاء فئة داخلية' })
  async create(@Body() body: { storeId: string; name: string }) {
    const created = await this.subCategoryService.create({
      storeId: body.storeId,
      name: body.name ?? '',
    });
    return { data: created };
  }

  @Put(':id')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiOperation({ summary: 'تحديث فئة داخلية' })
  async update(@Param('id') id: string, @Body() body: { name?: string }) {
    const updated = await this.subCategoryService.update(id, { name: body.name });
    return { data: updated };
  }

  @Delete(':id')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Deleted' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiOperation({ summary: 'حذف فئة داخلية' })
  async delete(@Param('id') id: string) {
    await this.subCategoryService.delete(id);
    return { success: true };
  }
}
