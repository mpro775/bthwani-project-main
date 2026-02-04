import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SlotItemDto {
  @ApiProperty({
    description: 'تاريخ ووقت الـ slot',
    example: '2025-06-01T10:00:00.000Z',
    format: 'date-time',
  })
  @IsDateString()
  datetime: string;

  @ApiProperty({
    description: 'مدة الـ slot بالدقائق',
    example: 60,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  durationMinutes?: number;
}

export class CreateSlotsByRangeDto {
  @ApiProperty({
    description: 'بداية النطاق الزمني',
    example: '2025-06-01T08:00:00.000Z',
    format: 'date-time',
  })
  @IsDateString()
  start: string;

  @ApiProperty({
    description: 'نهاية النطاق الزمني',
    example: '2025-06-01T18:00:00.000Z',
    format: 'date-time',
  })
  @IsDateString()
  end: string;

  @ApiProperty({
    description: 'الفاصل بين كل slot بالدقائق',
    example: 60,
  })
  @IsNumber()
  @Min(1)
  intervalMinutes: number;

  @ApiProperty({
    description: 'مدة كل slot بالدقائق (اختياري، افتراضي = intervalMinutes)',
    example: 60,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  durationMinutes?: number;
}

export class CreateSlotsDto {
  @ApiProperty({
    description: 'قائمة slots صريحة (بدلاً من نطاق زمني)',
    type: [SlotItemDto],
    required: false,
  })
  @ValidateIf((o) => !o.start)
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SlotItemDto)
  slots?: SlotItemDto[];

  @ApiProperty({
    description: 'إنشاء slots بنطاق زمني + فاصل',
    type: CreateSlotsByRangeDto,
    required: false,
  })
  @ValidateIf((o) => !o.slots?.length)
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateSlotsByRangeDto)
  range?: CreateSlotsByRangeDto;
}
