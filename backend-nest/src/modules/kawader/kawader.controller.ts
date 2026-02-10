import { Controller, Get, Post, Body, Param, Query, Patch, Delete, HttpStatus, UseGuards, Req, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
import { KawaderService } from './kawader.service';
import CreateKawaderDto from './dto/create-kawader.dto';
import UpdateKawaderDto from './dto/update-kawader.dto';
import ApplyKawaderDto from './dto/apply-kawader.dto';
import ApplicationStatusDto from './dto/application-status.dto';
import CreatePortfolioItemDto from './dto/create-portfolio-item.dto';
import CreateReviewDto from './dto/create-review.dto';

interface RequestWithUser extends Request {
  user?: { id?: string; _id?: string };
}

@ApiTags('كوادر — الوظائف والخدمات المهنية')
@ApiBearerAuth()
@ApiConsumes('application/json', 'multipart/form-data')
@ApiProduces('application/json')
@UseGuards(UnifiedAuthGuard)
@Controller('kawader')
export class KawaderController {
  constructor(private readonly service: KawaderService) {}

  private getUserId(req: RequestWithUser): string | undefined {
    const u = req.user;
    return u ? (u._id ?? u.id) : undefined;
  }

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
    description: 'استرجاع قائمة العروض الوظيفية مع دعم التنقل والفلترة'
  })
  @ApiQuery({ name: 'cursor', required: false, description: 'مؤشر الصفحة التالية', example: '507f1f77bcf86cd799439012' })
  @ApiQuery({ name: 'offerType', required: false, description: 'نوع العرض: job أو service', enum: ['job', 'service'] })
  @ApiQuery({ name: 'jobType', required: false, description: 'نوع الوظيفة: full_time، part_time، remote', enum: ['full_time', 'part_time', 'remote'] })
  @ApiQuery({ name: 'location', required: false, description: 'الموقع أو المدينة' })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم الاسترجاع بنجاح' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  findAll(
    @Query('cursor') cursor?: string,
    @Query('offerType') offerType?: string,
    @Query('jobType') jobType?: string,
    @Query('location') location?: string,
  ) {
    return this.service.findAll({ cursor, offerType, jobType, location });
  }

  @Get('my')
  @ApiOperation({ 
    summary: 'عروضي',
    description: 'استرجاع العروض الوظيفية التي أنشأتها أنا فقط'
  })
  @ApiQuery({ name: 'cursor', required: false, description: 'مؤشر الصفحة التالية' })
  @ApiQuery({ name: 'limit', required: false, description: 'عدد العناصر (حد أقصى 50)', example: 25 })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم الاسترجاع بنجاح' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  getMy(@Req() req: RequestWithUser, @Query('cursor') cursor?: string, @Query('limit') limit?: number) {
    const userId = this.getUserId(req) ?? '';
    return this.service.findMy(userId, { cursor, limit: limit ? Number(limit) : undefined });
  }

  @Get('search')
  @ApiOperation({ 
    summary: 'البحث في العروض',
    description: 'البحث في العناوين والأوصاف والمهارات مع فلترة حسب النوع والموقع والحالة والميزانية'
  })
  @ApiQuery({ name: 'q', required: false, description: 'نص البحث في العنوان أو الوصف أو المهارات' })
  @ApiQuery({ name: 'status', required: false, description: 'فلترة حسب الحالة' })
  @ApiQuery({ name: 'offerType', required: false, description: 'نوع العرض: job أو service', enum: ['job', 'service'] })
  @ApiQuery({ name: 'jobType', required: false, description: 'نوع الوظيفة: full_time، part_time، remote', enum: ['full_time', 'part_time', 'remote'] })
  @ApiQuery({ name: 'location', required: false, description: 'الموقع أو المدينة' })
  @ApiQuery({ name: 'budgetMin', required: false, description: 'الحد الأدنى للميزانية' })
  @ApiQuery({ name: 'budgetMax', required: false, description: 'الحد الأقصى للميزانية' })
  @ApiQuery({ name: 'cursor', required: false, description: 'مؤشر الصفحة التالية' })
  @ApiQuery({ name: 'limit', required: false, description: 'عدد العناصر (حد أقصى 50)', example: 25 })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم البحث بنجاح' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  search(
    @Query('q') q?: string,
    @Query('status') status?: string,
    @Query('offerType') offerType?: string,
    @Query('jobType') jobType?: string,
    @Query('location') location?: string,
    @Query('budgetMin') budgetMin?: string,
    @Query('budgetMax') budgetMax?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.search({
      q,
      status,
      offerType,
      jobType,
      location,
      budgetMin: budgetMin != null ? Number(budgetMin) : undefined,
      budgetMax: budgetMax != null ? Number(budgetMax) : undefined,
      cursor,
      limit: limit != null ? Number(limit) : undefined,
    });
  }

  @Post('portfolio/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowed.includes(file.mimetype)) cb(null, true);
        else cb(new BadRequestException('نوع الملف غير مدعوم') as any, false);
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'رفع صورة لمعرض الأعمال', description: 'يرجع معرف الوسيط لاستخدامه في إضافة عنصر المعرض' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'تم الرفع بنجاح' })
  uploadPortfolioImage(@Req() req: RequestWithUser, @UploadedFile() file: Express.Multer.File) {
    const userId = this.getUserId(req) ?? '';
    if (!file) throw new BadRequestException('لم يتم اختيار ملف للرفع');
    return this.service.uploadPortfolioImage(file, userId);
  }

  @Post('portfolio')
  @ApiOperation({ summary: 'إضافة عنصر معرض', description: 'إضافة عنصر لمعرض أعمالي (وسائط + وصف)' })
  @ApiBody({
    description: 'بيانات عنصر المعرض',
    schema: {
      type: 'object',
      properties: {
        mediaIds: { type: 'array', items: { type: 'string' }, example: ['507f1f77bcf86cd799439011'] },
        caption: { type: 'string', example: 'مشروع تصميم شعار' },
      },
    },
  })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'تمت الإضافة بنجاح' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'بيانات غير صحيحة' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  addPortfolioItem(@Req() req: RequestWithUser, @Body() dto: CreatePortfolioItemDto) {
    const userId = this.getUserId(req) ?? '';
    return this.service.addPortfolioItem(userId, dto);
  }

  @Get('portfolio/me')
  @ApiOperation({ summary: 'معرضي', description: 'عناصر معرض أعمالي الخاصة بي' })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم الاسترجاع بنجاح' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  getMyPortfolio(@Req() req: RequestWithUser) {
    const userId = this.getUserId(req) ?? '';
    return this.service.getMyPortfolio(userId);
  }

  @Get('portfolio/user/:userId')
  @ApiOperation({ summary: 'معرض مستخدم', description: 'عناصر معرض أعمال مستخدم (عام)' })
  @ApiParam({ name: 'userId', description: 'معرف المستخدم', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم الاسترجاع بنجاح' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  getPortfolioByUser(@Param('userId') userId: string) {
    return this.service.getPortfolioByUser(userId);
  }

  @Delete('portfolio/:itemId')
  @ApiOperation({ summary: 'حذف عنصر معرض', description: 'حذف عنصر من معرضي — للمالك فقط' })
  @ApiParam({ name: 'itemId', description: 'معرف عنصر المعرض', example: '507f1f77bcf86cd799439012' })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم الحذف بنجاح' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'غير مصرح' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'العنصر غير موجود' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  removePortfolioItem(@Req() req: RequestWithUser, @Param('itemId') itemId: string) {
    const userId = this.getUserId(req) ?? '';
    return this.service.removePortfolioItem(itemId, userId);
  }

  @Get('reviews/user/:userId')
  @ApiOperation({ summary: 'مراجعات مستخدم', description: 'قائمة مراجعات مستخدم (للملف العام) مع متوسط التقييم وعدد المراجعات' })
  @ApiParam({ name: 'userId', description: 'معرف المستخدم (المُقيَّم)', example: '507f1f77bcf86cd799439011' })
  @ApiQuery({ name: 'cursor', required: false, description: 'مؤشر الصفحة التالية' })
  @ApiQuery({ name: 'limit', required: false, description: 'عدد العناصر (حد أقصى 50)', example: 25 })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم الاسترجاع بنجاح' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  getReviewsByUser(
    @Param('userId') userId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.getReviewsByUser(userId, {
      cursor,
      limit: limit != null ? Number(limit) : undefined,
    });
  }

  @Get('applications/my')
  @ApiOperation({ summary: 'تقدماتي', description: 'قائمة التقديمات التي أرسلتها أنا' })
  @ApiQuery({ name: 'cursor', required: false, description: 'مؤشر الصفحة التالية' })
  @ApiQuery({ name: 'limit', required: false, description: 'عدد العناصر (حد أقصى 50)', example: 25 })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم الاسترجاع بنجاح' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  getMyApplications(
    @Req() req: RequestWithUser,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    const userId = this.getUserId(req) ?? '';
    return this.service.getMyApplications(userId, {
      cursor,
      limit: limit != null ? Number(limit) : undefined,
    });
  }

  @Post(':id/apply')
  @ApiOperation({ summary: 'تقدم الآن', description: 'إرسال طلب تقديم على عرض وظيفي' })
  @ApiParam({ name: 'id', description: 'معرف العرض', example: '507f1f77bcf86cd799439012' })
  @ApiBody({
    description: 'رسالة التقديم (اختيارية)',
    schema: { type: 'object', properties: { coverNote: { type: 'string', example: 'لدي خبرة 4 سنوات...' } } },
  })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'تم إرسال التقديم بنجاح' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'تقديم مسبق أو عرضك الخاص' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'العرض غير موجود' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  apply(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: ApplyKawaderDto,
  ) {
    const userId = this.getUserId(req) ?? '';
    return this.service.apply(id, userId, dto);
  }

  @Get(':id/applications')
  @ApiOperation({ summary: 'تقديمات عرض (للمالك)', description: 'قائمة التقديمات على عرض معين — للمالك فقط' })
  @ApiParam({ name: 'id', description: 'معرف العرض', example: '507f1f77bcf86cd799439012' })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم الاسترجاع بنجاح' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'غير مصرح' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'العرض غير موجود' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  getKawaderApplications(@Req() req: RequestWithUser, @Param('id') id: string) {
    const ownerId = this.getUserId(req) ?? '';
    return this.service.getApplicationsByKawader(id, ownerId);
  }

  @Patch('applications/:appId/status')
  @ApiOperation({ summary: 'تحديث حالة تقديم (للمالك)', description: 'قبول أو رفض تقديم — للمالك فقط' })
  @ApiParam({ name: 'appId', description: 'معرف التقديم', example: '507f1f77bcf86cd799439012' })
  @ApiBody({
    description: 'الحالة الجديدة',
    schema: { type: 'object', required: ['status'], properties: { status: { type: 'string', enum: ['accepted', 'rejected'] } } },
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم تحديث الحالة بنجاح' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'غير مصرح' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'التقديم غير موجود' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  updateApplicationStatus(
    @Req() req: RequestWithUser,
    @Param('appId') appId: string,
    @Body() dto: ApplicationStatusDto,
  ) {
    const ownerId = this.getUserId(req) ?? '';
    return this.service.updateApplicationStatus(appId, ownerId, dto.status);
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

  @Post(':id/review')
  @ApiOperation({ summary: 'كتابة مراجعة', description: 'تقييم صاحب العرض/مقدم الخدمة بعد التعامل (1–5 نجوم + تعليق اختياري)' })
  @ApiParam({ name: 'id', description: 'معرف العرض', example: '507f1f77bcf86cd799439012' })
  @ApiBody({
    description: 'المراجعة',
    schema: {
      type: 'object',
      required: ['rating'],
      properties: {
        rating: { type: 'number', minimum: 1, maximum: 5, example: 5 },
        comment: { type: 'string', example: 'تعامل ممتاز' },
      },
    },
  })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'تمت إضافة المراجعة بنجاح' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'مراجعة مسبقة أو تقييم نفسك' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'العرض غير موجود' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  createReview(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: CreateReviewDto,
  ) {
    const reviewerId = this.getUserId(req) ?? '';
    return this.service.createReview(id, reviewerId, dto);
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
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'غير مصرح بتعديل هذا العرض' })
  update(@Req() req: RequestWithUser, @Param('id') id: string, @Body() dto: UpdateKawaderDto) {
    const userId = this.getUserId(req);
    return this.service.update(id, dto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف عرض وظيفي', description: 'حذف العرض الوظيفي نهائياً' })
  @ApiParam({ name: 'id', description: 'معرف العرض', example: '507f1f77bcf86cd799439012' })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم الحذف بنجاح' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'غير موجود' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'غير مصرح بحذف هذا العرض' })
  remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    const userId = this.getUserId(req);
    return this.service.remove(id, userId);
  }
}
