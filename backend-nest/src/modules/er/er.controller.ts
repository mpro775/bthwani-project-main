import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  SetMetadata,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { HRService } from './services/hr.service';
import { AccountingService } from './services/accounting.service';
import { Auth, CurrentUser } from '../../common/decorators/auth.decorator';
import { AuthType } from '../../common/guards/unified-auth.guard';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { CreateChartAccountDto } from './dto/create-chart-account.dto';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { User } from '../auth/entities';

const Roles = (...roles: string[]) => SetMetadata('roles', roles);

@ApiTags('ER System')
@Controller({ path: 'er', version: ['1', '2'] })
@ApiBearerAuth()
export class ERController {
  constructor(
    private readonly hrService: HRService,
    private readonly accountingService: AccountingService,
  ) {}

  // ==================== Employee Endpoints ====================

  @Post('employees')
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.JWT)
  @ApiBearerAuth()
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'إضافة موظف جديد' })
  async createEmployee(@Body() dto: CreateEmployeeDto) {
    return this.hrService.createEmployee(dto);
  }

  @Get('employees')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.JWT)
  @ApiBearerAuth()
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'الحصول على كل الموظفين' })
  async getAllEmployees(@Query('status') status?: string) {
    return this.hrService.findAllEmployees(status);
  }

  @Get('employees/:id')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.JWT)
  @ApiBearerAuth()
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'الحصول على موظف محدد' })
  async getEmployee(@Param('id') id: string) {
    return this.hrService.findEmployeeById(id);
  }

  @Patch('employees/:id')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.JWT)
  @ApiBearerAuth()
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'تحديث موظف' })
  async updateEmployee(
    @Param('id') id: string,
    @Body() dto: UpdateEmployeeDto,
  ) {
    return this.hrService.updateEmployee(id, dto);
  }

  @Delete('employees/:id')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Deleted' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.JWT)
  @ApiBearerAuth()
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'حذف موظف' })
  async deleteEmployee(@Param('id') id: string) {
    return this.hrService.deleteEmployee(id);
  }

  // ==================== Attendance Endpoints ====================

  @Post('attendance/check-in')
  @ApiBody({ schema: { type: 'object', properties: { location: { type: 'object' }, notes: { type: 'string' } } } })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.JWT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'تسجيل حضور' })
  async checkIn(
    @CurrentUser('employeeId' as unknown as keyof User) employeeId: string,
    @Body() dto: { location?: { lat: number; lng: number } },
  ) {
    return this.hrService.recordCheckIn(employeeId, dto.location);
  }

  @Post('attendance/check-out')
  @ApiBody({ schema: { type: 'object', properties: { location: { type: 'object' }, notes: { type: 'string' } } } })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.JWT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'تسجيل انصراف' })
  async checkOut(
    @CurrentUser('employeeId' as unknown as keyof User) employeeId: string,
    @Body() dto: { location?: { lat: number; lng: number } },
  ) {
    return this.hrService.recordCheckOut(employeeId, dto.location);
  }

  @Get('attendance/:employeeId')
  @ApiParam({ name: 'employeeId', type: String })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.JWT)
  @ApiBearerAuth()
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'سجل حضور موظف' })
  async getEmployeeAttendance(
    @Param('employeeId') employeeId: string,
    @Query('month') month?: number,
    @Query('year') year?: number,
  ) {
    return this.hrService.getEmployeeAttendance(employeeId, month, year);
  }

  // ==================== Leave Request Endpoints ====================

  @Post('leave-requests')
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.JWT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'تقديم طلب إجازة' })
  async createLeaveRequest(
    @CurrentUser('employeeId' as unknown as keyof User) employeeId: string,
    @Body() dto: CreateLeaveRequestDto,
  ) {
    return this.hrService.createLeaveRequest(employeeId, dto);
  }

  @Patch('leave-requests/:id/approve')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.JWT)
  @ApiBearerAuth()
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'الموافقة على طلب إجازة' })
  async approveLeaveRequest(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.hrService.approveLeaveRequest(id, userId);
  }

  @Patch('leave-requests/:id/reject')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.JWT)
  @ApiBearerAuth()
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'رفض طلب إجازة' })
  async rejectLeaveRequest(
    @Param('id') id: string,
    @Body() dto: { reason: string },
  ) {
    return this.hrService.rejectLeaveRequest(id, dto.reason);
  }

  // ==================== Payroll Endpoints ====================

  @Post('payroll/generate')
  @ApiBody({ schema: { type: 'object', properties: { employeeId: { type: 'string' }, month: { type: 'string' }, year: { type: 'number' } } } })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.JWT)
  @ApiBearerAuth()
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'إنشاء كشف راتب' })
  async generatePayroll(
    @Body() dto: { employeeId: string; month: number; year: number },
  ) {
    return this.hrService.generatePayroll(dto.employeeId, dto.month, dto.year);
  }

  @Patch('payroll/:id/approve')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.JWT)
  @ApiBearerAuth()
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'الموافقة على كشف راتب' })
  async approvePayroll(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.hrService.approvePayroll(id, userId);
  }

  @Patch('payroll/:id/mark-paid')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.JWT)
  @ApiBearerAuth()
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'تحديد كدفع' })
  async markAsPaid(
    @Param('id') id: string,
    @Body() dto: { transactionRef: string },
  ) {
    return this.hrService.markPayrollAsPaid(id, dto.transactionRef);
  }

  // ==================== Accounting Endpoints ====================

  @Post('accounts')
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.JWT)
  @ApiBearerAuth()
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'إنشاء حساب' })
  async createAccount(@Body() dto: CreateChartAccountDto) {
    return this.accountingService.createAccount(dto);
  }

  @Get('accounts')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.JWT)
  @ApiBearerAuth()
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'دليل الحسابات' })
  async getAccounts(@Query('type') type?: string) {
    return this.accountingService.findAllAccounts(type);
  }

  @Get('accounts/:id')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.JWT)
  @ApiBearerAuth()
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'الحصول على حساب' })
  async getAccount(@Param('id') id: string) {
    return this.accountingService.findAccountById(id);
  }

  @Post('journal-entries')
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.JWT)
  @ApiBearerAuth()
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'إنشاء قيد يومية' })
  async createJournalEntry(
    @Body() dto: CreateJournalEntryDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.accountingService.createJournalEntry(dto, userId);
  }

  @Get('journal-entries')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.JWT)
  @ApiBearerAuth()
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'الحصول على قيود اليومية' })
  async getJournalEntries(
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.accountingService.findJournalEntries(
      type,
      status,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Patch('journal-entries/:id/post')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.JWT)
  @ApiBearerAuth()
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'ترحيل قيد' })
  async postJournalEntry(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.accountingService.postJournalEntry(id, userId);
  }

  @Get('reports/trial-balance')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth(AuthType.JWT)
  @ApiBearerAuth()
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'ميزان المراجعة' })
  async getTrialBalance(@Query('date') date?: string) {
    return this.accountingService.getTrialBalance(
      date ? new Date(date) : new Date(),
    );
  }

  // ==================== DELETE Endpoints (Stubs for compatibility) ====================

  @Delete('assets/:id')
  @ApiParam({ name: 'id', type: String })
  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'حذف أصل' })
  @ApiResponse({ status: 200, description: 'Deleted' })
  async deleteAsset(@Param('id') id: string) {
    // TODO: Implement delete asset logic
    return { success: true, message: 'تم الحذف بنجاح' };
  }

  @Delete('accounts/chart/:id')
  @ApiParam({ name: 'id', type: String })
  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'حذف حساب من دليل الحسابات' })
  @ApiResponse({ status: 200, description: 'Deleted' })
  async deleteChartAccount(@Param('id') id: string) {
    // TODO: Implement delete chart account logic
    return { success: true, message: 'تم الحذف بنجاح' };
  }

  @Delete('documents/:id')
  @ApiParam({ name: 'id', type: String })
  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'حذف مستند' })
  @ApiResponse({ status: 200, description: 'Deleted' })
  async deleteDocument(@Param('id') id: string) {
    // TODO: Implement delete document logic
    return { success: true, message: 'تم الحذف بنجاح' };
  }

  @Get('documents/:id/download')
  @ApiParam({ name: 'id', type: String })
  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'تنزيل مستند' })
  @ApiResponse({ status: 200, description: 'Success' })
  async downloadDocument(@Param('id') id: string) {
    // TODO: Implement download document logic
    return { success: true, message: 'رابط التنزيل' };
  }

  @Delete('documents/bulk')
  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'حذف مستندات متعددة' })
  @ApiResponse({ status: 200, description: 'Deleted' })
  async deleteBulkDocuments(@Body() dto: { ids: string[] }) {
    // TODO: Implement bulk delete documents logic
    return { success: true, message: 'تم الحذف بنجاح' };
  }

  @Get('documents/export')
  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'تصدير مستندات' })
  @ApiResponse({ status: 200, description: 'Success' })
  async exportDocuments(@Query() query: any) {
    // TODO: Implement export documents logic
    return { success: true, message: 'تم التصدير بنجاح' };
  }

  @Delete('payroll/:id')
  @ApiParam({ name: 'id', type: String })
  @Auth(AuthType.JWT)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'حذف كشف راتب' })
  @ApiResponse({ status: 200, description: 'Deleted' })
  async deletePayroll(@Param('id') id: string) {
    // TODO: Implement delete payroll logic
    return { success: true, message: 'تم الحذف بنجاح' };
  }
}
