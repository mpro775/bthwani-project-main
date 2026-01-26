import { api } from '../services/api';

// أنواع البيانات متوافقة مع النماذج الموجودة في الباك إند
export interface DriverAdjustment {
  _id: string;
  driver: string;
  type: 'bonus' | 'penalty';
  amount: number;
  reason: string;
  ref?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface DriverPayoutCycle {
  _id: string;
  driver: string;
  start: string;
  end: string;
  status: string;
  totalEarnings: number;
  totalDeductions: number;
  netAmount: number;
  reference?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DriverFinanceSummary {
  driver: {
    _id: string;
    fullName: string;
    phone: string;
  };
  currentBalance: number;
  totalAdjustments: number;
  recentAdjustments: DriverAdjustment[];
  payoutCycles: DriverPayoutCycle[];
}

export interface CreateAdjustmentRequest {
  driverId: string;
  type: 'bonus' | 'penalty';
  amount: number;
  reason: string;
  ref?: string;
}

// جلب التسويات لسائق محدد
export const getDriverAdjustments = async (driverId: string): Promise<{
  items: DriverAdjustment[];
}> => {
  try {
    const response = await api.get(`/admin/drivers/finance/${driverId}/adjustments`);
    return response.data;
  } catch (error) {
    console.error('خطأ في جلب تسويات السائق:', error);
    throw error;
  }
};

// إنشاء تسوية جديدة
export const createDriverAdjustment = async (data: CreateAdjustmentRequest): Promise<DriverAdjustment> => {
  try {
    const response = await api.post(`/admin/drivers/finance/${data.driverId}/adjustments`, {
      type: data.type,
      amount: data.amount,
      reason: data.reason,
      ref: data.ref,
    });
    return response.data;
  } catch (error) {
    console.error('خطأ في إنشاء التسوية:', error);
    throw error;
  }
};

// جلب دورات الدفع
export const getDriverPayoutCycles = async (params?: {
  from?: string;
  to?: string;
  status?: string;
  driver?: string;
}): Promise<{
  items: DriverPayoutCycle[];
}> => {
  try {
    const response = await api.get('/admin/drivers/finance', { params });
    return response.data;
  } catch (error) {
    console.error('خطأ في جلب دورات الدفع:', error);
    throw error;
  }
};

// تشغيل دورة دفع جديدة
export const runPayoutCycle = async (params?: {
  period?: string;
  from?: string;
  to?: string;
}): Promise<{ ok: boolean; message: string }> => {
  try {
    const response = await api.post('/admin/drivers/finance/run', null, { params });
    return response.data;
  } catch (error) {
    console.error('خطأ في تشغيل دورة الدفع:', error);
    throw error;
  }
};

// الموافقة على دورة دفع
export const approvePayoutCycle = async (payoutId: string): Promise<DriverPayoutCycle> => {
  try {
    const response = await api.patch(`/admin/drivers/finance/${payoutId}/approve`);
    return response.data;
  } catch (error) {
    console.error('خطأ في الموافقة على دورة الدفع:', error);
    throw error;
  }
};

// دفع دورة دفع
export const payPayoutCycle = async (payoutId: string, reference?: string): Promise<DriverPayoutCycle> => {
  try {
    const response = await api.patch(`/admin/drivers/finance/${payoutId}/pay`, { reference });
    return response.data;
  } catch (error) {
    console.error('خطأ في دفع دورة الدفع:', error);
    throw error;
  }
};

// جلب ملخص مالية سائق محدد (إذا كان موجود في الباك إند)
export const getDriverFinanceSummary = async (driverId: string): Promise<DriverFinanceSummary> => {
  try {
    // يمكن أن نحتاج إلى إضافة هذا المسار في الباك إند إذا لم يكن موجود
    const response = await api.get(`/admin/drivers/finance/${driverId}/summary`);
    return response.data;
  } catch (error) {
    console.error('خطأ في جلب ملخص مالية السائق:', error);
    throw error;
  }
};