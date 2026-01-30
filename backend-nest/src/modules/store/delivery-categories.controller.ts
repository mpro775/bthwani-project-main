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
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { Public } from '../../common/decorators/auth.decorator';
import { DeliveryCategoryService } from './delivery-category.service';

@ApiTags('Delivery - Categories')
@Controller({ path: 'delivery/categories', version: '1' })
export class DeliveryCategoriesController {
  constructor(private readonly categoryService: DeliveryCategoryService) {}

  @Public()
  @Get()
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiOperation({ summary: 'جلب فئات التوصيل (قائمة مسطحة للقوائم)' })
  async getDeliveryCategories(
    @Query('usageType') usageType?: string,
    @Query('search') search?: string,
  ) {
    let list = await this.categoryService.findAll({ usageType, search });
    if (list.length === 0) {
      list = await this.categoryService.ensureDefaultCategories();
    }
    return { data: list };
  }

  @Public()
  @Get('main')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiOperation({ summary: 'جلب الفئات الرئيسية' })
  async getMainCategories(
    @Query('usageType') usageType?: string,
    @Query('search') search?: string,
    @Query('withNumbers') _withNumbers?: string,
  ) {
    let list = await this.categoryService.findMain({ usageType, search });
    if (list.length === 0) {
      await this.categoryService.ensureDefaultCategories();
      list = await this.categoryService.findMain({ usageType, search });
    }
    return { data: list };
  }

  @Public()
  @Get('children/:parentId')
  @ApiParam({ name: 'parentId', type: String })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiOperation({ summary: 'جلب الفئات الفرعية' })
  async getChildren(
    @Param('parentId') parentId: string,
    @Query('withNumbers') _withNumbers?: string,
  ) {
    const list = await this.categoryService.findChildren(parentId);
    return { data: list };
  }

  @Public()
  @Post()
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiOperation({ summary: 'إنشاء فئة جديدة' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        image: { type: 'string' },
        icon: { type: 'string' },
        isActive: { type: 'boolean' },
        parent: { type: 'string', nullable: true },
        usageType: { type: 'string' },
        sortOrder: { type: 'number' },
      },
    },
  })
  async create(
    @Body()
    body: {
      name: string;
      image?: string;
      icon?: string;
      isActive?: boolean;
      parent?: string | null;
      usageType?: string;
      sortOrder?: number;
    },
  ) {
    const cat = await this.categoryService.create(body);
    return { data: cat };
  }

  @Public()
  @Put(':id')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiOperation({ summary: 'تحديث فئة' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        image: { type: 'string' },
        isActive: { type: 'boolean' },
        parent: { type: 'string', nullable: true },
        usageType: { type: 'string' },
        sortOrder: { type: 'number' },
      },
    },
  })
  async update(
    @Param('id') id: string,
    @Body()
    body: Partial<{
      name: string;
      image: string;
      isActive: boolean;
      parent: string | null;
      usageType: string;
      sortOrder: number;
    }>,
  ) {
    const cat = await this.categoryService.update(id, body);
    return { data: cat };
  }

  @Public()
  @Delete(':id')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiOperation({ summary: 'حذف فئة' })
  async delete(@Param('id') id: string) {
    await this.categoryService.delete(id);
    return { success: true };
  }

  @Public()
  @Post('bulk-reorder')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiOperation({ summary: 'إعادة ترتيب الفئات' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        updates: {
          type: 'array',
          items: { type: 'object', properties: { id: { type: 'string' }, sortOrder: { type: 'number' } } },
        },
      },
    },
  })
  async bulkReorder(@Body('updates') updates: { id: string; sortOrder: number }[]) {
    if (Array.isArray(updates) && updates.length) {
      await this.categoryService.bulkReorder(updates);
    }
    return { success: true };
  }
}
