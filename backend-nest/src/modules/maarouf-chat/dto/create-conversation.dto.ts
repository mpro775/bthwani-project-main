import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsMongoId } from 'class-validator';

export class CreateConversationDto {
  @ApiProperty({ 
    description: 'معرف الإعلان', 
    example: '507f1f77bcf86cd799439011' 
  })
  @IsMongoId({ message: 'معرف الإعلان غير صحيح' })
  maaroufId: string;
}
