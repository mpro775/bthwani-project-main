import { Controller, Get, Post, Patch, Delete, Body, Param, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { UnifiedAuthGuard } from '../../common/guards/unified-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Auth, Roles } from '../../common/decorators/auth.decorator';
import { AuthType } from '../../common/guards/unified-auth.guard';
import { KenzCategoryService } from '../kenz/kenz-category.service';
import CreateKenzCategoryDto from '../kenz/dto/create-kenz-category.dto';
import UpdateKenzCategoryDto from '../kenz/dto/update-kenz-category.dto';

@ApiTags('Admin:Kenz – الفئات')
@ApiBearerAuth()
@Controller({ path: 'admin/kenz/categories', version: '1' })
@UseGuards(UnifiedAuthGuard, RolesGuard)
@Auth(AuthType.JWT)
@Roles('admin', 'superadmin')
export class AdminKenzCategoriesController {
  constructor(private readonly categoryService: KenzCategoryService) {}

  @Get()
  @ApiOperation({ summary: 'قائمة فئات كنز', description: 'استرجاع جميع الفئات (قائمة مسطحة)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم الاسترجاع بنجاح' })
  list() {
    return this.categoryService.findAll();
  }

  @Get('tree')
  @ApiOperation({ summary: 'شجرة فئات كنز', description: 'استرجاع الفئات بشكل شجري' })
  @ApiResponse({ status: HttpStatus.OK, description: 'شجرة الفئات' })
  getTree() {
    return this.categoryService.getTree();
  }

  @Post()
  @ApiOperation({ summary: 'إنشاء فئة جديدة' })
  @ApiBody({ type: CreateKenzCategoryDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'تم إنشاء الفئة' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'slug مكرر' })
  create(@Body() dto: CreateKenzCategoryDto) {
    return this.categoryService.create(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'تفاصيل فئة' })
  @ApiParam({ name: 'id', description: 'معرف الفئة' })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم الاسترجاع بنجاح' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'الفئة غير موجودة' })
  getOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'تحديث فئة' })
  @ApiParam({ name: 'id', description: 'معرف الفئة' })
  @ApiBody({ type: UpdateKenzCategoryDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم التحديث' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'الفئة غير موجودة' })
  update(@Param('id') id: string, @Body() dto: UpdateKenzCategoryDto) {
    return this.categoryService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف فئة' })
  @ApiParam({ name: 'id', description: 'معرف الفئة' })
  @ApiResponse({ status: HttpStatus.OK, description: 'تم الحذف' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'الفئة غير موجودة' })
  remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }
}
