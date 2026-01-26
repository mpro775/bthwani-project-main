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
import { KawaderService } from './kawader.service';
import CreateKawaderDto from './dto/create-kawader.dto';
import UpdateKawaderDto from './dto/update-kawader.dto';

@ApiTags('كوادر — الوظائف والخدمات المهنية')
@ApiBearerAuth()
@ApiConsumes('application/json')
@ApiProduces('application/json')
@Controller('kawader')
export class KawaderController {
  constructor(private readonly service: KawaderService) {}

  @Post()
  @ApiOperation({ 
    summary: 'إنشاء عرض وظيفة أو خدمة مهنية',
    description: 'إضافة عرض جديد للوظائف أو الخدمات المهنية مع تحديد النطاق والميزانية'
  })
  @ApiBody({
    description: 'بيانات العرض الوظيفي',
    schema: {
      type: 'object',
      required: ['ownerId', 'title'],
      properties: {
        ownerId: { type: 'string', example: '507f1f77bcf86cd799439011' },
        title: { type: 'string', example: 'مطور Full Stack مطلوب لمشروع تقني' },
        description: { type: 'string', example: 'نحتاج مطور بخبرة 3+ سنوات في React و Node.js' },
        scope: { type: 'string', example: 'مشروع 6 أشهر' },
        budget: { type: 'number', example: 15000 },
        metadata: { type: 'object', example: { experience: '3+ years', skills: ['React', 'Node.js'] } },
        status: { type: 'string', enum: ['draft','pending','confirmed','completed','cancelled'], default: 'draft' }
      }
    }
  })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'تم إنشاء العرض بنجاح' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'بيانات غير صحيحة' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  create(@Body() dto: CreateKawaderDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'قائمة العروض الوظيفية',
    description: 'استرجاع قائمة العروض الوظيفية مع دعم التنقل بالـ cursor'
  })
  @ApiQuery({ name: 'cursor', required: false, description: 'مؤشر الصفحة التالية', example: '507f1f77bcf86cd799439012' })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم الاسترجاع بنجاح' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  findAll(@Query('cursor') cursor?: string) {
    return this.service.findAll({ cursor });
  }

  @Get(':id')
  @ApiOperation({ summary: 'تفاصيل عرض وظيفي', description: 'استرجاع عرض وظيفي بواسطة المعرف' })
  @ApiParam({ name: 'id', description: 'معرف العرض', example: '507f1f77bcf86cd799439012' })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم الاسترجاع بنجاح' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'غير موجود' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'تحديث عرض وظيفي', description: 'تحديث بيانات العرض الوظيفي' })
  @ApiParam({ name: 'id', description: 'معرف العرض', example: '507f1f77bcf86cd799439012' })
  @ApiBody({
    description: 'الحقول الممكن تحديثها',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'مطور Full Stack محدث' },
        description: { type: 'string', example: 'تفاصيل محدثة للمتطلبات' },
        scope: { type: 'string', example: 'مشروع 8 أشهر' },
        budget: { type: 'number', example: 18000 },
        metadata: { type: 'object', example: { experience: '5+ years', skills: ['React', 'Node.js', 'TypeScript'] } },
        status: { type: 'string', enum: ['draft','pending','confirmed','completed','cancelled'], example: 'confirmed' }
      }
    }
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم التحديث بنجاح' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'غير موجود' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'بيانات غير صحيحة' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  update(@Param('id') id: string, @Body() dto: UpdateKawaderDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف عرض وظيفي', description: 'حذف العرض الوظيفي نهائياً' })
  @ApiParam({ name: 'id', description: 'معرف العرض', example: '507f1f77bcf86cd799439012' })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم الحذف بنجاح' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'غير موجود' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
