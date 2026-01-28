import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { AuthService } from '../auth/auth.service';
import { AddAddressDto } from './dto/add-address.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SetPinDto, VerifyPinDto } from './dto/set-pin.dto';
import { RegisterDto } from '../auth/dto/register.dto';
import { SendOtpDto } from '../auth/dto/send-otp.dto';
import { CursorPaginationDto } from '../../common/dto/pagination.dto';
import { UnifiedAuthGuard } from '../../common/guards/unified-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import {
  Auth,
  Roles,
  CurrentUser,
} from '../../common/decorators/auth.decorator';
import { AuthType } from '../../common/guards/unified-auth.guard';

@ApiTags('User')
@ApiBearerAuth()
@Controller({ path: 'users', version: '1' })
@UseGuards(UnifiedAuthGuard, RolesGuard)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Auth(AuthType.JWT)
  @Get('me')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({
    summary: 'جلب بيانات المستخدم الحالي',
    description: 'الحصول على جميع بيانات المستخدم الحالي',
  })
  @ApiResponse({ status: 200, description: 'بيانات المستخدم' })
  @ApiResponse({ status: 401, description: 'غير مصرّح' })
  @ApiResponse({ status: 404, description: 'المستخدم غير موجود' })
  async getCurrentUser(@CurrentUser('id') userId: string) {
    return this.userService.getCurrentUser(userId);
  }

  @Auth(AuthType.JWT)
  @Post('init')
  @ApiResponse({ status: 200, description: 'User initialized' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({
    summary: 'تهيئة بيانات المستخدم',
    description: 'تهيئة أو تحديث بيانات المستخدم (idempotent)',
  })
  @ApiBody({ type: RegisterDto, description: 'بيانات المستخدم' })
  @ApiResponse({ status: 200, description: 'تم تهيئة البيانات بنجاح' })
  @ApiResponse({ status: 401, description: 'غير مصرّح' })
  async initUser(
    @CurrentUser('id') userId: string,
    @Body() registerDto: RegisterDto,
  ) {
    const user = await this.authService.initUser(userId, registerDto);
    return {
      success: true,
      message: 'تم تهيئة البيانات بنجاح',
      data: user,
    };
  }

  @Auth(AuthType.JWT)
  @Post('otp/send')
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({
    summary: 'إرسال رمز OTP عبر البريد الإلكتروني',
    description: 'إنشاء وإرسال رمز OTP إلى بريد المستخدم الإلكتروني',
  })
  @ApiBody({ type: SendOtpDto })
  @ApiResponse({ status: 200, description: 'تم إرسال رمز التحقق بنجاح' })
  @ApiResponse({ status: 401, description: 'غير مصرّح' })
  async sendOtp(@CurrentUser('id') userId: string) {
    const result = await this.authService.sendEmailOtp(userId);
    return result;
  }

  @Auth(AuthType.JWT)
  @Delete('me')
  @ApiResponse({ status: 200, description: 'Deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({
    summary: 'حذف حساب المستخدم',
    description: 'حذف حساب المستخدم الحالي نهائياً',
  })
  @ApiResponse({ status: 200, description: 'تم حذف الحساب بنجاح' })
  @ApiResponse({ status: 401, description: 'غير مصرّح' })
  @ApiResponse({ status: 404, description: 'المستخدم غير موجود' })
  async deleteCurrentUser(@CurrentUser('id') userId: string) {
    return this.userService.deleteCurrentUser(userId);
  }

  // Note: /user/profile route is handled by a separate controller if needed

  @Auth(AuthType.JWT)
  @Patch('me')
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({
    summary: 'تحديث الملف الشخصي',
    description: 'تحديث بيانات المستخدم الحالي',
  })
  @ApiBody({ type: UpdateUserDto, description: 'البيانات المراد تحديثها' })
  @ApiResponse({ status: 200, description: 'تم التحديث بنجاح' })
  @ApiResponse({ status: 401, description: 'غير مصرّح' })
  @ApiResponse({ status: 400, description: 'بيانات غير صالحة' })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateProfile(userId, updateUserDto);
  }

  // Compatibility route: /users/profile
  @Auth(AuthType.JWT)
  @Patch('profile')
  @ApiOperation({ summary: 'تحديث الملف الشخصي (alias)' })
  async updateUserProfile(
    @CurrentUser('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateProfile(userId, updateUserDto);
  }

  // Avatar endpoint for frontend compatibility
  @Auth(AuthType.JWT)
  @Patch('avatar')
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({
    summary: 'تحديث صورة الملف الشخصي',
    description: 'تحديث صورة الملف الشخصي فقط',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: { type: 'string', description: 'رابط صورة الملف الشخصي' },
      },
      required: ['image'],
    },
  })
  @ApiResponse({ status: 200, description: 'تم تحديث الصورة بنجاح' })
  @ApiResponse({ status: 401, description: 'غير مصرّح' })
  @ApiResponse({ status: 400, description: 'بيانات غير صالحة' })
  async updateAvatar(
    @CurrentUser('id') userId: string,
    @Body() body: { image: string },
  ) {
    return this.userService.updateProfile(userId, { profileImage: body.image });
  }

  @Auth(AuthType.JWT)
  @Get('addresses')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({
    summary: 'جلب جميع عناوين المستخدم',
    description: 'الحصول على قائمة عناوين التوصيل المحفوظة',
  })
  @ApiResponse({ status: 200, description: 'قائمة العناوين' })
  @ApiResponse({ status: 401, description: 'غير مصرّح' })
  async getAddresses(@CurrentUser('id') userId: string) {
    return this.userService.getAddresses(userId);
  }

  // Compatibility route: /users/address (singular)
  @Auth(AuthType.JWT)
  @Get('address')
  @ApiOperation({ summary: 'جلب عناوين المستخدم (alias)' })
  async getUserAddress(@CurrentUser('id') userId: string) {
    return this.userService.getAddresses(userId);
  }

  @Auth(AuthType.JWT)
  @Post('addresses')
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({
    summary: 'إضافة عنوان توصيل جديد',
    description: 'إضافة عنوان توصيل مع الإحداثيات والتفاصيل',
  })
  @ApiBody({ type: AddAddressDto, description: 'بيانات العنوان' })
  @ApiResponse({ status: 201, description: 'تمت إضافة العنوان بنجاح' })
  @ApiResponse({ status: 400, description: 'بيانات العنوان غير صالحة' })
  @ApiResponse({ status: 401, description: 'غير مصرّح' })
  async addAddress(
    @CurrentUser('id') userId: string,
    @Body() addAddressDto: AddAddressDto,
  ) {
    return this.userService.addAddress(userId, addAddressDto);
  }

  // Compatibility route: /users/address (singular)
  @Auth(AuthType.JWT)
  @Post('address')
  @ApiOperation({ summary: 'إضافة عنوان توصيل (alias)' })
  async addUserAddress(
    @CurrentUser('id') userId: string,
    @Body() addAddressDto: AddAddressDto,
  ) {
    return this.userService.addAddress(userId, addAddressDto);
  }

  @Auth(AuthType.JWT)
  @Patch('addresses/:addressId')
  @ApiParam({ name: 'addressId', type: String })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({
    summary: 'تحديث عنوان موجود',
    description: 'تعديل بيانات عنوان توصيل محفوظ',
  })
  @ApiParam({ name: 'addressId', description: 'معرّف العنوان' })
  @ApiBody({ type: AddAddressDto, description: 'البيانات المراد تحديثها' })
  @ApiResponse({ status: 200, description: 'تم تحديث العنوان بنجاح' })
  @ApiResponse({ status: 404, description: 'العنوان غير موجود' })
  @ApiResponse({ status: 401, description: 'غير مصرّح' })
  async updateAddress(
    @CurrentUser('id') userId: string,
    @Param('addressId') addressId: string,
    @Body() updateData: Partial<AddAddressDto>,
  ) {
    return this.userService.updateAddress(userId, addressId, updateData);
  }

  @Auth(AuthType.JWT)
  @Delete('addresses/:addressId')
  @ApiParam({ name: 'addressId', type: String })
  @ApiResponse({ status: 200, description: 'Deleted' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({
    summary: 'حذف عنوان',
    description: 'حذف عنوان توصيل من القائمة',
  })
  @ApiParam({ name: 'addressId', description: 'معرّف العنوان' })
  @ApiResponse({ status: 200, description: 'تم حذف العنوان بنجاح' })
  @ApiResponse({ status: 404, description: 'العنوان غير موجود' })
  @ApiResponse({ status: 401, description: 'غير مصرّح' })
  async deleteAddress(
    @CurrentUser('id') userId: string,
    @Param('addressId') addressId: string,
  ) {
    return this.userService.deleteAddress(userId, addressId);
  }

  @Auth(AuthType.JWT)
  @Post('addresses/:addressId/set-default')
  @ApiParam({ name: 'addressId', type: String })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({
    summary: 'تعيين العنوان الافتراضي',
    description: 'جعل عنوان معين هو العنوان الافتراضي للتوصيل',
  })
  @ApiParam({ name: 'addressId', description: 'معرّف العنوان' })
  @ApiResponse({ status: 200, description: 'تم تعيين العنوان الافتراضي بنجاح' })
  @ApiResponse({ status: 404, description: 'العنوان غير موجود' })
  @ApiResponse({ status: 401, description: 'غير مصرّح' })
  async setDefaultAddress(
    @CurrentUser('id') userId: string,
    @Param('addressId') addressId: string,
  ) {
    return this.userService.setDefaultAddress(userId, addressId);
  }

  // ==================== Address Aliases (for frontend compatibility) ====================

  @Auth(AuthType.JWT)
  @Patch('address/:id')
  @ApiParam({ name: 'id', type: String })
  @ApiOperation({ summary: 'تحديث عنوان موجود (alias)' })
  async updateAddressAlias(
    @CurrentUser('id') userId: string,
    @Param('id') addressId: string,
    @Body() updateData: Partial<AddAddressDto>,
  ) {
    return this.userService.updateAddress(userId, addressId, updateData);
  }

  @Auth(AuthType.JWT)
  @Delete('address/:id')
  @ApiParam({ name: 'id', type: String })
  @ApiOperation({ summary: 'حذف عنوان (alias)' })
  async deleteAddressAlias(
    @CurrentUser('id') userId: string,
    @Param('id') addressId: string,
  ) {
    return this.userService.deleteAddress(userId, addressId);
  }

  @Auth(AuthType.JWT)
  @Patch('default-address')
  @ApiBody({ schema: { type: 'object', properties: { addressId: { type: 'string' } } } })
  @ApiOperation({ summary: 'تعيين العنوان الافتراضي (alias)' })
  async setDefaultAddressAlias(
    @CurrentUser('id') userId: string,
    @Body('addressId') addressId: string,
  ) {
    return this.userService.setDefaultAddress(userId, addressId);
  }

  @Auth(AuthType.JWT)
  @Delete('deactivate')
  @ApiResponse({ status: 200, description: 'Deleted' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({
    summary: 'إلغاء تفعيل الحساب',
    description: 'تعطيل حساب المستخدم بشكل مؤقت أو دائم',
  })
  @ApiResponse({ status: 200, description: 'تم تعطيل الحساب بنجاح' })
  @ApiResponse({ status: 401, description: 'غير مصرّح' })
  async deactivateAccount(@CurrentUser('id') userId: string) {
    return this.userService.deactivateAccount(userId);
  }

  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @Get('search')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({
    summary: 'البحث عن مستخدمين',
    description: 'البحث في قاعدة بيانات المستخدمين (admin only)',
  })
  @ApiQuery({ name: 'q', description: 'نص البحث (اسم، رقم، email)' })
  @ApiQuery({
    name: 'cursor',
    required: false,
    description: 'Cursor للصفحة التالية',
  })
  @ApiQuery({ name: 'limit', required: false, description: 'عدد النتائج' })
  @ApiResponse({ status: 200, description: 'نتائج البحث' })
  @ApiResponse({ status: 401, description: 'غير مصرّح' })
  @ApiResponse({ status: 403, description: 'ليس لديك صلاحية (admin only)' })
  async searchUsers(
    @Query('q') searchTerm: string,
    @Query() pagination: CursorPaginationDto,
  ) {
    return this.userService.searchUsers(searchTerm, pagination);
  }

  // ==================== PIN Code Management ====================

  @Auth(AuthType.JWT)
  @Post('pin/set')
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({
    summary: 'تعيين رمز PIN مشفر',
    description: 'تعيين رمز PIN من 4-6 أرقام مع تشفير bcrypt',
  })
  @ApiBody({ type: SetPinDto, description: 'بيانات PIN' })
  @ApiResponse({
    status: 200,
    description: 'تم تعيين PIN بنجاح',
  })
  @ApiResponse({
    status: 400,
    description: 'PIN ضعيف أو غير متطابق',
  })
  async setPin(
    @CurrentUser('id') userId: string,
    @Body() setPinDto: SetPinDto,
  ) {
    return this.userService.setPin(userId, setPinDto);
  }

  @Auth(AuthType.JWT)
  @Post('pin/verify')
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({
    summary: 'التحقق من رمز PIN',
    description: 'التحقق من صحة رمز PIN مع حماية من Brute Force',
  })
  @ApiBody({ type: VerifyPinDto, description: 'رمز PIN للتحقق' })
  @ApiResponse({
    status: 200,
    description: 'PIN صحيح',
  })
  @ApiResponse({
    status: 401,
    description: 'PIN غير صحيح أو محظور',
  })
  async verifyPin(
    @CurrentUser('id') userId: string,
    @Body() verifyPinDto: VerifyPinDto,
  ) {
    return this.userService.verifyPin(userId, verifyPinDto);
  }

  @Auth(AuthType.JWT)
  @Post('pin/change')
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({
    summary: 'تغيير رمز PIN',
    description: 'تغيير PIN الحالي (يتطلب PIN القديم)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        oldPin: { type: 'string' },
        newPin: { type: 'string' },
        confirmNewPin: { type: 'string' },
      },
      required: ['oldPin', 'newPin', 'confirmNewPin'],
    },
  })
  @ApiResponse({ status: 200, description: 'تم تغيير PIN بنجاح' })
  @ApiResponse({ status: 401, description: 'PIN القديم غير صحيح' })
  @ApiResponse({ status: 400, description: 'PIN الجديد غير صالح' })
  async changePin(
    @CurrentUser('id') userId: string,
    @Body() body: { oldPin: string; newPin: string; confirmNewPin: string },
  ) {
    return this.userService.changePin(userId, body.oldPin, {
      pin: body.newPin,
      confirmPin: body.confirmNewPin,
    });
  }

  @Auth(AuthType.JWT)
  @Get('pin/status')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({
    summary: 'حالة رمز PIN',
    description: 'التحقق من وجود PIN وحالة القفل',
  })
  @ApiResponse({ status: 200, description: 'حالة PIN' })
  @ApiResponse({ status: 401, description: 'غير مصرّح' })
  async getPinStatus(@CurrentUser('id') userId: string) {
    return this.userService.getPinStatus(userId);
  }

  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @Delete('pin/reset/:userId')
  @ApiParam({ name: 'userId', type: String })
  @ApiResponse({ status: 200, description: 'Deleted' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({
    summary: 'إعادة تعيين PIN (للمسؤولين)',
    description: 'إعادة تعيين PIN لمستخدم معين (admin only)',
  })
  @ApiParam({ name: 'userId', description: 'معرّف المستخدم' })
  @ApiResponse({ status: 200, description: 'تم إعادة تعيين PIN بنجاح' })
  @ApiResponse({ status: 404, description: 'المستخدم غير موجود' })
  @ApiResponse({ status: 401, description: 'غير مصرّح' })
  @ApiResponse({ status: 403, description: 'ليس لديك صلاحية (admin only)' })
  async resetPin(@Param('userId') userId: string) {
    return this.userService.resetPin(userId);
  }
}
