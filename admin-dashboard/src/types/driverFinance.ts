// Types and utilities for driver finance

export interface FinanceFilters {
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  type?: string;
  driverId?: string;
}

export const DEFAULT_FINANCE_FILTERS: FinanceFilters = {
  dateFrom: '',
  dateTo: '',
  status: '',
  type: '',
  driverId: '',
};

export const formatDateOnly = (date: string | Date): string => {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

export const formatCurrency = (amount: number, currency: string = 'SAR'): string => {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

export const getTransactionStatusLabel = (status: string): string => {
  const statusMap: Record<string, string> = {
    'pending': 'قيد المراجعة',
    'approved': 'معتمد',
    'rejected': 'مرفوض',
    'completed': 'مكتمل',
    'cancelled': 'ملغي',
  };
  return statusMap[status] || status;
};

export const getTransactionDirectionLabel = (direction: string): string => {
  const directionMap: Record<string, string> = {
    'credit': 'دائن',
    'debit': 'مدين',
    'incoming': 'وارد',
    'outgoing': 'صادر',
  };
  return directionMap[direction] || direction;
};

export interface DriverBalanceSummary {
  totalEarnings: number;
  totalDeductions: number;
  netBalance: number;
  currency: string;
}
