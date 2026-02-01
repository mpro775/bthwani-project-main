import { Controller, Get, Post, Body, Param, Query, Patch, Delete, HttpStatus, Req, UseGuards, UnauthorizedException, ForbiddenException } from '@nestjs/common';
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
import { SanadService } from './sanad.service';
import CreateSanadDto from './dto/create-sanad.dto';
import UpdateSanadDto from './dto/update-sanad.dto';

@ApiTags('سند — خدمات متخصصة + فزعة + خيري')
@ApiBearerAuth()
@ApiConsumes('application/json')
@ApiProduces('application/json')
@UseGuards(UnifiedAuthGuard)
@Controller({ path: 'sanad', version: '1' })
export class SanadController {
  constructor(private readonly service: SanadService) {}

  @Post()
  @ApiOperation({ summary: 'إنشاء طلب سند', description: 'إضافة طلب خدمة متخصصة/فزعة/خيري' })
  @ApiBody({
    description: 'بيانات الطلب',
    schema: {
      type: 'object',
      required: ['ownerId', 'title'],
      properties: {
        ownerId: { type: 'string', example: '507f1f77bcf86cd799439011' },
        title: { type: 'string', example: 'طلب فزعة لإسعاف عاجل' },
        description: { type: 'string', example: 'حالة طبية تحتاج نقل عاجل' },
        kind: { type: 'string', enum: ['specialist','emergency','charity'], example: 'emergency' },
        metadata: { type: 'object', example: { location: 'الرياض', contact: '+9665XXXXXXX' } },
        status: { type: 'string', enum: ['draft','pending','confirmed','completed','cancelled'], default: 'draft' }
      }
    }
  })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'تم إنشاء الطلب بنجاح' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'بيانات غير صحيحة' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  create(@Body() dto: CreateSanadDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'قائمة الطلبات', description: 'طلباتي فقط (أو كل الطلبات للأدمن)' })
  @ApiQuery({ name: 'cursor', required: false, description: 'مؤشر الصفحة التالية', example: '507f1f77bcf86cd799439012' })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم الاسترجاع بنجاح' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  findAll(@Query('cursor') cursor?: string, @Req() req?: any) {
    const user = req?.user;
    if (!user?.id) throw new UnauthorizedException('يجب تسجيل الدخول');
    const isAdmin = user.role === 'admin' || user.role === 'superadmin';
    if (isAdmin) return this.service.findAll({ cursor });
    return this.service.findByOwner(user.id, { cursor });
  }

  @Get(':id')
  @ApiOperation({ summary: 'تفاصيل طلب', description: 'استرجاع طلب (لصاحبه أو الأدمن فقط)' })
  @ApiParam({ name: 'id', description: 'معرف الطلب', example: '507f1f77bcf86cd799439012' })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم الاسترجاع بنجاح' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'غير موجود' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'غير مسموح' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  async findOne(@Param('id') id: string, @Req() req?: any) {
    const doc = await this.service.findOne(id);
    const user = req?.user;
    if (!user?.id) throw new UnauthorizedException('يجب تسجيل الدخول');
    const isAdmin = user.role === 'admin' || user.role === 'superadmin';
    const isOwner = doc.ownerId && String(doc.ownerId) === user.id;
    if (!isAdmin && !isOwner) throw new ForbiddenException('غير مسموح بعرض هذا الطلب');
    return doc;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'تحديث طلب', description: 'تحديث بيانات الطلب' })
  @ApiParam({ name: 'id', description: 'معرف الطلب', example: '507f1f77bcf86cd799439012' })
  @ApiBody({
    description: 'الحقول الممكن تحديثها',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'طلب فزعة محدث' },
        description: { type: 'string', example: 'تفاصيل محدثة' },
        kind: { type: 'string', enum: ['specialist','emergency','charity'], example: 'specialist' },
        metadata: { type: 'object', example: { location: 'الدمام' } },
        status: { type: 'string', enum: ['draft','pending','confirmed','completed','cancelled'], example: 'confirmed' }
      }
    }
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم التحديث بنجاح' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'غير موجود' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'بيانات غير صحيحة' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'غير مسموح' })
  async update(@Param('id') id: string, @Body() dto: UpdateSanadDto, @Req() req?: any) {
    const doc = await this.service.findOne(id);
    const user = req?.user;
    if (!user?.id) throw new UnauthorizedException('يجب تسجيل الدخول');
    const isAdmin = user.role === 'admin' || user.role === 'superadmin';
    const isOwner = doc.ownerId && String(doc.ownerId) === user.id;
    if (!isAdmin && !isOwner) throw new ForbiddenException('غير مسموح بتعديل هذا الطلب');
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف طلب', description: 'حذف الطلب نهائياً' })
  @ApiParam({ name: 'id', description: 'معرف الطلب', example: '507f1f77bcf86cd799439012' })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم الحذف بنجاح' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'غير موجود' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'غير مسموح' })
  async remove(@Param('id') id: string, @Req() req?: any) {
    const doc = await this.service.findOne(id);
    const user = req?.user;
    if (!user?.id) throw new UnauthorizedException('يجب تسجيل الدخول');
    const isAdmin = user.role === 'admin' || user.role === 'superadmin';
    const isOwner = doc.ownerId && String(doc.ownerId) === user.id;
    if (!isAdmin && !isOwner) throw new ForbiddenException('غير مسموح بحذف هذا الطلب');
    return this.service.remove(id);
  }

  @Get('my')
  @ApiOperation({ summary: 'طلباتي', description: 'استرجاع طلبات المستخدم الحالي' })
  @ApiQuery({ name: 'cursor', required: false, description: 'مؤشر الصفحة التالية', example: '507f1f77bcf86cd799439012' })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم الاسترجاع بنجاح' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'غير مخول' })
  getMy(@Query('cursor') cursor?: string, @Req() req?: any) {
    const userId = req?.user?.id;
    if (!userId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.service.findByOwner(userId, { cursor });
  }

  @Get('search')
  @ApiOperation({ summary: 'البحث في الطلبات', description: 'البحث في طلباتي (أو كل الطلبات للأدمن)' })
  @ApiQuery({ name: 'q', required: true, description: 'كلمة البحث', example: 'إسعاف' })
  @ApiQuery({ name: 'kind', required: false, description: 'نوع الطلب', enum: ['specialist','emergency','charity'] })
  @ApiQuery({ name: 'cursor', required: false, description: 'مؤشر الصفحة التالية', example: '507f1f77bcf86cd799439012' })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم البحث بنجاح' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'بيانات غير صحيحة' })
  search(
    @Query('q') query: string,
    @Query('kind') kind?: string,
    @Query('cursor') cursor?: string,
    @Req() req?: any
  ) {
    const user = req?.user;
    if (!user?.id) throw new UnauthorizedException('يجب تسجيل الدخول');
    const isAdmin = user.role === 'admin' || user.role === 'superadmin';
    return this.service.search(query, kind as any, { cursor, ownerId: isAdmin ? undefined : user.id });
  }
}
