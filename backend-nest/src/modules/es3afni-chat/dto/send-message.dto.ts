import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class SendEs3afniMessageDto {
  @ApiProperty({
    description: 'نص الرسالة',
    example: 'أستطيع التبرع، متى يمكنني الحضور؟',
  })
  @IsString({ message: 'نص الرسالة مطلوب' })
  @MinLength(1, { message: 'الرسالة لا يمكن أن تكون فارغة' })
  @MaxLength(1000, { message: 'الرسالة طويلة جداً (الحد الأقصى 1000 حرف)' })
  text: string;
}
