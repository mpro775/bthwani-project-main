import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from '../auth/entities/user.entity';
import { AddAddressDto } from './dto/add-address.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SetPinDto, VerifyPinDto } from './dto/set-pin.dto';
import { CursorPaginationDto } from '../../common/dto/pagination.dto';
import {
  EntityHelper,
  CacheHelper,
  PaginationHelper,
} from '../../common/utils';

@Injectable()
export class UserService {
  private readonly SALT_ROUNDS = 12; // عدد جولات التشفير
  private readonly MAX_PIN_ATTEMPTS = 5; // عدد محاولات PIN المسموحة
  private readonly PIN_LOCK_DURATION = 30 * 60 * 1000; // 30 دقيقة

  // Cache TTL
  private readonly USER_CACHE_TTL = 600; // 10 دقائق
  private readonly USER_PROFILE_CACHE_TTL = 300; // 5 دقائق

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // جلب المستخدم الحالي مع العنوان الافتراضي (مع Cache)
  async getCurrentUser(userId: string) {
    return CacheHelper.getOrSet(
      this.cacheManager,
      `user:profile:${userId}`,
      this.USER_PROFILE_CACHE_TTL,
      async () => {
        const user = await EntityHelper.findByIdOrFail(
          this.userModel,
          userId,
          'User',
          { lean: true },
        );

        // استخراج العنوان الافتراضي
        let defaultAddress: unknown = null;
        if (user.defaultAddressId && user.addresses?.length > 0) {
          defaultAddress = user.addresses.find(
            (addr) =>
              (addr as { _id?: Types.ObjectId })._id?.toString() ===
              user.defaultAddressId?.toString(),
          );
        }

        // fallback للعنوان الأول
        if (!defaultAddress && user.addresses?.length > 0) {
          defaultAddress = user.addresses[0];
        }

        return {
          ...user,
          defaultAddress,
        } as unknown;
      },
    );
  }

  /**
   * مسح cache المستخدم (عند التحديث)
   */
  private async invalidateUserCache(userId: string) {
    await CacheHelper.invalidateMultiple(this.cacheManager, [
      `user:profile:${userId}`,
      `user:${userId}`,
    ]);
  }

  // تحديث الملف الشخصي
  async updateProfile(userId: string, updateUserDto: UpdateUserDto) {
    const user = await this.userModel.findByIdAndUpdate(userId, updateUserDto, {
      new: true,
    });

    if (!user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'User not found',
        userMessage: 'المستخدم غير موجود',
      });
    }

    // ⚡ مسح cache بعد التحديث
    await this.invalidateUserCache(userId);

    return user;
  }

  // إضافة عنوان جديد
  async addAddress(userId: string, addAddressDto: AddAddressDto) {
    const user = await EntityHelper.findByIdOrFail(
      this.userModel,
      userId,
      'User',
    );

    user.addresses.push(addAddressDto as never);
    await user.save();

    // ⚡ مسح cache بعد التحديث
    await this.invalidateUserCache(userId);

    return {
      message: 'تم إضافة العنوان بنجاح',
      addresses: user.addresses,
    };
  }

  // تحديث عنوان
  async updateAddress(
    userId: string,
    addressId: string,
    updateData: Partial<AddAddressDto>,
  ) {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'User not found',
        userMessage: 'المستخدم غير موجود',
      });
    }

    const address = user.addresses.find(
      (addr) => (addr as { _id: Types.ObjectId })._id.toString() === addressId,
    );

    if (!address) {
      throw new NotFoundException({
        code: 'ADDRESS_NOT_FOUND',
        message: 'Address not found',
        userMessage: 'العنوان غير موجود',
      });
    }

    // تحديث البيانات
    Object.assign(address, updateData);
    await user.save();

    return address as unknown;
  }

  // حذف عنوان
  async deleteAddress(userId: string, addressId: string) {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'User not found',
        userMessage: 'المستخدم غير موجود',
      });
    }

    user.addresses = user.addresses.filter(
      (addr) => (addr as { _id: Types.ObjectId })._id.toString() !== addressId,
    ) as never;

    // إزالة العنوان الافتراضي إذا كان محذوفاً
    if (user.defaultAddressId?.toString() === addressId) {
      user.defaultAddressId =
        (user.addresses[0] as { _id?: Types.ObjectId })?._id || undefined;
    }

    await user.save();

    return {
      message: 'تم حذف العنوان بنجاح',
      addresses: user.addresses,
    };
  }

  // تعيين العنوان الافتراضي
  async setDefaultAddress(userId: string, addressId: string) {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'User not found',
        userMessage: 'المستخدم غير موجود',
      });
    }

    const addressExists = user.addresses.some(
      (addr) => (addr as { _id: Types.ObjectId })._id.toString() === addressId,
    );

    if (!addressExists) {
      throw new NotFoundException({
        code: 'ADDRESS_NOT_FOUND',
        message: 'Address not found',
        userMessage: 'العنوان غير موجود',
      });
    }

    user.defaultAddressId = new Types.ObjectId(addressId);
    await user.save();

    return {
      message: 'تم تعيين العنوان الافتراضي',
      defaultAddressId: user.defaultAddressId,
    };
  }

  // جلب العناوين
  async getAddresses(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .select('addresses defaultAddressId');

    if (!user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'User not found',
        userMessage: 'المستخدم غير موجود',
      });
    }

    return {
      addresses: user.addresses,
      defaultAddressId: user.defaultAddressId,
    };
  }

  // إلغاء تفعيل الحساب
  async deactivateAccount(userId: string) {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true },
    );

    if (!user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'User not found',
        userMessage: 'المستخدم غير موجود',
      });
    }

    return {
      message: 'تم إلغاء تفعيل الحساب',
    };
  }

  // البحث عن المستخدمين (للإدارة)
  async searchUsers(searchTerm: string, pagination: CursorPaginationDto) {
    return PaginationHelper.paginate(
      this.userModel,
      {
        $or: [
          { fullName: { $regex: searchTerm, $options: 'i' } },
          { email: { $regex: searchTerm, $options: 'i' } },
          { phone: { $regex: searchTerm, $options: 'i' } },
        ],
      },
      pagination,
    );
  }

  // ==================== PIN Code Management (Secure) ====================

  /**
   * تعيين رمز PIN مشفر للمستخدم
   */
  async setPin(userId: string, setPinDto: SetPinDto) {
    // التحقق من تطابق PIN
    if (setPinDto.pin !== setPinDto.confirmPin) {
      throw new BadRequestException({
        code: 'PIN_MISMATCH',
        message: 'PIN codes do not match',
        userMessage: 'رمز PIN غير متطابق',
        suggestedAction: 'يرجى التأكد من إدخال نفس الرمز مرتين',
      });
    }

    // التحقق من قوة PIN (لا يجب أن يكون متسلسل أو متكرر)
    if (!this.isStrongPin(setPinDto.pin)) {
      throw new BadRequestException({
        code: 'WEAK_PIN',
        message: 'PIN is too weak',
        userMessage: 'رمز PIN ضعيف جداً',
        suggestedAction: 'تجنب الأرقام المتسلسلة أو المتكررة مثل 1234 أو 1111',
      });
    }

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'User not found',
        userMessage: 'المستخدم غير موجود',
      });
    }

    // تشفير PIN باستخدام bcrypt
    const pinCodeHash = await bcrypt.hash(setPinDto.pin, this.SALT_ROUNDS);

    // حفظ PIN المشفر
    user.security = {
      ...user.security,
      pinCodeHash,
      pinAttempts: 0,
      pinLockedUntil: undefined,
    };

    await user.save();

    return {
      success: true,
      message: 'تم تعيين رمز PIN بنجاح',
    };
  }

  /**
   * التحقق من رمز PIN
   */
  async verifyPin(userId: string, verifyPinDto: VerifyPinDto) {
    // جلب المستخدم مع pinCodeHash (select: false بشكل افتراضي)
    const user = await this.userModel
      .findById(userId)
      .select('+security.pinCodeHash');

    if (!user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'User not found',
        userMessage: 'المستخدم غير موجود',
      });
    }

    // التحقق من وجود PIN
    if (!user.security?.pinCodeHash) {
      throw new BadRequestException({
        code: 'PIN_NOT_SET',
        message: 'PIN code is not set',
        userMessage: 'لم يتم تعيين رمز PIN',
        suggestedAction: 'يرجى تعيين رمز PIN أولاً',
      });
    }

    // التحقق من القفل
    if (
      user.security.pinLockedUntil &&
      user.security.pinLockedUntil > new Date()
    ) {
      const remainingMinutes = Math.ceil(
        (user.security.pinLockedUntil.getTime() - Date.now()) / 60000,
      );
      throw new UnauthorizedException({
        code: 'PIN_LOCKED',
        message: 'PIN is locked due to too many failed attempts',
        userMessage: `رمز PIN محظور بسبب المحاولات الفاشلة المتكررة`,
        suggestedAction: `يرجى المحاولة بعد ${remainingMinutes} دقيقة`,
        details: {
          lockedUntil: user.security.pinLockedUntil,
          remainingMinutes,
        },
      });
    }

    // التحقق من PIN
    const isValid = await bcrypt.compare(
      verifyPinDto.pin,
      user.security.pinCodeHash,
    );

    if (!isValid) {
      // زيادة عدد المحاولات الفاشلة
      const pinAttempts = (user.security.pinAttempts || 0) + 1;
      user.security.pinAttempts = pinAttempts;

      // قفل PIN إذا تجاوز الحد الأقصى
      if (pinAttempts >= this.MAX_PIN_ATTEMPTS) {
        user.security.pinLockedUntil = new Date(
          Date.now() + this.PIN_LOCK_DURATION,
        );
        await user.save();

        throw new UnauthorizedException({
          code: 'PIN_LOCKED',
          message: 'PIN locked due to too many failed attempts',
          userMessage: 'تم قفل رمز PIN بسبب المحاولات الفاشلة المتكررة',
          suggestedAction: 'يرجى المحاولة بعد 30 دقيقة أو التواصل مع الدعم',
          details: {
            lockedUntil: user.security.pinLockedUntil,
          },
        });
      }

      await user.save();

      throw new UnauthorizedException({
        code: 'INVALID_PIN',
        message: 'Invalid PIN code',
        userMessage: 'رمز PIN غير صحيح',
        suggestedAction: `لديك ${this.MAX_PIN_ATTEMPTS - pinAttempts} محاولات متبقية`,
        details: {
          attemptsRemaining: this.MAX_PIN_ATTEMPTS - pinAttempts,
        },
      });
    }

    // إعادة تعيين المحاولات عند النجاح
    user.security.pinAttempts = 0;
    user.security.pinLockedUntil = undefined;
    await user.save();

    return {
      success: true,
      message: 'تم التحقق من رمز PIN بنجاح',
    };
  }

  /**
   * تغيير رمز PIN (يتطلب PIN القديم)
   */
  async changePin(userId: string, oldPin: string, newPinDto: SetPinDto) {
    // التحقق من PIN القديم أولاً
    await this.verifyPin(userId, { pin: oldPin });

    // تعيين PIN الجديد
    return this.setPin(userId, newPinDto);
  }

  /**
   * إعادة تعيين PIN (للمسؤولين أو بعد التحقق من الهوية)
   */
  async resetPin(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'User not found',
        userMessage: 'المستخدم غير موجود',
      });
    }

    // حذف PIN وإعادة تعيين المحاولات
    user.security = {
      ...user.security,
      pinCodeHash: undefined,
      pinAttempts: 0,
      pinLockedUntil: undefined,
    };

    await user.save();

    return {
      success: true,
      message: 'تم إعادة تعيين رمز PIN',
    };
  }

  /**
   * التحقق من قوة PIN
   */
  private isStrongPin(pin: string): boolean {
    // رفض الأرقام المتسلسلة
    const sequential = ['0123', '1234', '2345', '3456', '4567', '5678', '6789'];
    const reverseSequential = [
      '9876',
      '8765',
      '7654',
      '6543',
      '5432',
      '4321',
      '3210',
    ];

    if (
      sequential.some((seq) => pin.includes(seq)) ||
      reverseSequential.some((seq) => pin.includes(seq))
    ) {
      return false;
    }

    // رفض الأرقام المتكررة
    const allSame = pin.split('').every((char) => char === pin[0]);
    if (allSame) {
      return false;
    }

    // رفض أنماط شائعة
    const commonPins = ['0000', '1111', '2222', '1234', '4321', '1122', '6969'];
    if (commonPins.includes(pin)) {
      return false;
    }

    return true;
  }

  /**
   * التحقق من حالة PIN
   */
  async getPinStatus(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .select('+security.pinCodeHash');

    if (!user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'User not found',
        userMessage: 'المستخدم غير موجود',
      });
    }

    const hasPin = !!user.security?.pinCodeHash;
    const isLocked =
      user.security?.pinLockedUntil &&
      user.security.pinLockedUntil > new Date();

    return {
      hasPin,
      isLocked,
      lockedUntil: isLocked ? user.security.pinLockedUntil : null,
      attemptsRemaining: isLocked
        ? 0
        : this.MAX_PIN_ATTEMPTS - (user.security?.pinAttempts || 0),
    };
  }

  // حذف حساب المستخدم الحالي
  async deleteCurrentUser(userId: string) {
    const user = await EntityHelper.findByIdOrFail(
      this.userModel,
      userId,
      'User',
    );

    // حذف المستخدم من قاعدة البيانات
    await this.userModel.findByIdAndDelete(userId);

    // مسح الـ cache
    await CacheHelper.invalidateMultiple(this.cacheManager, [
      `user:profile:${userId}`,
      `user:addresses:${userId}`,
    ]);

    return {
      message: 'تم حذف الحساب بنجاح',
      deletedAt: new Date().toISOString(),
    };
  }
}
