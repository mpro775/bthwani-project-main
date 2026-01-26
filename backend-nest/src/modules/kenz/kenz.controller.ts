import { Controller, Get, Post, Body, Param, Query, Patch, Delete, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
  ApiConsumes,
  ApiProduces
} from '@nestjs/swagger';
import { KenzService } from './kenz.service';
import CreateKenzDto from './dto/create-kenz.dto';
import UpdateKenzDto from './dto/update-kenz.dto';

@ApiTags('كنز — السوق المفتوح')
@ApiBearerAuth()
@ApiConsumes('application/json')
@ApiProduces('application/json')
@Controller('kenz')
export class KenzController {
  constructor(private readonly service: KenzService) { }

  @Post()
  @ApiOperation({ summary: 'إنشاء إعلان سوق', description: 'إضافة إعلان جديد في سوق كنز' })
  @ApiBody({
    description: 'بيانات الإعلان',
    schema: {
      type: 'object',
      required: ['ownerId', 'title'],
      properties: {
        ownerId: { type: 'string', example: '507f1f77bcf86cd799439011' },
        title: { type: 'string', example: 'iPhone 14 Pro مستعمل بحالة ممتازة' },
        description: { type: 'string', example: 'استخدام خفيف مع ضمان متبقي 6 أشهر' },
        price: { type: 'number', example: 3500 },
        category: { type: 'string', example: 'إلكترونيات' },
        metadata: { type: 'object', example: { color: 'فضي', storage: '256GB' } },
        status: { type: 'string', enum: ['draft', 'pending', 'confirmed', 'completed', 'cancelled'], default: 'draft' }
      }
    }
  })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'تم إنشاء الإعلان بنجاح' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'بيانات غير صحيحة' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  create(@Body() dto: CreateKenzDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'قائمة الإعلانات', description: 'استرجاع الإعلانات مع دعم cursor' })
  @ApiQuery({ name: 'cursor', required: false, description: 'مؤشر الصفحة التالية', example: '507f1f77bcf86cd799439012' })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم الاسترجاع بنجاح' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  findAll(@Query('cursor') cursor?: string) {
    return this.service.findAll({ cursor });
  }

  @Get(':id')
  @ApiOperation({ summary: 'تفاصيل إعلان', description: 'استرجاع إعلان بواسطة المعرف' })
  @ApiParam({ name: 'id', description: 'معرف الإعلان', example: '507f1f77bcf86cd799439012' })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم الاسترجاع بنجاح' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'غير موجود' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'تحديث إعلان', description: 'تحديث بيانات الإعلان' })
  @ApiParam({ name: 'id', description: 'معرف الإعلان', example: '507f1f77bcf86cd799439012' })
  @ApiBody({
    description: 'الحقول الممكن تحديثها',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'iPhone 14 Pro محدث' },
        description: { type: 'string', example: 'تفاصيل محدثة' },
        price: { type: 'number', example: 3400 },
        category: { type: 'string', example: 'إلكترونيات' },
        metadata: { type: 'object', example: { color: 'أسود' } },
        status: { type: 'string', enum: ['draft', 'pending', 'confirmed', 'completed', 'cancelled'], example: 'confirmed' }
      }
    }
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم التحديث بنجاح' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'غير موجود' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'بيانات غير صحيحة' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  update(@Param('id') id: string, @Body() dto: UpdateKenzDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف إعلان', description: 'حذف الإعلان نهائياً' })
  @ApiParam({ name: 'id', description: 'معرف الإعلان', example: '507f1f77bcf86cd799439012' })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم الحذف بنجاح' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'غير موجود' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
