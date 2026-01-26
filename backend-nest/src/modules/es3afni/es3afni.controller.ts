import { Controller, Get, Post, Body, Param, Query, Patch, Delete, HttpStatus, UseGuards } from '@nestjs/common';
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
import { UnifiedAuthGuard } from '../../common/guards/unified-auth.guard';
import { Es3afniService } from './es3afni.service';
import CreateEs3afniDto from './dto/create-es3afni.dto';
import UpdateEs3afniDto from './dto/update-es3afni.dto';

@ApiTags('اسعفني — شبكة تبرع بالدم عاجلة')
@ApiBearerAuth()
@ApiConsumes('application/json')
@ApiProduces('application/json')
@UseGuards(UnifiedAuthGuard)
@Controller('es3afni')
export class Es3afniController {
  constructor(private readonly service: Es3afniService) {}

  @Post()
  @ApiOperation({ summary: 'إنشاء نداء تبرع بالدم', description: 'إنشاء بلاغ تبرع بالدم مع تحديد النوع والموقع' })
  @ApiBody({
    description: 'بيانات البلاغ',
    schema: {
      type: 'object',
      required: ['ownerId', 'title'],
      properties: {
        ownerId: { type: 'string', example: '507f1f77bcf86cd799439011' },
        title: { type: 'string', example: 'حاجة عاجلة لفصيلة O+ في الرياض' },
        description: { type: 'string', example: 'المريض بحاجة عاجلة للتبرع خلال 24 ساعة' },
        bloodType: { type: 'string', example: 'O+' },
        location: { type: 'object', example: { lat: 24.7136, lng: 46.6753, address: 'مستشفى الملك فيصل التخصصي، الرياض' } },
        metadata: { type: 'object', example: { contact: '+9665XXXXXXX', unitsNeeded: 3 } },
        status: { type: 'string', enum: ['draft','pending','confirmed','completed','cancelled'], default: 'draft' }
      }
    }
  })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'تم إنشاء البلاغ بنجاح' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'بيانات غير صحيحة' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  create(@Body() dto: CreateEs3afniDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'قائمة البلاغات', description: 'استرجاع قائمة البلاغات مع دعم cursor' })
  @ApiQuery({ name: 'cursor', required: false, description: 'مؤشر الصفحة التالية', example: '507f1f77bcf86cd799439012' })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم الاسترجاع بنجاح' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  findAll(@Query('cursor') cursor?: string) {
    return this.service.findAll({ cursor });
  }

  @Get(':id')
  @ApiOperation({ summary: 'تفاصيل بلاغ', description: 'استرجاع بلاغ بواسطة المعرف' })
  @ApiParam({ name: 'id', description: 'معرف البلاغ', example: '507f1f77bcf86cd799439012' })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم الاسترجاع بنجاح' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'غير موجود' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'تحديث بلاغ', description: 'تحديث بيانات بلاغ تبرع بالدم' })
  @ApiParam({ name: 'id', description: 'معرف البلاغ', example: '507f1f77bcf86cd799439012' })
  @ApiBody({
    description: 'الحقول الممكن تحديثها',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'نداء محدث لفصيلة O+' },
        description: { type: 'string', example: 'تفاصيل محدثة' },
        bloodType: { type: 'string', example: 'O+' },
        location: { type: 'object', example: { lat: 24.7, lng: 46.6, address: 'الرياض' } },
        metadata: { type: 'object', example: { contact: '+9665XXXXXXX', unitsNeeded: 2 } },
        status: { type: 'string', enum: ['draft','pending','confirmed','completed','cancelled'], example: 'confirmed' }
      }
    }
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم التحديث بنجاح' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'غير موجود' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'بيانات غير صحيحة' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  update(@Param('id') id: string, @Body() dto: UpdateEs3afniDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف بلاغ', description: 'حذف بلاغ تبرع بالدم نهائياً' })
  @ApiParam({ name: 'id', description: 'معرف البلاغ', example: '507f1f77bcf86cd799439012' })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم الحذف بنجاح' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'غير موجود' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Get('my')
  @ApiOperation({
    summary: 'بلاغاتي الخاصة',
    description: 'استرجاع بلاغات تبرع بالدم التي أنشأتها'
  })
  @ApiQuery({ name: 'cursor', required: false, description: 'مؤشر الصفحة التالية', example: '507f1f77bcf86cd799439012' })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم الاسترجاع بنجاح' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  getMy(@Query('cursor') cursor?: string) {
    // TODO: تنفيذ منطق استرجاع البلاغات الخاصة بالمستخدم الحالي
    return this.service.findAll({ cursor });
  }

  @Get('search')
  @ApiOperation({
    summary: 'البحث في البلاغات',
    description: 'البحث في بلاغات تبرع بالدم بناءً على استعلام النص'
  })
  @ApiQuery({ name: 'q', description: 'استعلام البحث', example: 'فصيلة O+' })
  @ApiQuery({ name: 'bloodType', required: false, description: 'فلترة حسب فصيلة الدم', example: 'O+' })
  @ApiQuery({ name: 'status', required: false, description: 'فلترة حسب الحالة', enum: ['draft','pending','confirmed','completed','cancelled'] })
  @ApiQuery({ name: 'cursor', required: false, description: 'مؤشر الصفحة التالية', example: '507f1f77bcf86cd799439012' })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم البحث بنجاح' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'استعلام البحث مطلوب' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  search(
    @Query('q') q: string,
    @Query('bloodType') bloodType?: string,
    @Query('status') status?: string,
    @Query('cursor') cursor?: string
  ) {
    // TODO: تنفيذ منطق البحث في البلاغات
    return this.service.findAll({ cursor });
  }
}
