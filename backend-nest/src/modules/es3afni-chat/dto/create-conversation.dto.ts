import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsMongoId } from 'class-validator';

export class CreateEs3afniConversationDto {
  @ApiProperty({
    description: 'معرف طلب الدم (اسعفني)',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId({ message: 'معرف الطلب غير صحيح' })
  requestId: string;
}
