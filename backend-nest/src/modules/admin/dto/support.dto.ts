import { IsOptional, IsString, IsNumber } from 'class-validator';

export class GetSupportTicketsQueryDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  priority?: string;

  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  limit?: number = 20;
}

export class GetSupportTicketsResponseDto {
  data: any[]; // TODO: Create SupportTicket DTO
  total: number;
  page: number;
  limit: number;
}

export class AssignTicketDto {
  @IsString()
  ticketId: string;

  @IsString()
  assigneeId: string;

  @IsOptional()
  @IsString()
  adminId?: string;
}

export class AssignTicketResponseDto {
  success: boolean;
  message: string;
}

export class ResolveTicketDto {
  @IsString()
  ticketId: string;

  @IsString()
  resolution: string;

  @IsOptional()
  @IsString()
  adminId?: string;
}

export class ResolveTicketResponseDto {
  success: boolean;
  message: string;
}

export class GetSLAMetricsResponseDto {
  averageResponseTime: number;
  averageResolutionTime: number;
  breachedSLA: number;
}
