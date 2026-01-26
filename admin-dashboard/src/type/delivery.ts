// src/types/delivery.ts
export type StoreForm_type = {
  name: string;
  address: string;
  categoryId: string;
  lat: string;
  lng: string;
  isActive: boolean;
  image: string | null;
  logo: string | null;
  documents: string | null; // وثائق المتجر (PDF, DOC, etc.)
  schedule: ScheduleSlot[];
  commissionRate: string;           // لاحظ: كـ string لسهولة الربط مع الـ TextField
  isTrending: boolean;
  isFeatured: boolean;
  pricingStrategyType: string;      // "auto" | "manual" | ""
pricingStrategy?: string | { _id: string; name?: string }; // أو object كامل لو تحتاج بيانات أكثر
};

export interface DeliveryStore {
  _id: string;
  name: string;
  address: string;
  category: Category;
  location: {
    lat: number;
    lng: number;
  };
    pricingStrategyType: string;      // "auto" | "manual" | ""
  commissionRate: string;           // لاحظ: كـ string لسهولة الربط مع الـ TextField

pricingStrategy?: string | { _id: string; name?: string }; // أو object كامل لو تحتاج بيانات أكثر

    isTrending: boolean;
  isFeatured: boolean;
  isActive: boolean;
  image: string;
  logo: string;
    isOpen?: boolean;

  schedule: ScheduleSlot[];
  createdAt: string;
  updatedAt?: string;
  // …and any other fields you need
}
export interface ScheduleSlot {
  day: Day;
  open: boolean;
  from: string; // "HH:mm"
  to: string; // "HH:mm"
}

export const daysOfWeek = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

 export type Day = (typeof daysOfWeek)[number];

// types/delivery.ts
export interface Banner {
  _id: string;
  title: string;
  description: string;
  link?: string;
  storeId?: string;
  categoryId?: string;
  order: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  image?: string;
}

export interface Category {
  _id: string;
  name: string;
  // حقول أخرى إن وجدت
}

export interface BannerForm {
  title: string;
  description: string;
  link: string;
  storeId: string;
  categoryId: string;
  order: number; // صار number
  startDate: string;
  endDate: string;
  isActive: boolean;
  image: File | null;
}

export interface DeliveryProductSubCategory {
  _id: string;
  storeId: string | { _id: string };
  name: string;
}

export interface DeliveryProduct {
  _id: string;
  storeId: string;
  subCategoryId?: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  isAvailable: boolean;
}
// src/type/delivery.ts

// نوع الكائن الذي يستقبله من الـ API
export type PromotionPlacement =
  | "home_hero"
  | "home_strip"
  | "category_header"
  | "category_feed"
  | "store_header"
  | "search_banner"
  | "cart"
  | "checkout";

export interface IPromotion {
  _id: string;
  title?: string;
  description?: string;
  image?: string;
  link?: string;
  target: "product" | "store" | "category";
  value?: number;
  valueType?: "percentage" | "fixed";
  product?: Product | { _id: string; name?: string };
  store?: DeliveryStore | { _id: string; name?: string };
  category?: Category | { _id: string; name?: string };
  placements: PromotionPlacement[];
  channels?: ("app" | "web")[];
  cities?: string[];
  stacking?: "none" | "best" | "stack_same_target";
  minQty?: number;
  minOrderSubtotal?: number;
  maxDiscountAmount?: number;
  order?: number;
  startDate?: string | Date;
  endDate?: string | Date;
  isActive: boolean;
  createdAt?: string;
}

// Populated versions for display
export interface IPromotionPopulated {
  _id: string;
  title?: string;
  description?: string;
  image?: string;
  link?: string;
  target: "product" | "store" | "category";
  value?: number;
  valueType?: "percentage" | "fixed";
  product?: Product;
  store?: DeliveryStore;
  category?: Category;
  placements: PromotionPlacement[];
  channels?: ("app" | "web")[];
  cities?: string[];
  stacking?: "none" | "best" | "stack_same_target";
  minQty?: number;
  minOrderSubtotal?: number;
  maxDiscountAmount?: number;
  order?: number;
  startDate?: string | Date;
  endDate?: string | Date;
  isActive: boolean;
  createdAt?: string;
}

export interface PromotionForm {
  title: string;
  description: string;
  image: File | null;
  link: string;
  target: "product" | "store" | "category";
  value: number;
  valueType: "percentage" | "fixed";
  productId: string;
  storeId: string;
  categoryId: string;
  placements: PromotionPlacement[];
  channels: ("app" | "web")[];
  citiesText: string; // إدخال نصي مفصول بفواصل
  stacking: "none" | "best" | "stack_same_target";
  minQty?: number | undefined;
  minOrderSubtotal?: number | undefined;
  maxDiscountAmount?: number | undefined;
  isActive: boolean;
  order: number;
  startDate: string; // "YYYY-MM-DD"
  endDate: string;   // "YYYY-MM-DD"
}

// API payload type for create/update operations
export interface PromotionPayload {
  title?: string;
  description?: string;
  image?: string;
  link?: string;
  target: "product" | "store" | "category";
  value?: number;
  valueType?: "percentage" | "fixed";
  product?: string; // ObjectId as string
  store?: string; // ObjectId as string
  category?: string; // ObjectId as string
  placements?: PromotionPlacement[];
  channels?: ("app" | "web")[];
  cities?: string[];
  stacking?: "none" | "best" | "stack_same_target";
  minQty?: number;
  minOrderSubtotal?: number;
  maxDiscountAmount?: number;
  order?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}
// نموذج المنتج لخيارات select
export interface Product {
  _id: string;
  name: string;
}

// إذا لم تعرف Type للمتجر أو الفئة، أضفهم أيضاً:
export interface DeliveryStore {
  _id: string;
  name: string;
}

export interface Category {
  _id: string;
  name: string;
}
