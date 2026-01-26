import { Types } from 'mongoose';

// Wallet interface (from Driver/Vendor entities)
export interface Wallet {
  balance: number;
  earnings?: number;
  totalEarned?: number;
  totalWithdrawn?: number;
  lastUpdated?: Date;
}

// Attendance interfaces
export interface AttendanceMatchQuery {
  employeeId?: Types.ObjectId;
  employeeModel?: string;
  date?: {
    $gte?: Date;
    $lte?: Date;
    $lt?: Date;
  };
  status?: string;
}

export interface AttendanceDocument {
  _id: Types.ObjectId;
  employeeId: Types.ObjectId;
  employeeModel: string;
  date: Date;
  checkIn: Date;
  checkOut?: Date;
  status: 'present' | 'absent' | 'late' | 'half_day' | 'on_leave';
  workHours?: number;
  overtimeHours?: number;
  isLate?: boolean;
  notes?: string;
  approvedBy?: Types.ObjectId;
  isManualEntry?: boolean;
}

// Leave Request interfaces
export interface LeaveRequestDocument {
  _id: Types.ObjectId;
  employeeId: Types.ObjectId;
  employeeModel: string;
  leaveType: string;
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  rejectionReason?: string;
  approvedBy?: Types.ObjectId;
  rejectedBy?: Types.ObjectId;
  approvedAt?: Date;
  rejectedAt?: Date;
}

// Driver Leave Balance
export interface DriverLeaveBalance {
  annual: number;
  sick: number;
  emergency?: number;
}

// Driver with typed wallet
export interface DriverWithWallet {
  _id: Types.ObjectId;
  wallet?: Wallet;
  leaveBalance?: DriverLeaveBalance;
  [key: string]: any;
}

// Vendor with typed wallet
export interface VendorWithWallet {
  _id: Types.ObjectId;
  wallet?: Wallet;
  [key: string]: any;
}

// Store metadata
export interface StoreMetadata {
  referredBy?: string;
  [key: string]: any;
}

// Onboarding Application
export interface OnboardingDocument {
  _id: Types.ObjectId;
  businessName: string;
  status: 'pending' | 'approved' | 'rejected';
  referredBy?: Types.ObjectId;
  approvedBy?: Types.ObjectId;
  rejectedBy?: Types.ObjectId;
  approvedAt?: Date;
  rejectionReason?: string;
  [key: string]: any;
}

// Aggregation Results
export interface AttendanceStats {
  _id: Types.ObjectId | string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
}

export interface StatusGroupResult {
  _id: string;
  count: number;
}

// Settings Query
export interface SettingsQuery {
  category?: string;
  isPublic?: boolean;
  key?: string;
}

// Shift Data
export interface ShiftData {
  name: string;
  startTime: string;
  endTime: string;
  days: number[];
  breakTimes?: {
    start: string;
    end: string;
    duration: number;
  };
  maxDrivers?: number;
  description?: string;
  color?: string;
}

// Kawader interfaces
export enum KawaderStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface KawaderDocument {
  _id: Types.ObjectId;
  ownerId: Types.ObjectId;
  title: string;
  description?: string;
  scope?: string;
  budget?: number;
  metadata: Record<string, any>;
  status: KawaderStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface KawaderWithOwner extends KawaderDocument {
  owner?: {
    _id: Types.ObjectId;
    name: string;
    email: string;
    phone?: string;
  };
}

export interface KawaderListResponse {
  items: KawaderWithOwner[];
  nextCursor?: string;
}

export interface KawaderStats {
  total: number;
  draft: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
}

export interface KawaderAdminQuery {
  status?: KawaderStatus;
  ownerId?: Types.ObjectId;
  createdAfter?: Date;
  createdBefore?: Date;
  budgetMin?: number;
  budgetMax?: number;
}

export interface KawaderStatusUpdateDto {
  status: KawaderStatus;
  notes?: string;
}

// Kenz interfaces
export enum KenzStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface KenzDocument {
  _id: Types.ObjectId;
  ownerId: Types.ObjectId;
  title: string;
  description?: string;
  price?: number;
  category?: string;
  metadata: Record<string, any>;
  status: KenzStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface KenzWithOwner extends KenzDocument {
  owner?: {
    _id: Types.ObjectId;
    name: string;
    email: string;
    phone?: string;
  };
}

export interface KenzListResponse {
  items: KenzWithOwner[];
  nextCursor?: string;
}

export interface KenzStats {
  total: number;
  draft: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
}

export interface KenzAdminQuery {
  status?: KenzStatus;
  ownerId?: Types.ObjectId;
  category?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  priceMin?: number;
  priceMax?: number;
}

export interface KenzStatusUpdateDto {
  status: KenzStatus;
  notes?: string;
}

// Maarouf interfaces
export enum MaaroufKind {
  LOST = 'lost',
  FOUND = 'found'
}

export enum MaaroufStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface MaaroufDocument {
  _id: Types.ObjectId;
  ownerId: Types.ObjectId;
  title: string;
  description?: string;
  kind?: MaaroufKind;
  tags?: string[];
  metadata: Record<string, any>;
  status: MaaroufStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface MaaroufWithOwner extends MaaroufDocument {
  owner?: {
    _id: Types.ObjectId;
    name: string;
    email: string;
    phone?: string;
  };
}

export interface MaaroufListResponse {
  items: MaaroufWithOwner[];
  nextCursor?: string;
}

export interface MaaroufStats {
  total: number;
  draft: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  lost: number;
  found: number;
}

export interface MaaroufAdminQuery {
  status?: MaaroufStatus;
  kind?: MaaroufKind;
  ownerId?: Types.ObjectId;
  tags?: string[];
  createdAfter?: Date;
  createdBefore?: Date;
  search?: string;
}

export interface MaaroufStatusUpdateDto {
  status: MaaroufStatus;
  notes?: string;
}

// Sanad interfaces
export enum SanadKind {
  SPECIALIST = 'specialist',
  EMERGENCY = 'emergency',
  CHARITY = 'charity'
}

export enum SanadStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface SanadDocument {
  _id: Types.ObjectId;
  ownerId: Types.ObjectId;
  title: string;
  description?: string;
  kind?: SanadKind;
  metadata: Record<string, any>;
  status: SanadStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface SanadWithOwner extends SanadDocument {
  owner?: {
    _id: Types.ObjectId;
    name: string;
    email: string;
    phone?: string;
  };
}

export interface SanadListResponse {
  items: SanadWithOwner[];
  nextCursor?: string;
}

export interface SanadStats {
  total: number;
  draft: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  specialist: number;
  emergency: number;
  charity: number;
}

export interface SanadAdminQuery {
  status?: SanadStatus;
  kind?: SanadKind;
  ownerId?: Types.ObjectId;
  createdAfter?: Date;
  createdBefore?: Date;
  search?: string;
}

export interface SanadStatusUpdateDto {
  status: SanadStatus;
  notes?: string;
}

// Payments interfaces
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

export interface PaymentsDocument {
  _id: Types.ObjectId;
  ownerId: Types.ObjectId;
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
  createdAt: Date;
  updatedAt: Date;
  processedAt?: Date;
  completedAt?: Date;
}

export interface PaymentsWithOwner extends PaymentsDocument {
  owner?: {
    _id: Types.ObjectId;
    name: string;
    email: string;
    phone?: string;
  };
}

export interface PaymentsListResponse {
  items: PaymentsWithOwner[];
  nextCursor?: string;
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

export interface PaymentsAdminQuery {
  status?: PaymentStatus;
  type?: PaymentType;
  method?: PaymentMethod;
  ownerId?: Types.ObjectId;
  amountMin?: number;
  amountMax?: number;
  createdAfter?: Date;
  createdBefore?: Date;
  search?: string;
  reference?: string;
}

export interface PaymentsStatusUpdateDto {
  status: PaymentStatus;
  notes?: string;
  transactionId?: string;
}

