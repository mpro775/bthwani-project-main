import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Employee } from '../entities/employee.entity';
import { Attendance } from '../entities/attendance.entity';
import { LeaveRequest } from '../entities/leave-request.entity';
import { Payroll } from '../entities/payroll.entity';
import { CreateLeaveRequestDto } from '../dto/create-leave-request.dto';
import { CreateEmployeeDto } from '../dto/create-employee.dto';

@Injectable()
export class HRService {
  constructor(
    @InjectModel(Employee.name)
    private employeeModel: Model<Employee>,
    @InjectModel(Attendance.name)
    private attendanceModel: Model<Attendance>,
    @InjectModel(LeaveRequest.name)
    private leaveRequestModel: Model<LeaveRequest>,
    @InjectModel(Payroll.name)
    private payrollModel: Model<Payroll>,
  ) {}

  // ==================== Employee Management ====================

  async createEmployee(dto: CreateEmployeeDto): Promise<Employee> {
    const employeeId = await this.generateEmployeeId();
    const employee = new this.employeeModel({
      ...dto,
      employeeId,
      hireDate: new Date(dto.hireDate),
    });
    return employee.save();
  }

  private async generateEmployeeId(): Promise<string> {
    const count = await this.employeeModel.countDocuments();
    return `EMP-${String(count + 1).padStart(4, '0')}`;
  }

  async findAllEmployees(status?: string): Promise<any[]> {
    const query: { status?: string } = {};
    if (status) query.status = status;
    return this.employeeModel.find(query).populate('manager').lean().exec();
  }

  async findEmployeeById(id: string): Promise<Employee> {
    const employee = await this.employeeModel.findById(id).populate('manager');
    if (!employee) {
      throw new NotFoundException('الموظف غير موجود');
    }
    return employee;
  }

  async updateEmployee(id: string, dto: any): Promise<Employee> {
    const employee = await this.employeeModel.findById(id);
    if (!employee) {
      throw new NotFoundException('الموظف غير موجود');
    }
    Object.assign(employee, dto);
    return employee.save();
  }

  // ==================== Attendance Management ====================

  async recordCheckIn(
    employeeId: string,
    location?: { lat: number; lng: number },
  ): Promise<Attendance> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // التحقق من عدم وجود سجل لنفس اليوم
    const existing = await this.attendanceModel.findOne({
      employee: employeeId,
      date: today,
    });

    if (existing) {
      throw new BadRequestException('تم تسجيل الحضور لهذا اليوم بالفعل');
    }

    const attendance = new this.attendanceModel({
      employee: employeeId,
      date: today,
      checkIn: new Date(),
      status: 'present',
      location: location ? { checkInLocation: location } : undefined,
      isManualEntry: false,
    });

    return attendance.save();
  }

  async recordCheckOut(
    employeeId: string,
    location?: { lat: number; lng: number },
  ): Promise<Attendance> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await this.attendanceModel.findOne({
      employee: employeeId,
      date: today,
    });

    if (!attendance) {
      throw new NotFoundException('لم يتم تسجيل الحضور اليوم');
    }

    if (attendance.checkOut) {
      throw new BadRequestException('تم تسجيل الانصراف بالفعل');
    }

    attendance.checkOut = new Date();

    // حساب ساعات العمل
    const workMs = attendance.checkOut.getTime() - attendance.checkIn.getTime();
    attendance.workHours = workMs / (1000 * 60 * 60); // بالساعات

    if (location && attendance.location) {
      attendance.location.checkOutLocation = location;
    }

    return attendance.save();
  }

  async getEmployeeAttendance(
    employeeId: string,
    month?: number,
    year?: number,
  ): Promise<any[]> {
    const query: {
      employee: string;
      date?: { $gte?: Date; $lte?: Date };
    } = { employee: employeeId };

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      query.date = { $gte: startDate, $lte: endDate };
    }

    return this.attendanceModel.find(query).sort({ date: -1 }).lean().exec();
  }

  // ==================== Leave Request Management ====================

  async createLeaveRequest(
    employeeId: string,
    dto: CreateLeaveRequestDto,
  ): Promise<LeaveRequest> {
    const requestNumber = await this.generateLeaveRequestNumber();

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    // حساب عدد الأيام
    const daysDiff = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    const leaveRequest = new this.leaveRequestModel({
      ...dto,
      requestNumber,
      employee: employeeId,
      startDate,
      endDate,
      days: daysDiff + 1,
      status: 'pending',
    });

    return leaveRequest.save();
  }

  private async generateLeaveRequestNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.leaveRequestModel.countDocuments({
      requestNumber: new RegExp(`^LR-${year}`),
    });
    return `LR-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  async approveLeaveRequest(
    id: string,
    approvedBy: string,
  ): Promise<LeaveRequest> {
    const request = await this.leaveRequestModel.findById(id);
    if (!request) {
      throw new NotFoundException('طلب الإجازة غير موجود');
    }

    if (request.status !== 'pending') {
      throw new BadRequestException('الطلب تم معالجته مسبقاً');
    }

    request.status = 'approved';
    request.approvedBy = approvedBy as unknown as Types.ObjectId;
    request.approvedAt = new Date();

    return request.save();
  }

  async rejectLeaveRequest(
    id: string,
    rejectionReason: string,
  ): Promise<LeaveRequest> {
    const request = await this.leaveRequestModel.findById(id);
    if (!request) {
      throw new NotFoundException('طلب الإجازة غير موجود');
    }

    request.status = 'rejected';
    request.rejectionReason = rejectionReason;

    return request.save();
  }

  // ==================== Payroll Management ====================

  async generatePayroll(
    employeeId: string,
    month: number,
    year: number,
  ): Promise<Payroll> {
    const payrollNumber = `PR-${year}-${String(month).padStart(2, '0')}-${employeeId.slice(-4)}`;

    const employee = await this.employeeModel.findById(employeeId);
    if (!employee) {
      throw new NotFoundException('الموظف غير موجود');
    }

    // حساب أيام العمل والغياب
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const attendance = await this.attendanceModel.find({
      employee: employeeId,
      date: { $gte: startDate, $lte: endDate },
    });

    const workingDays = attendance.filter((a) => a.status === 'present').length;
    const absentDays = attendance.filter((a) => a.status === 'absent').length;
    const overtimeHours = attendance.reduce(
      (sum, a) => sum + (a.overtimeHours || 0),
      0,
    );

    // حساب الراتب
    const baseSalary = employee.salary;
    const overtimePay = overtimeHours * (baseSalary / (30 * 8)); // افتراض 8 ساعات يوم
    const netSalary = baseSalary + overtimePay;

    const payroll = new this.payrollModel({
      payrollNumber,
      employee: employeeId,
      month,
      year,
      baseSalary,
      allowances: 0,
      bonuses: 0,
      overtimePay,
      deductions: 0,
      netSalary,
      workingDays,
      absentDays,
      lateDays: 0,
      overtimeHours,
      status: 'draft',
    });

    return payroll.save();
  }

  async approvePayroll(id: string, approvedBy: string): Promise<Payroll> {
    const payroll = await this.payrollModel.findById(id);
    if (!payroll) {
      throw new NotFoundException('كشف الراتب غير موجود');
    }

    payroll.status = 'approved';
    payroll.approvedBy = approvedBy as unknown as Types.ObjectId;
    payroll.approvedAt = new Date();

    return payroll.save();
  }

  async markPayrollAsPaid(
    id: string,
    transactionRef: string,
  ): Promise<Payroll> {
    const payroll = await this.payrollModel.findById(id);
    if (!payroll) {
      throw new NotFoundException('كشف الراتب غير موجود');
    }

    payroll.status = 'paid';
    payroll.paidAt = new Date();
    payroll.transactionRef = transactionRef;

    return payroll.save();
  }

  async deleteEmployee(id: string): Promise<void> {
    const employee = await this.employeeModel.findById(id);
    if (!employee) {
      throw new NotFoundException('الموظف غير موجود');
    }

    // تحديث حالة الموظف بدلاً من الحذف الفعلي
    employee.status = 'terminated';
    await employee.save();
  }
}
