import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
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
  ApiBody,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { ConsentService } from './services/consent.service';
import { AuthResponse, VerifyOtpResponse } from './types/auth.types';
import { ConsentDto, BulkConsentDto, ConsentType } from './dto/consent.dto';
import {
  ForgotPasswordDto,
  VerifyResetCodeDto,
  ResetPasswordDto,
  VerifyOtpDto,
} from './dto/password-reset.dto';
import { RegisterLocalDto } from './dto/register-local.dto';
import { LoginLocalDto } from './dto/login-local.dto';
import { VerifyEmailOtpDto } from './dto/verify-email-otp.dto';
import { DriverLoginDto } from './dto/driver-login.dto';
import { UnifiedAuthGuard } from '../../common/guards/unified-auth.guard';
import {
  Auth,
  CurrentUser,
  Public,
} from '../../common/decorators/auth.decorator';
import { AuthType } from '../../common/guards/unified-auth.guard';

@ApiTags('Auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly consentService: ConsentService,
  ) {}

  @Public()
  @Throttle({ auth: { ttl: 60000, limit: 5 } })
  @Post('driver/login')
  @ApiBody({ type: DriverLoginDto })
  @ApiResponse({ status: 201, description: 'تم تسجيل الدخول بنجاح' })
  @ApiResponse({ status: 400, description: 'بيانات غير صالحة (رقم هاتف أو كلمة مرور)' })
  @ApiResponse({ status: 401, description: 'بيانات الدخول غير صحيحة' })
  @ApiOperation({ summary: 'تسجيل دخول السائق' })
  async driverLogin(@Body() loginDto: DriverLoginDto) {
    return this.authService.driverLogin(loginDto.phone, loginDto.password);
  }

  // ==================== Marketer Authentication ====================

  @Public()
  @Throttle({ auth: { ttl: 60000, limit: 5 } })
  @Post('marketer-login')
  @ApiResponse({
    status: 200,
    description: 'تسجيل دخول المسوق بنجاح',
    schema: {
      example: {
        success: true,
        message: 'تم تسجيل الدخول بنجاح',
        data: {
          user: { id: '...', fullName: '...', email: '...' },
          token: { accessToken: '...', tokenType: 'Bearer', expiresIn: '30d' },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiOperation({ summary: 'تسجيل دخول المسوق' })
  async marketerLogin(@Body() loginDto: LoginLocalDto): Promise<{
    success: boolean;
    message: string;
    data: { user: { id: string; fullName: string; email?: string }; token: { accessToken: string; tokenType: string; expiresIn: string } };
  }> {
    const result = await this.authService.marketerLogin(
      loginDto.email,
      loginDto.password,
    );
    return {
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      data: result,
    };
  }

  @ApiBearerAuth()
  @UseGuards(UnifiedAuthGuard)
  @Auth(AuthType.MARKETER_JWT)
  @Get('me')
  @ApiResponse({
    status: 200,
    description: 'بيانات المسوق الحالي',
    schema: {
      example: {
        success: true,
        data: {
          user: { id: '...', fullName: '...', email: '...', phone: '...' },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'المسوق الحالي (Marketer JWT فقط)' })
  async getMe(@CurrentUser('id') marketerId: string) {
    const profile = await this.authService.getMarketerProfile(marketerId);
    return {
      success: true,
      data: profile,
    };
  }

  @ApiBearerAuth()
  @UseGuards(UnifiedAuthGuard)
  @Auth(AuthType.MARKETER_JWT)
  @Post('push-token')
  @ApiResponse({ status: 200, description: 'تم حفظ رمز الإشعارات' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'ربط Expo push token بحساب المسوق' })
  async pushToken(
    @CurrentUser('id') marketerId: string,
    @Body() body: { pushToken: string },
  ) {
    const result = await this.authService.updateMarketerPushToken(
      marketerId,
      body.pushToken,
    );
    return { ...result, success: true };
  }

  // ==================== Local Authentication ====================

  @Public()
  @Throttle({ auth: { ttl: 60000, limit: 5 } })
  @Post('register')
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  @ApiOperation({ summary: 'تسجيل حساب جديد' })
  async register(@Body() registerDto: RegisterLocalDto): Promise<{
    success: boolean;
    message: string;
    data: AuthResponse;
  }> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const result = await this.authService.registerLocal(registerDto);
    return {
      success: true,
      message: 'تم إنشاء الحساب بنجاح',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: result,
    };
  }

  @Public()
  @Throttle({ auth: { ttl: 60000, limit: 5 } })
  @Post('login')
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiOperation({ summary: 'تسجيل الدخول' })
  async login(@Body() loginDto: LoginLocalDto): Promise<{
    success: boolean;
    message: string;
    data: AuthResponse;
  }> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const result = await this.authService.loginLocal(
      loginDto.email,
      loginDto.password,
    );
    return {
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: result,
    };
  }

  @ApiBearerAuth()
  @UseGuards(UnifiedAuthGuard)
  @Auth(AuthType.JWT)
  @Throttle({ strict: { ttl: 60000, limit: 5 } })
  @Post('verify-email-otp')
  @ApiResponse({ status: 200, description: 'OTP verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({ summary: 'التحقق من رمز OTP عبر البريد الإلكتروني' })
  async verifyEmailOtp(
    @CurrentUser('id') userId: string,
    @Body() dto: VerifyEmailOtpDto,
  ): Promise<{
    success: boolean;
    message: string;
    data: VerifyOtpResponse;
  }> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const result = await this.authService.verifyEmailOtp(userId, dto.code);
    return {
      success: true,
      message: 'تم التحقق من البريد الإلكتروني بنجاح',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: result,
    };
  }

  // ==================== Consent Management ====================

  @ApiBearerAuth()
  @UseGuards(UnifiedAuthGuard)
  @Auth(AuthType.JWT)
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
  @Auth(AuthType.JWT)
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
  @Auth(AuthType.JWT)
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
  @Auth(AuthType.JWT)
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
  @Auth(AuthType.JWT)
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
  @Auth(AuthType.JWT)
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
