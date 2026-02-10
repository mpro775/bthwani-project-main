import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
  Delete,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
  ApiConsumes,
  ApiProduces,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { UnifiedAuthGuard } from '../../common/guards/unified-auth.guard';
import { Es3afniService } from './es3afni.service';
import { Es3afniDonorService } from './es3afni-donor.service';
import CreateEs3afniDto from './dto/create-es3afni.dto';
import UpdateEs3afniDto from './dto/update-es3afni.dto';
import CreateDonorDto from './dto/create-donor.dto';
import UpdateDonorDto from './dto/update-donor.dto';

interface RequestWithUser extends Request {
  user?: { id?: string };
}

@ApiTags('اسعفني — شبكة تبرع بالدم عاجلة')
@ApiBearerAuth()
@ApiConsumes('application/json')
@ApiProduces('application/json')
@UseGuards(UnifiedAuthGuard)
@Controller('es3afni')
export class Es3afniController {
  constructor(
    private readonly service: Es3afniService,
    private readonly donorService: Es3afniDonorService,
  ) {}

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
        description: { type: 'string' },
        bloodType: { type: 'string', example: 'O+' },
        urgency: { type: 'string', enum: ['low', 'normal', 'urgent', 'critical'] },
        location: { type: 'object', example: { lat: 24.7136, lng: 46.6753, address: 'الرياض' } },
        metadata: { type: 'object' },
        status: { type: 'string', enum: ['draft', 'pending', 'confirmed', 'completed', 'cancelled', 'expired'], default: 'draft' },
      },
    },
  })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'تم إنشاء البلاغ بنجاح' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'بيانات غير صحيحة' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  create(@Body() dto: CreateEs3afniDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'قائمة البلاغات', description: 'استرجاع قائمة البلاغات مع دعم الفلترة و cursor' })
  @ApiQuery({ name: 'cursor', required: false, description: 'مؤشر الصفحة التالية' })
  @ApiQuery({ name: 'bloodType', required: false, description: 'فلترة حسب فصيلة الدم', example: 'O+' })
  @ApiQuery({ name: 'status', required: false, description: 'فلترة حسب الحالة' })
  @ApiQuery({ name: 'urgency', required: false, description: 'فلترة حسب الأولوية' })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم الاسترجاع بنجاح' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  findAll(
    @Query('cursor') cursor?: string,
    @Query('bloodType') bloodType?: string,
    @Query('status') status?: string,
    @Query('urgency') urgency?: string,
  ) {
    return this.service.findAll({ cursor, bloodType, status, urgency });
  }

  @Get('my')
  @ApiOperation({ summary: 'بلاغاتي الخاصة', description: 'استرجاع بلاغات تبرع بالدم التي أنشأتها' })
  @ApiQuery({ name: 'cursor', required: false, description: 'مؤشر الصفحة التالية' })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم الاسترجاع بنجاح' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  getMy(@Req() req: RequestWithUser, @Query('cursor') cursor?: string) {
    const userId = req.user?.id ?? '';
    return this.service.findMy(userId, { cursor });
  }

  @Get('search')
  @ApiOperation({ summary: 'البحث في البلاغات', description: 'البحث في بلاغات تبرع بالدم بناءً على استعلام النص والفلترة' })
  @ApiQuery({ name: 'q', required: false, description: 'استعلام البحث في العنوان والوصف' })
  @ApiQuery({ name: 'bloodType', required: false, description: 'فلترة حسب فصيلة الدم', example: 'O+' })
  @ApiQuery({ name: 'status', required: false, description: 'فلترة حسب الحالة' })
  @ApiQuery({ name: 'cursor', required: false, description: 'مؤشر الصفحة التالية' })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم البحث بنجاح' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  search(
    @Query('q') q?: string,
    @Query('bloodType') bloodType?: string,
    @Query('status') status?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.service.search({ q, bloodType, status, cursor });
  }

  @Get('donors/nearby')
  @ApiOperation({ summary: 'متبرعون قريبون', description: 'قائمة متبرعين متاحين قرب موقع معين' })
  @ApiQuery({ name: 'lat', required: true, description: 'خط العرض', example: '24.7136' })
  @ApiQuery({ name: 'lng', required: true, description: 'خط الطول', example: '46.6753' })
  @ApiQuery({ name: 'radiusKm', required: false, description: 'نصف القطر بالكم', example: '50' })
  @ApiQuery({ name: 'bloodType', required: false, description: 'فصيلة الدم', example: 'O+' })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم الاسترجاع بنجاح' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  getDonorsNearby(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radiusKm') radiusKm?: string,
    @Query('bloodType') bloodType?: string,
  ) {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (isNaN(latNum) || isNaN(lngNum)) {
      return { items: [] };
    }
    return this.donorService.findDonorsNearby({
      lat: latNum,
      lng: lngNum,
      radiusKm: radiusKm ? parseFloat(radiusKm) : undefined,
      bloodType,
    }).then((items) => ({ items }));
  }

  @Get('donors/me')
  @ApiOperation({ summary: 'ملف المتبرع الحالي', description: 'استرجاع أو عدم وجود ملف متبرع للمستخدم الحالي' })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم الاسترجاع بنجاح' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'لم يسجل كمتبرع بعد' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  getMyDonorProfile(@Req() req: RequestWithUser) {
    const userId = req.user?.id ?? '';
    return this.donorService.getMyDonorProfile(userId);
  }

  @Post('donors/me')
  @ApiOperation({ summary: 'تسجيل كمتبرع', description: 'إنشاء أو تحديث ملف المتبرع للمستخدم الحالي' })
  @ApiBody({ description: 'بيانات المتبرع', type: CreateDonorDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'تم التسجيل بنجاح' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'بيانات غير صحيحة' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  registerDonor(@Req() req: RequestWithUser, @Body() dto: CreateDonorDto) {
    const userId = req.user?.id ?? '';
    return this.donorService.registerDonor(userId, dto);
  }

  @Patch('donors/me')
  @ApiOperation({ summary: 'تحديث ملف المتبرع', description: 'تحديث بيانات المتبرع للمستخدم الحالي' })
  @ApiBody({ description: 'الحقول الممكن تحديثها', type: UpdateDonorDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم التحديث بنجاح' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'لم يسجل كمتبرع بعد' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  updateDonor(@Req() req: RequestWithUser, @Body() dto: UpdateDonorDto) {
    const userId = req.user?.id ?? '';
    return this.donorService.updateDonor(userId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'تفاصيل بلاغ', description: 'استرجاع بلاغ بواسطة المعرف' })
  @ApiParam({ name: 'id', description: 'معرف البلاغ' })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم الاسترجاع بنجاح' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'غير موجود' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'تحديث بلاغ', description: 'تحديث بيانات بلاغ تبرع بالدم' })
  @ApiParam({ name: 'id', description: 'معرف البلاغ' })
  @ApiBody({
    description: 'الحقول الممكن تحديثها',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        bloodType: { type: 'string', example: 'O+' },
        urgency: { type: 'string', enum: ['low', 'normal', 'urgent', 'critical'] },
        location: { type: 'object' },
        metadata: { type: 'object' },
        status: { type: 'string', enum: ['draft', 'pending', 'confirmed', 'completed', 'cancelled', 'expired'] },
      },
    },
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
  @ApiParam({ name: 'id', description: 'معرف البلاغ' })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم الحذف بنجاح' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'غير موجود' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
