import axiosInstance from "../utils/axios";

export interface Attendance {
  _id?: string;
  employee: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  status: 'present' | 'absent' | 'late';
  createdAt?: string;
  updatedAt?: string;
}

export interface AttendanceFormData {
  employee: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  status: 'present' | 'absent' | 'late';
}

export interface AttendanceStats {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  averageHours: number;
}

// Get attendance records with optional filtering
export async function getAttendance(params?: {
  employee?: string;
  date?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}): Promise<{
  attendance: Attendance[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const { data } = await axiosInstance.get<{
    attendance: Attendance[];
    total: number;
    page: number;
    pageSize: number;
  }>("/attendance", {
    params,
    headers: { "x-silent-401": "1" }
  });
  return data;
}

// Record attendance
export async function recordAttendance(attendance: AttendanceFormData): Promise<Attendance> {
  const { data } = await axiosInstance.post<Attendance>("/attendance", attendance);
  return data;
}

// Get attendance for specific employee
export async function getEmployeeAttendance(employeeId: string): Promise<Attendance[]> {
  const { data } = await axiosInstance.get<Attendance[]>("/attendance", {
    params: { employee: employeeId },
    headers: { "x-silent-401": "1" }
  });
  return data;
}

// Get attendance statistics
export async function getAttendanceStats(date?: string): Promise<AttendanceStats> {
  const { data } = await axiosInstance.get<AttendanceStats>("/attendance/stats", {
    params: { date },
    headers: { "x-silent-401": "1" }
  });
  return data;
}

// Get today's attendance summary
export async function getTodayAttendance(): Promise<{
  present: number;
  absent: number;
  late: number;
  total: number;
}> {
  const { data } = await axiosInstance.get<{
    present: number;
    absent: number;
    late: number;
    total: number;
  }>("/attendance/today", {
    headers: { "x-silent-401": "1" }
  });
  return data;
}
