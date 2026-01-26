import axiosInstance from "../utils/axios";
import type { DriverLeaveRequest } from "./driverLeaveRequests";

export interface Driver {
  _id?: string;
  fullName: string;
  email: string;
  averageRating?: number;
  totalRatings?: number;
  phone: string;
  role: "rider_driver" | "light_driver" | "women_driver";
  vehicleType: "motor" | "bike" | "car";
  driverType: "primary" | "joker";
  isAvailable: boolean;
  isFemaleDriver: boolean;
  isVerified: boolean;
  isBanned: boolean;
  location?: {
    lat: number;
    lng: number;
    updatedAt: string;
  };
  residenceLocation?: {
    lat: number;
    lng: number;
    address: string;
    governorate: string;
    city: string;
  };
  currentLocation?: {
    lat: number;
    lng: number;
    updatedAt: string;
  };
  glReceivableAccount?: string;
  glDepositAccount?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DriverAttendanceDaily {
  _id?: string;
  driver: string;
  day: string;
  totalOnlineMins: number;
  firstCheckInAt?: string;
  lastCheckOutAt?: string;
  ordersDelivered: number;
  distanceKm: number;
  breaksCount: number;
  shiftsMatched: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface DriverAttendanceSession {
  _id?: string;
  driver: string;
  startAt: string;
  endAt?: string;
  status: "open" | "closed";
  ordersDelivered: number;
  distanceKm: number;
  breaksCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DriverShift {
  _id?: string;
  name: string;
  dayOfWeek?: number;
  specificDate?: string;
  startLocal: string;
  endLocal: string;
  area?: string;
  capacity: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DriverAsset {
  _id?: string;
  code: string;
  type: string;
  brand?: string;
  model?: string;
  serial?: string;
  status: "available" | "assigned" | "repair" | "lost" | "retired";
  assignedTo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DriverRating {
  _id?: string;
  driver: string;
  customer: string;
  order: string;
  rating: number;
  comment?: string;
  createdAt?: string;
}

// Get all drivers
export async function getDrivers(params?: {
  status?: string;
  vehicleType?: string;
  isAvailable?: boolean;
  page?: number;
  pageSize?: number;
}): Promise<{
  drivers: Driver[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const mapped = {
    page: params?.page,
    per_page: params?.pageSize,
    // filters إضافية عند الحاجة
  };
  const { data } = await axiosInstance.get<{
    drivers: Driver[];
    total: number;
    page: number;
    pageSize: number;
  }>("/admin/drivers", {
    params: mapped,
    headers: { "x-silent-401": "1" }
  });
  return data;
}

// Get driver by ID
export async function getDriver(id: string): Promise<Driver> {
  const { data } = await axiosInstance.get<Driver>(`/admin/drivers/${id}`, {
    headers: { "x-silent-401": "1" }
  });
  return data;
}

// Create new driver
export async function createDriver(driver: Omit<Driver, '_id' | 'createdAt' | 'updatedAt'>): Promise<Driver> {
  const { data } = await axiosInstance.post<Driver>("/admin/drivers", driver);
  return data;
}

// Update driver
export async function updateDriver(id: string, driver: Partial<Driver>): Promise<Driver> {
  const { data } = await axiosInstance.patch<Driver>(`/admin/drivers/${id}`, driver);
  return data;
}

// Delete driver
export async function deleteDriver(id: string): Promise<void> {
  await axiosInstance.delete(`/admin/drivers/${id}`);
}

// Get driver attendance daily
export async function getDriverAttendanceDaily(params?: {
  driver?: string;
  day?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}): Promise<{
  attendance: DriverAttendanceDaily[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const { data } = await axiosInstance.get<{
    attendance: DriverAttendanceDaily[];
    total: number;
    page: number;
    pageSize: number;
  }>("/admin/drivers/attendance", {
    params,
    headers: { "x-silent-401": "1" }
  });
  return data;
}

// Get driver attendance sessions
export async function getDriverAttendanceSessions(params?: {
  driver?: string;
  status?: "open" | "closed";
  page?: number;
  pageSize?: number;
}): Promise<{
  sessions: DriverAttendanceSession[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const { data } = await axiosInstance.get<{
    sessions: DriverAttendanceSession[];
    total: number;
    page: number;
    pageSize: number;
  }>("/admin/drivers/attendance/sessions", {
    params,
    headers: { "x-silent-401": "1" }
  });
  return data;
}

// Get driver shifts
export async function getDriverShifts(): Promise<DriverShift[]> {
  const { data } = await axiosInstance.get<DriverShift[]>("/admin/drivers/shifts", {
    headers: { "x-silent-401": "1" }
  });
  return data;
}

// Create driver shift
export async function createDriverShift(shift: Omit<DriverShift, '_id' | 'createdAt' | 'updatedAt'>): Promise<DriverShift> {
  const { data } = await axiosInstance.post<DriverShift>("/admin/drivers/shifts", shift);
  return data;
}

// Update driver shift
export async function updateDriverShift(id: string, shift: Partial<DriverShift>): Promise<DriverShift> {
  const { data } = await axiosInstance.patch<DriverShift>(`/admin/drivers/shifts/${id}`, shift);
  return data;
}

// Delete driver shift
export async function deleteDriverShift(id: string): Promise<void> {
  await axiosInstance.delete(`/admin/drivers/shifts/${id}`);
}

// Get driver assets
export async function getDriverAssets(params?: {
  status?: string;
  type?: string;
  page?: number;
  pageSize?: number;
}): Promise<{
  assets: DriverAsset[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const { data } = await axiosInstance.get<{
    assets: DriverAsset[];
    total: number;
    page: number;
    pageSize: number;
  }>("/admin/drivers/assets", {
    params,
    headers: { "x-silent-401": "1" }
  });
  return data;
}

// Create driver asset
export async function createDriverAsset(asset: Omit<DriverAsset, '_id' | 'createdAt' | 'updatedAt'>): Promise<DriverAsset> {
  const { data } = await axiosInstance.post<DriverAsset>("/admin/drivers/assets", asset);
  return data;
}

// Update driver asset
export async function updateDriverAsset(id: string, asset: Partial<DriverAsset>): Promise<DriverAsset> {
  const { data } = await axiosInstance.patch<DriverAsset>(`/admin/drivers/assets/${id}`, asset);
  return data;
}

// Delete driver asset
export async function deleteDriverAsset(id: string): Promise<void> {
  await axiosInstance.delete(`/admin/drivers/assets/${id}`);
}

// Get driver ratings
export async function getDriverRatings(params?: {
  driver?: string;
  rating?: number;
  page?: number;
  pageSize?: number;
}): Promise<{
  ratings: DriverRating[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const { data } = await axiosInstance.get<{
    ratings: DriverRating[];
    total: number;
    page: number;
    pageSize: number;
  }>("/admin/drivers/ratings", {
    params,
    headers: { "x-silent-401": "1" }
  });
  return data;
}

// Get driver leave requests
export async function getDriverLeaveRequests(params?: {
  driver?: string;
  status?: "pending" | "approved" | "rejected";
  page?: number;
  pageSize?: number;
}): Promise<{
  requests: DriverLeaveRequest[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const { data } = await axiosInstance.get<{
    requests: DriverLeaveRequest[];
    total: number;
    page: number;
    pageSize: number;
  }>("/admin/drivers/leave-requests", {
    params,
    headers: { "x-silent-401": "1" }
  });
  return data;
}
