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
import { MaaroufService } from './maarouf.service';
import CreateMaaroufDto from './dto/create-maarouf.dto';
import UpdateMaaroufDto from './dto/update-maarouf.dto';

@ApiTags('معروف — المفقودات والموجودات')
@ApiBearerAuth()
@ApiConsumes('application/json')
@ApiProduces('application/json')
@Controller('maarouf')
export class MaaroufController {
  constructor(private readonly service: MaaroufService) {}

  @Post()
  @ApiOperation({ 
    summary: 'إنشاء إعلان مفقود أو موجود',
    description: 'إضافة إعلان جديد للمفقودات أو الموجودات مع تحديد النوع والعلامات'
  })
  @ApiBody({
    description: 'بيانات الإعلان',
    schema: {
      type: 'object',
      required: ['ownerId', 'title'],
      properties: {
        ownerId: { type: 'string', example: '507f1f77bcf86cd799439011' },
        title: { type: 'string', example: 'محفظة سوداء مفقودة في منطقة النرجس' },
        description: { type: 'string', example: 'محفظة سوداء صغيرة تحتوي على بطاقات شخصية وأموال' },
        kind: { type: 'string', enum: ['lost', 'found'], example: 'lost' },
        tags: { type: 'array', items: { type: 'string' }, example: ['محفظة', 'بطاقات', 'نرجس'] },
        metadata: { type: 'object', example: { color: 'أسود', location: 'النرجس', date: '2024-01-15' } },
        status: { type: 'string', enum: ['draft','pending','confirmed','completed','cancelled'], default: 'draft' }
      }
    }
  })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'تم إنشاء الإعلان بنجاح' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'بيانات غير صحيحة' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  create(@Body() dto: CreateMaaroufDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'قائمة الإعلانات',
    description: 'استرجاع قائمة إعلانات المفقودات والموجودات مع دعم التنقل بالـ cursor'
  })
  @ApiQuery({ name: 'cursor', required: false, description: 'مؤشر الصفحة التالية', example: '507f1f77bcf86cd799439012' })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم الاسترجاع بنجاح' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  findAll(@Query('cursor') cursor?: string) {
    return this.service.findAll({ cursor });
  }

  @Get(':id')
  @ApiOperation({ summary: 'تفاصيل إعلان', description: 'استرجاع إعلان مفقود أو موجود بواسطة المعرف' })
  @ApiParam({ name: 'id', description: 'معرف الإعلان', example: '507f1f77bcf86cd799439012' })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم الاسترجاع بنجاح' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'غير موجود' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'تحديث إعلان', description: 'تحديث بيانات إعلان المفقودات أو الموجودات' })
  @ApiParam({ name: 'id', description: 'معرف الإعلان', example: '507f1f77bcf86cd799439012' })
  @ApiBody({
    description: 'الحقول الممكن تحديثها',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'محفظة سوداء محدثة' },
        description: { type: 'string', example: 'تفاصيل محدثة للمحفظة' },
        kind: { type: 'string', enum: ['lost', 'found'], example: 'found' },
        tags: { type: 'array', items: { type: 'string' }, example: ['محفظة', 'أسود', 'موجودة'] },
        metadata: { type: 'object', example: { color: 'أسود', location: 'الروضة', date: '2024-01-16' } },
        status: { type: 'string', enum: ['draft','pending','confirmed','completed','cancelled'], example: 'confirmed' }
      }
    }
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم التحديث بنجاح' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'غير موجود' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'بيانات غير صحيحة' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  update(@Param('id') id: string, @Body() dto: UpdateMaaroufDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف إعلان', description: 'حذف إعلان المفقودات أو الموجودات نهائياً' })
  @ApiParam({ name: 'id', description: 'معرف الإعلان', example: '507f1f77bcf86cd799439012' })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم الحذف بنجاح' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'غير موجود' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
