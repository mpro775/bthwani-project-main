import { IsOptional, IsNumber, IsString } from 'class-validator';

export class GetDriverAttendanceQueryDto {
  @IsOptional()
  @IsNumber()
  month?: number;

  @IsOptional()
  @IsNumber()
  year?: number;
}

export class GetDriverAttendanceResponseDto {
  data: any[]; // TODO: Create Attendance DTO
  summary: {
    present: number;
    absent: number;
    late: number;
  };
}

export class GetAttendanceSummaryResponseDto {
  data: any[]; // TODO: Create Attendance summary DTO
  total: number;
}

export class AdjustAttendanceDto {
  @IsString()
  driverId: string;

  data: any; // TODO: Create Attendance adjustment DTO

  @IsOptional()
  @IsString()
  adminId?: string;
}

export class AdjustAttendanceResponseDto {
  success: boolean;
  message: string;
}
