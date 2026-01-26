import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { AdminController } from './admin.controller';
import { AdminCMSController } from './admin-cms.controller';
import { AdminKawaderController } from './kawader.admin.controller';
import { AdminKenzController } from './kenz.admin.controller';
import { AdminMaaroufController } from './maarouf.admin.controller';
import { AdminSanadController } from './sanad.admin.controller';
import { AdminPaymentsController } from './payments.admin.controller';
import { AdminAmaniController } from './amani.admin.controller';
import { AdminArabonController } from './arabon.admin.controller';
import { AdminEs3afniController } from './es3afni.admin.controller';
import { AdminService } from './admin.service';
import {
  WithdrawalService,
  AuditService,
  SupportAdminService,
  DataDeletionService,
  SettingsService,
  FeatureFlagService,
  SecurityService,
  DriverShiftService,
  AttendanceService,
  LeaveService,
  MarketerService,
  BackupService,
} from './services';
import { AmaniService } from '../amani/amani.service';
import { ArabonService } from '../arabon/arabon.service';
import { Es3afniService } from '../es3afni/es3afni.service';
import { User, UserSchema } from '../auth/entities/user.entity';
import { Order, OrderSchema } from '../order/entities/order.entity';
import { Driver, DriverSchema } from '../driver/entities/driver.entity';
import { Vendor, VendorSchema } from '../vendor/entities/vendor.entity';
import { Store, StoreSchema } from '../store/entities/store.entity';
import {
  WithdrawalRequest,
  WithdrawalRequestSchema,
} from '../finance/entities/withdrawal-request.entity';
import {
  SupportTicket,
  SupportTicketSchema,
} from '../support/entities/support-ticket.entity';
import { AuditLog, AuditLogSchema } from './entities/audit-log.entity';
import {
  DataDeletionRequest,
  DataDeletionRequestSchema,
} from '../legal/entities/data-deletion-request.entity';
import { AppSettings, AppSettingsSchema } from './entities/app-settings.entity';
import {
  FeatureFlag,
  FeatureFlagSchema,
} from './entities/feature-flag.entity';
import {
  LoginAttempt,
  LoginAttemptSchema,
} from './entities/login-attempt.entity';
import {
  BackupRecord,
  BackupRecordSchema,
} from './entities/backup-record.entity';
import { Role, RoleSchema } from './entities/role.entity';
import {
  DriverShift,
  DriverShiftSchema,
} from '../driver/entities/driver-shift.entity';
import { Attendance, AttendanceSchema } from '../er/entities/attendance.entity';
import {
  LeaveRequest,
  LeaveRequestSchema,
} from '../er/entities/leave-request.entity';
import { Marketer, MarketerSchema } from '../marketer/entities/marketer.entity';
import {
  CommissionPlan,
  CommissionPlanSchema,
} from '../marketer/entities/commission-plan.entity';
import {
  Onboarding,
  OnboardingSchema,
} from '../marketer/entities/onboarding.entity';
import { Amani, AmaniSchema } from '../amani/entities/amani.entity';
import { Arabon, ArabonSchema } from '../arabon/entities/arabon.entity';
import { Es3afni, Es3afniSchema } from '../es3afni/entities/es3afni.entity';
import { KawaderModule } from '../kawader/kawader.module';
import { KenzModule } from '../kenz/kenz.module';
import { MaaroufModule } from '../maarouf/maarouf.module';
import { SanadModule } from '../sanad/sanad.module';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Driver.name, schema: DriverSchema },
      { name: Vendor.name, schema: VendorSchema },
      { name: Store.name, schema: StoreSchema },
      { name: WithdrawalRequest.name, schema: WithdrawalRequestSchema },
      { name: SupportTicket.name, schema: SupportTicketSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
      { name: DataDeletionRequest.name, schema: DataDeletionRequestSchema },
      { name: AppSettings.name, schema: AppSettingsSchema },
      { name: FeatureFlag.name, schema: FeatureFlagSchema },
      { name: LoginAttempt.name, schema: LoginAttemptSchema },
      { name: BackupRecord.name, schema: BackupRecordSchema },
      { name: Role.name, schema: RoleSchema },
      { name: DriverShift.name, schema: DriverShiftSchema },
      { name: Attendance.name, schema: AttendanceSchema },
      { name: LeaveRequest.name, schema: LeaveRequestSchema },
      { name: Marketer.name, schema: MarketerSchema },
      { name: CommissionPlan.name, schema: CommissionPlanSchema },
      { name: Onboarding.name, schema: OnboardingSchema },
      { name: Amani.name, schema: AmaniSchema },
      { name: Arabon.name, schema: ArabonSchema },
      { name: Es3afni.name, schema: Es3afniSchema },
    ]),
    JwtModule.register({}),
    KawaderModule,
    KenzModule,
    MaaroufModule,
    SanadModule,
    PaymentsModule,
  ],
  controllers: [AdminController, AdminCMSController, AdminKawaderController, AdminKenzController, AdminMaaroufController, AdminSanadController, AdminPaymentsController, AdminAmaniController, AdminArabonController, AdminEs3afniController],
  providers: [
    AdminService,
    WithdrawalService,
    AuditService,
    SupportAdminService,
    DataDeletionService,
    SettingsService,
    FeatureFlagService,
    SecurityService,
    DriverShiftService,
    AttendanceService,
    LeaveService,
    MarketerService,
    BackupService,
    AmaniService,
    ArabonService,
    Es3afniService,
  ],
  exports: [
    AdminService,
    WithdrawalService,
    AuditService,
    SupportAdminService,
    DataDeletionService,
    SettingsService,
    FeatureFlagService,
    SecurityService,
    DriverShiftService,
    AttendanceService,
    LeaveService,
    MarketerService,
    BackupService,
    AmaniService,
    ArabonService,
    Es3afniService,
  ],
})
export class AdminModule {}
