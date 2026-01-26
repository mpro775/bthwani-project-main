import { IsString, IsOptional } from 'class-validator';

export class GetAllShiftsResponseDto {
  data: any[]; // TODO: Create Shift DTO
}

export class CreateShiftDto {
  @IsString()
  name: string;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsOptional()
  daysOfWeek?: number[];
}

export class CreateShiftResponseDto {
  success: boolean;
  message: string;
  shift: CreateShiftDto;
}

export class UpdateShiftDto {
  @IsString()
  shiftId: string;

  updates: any; // TODO: Create specific update DTO

  @IsOptional()
  @IsString()
  adminId?: string;
}

export class UpdateShiftResponseDto {
  success: boolean;
  message: string;
}

export class AssignShiftToDriverDto {
  @IsString()
  shiftId: string;

  @IsString()
  driverId: string;

  @IsString()
  startDate: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  adminId?: string;
}

export class AssignShiftResponseDto {
  success: boolean;
  message: string;
}

export class GetDriverShiftsResponseDto {
  data: any[]; // TODO: Create DriverShift DTO
}
