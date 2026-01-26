import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiSecurity,
} from '@nestjs/swagger';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { ConsentService } from './services/consent.service';
import { RegisterDto } from './dto/register.dto';
import { FirebaseAuthDto } from './dto/firebase-auth.dto';
import { ConsentDto, BulkConsentDto, ConsentType } from './dto/consent.dto';
import {
  ForgotPasswordDto,
  VerifyResetCodeDto,
  ResetPasswordDto,
  VerifyOtpDto,
} from './dto/password-reset.dto';
import { UnifiedAuthGuard } from '../../common/guards/unified-auth.guard';
import {
  Auth,
  CurrentUser,
  Public,
} from '../../common/decorators/auth.decorator';
import { AuthType } from '../../common/guards/unified-auth.guard';

@ApiTags('Auth')
@Controller({ path: 'auth', version: ['1', '2'] })
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly consentService: ConsentService,
  ) {}

  @Public()
  @Throttle({ auth: { ttl: 60000, limit: 5 } }) // ✅ 5 محاولات تسجيل دخول في الدقيقة
  @Post('firebase/login')
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'تسجيل الدخول عبر Firebase' })
  async loginWithFirebase(@Body() firebaseAuthDto: FirebaseAuthDto) {
    return this.authService.loginWithFirebase(firebaseAuthDto.idToken);
  }

  @Public()
  @Throttle({ auth: { ttl: 60000, limit: 5 } })
  @Post('driver/login')
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'تسجيل دخول السائق' })
  async driverLogin(@Body() loginDto: { email: string; password: string }) {
    return this.authService.driverLogin(loginDto.email, loginDto.password);
  }

  // ==================== Consent Management ====================

  @ApiBearerAuth()
  @UseGuards(UnifiedAuthGuard)
  @Auth(AuthType.FIREBASE)
  @Throttle({ strict: { ttl: 60000, limit: 10 } }) // ✅ 10 موافقات في الدقيقة
  @Post('consent')
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'تسجيل موافقة المستخدم' })
  async grantConsent(
    @CurrentUser('id') userId: string,
    @Body() consentDto: ConsentDto,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || (req.headers['x-forwarded-for'] as string);
    const userAgent = req.headers['user-agent'];

    const consent = await this.consentService.recordConsent(
      userId,
      consentDto,
      ipAddress,
      userAgent,
    );

    return {
      success: true,
      message: 'تم تسجيل الموافقة بنجاح',
      data: consent,
    };
  }

  @ApiBearerAuth()
  @UseGuards(UnifiedAuthGuard)
  @Auth(AuthType.FIREBASE)
  @Post('consent/bulk')
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'تسجيل موافقات متعددة دفعة واحدة' })
  async grantBulkConsents(
    @CurrentUser('id') userId: string,
    @Body() bulkConsentDto: BulkConsentDto,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || (req.headers['x-forwarded-for'] as string);
    const userAgent = req.headers['user-agent'];

    const consents = await this.consentService.recordBulkConsents(
      userId,
      bulkConsentDto.consents,
      ipAddress,
      userAgent,
    );

    return {
      success: true,
      message: `تم تسجيل ${consents.length} موافقة بنجاح`,
      data: consents,
    };
  }

  @ApiBearerAuth()
  @UseGuards(UnifiedAuthGuard)
  @Auth(AuthType.FIREBASE)
  @Delete('consent/:type')
  @ApiParam({ name: 'type', type: String })
  @ApiResponse({ status: 200, description: 'Deleted' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'سحب الموافقة' })
  @ApiParam({ name: 'type', enum: ConsentType, description: 'نوع الموافقة' })
  async withdrawConsent(
    @CurrentUser('id') userId: string,
    @Param('type') type: ConsentType,
    @Body('reason') reason?: string,
  ) {
    const consent = await this.consentService.withdrawConsent(
      userId,
      type,
      reason,
    );

    return {
      success: true,
      message: 'تم سحب الموافقة بنجاح',
      data: consent,
    };
  }

  @ApiBearerAuth()
  @UseGuards(UnifiedAuthGuard)
  @Auth(AuthType.FIREBASE)
  @Get('consent/history')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'سجل موافقات المستخدم' })
  @ApiQuery({ name: 'type', enum: ConsentType, required: false })
  async getConsentHistory(
    @CurrentUser('id') userId: string,
    @Query('type') type?: ConsentType,
  ) {
    const history = await this.consentService.getConsentHistory(userId, type);

    return {
      success: true,
      data: history,
      count: history.length,
    };
  }

  @ApiBearerAuth()
  @UseGuards(UnifiedAuthGuard)
  @Auth(AuthType.FIREBASE)
  @Get('consent/summary')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'ملخص موافقات المستخدم' })
  async getConsentSummary(@CurrentUser('id') userId: string) {
    const summary = await this.consentService.getConsentSummary(userId);

    return {
      success: true,
      data: summary,
    };
  }

  @ApiBearerAuth()
  @UseGuards(UnifiedAuthGuard)
  @Auth(AuthType.FIREBASE)
  @Get('consent/check/:type')
  @ApiParam({ name: 'type', type: String })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'التحقق من موافقة محددة' })
  @ApiParam({ name: 'type', enum: ConsentType, description: 'نوع الموافقة' })
  async checkConsent(
    @CurrentUser('id') userId: string,
    @Param('type') type: ConsentType,
  ) {
    const hasConsent = await this.consentService.checkConsent(userId, type);

    return {
      success: true,
      data: {
        consentType: type,
        hasActiveConsent: hasConsent,
      },
    };
  }

  // ==================== Password Reset (Traditional) ====================

  @Public()
  @Throttle({ auth: { ttl: 60000, limit: 3 } })
  @Post('forgot')
  @ApiResponse({ status: 201, description: 'Reset code sent' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiOperation({ summary: 'طلب إعادة تعيين كلمة المرور' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.authService.requestPasswordReset(dto.emailOrPhone);
    return {
      success: true,
      message: 'تم إرسال رمز إعادة التعيين',
      userMessage: 'تم إرسال رمز التحقق إلى بريدك الإلكتروني أو هاتفك',
    };
  }

  @Public()
  @Throttle({ auth: { ttl: 60000, limit: 5 } })
  @Post('reset/verify')
  @ApiResponse({ status: 200, description: 'Code verified' })
  @ApiResponse({ status: 400, description: 'Invalid code' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiOperation({ summary: 'التحقق من رمز إعادة التعيين' })
  async verifyResetCode(@Body() dto: VerifyResetCodeDto) {
    const isValid = await this.authService.verifyResetCode(
      dto.emailOrPhone,
      dto.code,
    );
    return {
      success: true,
      message: isValid ? 'الرمز صحيح' : 'الرمز غير صحيح',
      data: { valid: isValid },
    };
  }

  @Public()
  @Throttle({ auth: { ttl: 60000, limit: 3 } })
  @Post('reset')
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid code or password' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiOperation({ summary: 'إعادة تعيين كلمة المرور' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(
      dto.emailOrPhone,
      dto.code,
      dto.newPassword,
    );
    return {
      success: true,
      message: 'تم إعادة تعيين كلمة المرور بنجاح',
      userMessage: 'تم تغيير كلمة المرور بنجاح، يمكنك تسجيل الدخول الآن',
    };
  }

  @Public()
  @Throttle({ auth: { ttl: 60000, limit: 5 } })
  @Post('verify-otp')
  @ApiResponse({ status: 200, description: 'OTP verified' })
  @ApiResponse({ status: 400, description: 'Invalid OTP' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiOperation({ summary: 'التحقق من رمز OTP' })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    const result = await this.authService.verifyOtp(dto.phone, dto.otp);
    return {
      success: true,
      message: 'تم التحقق من الرمز بنجاح',
      data: result,
    };
  }
}

