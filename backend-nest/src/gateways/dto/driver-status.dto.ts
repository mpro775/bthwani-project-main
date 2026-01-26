import { IsBoolean } from 'class-validator';

export class DriverStatusDto {
  @IsBoolean({ message: 'isAvailable must be a boolean value' })
  isAvailable: boolean;
}

