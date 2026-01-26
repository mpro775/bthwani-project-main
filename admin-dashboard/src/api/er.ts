/**
 * ER/HR System API
 * واجهة نظام الموارد البشرية والمحاسبة
 */

import { useAdminAPI, useAdminQuery } from '@/hooks/useAdminAPI';
import { ALL_ADMIN_ENDPOINTS } from '@/config/admin-endpoints';
import type * as Types from '@/types/er';

const getEndpoint = (id: string) => {
  const endpoint = ALL_ADMIN_ENDPOINTS.find(ep => ep.id === id);
  if (!endpoint) throw new Error(`Endpoint "${id}" not found`);
  return endpoint;
};

// ==================== Employee Hooks ====================

export function useEmployees(status?: string) {
  return useAdminQuery<Types.ERResponse<Types.Employee[]>>(
    getEndpoint('er-employees-all'),
    { query: status ? { status } : undefined },
    { enabled: true }
  );
}

export function useEmployee(id: string) {
  return useAdminQuery<Types.ERResponse<Types.Employee>>(
    getEndpoint('er-employee-get'),
    { params: { id } },
    { enabled: !!id }
  );
}

// ==================== Attendance Hooks ====================

export function useEmployeeAttendance(employeeId: string, month?: number, year?: number) {
  const queryParams: Record<string, string> = {
    ...(month !== undefined && { month: month.toString() }),
    ...(year !== undefined && { year: year.toString() }),
  };
  return useAdminQuery<Types.ERResponse<Types.Attendance[]>>(
    getEndpoint('er-attendance-get'),
    { params: { employeeId }, query: Object.keys(queryParams).length > 0 ? queryParams : undefined },
    { enabled: !!employeeId }
  );
}

// ==================== Accounting Hooks ====================

export function useChartAccounts(type?: string) {
  return useAdminQuery<Types.ERResponse<Types.ChartAccount[]>>(
    getEndpoint('er-accounts-all'),
    { query: type ? { type } : undefined },
    { enabled: true }
  );
}

export function useJournalEntries(filters?: {
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useAdminQuery<Types.ERResponse<Types.JournalEntry[]>>(
    getEndpoint('er-journal-all'),
    { query: filters },
    { enabled: true }
  );
}

export function useTrialBalance(date?: string) {
  return useAdminQuery<Types.ERResponse<any>>(
    getEndpoint('er-trial-balance'),
    { query: date ? { date } : undefined },
    { enabled: true }
  );
}

// ==================== Mutations API ====================

export function useERAPI() {
  const { callEndpoint } = useAdminAPI();

  return {
    // Employees
    createEmployee: async (data: Types.CreateEmployeeDto) => {
      return callEndpoint(getEndpoint('er-employees-create'), { body: data });
    },
    
    updateEmployee: async (id: string, data: Types.UpdateEmployeeDto) => {
      return callEndpoint(getEndpoint('er-employee-update'), { params: { id }, body: data });
    },

    // Leave Requests
    approveLeaveRequest: async (id: string) => {
      return callEndpoint(getEndpoint('er-leave-approve'), { params: { id } });
    },

    rejectLeaveRequest: async (id: string, reason: string) => {
      return callEndpoint(getEndpoint('er-leave-reject'), { params: { id }, body: { reason } });
    },

    // Payroll
    generatePayroll: async (employeeId: string, month: number, year: number) => {
      return callEndpoint(getEndpoint('er-payroll-generate'), { 
        body: { employeeId, month, year } 
      });
    },

    approvePayroll: async (id: string) => {
      return callEndpoint(getEndpoint('er-payroll-approve'), { params: { id } });
    },

    markPayrollAsPaid: async (id: string, transactionRef: string) => {
      return callEndpoint(getEndpoint('er-payroll-mark-paid'), { 
        params: { id }, 
        body: { transactionRef } 
      });
    },

    // Accounting
    createAccount: async (data: Types.CreateChartAccountDto) => {
      return callEndpoint(getEndpoint('er-accounts-create'), { body: data });
    },

    createJournalEntry: async (data: Types.CreateJournalEntryDto) => {
      return callEndpoint(getEndpoint('er-journal-create'), { body: data });
    },

    postJournalEntry: async (id: string) => {
      return callEndpoint(getEndpoint('er-journal-post'), { params: { id } });
    },
  };
}
