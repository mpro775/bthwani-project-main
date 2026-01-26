import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignOptions } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as admin from 'firebase-admin';
import { User } from './entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { Driver } from '../driver/entities/driver.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Driver.name) private driverModel: Model<Driver>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // المصادقة عبر Firebase (الطريقة الرئيسية)
  async loginWithFirebase(idToken: string) {
    try {
      // التحقق من Firebase token
      const decodedToken = await admin.auth().verifyIdToken(idToken, true);

      // البحث عن المستخدم أو إنشاءه
      let user = await this.userModel.findOne({
        firebaseUID: decodedToken.uid,
      });

      if (!user) {
        // إنشاء مستخدم جديد من Firebase
        user = await this.userModel.create({
          firebaseUID: decodedToken.uid,
          email: decodedToken.email,
          fullName: String(decodedToken.name) || 'مستخدم جديد',
          phone: decodedToken.phone_number || '',
          emailVerified: decodedToken.email_verified,
          authProvider: 'firebase',
          profileImage: decodedToken.picture || '',
        });
      } else {
        // تحديث بيانات المستخدم من Firebase
        await this.userModel.findByIdAndUpdate(user._id, {
          lastLoginAt: new Date(),
          emailVerified: decodedToken.email_verified,
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

      // إنشاء JWT Token
      const token = await this.generateToken(user);

      return {
        user: this.sanitizeUser(user),
        token,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException({
        code: 'INVALID_FIREBASE_TOKEN',
        message: error instanceof Error ? error.message : 'Unknown error',
        userMessage: 'رمز Firebase غير صالح أو منتهي الصلاحية',
        suggestedAction: 'يرجى تسجيل الدخول مرة أخرى',
      });
    }
  }

  // إنشاء JWT Token
  private async generateToken(user: {
    _id?: any;
    id?: string;
    email?: string;
    role?: string;
    firebaseUID?: string;
  }) {
    const payload = {
      sub: user._id ? String(user._id) : user.id,
      email: user.email,
      role: user.role,
      firebaseUID: user.firebaseUID,
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

  async verifyResetCode(
    emailOrPhone: string,
    code: string,
  ): Promise<boolean> {
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

    // Update password in Firebase (if Firebase user exists)
    if (user.firebaseUID) {
      try {
        await admin.auth().updateUser(user.firebaseUID, {
          password: newPassword,
        });
      } catch (error) {
        console.error('Failed to update Firebase password:', error);
      }
    }

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
  private async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  // تسجيل دخول السائق
  async driverLogin(email: string, password: string) {
    // البحث عن السائق في مجموعة الـ drivers
    const driver = await this.driverModel.findOne({ email }).select('+password');

    if (!driver) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // التحقق من كلمة المرور
    const isValidPassword = await this.comparePassword(password, driver.password);
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // التحقق من حالة السائق
    if (driver.isBanned) {
      throw new UnauthorizedException('Account is banned');
    }

    // توليد token
    const token = await this.generateDriverToken(driver);

    return {
      user: this.sanitizeDriver(driver),
      token,
      type: 'driver',
    };
  }

  // توليد token للسائق
  private async generateDriverToken(driver: any) {
    const payload = {
      sub: driver._id,
      email: driver.email,
      role: 'driver',
      type: 'driver',
    };

    return this.jwtService.sign(payload);
  }

  // تنظيف بيانات السائق
  private sanitizeDriver(driver: any) {
    const { password, ...sanitized } = driver.toObject();
    return sanitized;
  }
}
