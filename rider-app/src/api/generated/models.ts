export interface FirebaseAuthDto {
  idToken: string;
}

export interface ConsentDto {
  consentType: "privacy_policy" | "terms_of_service" | "marketing" | "data_processing";
  granted: boolean;
  version: string;
  notes?: string;
}

export interface BulkConsentDto {
  consents: ConsentDto[];
}

export interface ForgotPasswordDto {
  emailOrPhone: string;
}

export interface VerifyResetCodeDto {
  emailOrPhone: string;
  code: string;
}

export interface ResetPasswordDto {
  emailOrPhone: string;
  code: string;
  newPassword: string;
}

export interface VerifyOtpDto {
  phone: string;
  otp: string;
}

export interface CreateTransactionDto {
  userId: string;
  userModel: "User" | "Driver";
  amount: number;
  type: "credit" | "debit";
  method: "agent" | "card" | "transfer" | "payment" | "escrow" | "reward" | "kuraimi" | "withdrawal";
  description?: string;
  bankRef?: string;
  meta?: Record<string, any>;
}

export interface OrderItemDto {
  productType: string;
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  store: string;
  image?: string;
}

export interface AddressDto {
  label: string;
  street: string;
  city: string;
  location: Record<string, any>;
}

export interface CreateOrderDto {
  user: string;
  items: OrderItemDto[];
  price: number;
  deliveryFee: number;
  companyShare: number;
  platformShare: number;
  address: any;
  paymentMethod: "cash" | "wallet" | "card" | "mixed";
  orderType: "marketplace" | "errand" | "utility";
  walletUsed?: number;
  cashDue?: number;
}

export interface UpdateOrderStatusDto {
  status: "created" | "confirmed" | "preparing" | "ready" | "picked_up" | "on_the_way" | "arrived" | "delivered" | "cancelled" | "returned" | "refunded" | "failed";
  reason?: string;
  changedBy?: "admin" | "store" | "driver" | "customer";
}

export interface CreateDriverDto {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  role: "rider_driver" | "light_driver" | "women_driver";
  vehicleType: "motor" | "bike" | "car";
  vehicleClass?: "light" | "medium" | "heavy";
  vehiclePower?: number;
  driverType?: "primary" | "joker";
  isFemaleDriver?: boolean;
}

export interface UpdateLocationDto {
  lat: number;
  lng: number;
}

export interface CreateVendorDto {
  fullName: string;
  phone: string;
  email?: string;
  password: string;
  store: string;
  createdByMarketerUid?: string;
  source?: "marketerQuickOnboard" | "admin" | "other";
}

export interface UpdateVendorDto {
  isActive?: boolean;
  expoPushToken?: string;
  notificationSettings?: Record<string, any>;
}

export interface LocationDto {
  lat: number;
  lng: number;
}

export interface CreateStoreDto {
  name: string;
  name_ar?: string;
  name_en?: string;
  address: string;
  location: any;
  category?: string;
  image?: string;
  logo?: string;
  commissionRate?: number;
  usageType?: "restaurant" | "grocery" | "pharmacy" | "bakery" | "cafe" | "other";
  tags?: string[];
}

export interface CreateProductDto {
  name: string;
  name_ar?: string;
  name_en?: string;
  description?: string;
  price: number;
  store: string;
  category?: string;
  image?: string;
  images: string[];
  inStock: boolean;
  stockQuantity: number;
  discount: number;
}

export interface UpdateUserDto {
  fullName?: string;
  aliasName?: string;
  phone?: string;
  profileImage?: string;
  language?: "ar" | "en";
  theme?: "light" | "dark";
  pushToken?: string;
}

export interface AddAddressDto {
  label: string;
  city: string;
  street: string;
  location?: any;
}

export interface SetPinDto {
  pin: string;
  confirmPin: string;
}

export interface VerifyPinDto {
  pin: string;
}

export interface CreateNotificationDto {
  toUser?: string;
  audience?: string[];
  title: string;
  body: string;
  data?: Record<string, any>;
  collapseId?: string;
}

export interface CreateSuppressionDto {
  suppressedChannels: "push" | "email" | "sms"[];
  reason: "user_request" | "bounce" | "complaint" | "unsubscribe" | "invalid_contact" | "too_many_failures" | "admin_block";
  details?: string;
  expiresAt?: string;
}

export interface CreateCommissionDto {
  entityId: string;
  entityModel: "Order" | "Vendor" | "Driver" | "Marketer";
  beneficiary: string;
  beneficiaryType: "driver" | "vendor" | "marketer" | "company";
  amount: number;
  rate: number;
  baseAmount: number;
  calculationType: "percentage" | "fixed";
  metadata?: Record<string, any>;
  notes?: string;
}

export interface ApprovePayoutBatchDto {

}

export interface CreateSettlementDto {

}

export interface ApproveSettlementDto {

}

export interface CreateFinancialCouponDto {
  code: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  maxDiscountAmount?: number;
  minOrderAmount?: number;
  maxUsage: number;
  maxUsagePerUser: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface ValidateCouponDto {

}

export interface UpdateFinancialCouponDto {

}

export interface AddToCartDto {

}

export interface UpdateCartItemDto {

}

export interface AddNoteDto {

}

export interface AddDeliveryAddressDto {

}

export interface AddToSheinCartDto {

}

export interface UpdateSheinCartItemDto {

}

export interface UpdateSheinShippingDto {

}

export interface CalculateUtilityPriceDto {

}

export interface CreateUtilityPricingDto {

}

export interface UpdateUtilityPricingDto {

}

export interface CreateDailyPriceDto {

}

export interface CreateUtilityOrderDto {

}

export interface PointDto {
  location: any;
  city?: string;
  street?: string;
}

export interface CalculateFeeDto {
  category: "docs" | "parcel" | "groceries" | "carton" | "food" | "fragile" | "other";
  size: "small" | "medium" | "large";
  weightKg?: number;
  pickup: any;
  dropoff: any;
  tip?: number;
}

export interface CreateErrandDto {

}

export interface RateErrandDto {

}

export interface UpdateErrandStatusDto {

}

export interface AssignDriverDto {

}

export interface CreatePromotionDto {
  title?: string;
  description?: string;
  image?: string;
  link?: string;
  target: "product" | "store" | "category";
  value?: number;
  valueType?: "percentage" | "fixed";
  product?: string;
  store?: string;
  category?: string;
  placements: "home_hero" | "home_strip" | "category_header" | "category_feed" | "store_header" | "search_banner" | "cart" | "checkout"[];
  cities?: string[];
  channels?: string[];
  stacking?: "none" | "best" | "stack_same_target";
  minQty?: number;
  minOrderSubtotal?: number;
  maxDiscountAmount?: number;
  order?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface UpdatePromotionDto {

}

export interface CreateMerchantDto {

}

export interface UpdateMerchantDto {

}

export interface CreateProductCatalogDto {

}

export interface UpdateProductCatalogDto {

}

export interface CreateMerchantProductDto {

}

export interface UpdateMerchantProductDto {

}

export interface CreateMerchantCategoryDto {

}

export interface UpdateMerchantCategoryDto {

}

export interface CreateAttributeDto {

}

export interface UpdateAttributeDto {

}

export interface CreateBannerDto {
  title?: string;
  description?: string;
  image: string;
  link?: string;
  store?: string;
  category?: string;
  placement?: "home" | "category" | "store" | "search";
  order: number;
  startDate?: string;
  endDate?: string;
}

export interface UpdateBannerDto {

}

export interface CreateStoreSectionDto {
  store: string;
  name: string;
  nameAr?: string;
  description?: string;
  icon?: string;
  usageType: "grocery" | "restaurant" | "retail";
  order: number;
}

export interface UpdateStoreSectionDto {

}

export interface CreateSubscriptionPlanDto {

}

export interface SubscribeDto {

}

export interface CreateEmployeeDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationalId?: string;
  position: string;
  department: string;
  employmentType: "full_time" | "part_time" | "contract" | "intern";
  salary: number;
  hireDate: string;
  terminationDate?: string;
  address?: Record<string, any>;
  emergencyContact?: string;
  emergencyPhone?: string;
  manager?: string;
  skills?: string[];
  bankDetails?: Record<string, any>;
  annualLeaveDays?: number;
  sickLeaveDays?: number;
}

export interface UpdateEmployeeDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  nationalId?: string;
  position?: string;
  department?: string;
  employmentType?: "full_time" | "part_time" | "contract" | "intern";
  salary?: number;
  hireDate?: string;
  terminationDate?: string;
  address?: Record<string, any>;
  emergencyContact?: string;
  emergencyPhone?: string;
  manager?: string;
  skills?: string[];
  bankDetails?: Record<string, any>;
  annualLeaveDays?: number;
  sickLeaveDays?: number;
}

export interface CreateLeaveRequestDto {
  leaveType: "annual" | "sick" | "unpaid" | "maternity" | "emergency";
  startDate: string;
  endDate: string;
  reason: string;
  notes?: string;
  attachments?: string[];
}

export interface CreateChartAccountDto {
  accountCode: string;
  accountName: string;
  accountNameAr?: string;
  accountType: "asset" | "liability" | "equity" | "revenue" | "expense";
  normalBalance: "debit" | "credit";
  parent?: string;
  description?: string;
}

export interface JournalLineDto {
  account: string;
  debit: number;
  credit: number;
  description?: string;
}

export interface CreateJournalEntryDto {
  date: string;
  description: string;
  lines: JournalLineDto[];
  type: "general" | "sales" | "purchase" | "payment" | "receipt" | "adjustment";
  reference?: string;
  relatedEntity?: string;
  relatedEntityModel?: string;
  notes?: string;
}

export interface RecordConsentDto {
  consentType: "privacy_policy" | "terms_of_service";
  version: string;
  accepted: boolean;
  ipAddress?: string;
  userAgent?: string;
}

export interface CreatePrivacyPolicyDto {
  version: string;
  content: string;
  contentEn: string;
  effectiveDate?: string;
  isActive?: boolean;
}

export interface CreateTermsOfServiceDto {
  version: string;
  content: string;
  contentEn: string;
  effectiveDate?: string;
  isActive?: boolean;
}