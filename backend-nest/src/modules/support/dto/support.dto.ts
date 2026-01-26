import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsMongoId,
  Min,
  Max,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTicketDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  userId?: string;

  @ApiPropertyOptional({ enum: ['User', 'Driver', 'Vendor'] })
  @IsOptional()
  @IsEnum(['User', 'Driver', 'Vendor'])
  userModel?: string;

  @ApiProperty()
  @IsString()
  subject: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty({ enum: ['low', 'medium', 'high', 'urgent'] })
  @IsEnum(['low', 'medium', 'high', 'urgent'])
  priority: string;

  @ApiProperty({
    enum: [
      'technical',
      'payment',
      'account',
      'order',
      'general',
      'complaint',
      'feedback',
    ],
  })
  @IsEnum([
    'technical',
    'payment',
    'account',
    'order',
    'general',
    'complaint',
    'feedback',
  ])
  category: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  relatedOrder?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class GetTicketsQueryDto {
  @ApiPropertyOptional({
    enum: [
      'open',
      'assigned',
      'in-progress',
      'pending-user',
      'resolved',
      'closed',
      'cancelled',
    ],
  })
  @IsOptional()
  @IsEnum([
    'open',
    'assigned',
    'in-progress',
    'pending-user',
    'resolved',
    'closed',
    'cancelled',
  ])
  status?: string;

  @ApiPropertyOptional({ enum: ['low', 'medium', 'high', 'urgent'] })
  @IsOptional()
  @IsEnum(['low', 'medium', 'high', 'urgent'])
  priority?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  assignedTo?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;
}

export class AssignTicketDto {
  @ApiProperty()
  @IsMongoId()
  assigneeId: string;
}

export class AddMessageDto {
  @ApiProperty()
  @IsString()
  message: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];
}

export class ResolveTicketDto {
  @ApiProperty()
  @IsString()
  resolution: string;
}

export class RateTicketDto {
  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  feedback?: string;
}

