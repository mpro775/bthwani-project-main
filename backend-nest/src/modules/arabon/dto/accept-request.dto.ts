import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class AcceptRequestDto {
  @ApiProperty({
    description: 'معرف الـ slot المراد تعيينه للحجز',
    example: '507f1f77bcf86cd799439012',
  })
  @IsString()
  slotId: string;

  @ApiProperty({
    description: 'مبلغ العربون (اختياري؛ يُؤخذ من العربون إن لم يُمرر)',
    example: 100,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  depositAmount?: number;

  @ApiProperty({ description: 'كود الكوبون (اختياري)', example: 'FIRST10', required: false })
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiProperty({ description: 'معرف الكوبون (اختياري)', required: false })
  @IsOptional()
  @IsString()
  couponId?: string;
}
