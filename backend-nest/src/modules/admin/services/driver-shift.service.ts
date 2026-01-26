import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DriverShift } from '../../driver/entities/driver-shift.entity';
import { Driver } from '../../driver/entities/driver.entity';
import { ShiftData } from '../interfaces/admin.interfaces';

@Injectable()
export class DriverShiftService {
  constructor(
    @InjectModel(DriverShift.name)
    private shiftModel: Model<DriverShift>,
    @InjectModel(Driver.name)
    private driverModel: Model<Driver>,
  ) {}

  async getAllShifts() {
    const shifts = await this.shiftModel
      .find({ isActive: true })
      .populate('assignments.driverId', 'fullName phone')
      .sort({ startTime: 1 });

    return { data: shifts, total: shifts.length };
  }

  async getShiftById(shiftId: string): Promise<DriverShift> {
    const shift = await this.shiftModel
      .findById(shiftId)
      .populate('assignments.driverId', 'fullName phone');

    if (!shift) {
      throw new NotFoundException({
        code: 'SHIFT_NOT_FOUND',
        userMessage: 'الوردية غير موجودة',
      });
    }

    return shift;
  }

  async createShift(
    shiftData: ShiftData,
    adminId: string,
  ): Promise<DriverShift> {
    // Validate times
    if (
      !this.isValidTime(shiftData.startTime) ||
      !this.isValidTime(shiftData.endTime)
    ) {
      throw new BadRequestException({
        code: 'INVALID_TIME_FORMAT',
        userMessage: 'صيغة الوقت غير صحيحة (استخدم HH:MM)',
      });
    }

    const shift = new this.shiftModel({
      ...shiftData,
      createdBy: new Types.ObjectId(adminId),
      assignments: [],
    });

    return await shift.save();
  }

  async updateShift(
    shiftId: string,
    updates: Partial<DriverShift>,
  ): Promise<DriverShift> {
    const shift = await this.shiftModel.findById(shiftId);
    if (!shift) {
      throw new NotFoundException({
        code: 'SHIFT_NOT_FOUND',
        userMessage: 'الوردية غير موجودة',
      });
    }

    // Validate times if being updated
    if (updates.startTime && !this.isValidTime(updates.startTime)) {
      throw new BadRequestException({
        code: 'INVALID_TIME_FORMAT',
        userMessage: 'صيغة الوقت غير صحيحة',
      });
    }
    if (updates.endTime && !this.isValidTime(updates.endTime)) {
      throw new BadRequestException({
        code: 'INVALID_TIME_FORMAT',
        userMessage: 'صيغة الوقت غير صحيحة',
      });
    }

    Object.assign(shift, updates);
    return await shift.save();
  }

  async assignShiftToDriver(
    shiftId: string,
    driverId: string,
    startDate: string,
    endDate?: string,
  ): Promise<{ success: boolean; message: string }> {
    const shift = await this.shiftModel.findById(shiftId);
    if (!shift) {
      throw new NotFoundException({
        code: 'SHIFT_NOT_FOUND',
        userMessage: 'الوردية غير موجودة',
      });
    }

    const driver = await this.driverModel.findById(driverId);
    if (!driver) {
      throw new NotFoundException({
        code: 'DRIVER_NOT_FOUND',
        userMessage: 'السائق غير موجود',
      });
    }

    // Check if driver already assigned to this shift
    const existing = shift.assignments.find(
      (a) => a.driverId.toString() === driverId && a.isActive,
    );
    if (existing) {
      throw new BadRequestException({
        code: 'DRIVER_ALREADY_ASSIGNED',
        userMessage: 'السائق مُعيَّن بالفعل لهذه الوردية',
      });
    }

    // Check shift capacity
    const activeAssignments = shift.assignments.filter((a) => a.isActive);
    if (shift.maxDrivers && activeAssignments.length >= shift.maxDrivers) {
      throw new BadRequestException({
        code: 'SHIFT_FULL',
        userMessage: 'الوردية مكتملة',
      });
    }

    // Check for conflicts with other shifts
    await this.checkShiftConflicts(driverId, startDate, endDate);

    shift.assignments.push({
      driverId: new Types.ObjectId(driverId),
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      isActive: true,
    });

    await shift.save();

    return {
      success: true,
      message: 'تم تعيين الوردية للسائق',
    };
  }

  async unassignShiftFromDriver(
    shiftId: string,
    driverId: string,
  ): Promise<{ success: boolean; message: string }> {
    const shift = await this.shiftModel.findById(shiftId);
    if (!shift) {
      throw new NotFoundException({
        code: 'SHIFT_NOT_FOUND',
        userMessage: 'الوردية غير موجودة',
      });
    }

    const assignment = shift.assignments.find(
      (a) => a.driverId.toString() === driverId && a.isActive,
    );

    if (!assignment) {
      throw new NotFoundException({
        code: 'ASSIGNMENT_NOT_FOUND',
        userMessage: 'التعيين غير موجود',
      });
    }

    assignment.isActive = false;
    assignment.endDate = new Date();

    await shift.save();

    return {
      success: true,
      message: 'تم إلغاء تعيين الوردية',
    };
  }

  async getDriverShifts(driverId: string) {
    const shifts = await this.shiftModel
      .find({
        'assignments.driverId': new Types.ObjectId(driverId),
        'assignments.isActive': true,
      })
      .sort({ startTime: 1 });

    return { data: shifts, total: shifts.length };
  }

  async getDriversShifts({ status, date, page, limit }: {
    status?: string;
    date?: string;
    page: number;
    limit: number;
  }) {
    const query: any = { isActive: true };
    const skip = (page - 1) * limit;

    if (status) {
      query.status = status;
    }

    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      query.createdAt = { $gte: startOfDay, $lte: endOfDay };
    }

    const [shifts, total] = await Promise.all([
      this.shiftModel
        .find(query)
        .populate('assignments.driverId', 'fullName phone')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      this.shiftModel.countDocuments(query),
    ]);

    return {
      data: shifts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getShiftDrivers(shiftId: string) {
    const shift = await this.shiftModel
      .findById(shiftId)
      .populate('assignments.driverId', 'fullName phone isAvailable');

    if (!shift) {
      throw new NotFoundException({
        code: 'SHIFT_NOT_FOUND',
        userMessage: 'الوردية غير موجودة',
      });
    }

    const activeAssignments = shift.assignments.filter((a) => a.isActive);

    return {
      shift,
      drivers: activeAssignments,
      total: activeAssignments.length,
    };
  }

  async deleteShift(shiftId: string): Promise<void> {
    const shift = await this.shiftModel.findById(shiftId);
    if (!shift) {
      throw new NotFoundException({
        code: 'SHIFT_NOT_FOUND',
        userMessage: 'الوردية غير موجودة',
      });
    }

    const activeAssignments = shift.assignments.filter((a) => a.isActive);
    if (activeAssignments.length > 0) {
      throw new BadRequestException({
        code: 'SHIFT_HAS_ASSIGNMENTS',
        userMessage: 'لا يمكن حذف وردية لديها سائقين معيّنين',
      });
    }

    shift.isActive = false;
    await shift.save();
  }

  private async checkShiftConflicts(
    driverId: string,
    startDate: string,
    endDate?: string,
  ): Promise<void> {
    const driverObjectId = new Types.ObjectId(driverId);
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date('2099-12-31');

    const conflicts = await this.shiftModel.find({
      'assignments.driverId': driverObjectId,
      'assignments.isActive': true,
      $or: [
        {
          'assignments.startDate': { $lte: end },
          'assignments.endDate': { $gte: start },
        },
        {
          'assignments.startDate': { $lte: end },
          'assignments.endDate': null,
        },
      ],
    });

    if (conflicts.length > 0) {
      throw new BadRequestException({
        code: 'SHIFT_CONFLICT',
        userMessage: 'السائق لديه وردية متعارضة في هذه الفترة',
      });
    }
  }

  private isValidTime(time: string): boolean {
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }
}
