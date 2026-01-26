import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => {
  const secret = process.env.JWT_SECRET;
  const vendorSecret = process.env.VENDOR_JWT_SECRET;
  const marketerSecret = process.env.MARKETER_JWT_SECRET;
  const refreshSecret = process.env.REFRESH_TOKEN_SECRET;

  // التحقق من وجود المفاتيح
  if (!secret || !vendorSecret || !marketerSecret || !refreshSecret) {
    throw new Error(
      'CRITICAL: JWT secrets are not configured! ' +
        'Set JWT_SECRET, VENDOR_JWT_SECRET, MARKETER_JWT_SECRET, and REFRESH_TOKEN_SECRET in .env file',
    );
  }

  // التحقق من قوة المفاتيح
  if (secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }
  if (vendorSecret.length < 32) {
    throw new Error('VENDOR_JWT_SECRET must be at least 32 characters long');
  }
  if (marketerSecret.length < 32) {
    throw new Error('MARKETER_JWT_SECRET must be at least 32 characters long');
  }
  if (refreshSecret.length < 32) {
    throw new Error('REFRESH_TOKEN_SECRET must be at least 32 characters long');
  }

  return {
    // JWT للمستخدمين العاديين
    secret,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',

    // JWT للـ Vendors
    vendorSecret,
    vendorExpiresIn: process.env.VENDOR_JWT_EXPIRES_IN || '30d',

    // JWT للـ Marketers
    marketerSecret,
    marketerExpiresIn: process.env.MARKETER_JWT_EXPIRES_IN || '30d',

    // Refresh Token
    refreshSecret,
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d',
  };
});
