/**
 * ER/HR System Types
 * أنواع نظام الموارد البشرية
 */

// ==================== Employee Types ====================

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  salary: number;
  hireDate: string;
  status: 'active' | 'inactive' | 'terminated';
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeeDto {
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  salary: number;
  hireDate: string;
}

export interface UpdateEmployeeDto {
  name?: string;
  email?: string;
  phone?: string;
  position?: string;
  department?: string;
  salary?: number;
  status?: 'active' | 'inactive' | 'terminated';
}

// ==================== Attendance Types ====================

export interface Attendance {
  id: string;
  employeeId: string;
  checkIn: string;
  checkOut?: string;
  date: string;
  hours?: number;
  location?: { lat: number; lng: number };
}

// ==================== Leave Request Types ====================

export interface LeaveRequest {
  id: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  type: 'annual' | 'sick' | 'unpaid' | 'emergency';
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface CreateLeaveRequestDto {
  startDate: string;
  endDate: string;
  type: 'annual' | 'sick' | 'unpaid' | 'emergency';
  reason: string;
}

// ==================== Payroll Types ====================

export interface Payroll {
  id: string;
  employeeId: string;
  month: number;
  year: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: 'draft' | 'approved' | 'paid';
  approvedBy?: string;
  paidAt?: string;
  transactionRef?: string;
  createdAt: string;
}

// ==================== Accounting Types ====================

export interface ChartAccount {
  id: string;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  parentId?: string;
  balance: number;
  isActive: boolean;
}

export interface CreateChartAccountDto {
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  parentId?: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  description: string;
  type: string;
  status: 'draft' | 'posted';
  entries: Array<{
    accountId: string;
    debit: number;
    credit: number;
  }>;
  postedBy?: string;
  postedAt?: string;
  createdBy: string;
  createdAt: string;
}

export interface CreateJournalEntryDto {
  date: string;
  description: string;
  type: string;
  entries: Array<{
    accountId: string;
    debit: number;
    credit: number;
  }>;
}

// ==================== Response Types ====================

export interface ERResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

