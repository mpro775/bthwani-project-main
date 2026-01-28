import { ApiProperty } from '@nestjs/swagger';

export class SendOtpDto {
  // هذا DTO فارغ لأن userId سيتم الحصول عليه من JWT token
  // يمكن إضافة حقول اختيارية في المستقبل مثل نوع OTP (email/phone)
}
