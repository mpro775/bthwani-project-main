import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UseGuards,
  Req,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiSecurity,
} from '@nestjs/swagger';
import { LegalService } from './legal.service';
import { CreatePrivacyPolicyDto } from './dto/create-privacy-policy.dto';
import { CreateTermsOfServiceDto } from './dto/create-terms-of-service.dto';
import { RecordConsentDto } from './dto/record-consent.dto';
import { Public } from '../../common/decorators/auth.decorator';
import { UnifiedAuthGuard } from '../../common/guards/unified-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/auth.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { Request } from 'express';

interface AuthRequest extends Request {
  user: { userId?: string; id?: string };
}

@ApiTags('Legal')
@Controller('legal')
export class LegalController {
  constructor(private readonly legalService: LegalService) {}

  // ========== Public Endpoints ==========

  @Get('privacy-policy')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Public()
  @ApiOperation({ summary: 'الحصول على سياسة الخصوصية النشطة' })
  @ApiQuery({
    name: 'lang',
    required: false,
    enum: ['ar', 'en'],
    description: 'اللغة (ar أو en)',
  })
  @ApiResponse({
    status: 200,
    description: 'تم الحصول على سياسة الخصوصية بنجاح',
  })
  @ApiResponse({ status: 404, description: 'لا توجد سياسة خصوصية نشطة' })
  async getPrivacyPolicy(@Query('lang') lang: string = 'ar') {
    return this.legalService.getActivePrivacyPolicy(lang);
  }

  @Get('terms-of-service')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Public()
  @ApiOperation({ summary: 'الحصول على شروط الخدمة النشطة' })
  @ApiQuery({
    name: 'lang',
    required: false,
    enum: ['ar', 'en'],
    description: 'اللغة (ar أو en)',
  })
  @ApiResponse({ status: 200, description: 'تم الحصول على شروط الخدمة بنجاح' })
  @ApiResponse({ status: 404, description: 'لا توجد شروط خدمة نشطة' })
  async getTermsOfService(@Query('lang') lang: string = 'ar') {
    return this.legalService.getTermsOfService(lang);
  }

  // ========== User Consent Endpoints ==========
  // ✅ تم نقل Consent Endpoints إلى AuthController - استخدم /auth/consent/*
  // السبب: Consent جزء من Authentication/Authorization flow

  // ========== Admin Endpoints ==========

  @Get('admin/privacy-policies')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(UnifiedAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'الحصول على جميع سياسات الخصوصية (للإدارة)' })
  @ApiResponse({ status: 200, description: 'تم الحصول على السياسات بنجاح' })
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 403, description: 'ممنوع - يتطلب صلاحيات إدارية' })
  async getAllPrivacyPolicies() {
    return this.legalService.getAllPrivacyPolicies();
  }

  @Post('admin/privacy-policy')
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(UnifiedAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'إنشاء سياسة خصوصية جديدة (للإدارة)' })
  @ApiResponse({ status: 201, description: 'تم إنشاء السياسة بنجاح' })
  @ApiResponse({ status: 400, description: 'بيانات غير صحيحة' })
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 403, description: 'ممنوع - يتطلب صلاحيات إدارية' })
  async createPrivacyPolicy(@Body() dto: CreatePrivacyPolicyDto) {
    return this.legalService.createPrivacyPolicy(dto);
  }

  @Patch('admin/privacy-policy/:id/activate')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(UnifiedAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'تفعيل سياسة خصوصية معينة (للإدارة)' })
  @ApiResponse({ status: 200, description: 'تم تفعيل السياسة بنجاح' })
  @ApiResponse({ status: 404, description: 'السياسة غير موجودة' })
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 403, description: 'ممنوع - يتطلب صلاحيات إدارية' })
  async activatePrivacyPolicy(@Param('id') id: string) {
    return this.legalService.activatePrivacyPolicy(id);
  }

  @Get('admin/terms-of-service')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(UnifiedAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'الحصول على جميع شروط الخدمة (للإدارة)' })
  @ApiResponse({ status: 200, description: 'تم الحصول على الشروط بنجاح' })
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 403, description: 'ممنوع - يتطلب صلاحيات إدارية' })
  async getAllTermsOfService() {
    return this.legalService.getAllTermsOfService();
  }

  @Post('admin/terms-of-service')
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(UnifiedAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'إنشاء شروط خدمة جديدة (للإدارة)' })
  @ApiResponse({ status: 201, description: 'تم إنشاء الشروط بنجاح' })
  @ApiResponse({ status: 400, description: 'بيانات غير صحيحة' })
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 403, description: 'ممنوع - يتطلب صلاحيات إدارية' })
  async createTermsOfService(@Body() dto: CreateTermsOfServiceDto) {
    return this.legalService.createTermsOfService(dto);
  }

  @Patch('admin/terms-of-service/:id/activate')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(UnifiedAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'تفعيل شروط خدمة معينة (للإدارة)' })
  @ApiResponse({ status: 200, description: 'تم تفعيل الشروط بنجاح' })
  @ApiResponse({ status: 404, description: 'الشروط غير موجودة' })
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 403, description: 'ممنوع - يتطلب صلاحيات إدارية' })
  async activateTermsOfService(@Param('id') id: string) {
    return this.legalService.activateTermsOfService(id);
  }

  @Get('admin/consent/statistics')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(UnifiedAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'الحصول على إحصائيات الموافقات (للإدارة)' })
  @ApiResponse({ status: 200, description: 'تم الحصول على الإحصائيات بنجاح' })
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 403, description: 'ممنوع - يتطلب صلاحيات إدارية' })
  async getConsentStatistics() {
    return this.legalService.getConsentStatistics();
  }
}

