import axiosInstance from "../utils/axios";

export interface Payroll {
  _id?: string;
  employee: string;
  periodStart: string;
  periodEnd: string;
  grossAmount: number;
  deductions: number;
  netAmount: number;
  status: 'pending' | 'processed';
  createdAt?: string;
  updatedAt?: string;
}

export interface PayrollFormData {
  employee: string;
  periodStart: string;
  periodEnd: string;
  grossAmount: number;
  deductions: number;
  netAmount: number;
  status: 'pending' | 'processed';
}

export interface PayrollProcessData {
  employee: string;
  periodStart: string;
  periodEnd: string;
  grossAmount: number;
  deductions?: number;
  incentives?: number;
}

// Get all payrolls
export async function getPayrolls(): Promise<Payroll[]> {
  const { data } = await axiosInstance.get<Payroll[]>("/er/payroll", {
    headers: { "x-silent-401": "1" }
  });
  return data;
}

// Get payroll by ID
export async function getPayroll(id: string): Promise<Payroll> {
  const { data } = await axiosInstance.get<Payroll>(`/er/payroll/${id}`, {
    headers: { "x-silent-401": "1" }
  });
  return data;
}

// Create new payroll
export async function createPayroll(payroll: PayrollFormData): Promise<Payroll> {
  const { data } = await axiosInstance.post<Payroll>("/er/payroll", payroll);
  return data;
}

// Update payroll
export async function updatePayroll(id: string, payroll: Partial<PayrollFormData>): Promise<Payroll> {
  const { data } = await axiosInstance.patch<Payroll>(`/er/payroll/${id}`, payroll);
  return data;
}

// Delete payroll
export async function deletePayroll(id: string): Promise<void> {
  await axiosInstance.delete(`/er/payroll/${id}`);
}

// Process payroll (calculate and create journal entries)
export async function processPayroll(payrollData: PayrollProcessData): Promise<Payroll> {
  const { data } = await axiosInstance.post<Payroll>("/er/payroll/process", payrollData);
  return data;
}

// Get payroll statistics
export async function getPayrollStats(month?: string): Promise<{
  totalEmployees: number;
  totalGross: number;
  totalNet: number;
  totalDeductions: number;
  processedCount: number;
  pendingCount: number;
}> {
  const { data } = await axiosInstance.get<{
    totalEmployees: number;
    totalGross: number;
    totalNet: number;
    totalDeductions: number;
    processedCount: number;
    pendingCount: number;
  }>("/er/payroll/stats", {
    params: { month },
    headers: { "x-silent-401": "1" }
  });
  return data;
}
