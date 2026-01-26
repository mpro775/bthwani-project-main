import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({ 
    description: 'نص الرسالة', 
    example: 'مرحباً، هل العرض الوظيفي متاح؟' 
  })
  @IsString({ message: 'نص الرسالة مطلوب' })
  @MinLength(1, { message: 'الرسالة لا يمكن أن تكون فارغة' })
  @MaxLength(1000, { message: 'الرسالة طويلة جداً (الحد الأقصى 1000 حرف)' })
  text: string;
}
