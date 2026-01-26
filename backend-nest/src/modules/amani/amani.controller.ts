import { Controller, Get, Post, Body, Param, Query, Patch, Delete, HttpStatus, BadRequestException } from '@nestjs/common';
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
import { AmaniService } from './amani.service';
import CreateAmaniDto from './dto/create-amani.dto';
import UpdateAmaniDto from './dto/update-amani.dto';
import AssignDriverDto from './dto/assign-driver.dto';
import UpdateAmaniStatusDto from './dto/update-status.dto';
import { Amani } from './entities/amani.entity';

@ApiTags('آماني — النقل النسائي للعائلات')
@ApiBearerAuth()
@ApiConsumes('application/json')
@ApiProduces('application/json')
@Controller('amani')
export class AmaniController {
  constructor(private readonly service: AmaniService) { }

  @Post()
  @ApiOperation({ 
    summary: 'إنشاء طلب نقل نسائي جديد',
    description: 'إنشاء طلب نقل آماني جديد للعائلات مع تحديد الموقع والوجهة'
  })
  @ApiBody({
    description: 'بيانات طلب النقل النسائي',
    schema: {
      type: 'object',
      required: ['ownerId', 'title'],
      properties: {
        ownerId: {
          type: 'string',
          description: 'معرف المستخدم صاحب الطلب',
          example: '507f1f77bcf86cd799439011'
        },
        title: {
          type: 'string',
          description: 'عنوان الطلب',
          example: 'نقل عائلي من الرياض إلى جدة'
        },
        description: {
          type: 'string',
          description: 'وصف تفصيلي للطلب',
          example: 'نقل عائلي مكون من 4 أفراد مع أمتعة'
        },
        origin: {
          type: 'object',
          description: 'موقع الانطلاق',
          example: { lat: 24.7136, lng: 46.6753, address: 'الرياض، المملكة العربية السعودية' }
        },
        destination: {
          type: 'object',
          description: 'الوجهة المطلوبة',
          example: { lat: 21.4858, lng: 39.1925, address: 'جدة، المملكة العربية السعودية' }
        },
        metadata: {
          type: 'object',
          description: 'بيانات إضافية للطلب',
          example: { passengers: 4, luggage: true, specialRequests: 'كرسي أطفال' }
        },
        status: {
          type: 'string',
          description: 'حالة الطلب',
          enum: ['draft', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
          default: 'draft'
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'تم إنشاء الطلب بنجاح',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string', example: '507f1f77bcf86cd799439012' },
        ownerId: { type: 'string', example: '507f1f77bcf86cd799439011' },
        title: { type: 'string', example: 'نقل عائلي من الرياض إلى جدة' },
        description: { type: 'string', example: 'نقل عائلي مكون من 4 أفراد مع أمتعة' },
        origin: { type: 'object' },
        destination: { type: 'object' },
        metadata: { type: 'object' },
        status: { type: 'string', example: 'draft' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'بيانات الطلب غير صحيحة'
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'غير مخول للوصول'
  })
  create(@Body() dto: CreateAmaniDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'الحصول على قائمة طلبات النقل النسائي',
    description: 'استرجاع قائمة بطلبات النقل النسائي مع إمكانية التنقل عبر الصفحات'
  })
  @ApiQuery({
    name: 'cursor',
    required: false,
    description: 'مؤشر للتنقل عبر الصفحات',
    example: '507f1f77bcf86cd799439012',
    schema: { type: 'string' }
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'تم استرجاع القائمة بنجاح',
    schema: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              ownerId: { type: 'string' },
              title: { type: 'string' },
              description: { type: 'string' },
              origin: { type: 'object' },
              destination: { type: 'object' },
              metadata: { type: 'object' },
              status: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' }
            }
          }
        },
        nextCursor: {
          type: 'string',
          nullable: true,
          description: 'مؤشر للصفحة التالية أو null إذا لم توجد صفحات أخرى',
          example: '507f1f77bcf86cd799439013'
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'غير مخول للوصول'
  })
  findAll(@Query('cursor') cursor?: string) {
    return this.service.findAll({ cursor });
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'الحصول على طلب نقل نسائي محدد',
    description: 'استرجاع تفاصيل طلب نقل نسائي محدد بواسطة المعرف'
  })
  @ApiParam({
    name: 'id',
    description: 'معرف طلب النقل النسائي',
    example: '507f1f77bcf86cd799439012',
    schema: { type: 'string' }
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'تم استرجاع الطلب بنجاح',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string', example: '507f1f77bcf86cd799439012' },
        ownerId: { type: 'string', example: '507f1f77bcf86cd799439011' },
        title: { type: 'string', example: 'نقل عائلي من الرياض إلى جدة' },
        description: { type: 'string', example: 'نقل عائلي مكون من 4 أفراد مع أمتعة' },
        origin: { type: 'object' },
        destination: { type: 'object' },
        metadata: { type: 'object' },
        status: { type: 'string', example: 'draft' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'الطلب غير موجود'
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'غير مخول للوصول'
  })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'تحديث طلب نقل نسائي',
    description: 'تحديث بيانات طلب نقل نسائي موجود'
  })
  @ApiParam({
    name: 'id',
    description: 'معرف طلب النقل النسائي',
    example: '507f1f77bcf86cd799439012',
    schema: { type: 'string' }
  })
  @ApiBody({
    description: 'البيانات المحدثة لطلب النقل النسائي',
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'عنوان الطلب',
          example: 'نقل عائلي محدث من الرياض إلى جدة'
        },
        description: {
          type: 'string',
          description: 'وصف تفصيلي للطلب',
          example: 'نقل عائلي مكون من 4 أفراد مع أمتعة وكرسي أطفال'
        },
        origin: {
          type: 'object',
          description: 'موقع الانطلاق المحدث',
          example: { lat: 24.7136, lng: 46.6753, address: 'الرياض، المملكة العربية السعودية' }
        },
        destination: {
          type: 'object',
          description: 'الوجهة المحدثة',
          example: { lat: 21.4858, lng: 39.1925, address: 'جدة، المملكة العربية السعودية' }
        },
        metadata: {
          type: 'object',
          description: 'البيانات الإضافية المحدثة',
          example: { passengers: 4, luggage: true, specialRequests: 'كرسي أطفال، مساعدات إضافية' }
        },
        status: {
          type: 'string',
          description: 'حالة الطلب المحدثة',
          enum: ['draft', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
          example: 'confirmed'
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'تم تحديث الطلب بنجاح',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string', example: '507f1f77bcf86cd799439012' },
        ownerId: { type: 'string', example: '507f1f77bcf86cd799439011' },
        title: { type: 'string', example: 'نقل عائلي محدث من الرياض إلى جدة' },
        description: { type: 'string', example: 'نقل عائلي مكون من 4 أفراد مع أمتعة وكرسي أطفال' },
        origin: { type: 'object' },
        destination: { type: 'object' },
        metadata: { type: 'object' },
        status: { type: 'string', example: 'confirmed' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'الطلب غير موجود'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'بيانات التحديث غير صحيحة'
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'غير مخول للوصول'
  })
  update(@Param('id') id: string, @Body() dto: UpdateAmaniDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'حذف طلب نقل نسائي',
    description: 'حذف طلب نقل نسائي نهائياً من النظام'
  })
  @ApiParam({
    name: 'id',
    description: 'معرف طلب النقل النسائي',
    example: '507f1f77bcf86cd799439012',
    schema: { type: 'string' }
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'تم حذف الطلب بنجاح',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'الطلب غير موجود'
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'غير مخول للوصول'
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post(':id/assign-driver')
  @ApiOperation({ 
    summary: 'تعيين سائق للطلب',
    description: 'تعيين سائق محدد لطلب نقل نسائي'
  })
  @ApiParam({
    name: 'id',
    description: 'معرف طلب النقل النسائي',
    example: '507f1f77bcf86cd799439012',
    schema: { type: 'string' }
  })
  @ApiBody({
    description: 'بيانات تعيين السائق',
    schema: {
      type: 'object',
      required: ['driverId'],
      properties: {
        driverId: {
          type: 'string',
          description: 'معرف السائق',
          example: '507f1f77bcf86cd799439013'
        },
        note: {
          type: 'string',
          description: 'ملاحظة إضافية',
          example: 'تم التعيين يدوياً'
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'تم تعيين السائق بنجاح'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'الطلب أو السائق غير موجود'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'حالة الطلب لا تسمح بالتعيين'
  })
  async assignDriver(@Param('id') id: string, @Body() dto: AssignDriverDto) {
    return this.service.assignDriver(id, dto);
  }

  @Post(':id/assign-driver/auto')
  @ApiOperation({ 
    summary: 'تعيين سائق تلقائياً',
    description: 'تعيين أقرب سائق متاح تلقائياً للطلب'
  })
  @ApiParam({
    name: 'id',
    description: 'معرف طلب النقل النسائي',
    example: '507f1f77bcf86cd799439012',
    schema: { type: 'string' }
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'تم تعيين السائق تلقائياً بنجاح'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'الطلب غير موجود أو لا يوجد سائقون متاحون'
  })
  async assignDriverAuto(@Param('id') id: string) {
    return this.service.assignDriverAuto(id);
  }

  @Patch(':id/status')
  @ApiOperation({ 
    summary: 'تحديث حالة الطلب',
    description: 'تحديث حالة طلب نقل نسائي'
  })
  @ApiParam({
    name: 'id',
    description: 'معرف طلب النقل النسائي',
    example: '507f1f77bcf86cd799439012',
    schema: { type: 'string' }
  })
  @ApiBody({
    description: 'البيانات المحدثة للحالة',
    schema: {
      type: 'object',
      required: ['status'],
      properties: {
        status: {
          type: 'string',
          enum: ['draft', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
          description: 'الحالة الجديدة',
          example: 'in_progress'
        },
        note: {
          type: 'string',
          description: 'ملاحظة حول تغيير الحالة',
          example: 'بدأ السائق الرحلة'
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'تم تحديث الحالة بنجاح'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'انتقال الحالة غير مسموح'
  })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateAmaniStatusDto) {
    return this.service.updateStatus(id, dto);
  }

  @Get('driver/my-orders')
  @ApiOperation({ 
    summary: 'جلب طلبات السائق',
    description: 'استرجاع قائمة بطلبات السائق المعينة له'
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'فلترة حسب الحالة',
    example: 'in_progress',
    schema: { type: 'string' }
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'تم استرجاع الطلبات بنجاح'
  })
  async getMyDriverOrders(@Query('status') status?: string) {
    // TODO: Get driverId from @CurrentUser decorator when auth is implemented
    // For now, this is a placeholder
    throw new BadRequestException('يجب تسجيل الدخول كسائق');
  }

  @Post(':id/cancel')
  @ApiOperation({ 
    summary: 'إلغاء الطلب',
    description: 'إلغاء طلب نقل نسائي'
  })
  @ApiParam({
    name: 'id',
    description: 'معرف طلب النقل النسائي',
    example: '507f1f77bcf86cd799439012',
    schema: { type: 'string' }
  })
  @ApiBody({
    description: 'سبب الإلغاء',
    schema: {
      type: 'object',
      required: ['reason'],
      properties: {
        reason: {
          type: 'string',
          description: 'سبب الإلغاء',
          example: 'تم الإلغاء من قبل العميل'
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'تم إلغاء الطلب بنجاح'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'لا يمكن إلغاء الطلب'
  })
  async cancel(@Param('id') id: string, @Body() dto: { reason: string }) {
    return this.service.cancel(id, dto.reason, 'user');
  }
}
