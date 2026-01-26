// أنواع بيانات قسم المدفوعات
export interface PaymentsItem {
  _id: string;
  ownerId: string;
  title: string;
  description?: string;
  type: PaymentType;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
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

export enum PaymentType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  TRANSFER = 'transfer',
  PAYMENT = 'payment',
  REFUND = 'refund',
  COMMISSION = 'commission'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  BANK_TRANSFER = 'bank_transfer',
  WALLET = 'wallet',
  DIGITAL = 'digital'
}

// ترجمة أنواع المدفوعات للعربية
export const PaymentTypeLabels: Record<PaymentType, string> = {
  [PaymentType.DEPOSIT]: 'إيداع',
  [PaymentType.WITHDRAWAL]: 'سحب',
  [PaymentType.TRANSFER]: 'تحويل',
  [PaymentType.PAYMENT]: 'دفع',
  [PaymentType.REFUND]: 'استرداد',
  [PaymentType.COMMISSION]: 'عمولة'
};

// ترجمة حالات المدفوعات للعربية
export const PaymentStatusLabels: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: 'في الانتظار',
  [PaymentStatus.PROCESSING]: 'قيد المعالجة',
  [PaymentStatus.COMPLETED]: 'مكتمل',
  [PaymentStatus.FAILED]: 'فاشل',
  [PaymentStatus.CANCELLED]: 'ملغي',
  [PaymentStatus.REFUNDED]: 'مسترد'
};

// ترجمة طرق الدفع للعربية
export const PaymentMethodLabels: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH]: 'نقدي',
  [PaymentMethod.CARD]: 'بطاقة',
  [PaymentMethod.BANK_TRANSFER]: 'تحويل بنكي',
  [PaymentMethod.WALLET]: 'محفظة',
  [PaymentMethod.DIGITAL]: 'رقمي'
};

// ألوان حالات المدفوعات
export const PaymentStatusColors: Record<PaymentStatus, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  [PaymentStatus.PENDING]: 'warning',
  [PaymentStatus.PROCESSING]: 'info',
  [PaymentStatus.COMPLETED]: 'success',
  [PaymentStatus.FAILED]: 'error',
  [PaymentStatus.CANCELLED]: 'error',
  [PaymentStatus.REFUNDED]: 'primary'
};

// ألوان أنواع المدفوعات
export const PaymentTypeColors: Record<PaymentType, 'success' | 'error' | 'primary' | 'secondary' | 'warning' | 'info'> = {
  [PaymentType.DEPOSIT]: 'success',
  [PaymentType.WITHDRAWAL]: 'error',
  [PaymentType.TRANSFER]: 'primary',
  [PaymentType.PAYMENT]: 'secondary',
  [PaymentType.REFUND]: 'warning',
  [PaymentType.COMMISSION]: 'info'
};

export interface PaymentsFilters {
  status?: PaymentStatus;
  type?: PaymentType;
  method?: PaymentMethod;
  ownerId?: string;
  amountMin?: number;
  amountMax?: number;
  createdAfter?: string;
  createdBefore?: string;
  search?: string;
  reference?: string;
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

export interface PaymentsStatusUpdateRequest {
  status: PaymentStatus;
  notes?: string;
  transactionId?: string;
}

export interface PaymentsListResponse {
  items: PaymentsItem[];
  nextCursor?: string;
}
