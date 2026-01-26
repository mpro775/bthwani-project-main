import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ERController } from './er.controller';
import { EmployeesCompatController } from './employees-compat.controller';
import { HRService } from './services/hr.service';
import { AccountingService } from './services/accounting.service';
import { Employee, EmployeeSchema } from './entities/employee.entity';
import { Attendance, AttendanceSchema } from './entities/attendance.entity';
import {
  LeaveRequest,
  LeaveRequestSchema,
} from './entities/leave-request.entity';
import { Payroll, PayrollSchema } from './entities/payroll.entity';
import {
  ChartOfAccounts,
  ChartOfAccountsSchema,
} from './entities/chart-of-accounts.entity';
import {
  JournalEntry,
  JournalEntrySchema,
} from './entities/journal-entry.entity';
import {
  PerformanceReview,
  PerformanceReviewSchema,
} from './entities/performance.entity';
import { Task, TaskSchema } from './entities/task.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Employee.name, schema: EmployeeSchema },
      { name: Attendance.name, schema: AttendanceSchema },
      { name: LeaveRequest.name, schema: LeaveRequestSchema },
      { name: Payroll.name, schema: PayrollSchema },
      { name: ChartOfAccounts.name, schema: ChartOfAccountsSchema },
      { name: JournalEntry.name, schema: JournalEntrySchema },
      { name: PerformanceReview.name, schema: PerformanceReviewSchema },
      { name: Task.name, schema: TaskSchema },
    ]),
    JwtModule.register({}),
  ],
  controllers: [ERController, EmployeesCompatController],
  providers: [HRService, AccountingService],
  exports: [HRService, AccountingService],
})
export class ERModule {}
