import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Attendance } from '../../er/entities/attendance.entity';
import { Driver } from '../../driver/entities/driver.entity';
import {
  AttendanceMatchQuery,
  AttendanceDocument,
} from '../interfaces/admin.interfaces';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(Attendance.name)
    private attendanceModel: Model<Attendance>,
    @InjectModel(Driver.name)
    private driverModel: Model<Driver>,
  ) {}

  async getDriverAttendance(
    driverId: string,
    query?: { month?: number; year?: number },
  ) {
    const matchQuery: AttendanceMatchQuery = {
      employeeId: new Types.ObjectId(driverId),
      employeeModel: 'Driver',
    };

    if (query?.month && query?.year) {
      const startDate = new Date(query.year, query.month - 1, 1);
      const endDate = new Date(query.year, query.month, 0, 23, 59, 59);
      matchQuery.date = { $gte: startDate, $lte: endDate };
    } else if (query?.year) {
      const startDate = new Date(query.year, 0, 1);
      const endDate = new Date(query.year, 11, 31, 23, 59, 59);
      matchQuery.date = { $gte: startDate, $lte: endDate };
    }

    const attendanceRecords = await this.attendanceModel
      .find(matchQuery)
      .sort({ date: 1 });

    // Calculate summary
    const summary = {
      present: attendanceRecords.filter(
        (a) => (a as unknown as AttendanceDocument).status === 'present',
      ).length,
      absent: attendanceRecords.filter(
        (a) => (a as unknown as AttendanceDocument).status === 'absent',
      ).length,
      late: attendanceRecords.filter(
        (a) => (a as unknown as AttendanceDocument).isLate,
      ).length,
      totalDays: attendanceRecords.length,
    };

    return {
      data: attendanceRecords,
      summary,
    };
  }

  async getAttendanceSummary(date?: string) {
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const records = await this.attendanceModel
      .find({
        employeeModel: 'Driver',
        date: { $gte: targetDate, $lt: nextDay },
      })
      .populate('employeeId', 'fullName phone');

    const summary = await this.attendanceModel.aggregate([
      {
        $match: {
          employeeModel: 'Driver',
          date: { $gte: targetDate, $lt: nextDay },
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    return {
      data: records,
      total: records.length,
      summary,
    };
  }

  async adjustAttendance(data: {
    driverId: string;
    data: {
      date: string;
      checkIn?: string;
      checkOut?: string;
      reason: string;
    };
    adminId: string;
  }) {
    const driver = await this.driverModel.findById(data.driverId);
    if (!driver) {
      throw new NotFoundException({
        code: 'DRIVER_NOT_FOUND',
        userMessage: 'السائق غير موجود',
      });
    }

    const targetDate = new Date(data.data.date);
    targetDate.setHours(0, 0, 0, 0);

    let attendance = await this.attendanceModel.findOne({
      employeeId: new Types.ObjectId(data.driverId),
      employeeModel: 'Driver',
      date: targetDate,
    });

    if (!attendance) {
      // Create new attendance record
      attendance = new this.attendanceModel({
        employee: new Types.ObjectId(data.driverId),
        date: targetDate,
        checkIn: data.data.checkIn
          ? new Date(`${data.data.date}T${data.data.checkIn}`)
          : new Date(),
        checkOut: data.data.checkOut
          ? new Date(`${data.data.date}T${data.data.checkOut}`)
          : undefined,
        status: 'present',
        notes: `Manual adjustment by admin: ${data.data.reason}`,
        isManualEntry: true,
      });
    } else {
      // Update existing record
      const attendanceDoc = attendance as unknown as AttendanceDocument;
      if (data.data.checkIn) {
        attendanceDoc.checkIn = new Date(
          `${data.data.date}T${data.data.checkIn}`,
        );
      }
      if (data.data.checkOut) {
        attendanceDoc.checkOut = new Date(
          `${data.data.date}T${data.data.checkOut}`,
        );
      }
      attendanceDoc.notes = `Adjusted by admin: ${data.data.reason}`;
    }

    await attendance.save();

    return {
      success: true,
      message: 'تم تعديل الحضور',
    };
  }

  async getMonthlyAttendanceReport(month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const stats = await this.attendanceModel.aggregate<{
      _id: Types.ObjectId;
      totalDays: number;
      presentDays: number;
      absentDays: number;
      lateDays: number;
    }>([
      {
        $match: {
          employeeModel: 'Driver',
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$employeeId',
          totalDays: { $sum: 1 },
          presentDays: {
            $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] },
          },
          absentDays: {
            $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] },
          },
          lateDays: { $sum: { $cond: ['$isLate', 1, 0] } },
        },
      },
    ]);

    // Populate driver details
    const driversMap = new Map<string, { fullName: string; phone: string }>();
    for (const stat of stats) {
      const driver = await this.driverModel
        .findById(stat._id)
        .select('fullName phone');
      if (driver) {
        driversMap.set(stat._id.toString(), {
          fullName: driver.fullName,
          phone: driver.phone,
        });
      }
    }

    const report = stats.map((stat) => ({
      driver: driversMap.get(stat._id.toString()),
      _id: stat._id,
      totalDays: stat.totalDays,
      presentDays: stat.presentDays,
      absentDays: stat.absentDays,
      lateDays: stat.lateDays,
    }));

    return { data: report, total: report.length };
  }

  async getAllDriversAttendance(targetDate: Date, page: number = 1, limit: number = 20) {
    const startDate = new Date(targetDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(targetDate);
    endDate.setHours(23, 59, 59, 999);

    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      this.attendanceModel
        .find({
          employeeModel: 'Driver',
          date: { $gte: startDate, $lte: endDate },
        })
        .populate('employeeId', 'fullName phone')
        .skip(skip)
        .limit(limit)
        .sort({ date: -1 }),
      this.attendanceModel.countDocuments({
        employeeModel: 'Driver',
        date: { $gte: startDate, $lte: endDate },
      }),
    ]);

    return {
      data: records,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  private isValidTime(time: string): boolean {
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }
}
