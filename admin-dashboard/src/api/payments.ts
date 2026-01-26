import { api } from '../services/api';

// أنواع البيانات
export interface PaymentsItem {
  _id: string;
  ownerId: string;
  title: string;
  description?: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'payment' | 'refund' | 'commission';
  amount: number;
  currency: string;
  method: 'cash' | 'card' | 'bank_transfer' | 'wallet' | 'digital';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  reference?: string;
  transactionId?: string;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
  completedAt?: string;
  owner?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

export interface PaymentsStats {
  total: number;
  totalAmount: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  cancelled: number;
  refunded: number;
  deposits: number;
  withdrawals: number;
  transfers: number;
  payments: number;
  refunds: number;
  commissions: number;
}

export interface PaymentsListResponse {
  items: PaymentsItem[];
  nextCursor?: string;
}

export interface UpdatePaymentsStatusRequest {
  status: string;
  notes?: string;
  transactionId?: string;
}

// جلب قائمة المدفوعات
export const getPaymentsList = async (params?: {
  cursor?: string;
  limit?: number;
  status?: string;
  type?: string;
  method?: string;
  ownerId?: string;
  amountMin?: number;
  amountMax?: number;
  createdAfter?: string;
  createdBefore?: string;
  search?: string;
  reference?: string;
}): Promise<PaymentsListResponse> => {
  try {
    const response = await api.get('/admin/payments', { params });
    return response.data;
  } catch (error) {
    console.error('خطأ في جلب قائمة المدفوعات:', error);
    throw error;
  }
};

// جلب دفع واحد
export const getPayment = async (id: string): Promise<PaymentsItem> => {
  try {
    const response = await api.get(`/admin/payments/${id}`);
    return response.data;
  } catch (error) {
    console.error('خطأ في جلب الدفع:', error);
    throw error;
  }
};

// تحديث حالة الدفع
export const updatePaymentsStatus = async (id: string, data: UpdatePaymentsStatusRequest): Promise<PaymentsItem> => {
  try {
    const response = await api.patch(`/admin/payments/${id}/status`, data);
    return response.data;
  } catch (error) {
    console.error('خطأ في تحديث حالة الدفع:', error);
    throw error;
  }
};

// حذف دفع
export const deletePayment = async (id: string): Promise<void> => {
  try {
    const response = await api.delete(`/admin/payments/${id}`);
    return response.data;
  } catch (error) {
    console.error('خطأ في حذف الدفع:', error);
    throw error;
  }
};

// جلب إحصائيات المدفوعات
export const getPaymentsStats = async (): Promise<PaymentsStats> => {
  try {
    const response = await api.get('/admin/payments/stats/overview');
    return response.data;
  } catch (error) {
    console.error('خطأ في جلب إحصائيات المدفوعات:', error);
    throw error;
  }
};
