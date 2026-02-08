// مطابق لـ app-user - كنز (السوق المفتوح)
export type KenzStatus = "draft" | "pending" | "confirmed" | "completed" | "cancelled";

export interface KenzItem {
  _id: string;
  ownerId: string | { _id: string };
  title: string;
  description?: string;
  price?: number;
  category?: string;
  metadata?: Record<string, any>;
  status: KenzStatus;
  images?: string[];
  city?: string;
  viewCount?: number;
  keywords?: string[];
  currency?: string;
  quantity?: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  owner?: {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  /** من الباك اند عند دمج الترويج */
  isBoosted?: boolean;
  boostType?: string | null;
  /** حالة السلعة */
  condition?: 'new' | 'used' | 'refurbished';
  /** نشر بالنيابة: رقم الهاتف */
  postedOnBehalfOfPhone?: string;
  /** نشر بالنيابة: المستخدم (معرّف أو كائن من الباك اند) */
  postedOnBehalfOfUserId?: string | { _id: string; name?: string; phone?: string };
  /** طريقة التسليم */
  deliveryOption?: 'meetup' | 'delivery' | 'both';
  /** رسوم التوصيل */
  deliveryFee?: number;
  /** يقبل الدفع بالإيكرو */
  acceptsEscrow?: boolean;
  /** إعلان مزاد */
  isAuction?: boolean;
  /** تاريخ انتهاء المزاد */
  auctionEndAt?: Date | string;
  /** السعر الابتدائي للمزاد */
  startingPrice?: number;
  /** معرف الفائز (عند إغلاق المزاد) */
  winnerId?: string | { _id: string; fullName?: string; phone?: string };
  /** مبلغ الفوز */
  winningBidAmount?: number;
}

export type KenzCondition = 'new' | 'used' | 'refurbished';

export interface CreateKenzPayload {
  ownerId: string;
  title: string;
  description?: string;
  price?: number;
  category?: string;
  metadata?: Record<string, any>;
  status?: KenzStatus;
  images?: string[];
  city?: string;
  keywords?: string[];
  currency?: string;
  quantity?: number;
  condition?: KenzCondition;
  /** نشر بالنيابة: رقم هاتف من نُشر الإعلان باسمه */
  postedOnBehalfOfPhone?: string;
  deliveryOption?: 'meetup' | 'delivery' | 'both';
  deliveryFee?: number;
  acceptsEscrow?: boolean;
  isAuction?: boolean;
  auctionEndAt?: string;
  startingPrice?: number;
}

export interface UpdateKenzPayload {
  title?: string;
  description?: string;
  price?: number;
  category?: string;
  metadata?: Record<string, any>;
  status?: KenzStatus;
  images?: string[];
  city?: string;
  keywords?: string[];
  currency?: string;
  quantity?: number;
  condition?: KenzCondition;
  postedOnBehalfOfPhone?: string;
  deliveryOption?: 'meetup' | 'delivery' | 'both';
  deliveryFee?: number;
  acceptsEscrow?: boolean;
  isAuction?: boolean;
  auctionEndAt?: string;
  startingPrice?: number;
}

export interface KenzFilters {
  status?: KenzStatus;
  category?: string;
  city?: string;
  search?: string;
  priceMin?: number;
  priceMax?: number;
}

export interface KenzListResponse {
  items: KenzItem[];
  nextCursor?: string;
}

// فئات الإعلانات - مطابق لـ app-user
export const KENZ_CATEGORIES = [
  "إلكترونيات",
  "سيارات",
  "عقارات",
  "أثاث",
  "ملابس",
  "رياضة",
  "كتب",
  "خدمات",
  "وظائف",
  "حيوانات",
  "أخرى",
] as const;

export type KenzCategory = (typeof KENZ_CATEGORIES)[number];

// المدن اليمنية - مطابق لـ app-user
export const KENZ_YEMEN_CITIES = [
  "صنعاء",
  "عدن",
  "تعز",
  "الحديدة",
  "إب",
  "المكلا",
  "ذمار",
  "البيضاء",
  "عمران",
  "صعدة",
  "مارب",
  "حجة",
  "لحج",
  "الضالع",
  "المحويت",
  "ريمة",
  "شبوة",
  "الجوف",
  "حضرموت",
  "سقطرى",
  "أمانة العاصمة",
] as const;

export type KenzYemenCity = (typeof KENZ_YEMEN_CITIES)[number];

// العملات - مطابق لـ app-user
export const KENZ_CURRENCIES = [
  "ريال يمني",
  "ريال سعودي",
  "دولار أمريكي",
] as const;

export type KenzCurrency = (typeof KENZ_CURRENCIES)[number];

export const KenzCategoryLabels: Record<KenzCategory, string> = {
  إلكترونيات: "إلكترونيات", سيارات: "سيارات", عقارات: "عقارات", أثاث: "أثاث",
  ملابس: "ملابس", رياضة: "رياضة", كتب: "كتب", خدمات: "خدمات",
  وظائف: "وظائف", حيوانات: "حيوانات", أخرى: "أخرى",
};

export const KenzCategoryValues: KenzCategory[] = [...KENZ_CATEGORIES];
export const KenzStatusValues: KenzStatus[] = ["draft", "pending", "confirmed", "completed", "cancelled"];

// ترجمة الحالات
export const KenzStatusLabels: Record<KenzStatus, string> = {
  draft: "مسودة",
  pending: "في الانتظار",
  confirmed: "متاح",
  completed: "مباع",
  cancelled: "ملغي",
};

// ألوان الحالات
export const KenzStatusColors: Record<KenzStatus, string> = {
  draft: "#9e9e9e",
  pending: "#ff9800",
  confirmed: "#ff500d",
  completed: "#4caf50",
  cancelled: "#f44336",
};
