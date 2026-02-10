import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignOptions } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { RegisterLocalDto } from './dto/register-local.dto';
import { Driver } from '../driver/entities/driver.entity';
import { Marketer } from '../marketer/entities/marketer.entity';
import * as bcrypt from 'bcrypt';
import { EmailService } from '../../common/services/email.service';
import { VerifyOtpResponse } from './types/auth.types';
import { SanitizationHelper } from 'src/common/utils/sanitization.helper';

// Types for return values
export interface AuthResponse {
  user: {
    id?: string;
    fullName?: string;
    aliasName?: string;
    email?: string;
    phone?: string;
    profileImage?: string;
    emailVerified?: boolean;
    classification?: string;
    role?: string;
    addresses?: unknown[];
    defaultAddressId?: unknown;
    language?: string;
    theme?: string;
    wallet?: unknown;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  };
  token: {
    accessToken: string;
    tokenType: string;
    expiresIn: string;
  };
}

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 12;

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Driver.name) private driverModel: Model<Driver>,
    @InjectModel(Marketer.name) private marketerModel: Model<Marketer>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  // إنشاء JWT Token
  private async generateToken(user: {
    _id?: any;
    id?: string;
    email?: string;
    role?: string;
  }) {
    const payload = {
      sub: user._id ? String(user._id) : user.id,
      email: user.email,
      role: user.role,
    };

    const secret =
      this.configService.get<string>('jwt.secret') || 'default-secret';
    const expiresIn = this.configService.get<string>('jwt.expiresIn') || '7d';

    const accessToken = await this.jwtService.signAsync(payload, {
      secret,
      expiresIn,
    } as SignOptions);

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn,
    };
  }

  // تنظيف بيانات المستخدم (إزالة البيانات الحساسة)
  private sanitizeUser(user: { toObject?: () => any } & Record<string, any>) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const userObject: Record<string, any> = user.toObject
      ? user.toObject()
      : user;

    // لا نحتاج لحذف password لأنه غير موجود في النموذج
    // فقط نعيد البيانات الآمنة

    /* eslint-disable @typescript-eslint/no-unsafe-assignment */
    return {
      id: userObject._id,
      fullName: userObject.fullName,
      aliasName: userObject.aliasName,
      email: userObject.email,
      phone: userObject.phone,
      profileImage: userObject.profileImage,
      emailVerified: userObject.emailVerified,
      classification: userObject.classification,
      role: userObject.role,
      addresses: userObject.addresses,
      defaultAddressId: userObject.defaultAddressId,
      language: userObject.language,
      theme: userObject.theme,
      wallet: userObject.wallet,
      isActive: userObject.isActive,
      createdAt: userObject.createdAt,
      updatedAt: userObject.updatedAt,
    };
    /* eslint-enable @typescript-eslint/no-unsafe-assignment */
  }

  // ==================== Password Reset Methods ====================

  async requestPasswordReset(emailOrPhone: string): Promise<void> {
    // Find user by email or phone
    const user = await this.userModel.findOne({
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
    });

    if (!user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'User not found',
        userMessage: 'المستخدم غير موجود',
      });
    }

    // Generate random 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Save reset code and expiry (15 minutes)
    user.passwordResetCode = resetCode;
    user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    // TODO: Send reset code via email or SMS
    // For now, just log it (in production, send via email/SMS service)
    console.log(`Password reset code for ${emailOrPhone}: ${resetCode}`);
  }

  async verifyResetCode(emailOrPhone: string, code: string): Promise<boolean> {
    const user = await this.userModel.findOne({
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
    });

    if (!user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'User not found',
        userMessage: 'المستخدم غير موجود',
      });
    }

    if (
      !user.passwordResetCode ||
      user.passwordResetCode !== code ||
      !user.passwordResetExpires ||
      user.passwordResetExpires < new Date()
    ) {
      return false;
    }

    return true;
  }

  async resetPassword(
    emailOrPhone: string,
    code: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userModel.findOne({
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
    });

    if (!user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'User not found',
        userMessage: 'المستخدم غير موجود',
      });
    }

    // Verify code
    const isValid = await this.verifyResetCode(emailOrPhone, code);
    if (!isValid) {
      throw new BadRequestException({
        code: 'INVALID_RESET_CODE',
        message: 'Invalid or expired reset code',
        userMessage: 'رمز التحقق غير صحيح أو منتهي الصلاحية',
      });
    }

    // Hash and update password
    const hashedPassword = await bcrypt.hash(newPassword, this.SALT_ROUNDS);
    user.password = hashedPassword;

    // Clear reset code
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
  }

  async verifyOtp(
    phone: string,
    otp: string,
  ): Promise<{ verified: boolean; user?: any; token?: any }> {
    // Find user by phone
    const user = await this.userModel.findOne({ phone });

    if (!user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'User not found',
        userMessage: 'المستخدم غير موجود',
      });
    }

    // In production, verify OTP with SMS service
    // For now, accept any 6-digit code for testing
    if (!/^\d{6}$/.test(otp)) {
      throw new BadRequestException({
        code: 'INVALID_OTP',
        message: 'Invalid OTP format',
        userMessage: 'رمز OTP غير صحيح',
      });
    }

    // Mark phone as verified
    user.phoneVerified = true;
    await user.save();

    // Generate token
    const token = await this.generateToken(user);

    return {
      verified: true,
      user: this.sanitizeUser(user),
      token,
    };
  }

  // مقارنة كلمة المرور المشفرة
  private async comparePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  // تسجيل دخول السائق (باستخدام رقم الهاتف)
  async driverLogin(phone: string, password: string) {
    // البحث عن السائق في مجموعة الـ drivers
    const driver = await this.driverModel
      .findOne({ phone })
      .select('+password');

    if (!driver) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // التحقق من كلمة المرور
    const isValidPassword = await this.comparePassword(
      password,
      driver.password,
    );
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // التحقق من حالة السائق
    if (driver.isBanned) {
      throw new UnauthorizedException('Account is banned');
    }

    // توليد token
    const token = this.generateDriverToken(driver);

    return {
      user: this.sanitizeDriver(driver),
      token,
      type: 'driver',
    };
  }

  // توليد token للسائق
  private generateDriverToken(driver: Driver) {
    const driverId = String(driver._id);
    const payload = {
      sub: driverId,
      driverId, // للتوافق مع Gateway و @CurrentDriver
      email: driver.email,
      role: 'driver',
      type: 'driver',
    };

    return this.jwtService.sign(payload);
  }

  // تنظيف بيانات السائق
  private sanitizeDriver(driver: any) {
    const sanitized = SanitizationHelper.sanitize<Driver>(driver);
    return sanitized;
  }

  // ==================== Marketer Authentication ====================

  /** Marketer login: email + password → Marketer JWT + user */
  async marketerLogin(
    email: string,
    password: string,
  ): Promise<{ user: { id: string; fullName: string; email?: string }; token: { accessToken: string; tokenType: string; expiresIn: string } }> {
    const marketer = await this.marketerModel
      .findOne({ email: email.toLowerCase() })
      .select('+password')
      .lean();

    if (!marketer) {
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
        userMessage: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
      });
    }

    if (!marketer.password) {
      throw new UnauthorizedException({
        code: 'PASSWORD_NOT_SET',
        message: 'Password not set for this account',
        userMessage: 'لم يتم تعيين كلمة مرور لهذا الحساب',
      });
    }

    const isValidPassword = await this.comparePassword(
      password,
      marketer.password,
    );
    if (!isValidPassword) {
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
        userMessage: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
      });
    }

    if (!marketer.isActive) {
      throw new UnauthorizedException({
        code: 'ACCOUNT_INACTIVE',
        message: 'Account is not active',
        userMessage: 'الحساب غير نشط',
      });
    }

    const marketerId = String((marketer as any)._id);
    const token = await this.generateMarketerToken(marketerId);
    const expiresIn =
      this.configService.get<string>('jwt.marketerExpiresIn') || '30d';

    return {
      user: {
        id: marketerId,
        fullName: marketer.fullName,
        email: marketer.email,
      },
      token: {
        accessToken: token,
        tokenType: 'Bearer',
        expiresIn,
      },
    };
  }

  private async generateMarketerToken(marketerId: string): Promise<string> {
    const secret = this.configService.get<string>('jwt.marketerSecret');
    if (!secret) {
      throw new UnauthorizedException('Marketer JWT secret is not configured');
    }
    const expiresIn =
      this.configService.get<string>('jwt.marketerExpiresIn') || '30d';
    return this.jwtService.signAsync(
      { marketerId },
      { secret, expiresIn } as SignOptions,
    );
  }

  async getMarketerProfile(marketerId: string): Promise<{
    user: { id: string; fullName: string; email?: string; phone?: string };
  }> {
    const marketer = await this.marketerModel.findById(marketerId).lean();
    if (!marketer) {
      throw new NotFoundException({
        code: 'MARKETER_NOT_FOUND',
        message: 'Marketer not found',
        userMessage: 'المسوق غير موجود',
      });
    }
    const m = marketer as any;
    return {
      user: {
        id: String(m._id),
        fullName: m.fullName,
        email: m.email,
        phone: m.phone,
      },
    };
  }

  async updateMarketerPushToken(
    marketerId: string,
    pushToken: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.marketerModel.findByIdAndUpdate(marketerId, {
      pushToken,
    });
    return { success: true, message: 'تم حفظ رمز الإشعارات بنجاح' };
  }

  // ==================== Local Authentication Methods ====================

  /**
   * تسجيل حساب جديد محلي
   */
  async registerLocal(registerDto: RegisterLocalDto): Promise<AuthResponse> {
    // التحقق من وجود المستخدم بنفس البريد الإلكتروني
    const existingUser = await this.userModel.findOne({
      email: registerDto.email.toLowerCase(),
    });

    if (existingUser) {
      throw new ConflictException({
        code: 'EMAIL_ALREADY_EXISTS',
        message: 'Email already registered',
        userMessage: 'البريد الإلكتروني مسجل مسبقاً',
        suggestedAction: 'يرجى تسجيل الدخول أو استخدام بريد إلكتروني آخر',
      });
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(
      registerDto.password,
      this.SALT_ROUNDS,
    );

    // إنشاء مستخدم جديد
    const user = await this.userModel.create({
      fullName: registerDto.fullName,
      email: registerDto.email.toLowerCase(),
      phone: registerDto.phone,
      password: hashedPassword,
      authProvider: 'local',
      emailVerified: false,
      isActive: true,
    });

    // إنشاء JWT Token
    const token = await this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  /**
   * تسجيل الدخول المحلي
   */
  async loginLocal(email: string, password: string): Promise<AuthResponse> {
    // البحث عن المستخدم مع كلمة المرور
    const user = await this.userModel
      .findOne({ email: email.toLowerCase() })
      .select('+password');

    if (!user) {
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
        userMessage: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
        suggestedAction: 'يرجى التحقق من بيانات الدخول',
      });
    }

    // التحقق من كلمة المرور
    const isValidPassword = await this.comparePassword(
      password,
      user.password || '',
    );
    if (!isValidPassword) {
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
        userMessage: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
        suggestedAction: 'يرجى التحقق من بيانات الدخول',
      });
    }

    // التحقق من حالة المستخدم
    if (!user.isActive) {
      throw new UnauthorizedException({
        code: 'ACCOUNT_INACTIVE',
        message: 'Account is not active',
        userMessage: 'الحساب غير نشط',
        suggestedAction: 'يرجى التواصل مع الدعم الفني',
      });
    }

    if (user.isBlacklisted || user.isBanned) {
      throw new UnauthorizedException({
        code: 'ACCOUNT_BANNED',
        message: 'Account is banned',
        userMessage: 'الحساب محظور',
        suggestedAction: 'يرجى التواصل مع الدعم الفني',
      });
    }

    // تحديث آخر تسجيل دخول
    user.lastLoginAt = new Date();
    await user.save();

    // إنشاء JWT Token
    const token = await this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  /**
   * تهيئة/تحديث بيانات المستخدم (idempotent)
   */
  async initUser(userId: string, data: RegisterDto) {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'User not found',
        userMessage: 'المستخدم غير موجود',
      });
    }

    // تحديث البيانات (idempotent - لا يحدث خطأ إذا كانت موجودة)
    const updateData: Partial<User> = {};

    if (data.fullName && !user.fullName) {
      updateData.fullName = data.fullName;
    }
    if (data.email && !user.email) {
      updateData.email = data.email.toLowerCase();
    }
    if (data.phone && !user.phone) {
      updateData.phone = data.phone;
    }
    if (data.aliasName) {
      updateData.aliasName = data.aliasName;
    }
    if (data.profileImage) {
      updateData.profileImage = data.profileImage;
    }

    if (Object.keys(updateData).length > 0) {
      await this.userModel.findByIdAndUpdate(userId, updateData);
    }

    // إرجاع المستخدم المحدث
    const updatedUser = await this.userModel.findById(userId);
    return this.sanitizeUser(updatedUser!);
  }

  /**
   * إرسال OTP عبر البريد الإلكتروني
   */
  async sendEmailOtp(userId: string) {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'User not found',
        userMessage: 'المستخدم غير موجود',
      });
    }

    if (!user.email) {
      throw new BadRequestException({
        code: 'EMAIL_NOT_SET',
        message: 'User email is not set',
        userMessage: 'البريد الإلكتروني غير موجود',
        suggestedAction: 'يرجى إضافة بريد إلكتروني أولاً',
      });
    }

    // إنشاء رمز OTP (6 أرقام)
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // حفظ OTP مع تاريخ انتهاء (15 دقيقة)
    user.emailOtpCode = otpCode;
    user.emailOtpExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    // إرسال OTP عبر البريد الإلكتروني
    try {
      await this.emailService.sendOtpEmail(user.email, otpCode, user.fullName);
    } catch {
      // في حالة فشل الإرسال، نمسح OTP
      user.emailOtpCode = undefined;
      user.emailOtpExpires = undefined;
      await user.save();

      throw new BadRequestException({
        code: 'EMAIL_SEND_FAILED',
        message: 'Failed to send OTP email',
        userMessage: 'فشل إرسال البريد الإلكتروني',
        suggestedAction: 'يرجى المحاولة مرة أخرى',
      });
    }

    return {
      success: true,
      message: 'تم إرسال رمز التحقق إلى بريدك الإلكتروني',
    };
  }

  /**
   * التحقق من OTP وتفعيل الحساب
   */
  async verifyEmailOtp(
    userId: string,
    code: string,
  ): Promise<VerifyOtpResponse> {
    const user = await this.userModel
      .findById(userId)
      .select('+emailOtpCode +emailOtpExpires');

    if (!user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'User not found',
        userMessage: 'المستخدم غير موجود',
      });
    }

    // التحقق من وجود OTP
    if (!user.emailOtpCode || !user.emailOtpExpires) {
      throw new BadRequestException({
        code: 'OTP_NOT_SENT',
        message: 'OTP not sent or expired',
        userMessage: 'لم يتم إرسال رمز التحقق أو انتهت صلاحيته',
        suggestedAction: 'يرجى طلب رمز جديد',
      });
    }

    // التحقق من انتهاء الصلاحية
    if (user.emailOtpExpires < new Date()) {
      // مسح OTP المنتهي
      user.emailOtpCode = undefined;
      user.emailOtpExpires = undefined;
      await user.save();

      throw new BadRequestException({
        code: 'OTP_EXPIRED',
        message: 'OTP code has expired',
        userMessage: 'رمز التحقق منتهي الصلاحية',
        suggestedAction: 'يرجى طلب رمز جديد',
      });
    }

    // التحقق من صحة الرمز
    if (user.emailOtpCode !== code) {
      throw new BadRequestException({
        code: 'INVALID_OTP',
        message: 'Invalid OTP code',
        userMessage: 'رمز التحقق غير صحيح',
        suggestedAction: 'يرجى التحقق من الرمز وإعادة المحاولة',
      });
    }

    // تفعيل الحساب ومسح OTP
    user.emailVerified = true;
    user.emailOtpCode = undefined;
    user.emailOtpExpires = undefined;
    await user.save();

    // إنشاء JWT Token جديد
    const token = await this.generateToken(user);

    return {
      verified: true,
      user: this.sanitizeUser(user),
      token,
    };
  }
}
