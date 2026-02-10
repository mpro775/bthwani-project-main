import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { KawaderApplicationStatus } from '../entities/kawader-application.entity';

const ALLOWED_STATUSES = [KawaderApplicationStatus.ACCEPTED, KawaderApplicationStatus.REJECTED] as const;

export default class ApplicationStatusDto {
  @ApiProperty({
    description: 'حالة التقديم: مقبول أو مرفوض',
    enum: ALLOWED_STATUSES,
    example: KawaderApplicationStatus.ACCEPTED,
  })
  @IsIn(ALLOWED_STATUSES, { message: 'الحالة يجب أن تكون accepted أو rejected' })
  status: typeof ALLOWED_STATUSES[number];
}
