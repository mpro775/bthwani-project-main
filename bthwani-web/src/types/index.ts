// Common Types
export interface User {
  id: string;
  _id?: string;
  email: string;
  fullName: string;
  phone: string;
  profileImage?: string;
  addresses?: Address[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Address {
  _id: string;
  label: string;
  city: string;
  street: string;
  location?: {
    lat: number;
    lng: number;
  };
  isDefault?: boolean;
}

export interface Store {
  id: string;
  _id?: string;
  name: string;
  description?: string;
  image?: string;
  logo?: string;
  rating?: number;
  ratingsCount?: number;
  deliveryTime?: string;
  deliveryFee?: number;
  minOrder?: number;
  minOrderAmount?: number;
  deliveryBaseFee?: number;
  deliveryPerKmFee?: number;
  deliveryRadiusKm?: number;
  avgPrepTimeMin?: number;
  categories?: string[];
  isOpen?: boolean;
  isActive?: boolean;
  forceClosed?: boolean;
  forceOpen?: boolean;
  schedule?: Array<{
    day: string;
    open: boolean;
    from: string;
    to: string;
    _id?: string;
  }>;
  location?: {
    lat: number;
    lng: number;
  };
  geo?: {
    type: string;
    coordinates: [number, number];
  };
  isTrending?: boolean;
  isFeatured?: boolean;
  commissionRate?: number;
  takeCommission?: boolean;
  pricingStrategy?: string | null;
  pricingStrategyType?: string;
  _promoBadge?: string;
  _promoPercent?: number;
  distance?: string;
  time?: string;
  usageType?: string;
  tags?: string[];
  participants?: string[];
  pendingOrders?: number;
  source?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  _id?: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  images?: string[];
  category?: string;
  storeId?: string;
  store?: Store;
  inStock?: boolean;
  isAvailable?: boolean; // Alternative field name from backend
  available?: boolean; // Another alternative field name
  discount?: number;
  discountPercent?: number; // Alternative field name from backend
  discountPercentage?: number; // Another alternative field name
  rating?: number;
  // حقول إضافية قد تأتي من API
  product?: unknown; // Nested product object
  merchant?: unknown; // Merchant information
  section?: unknown; // Section information
  stock?: number; // Stock quantity
}

export interface Category {
  id: string;
  _id?: string;
  name: string;
  nameAr?: string;
  nameEn?: string;
  icon?: string;
  image?: string;
  description?: string;
  sortOrder?: number;
  parent?: string;
}

export interface Banner {
  id: string;
  _id?: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  link?: string;
  placement?: string;
  channel?: string;
}

export interface Promotion {
  id: string;
  _id?: string;
  title: string;
  description?: string;
  imageUrl?: string;
  validUntil?: string;
  store?: string;
  value?: number;
  valueType?: "percentage" | "fixed";
  channels?: string[];
  link?: string;
  target?: string;
  product?: Product;
  category?: Category;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  total: number;
  coupon?: {
    code: string;
    discount: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  _id?: string;
  orderNumber: string;
  userId: string;
  storeId: string;
  store?: Store;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  address: Address;
  createdAt: string;
  updatedAt?: string;
  deliveryTime?: string;
  rating?: number;
  review?: string;
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'onTheWay'
  | 'delivered'
  | 'cancelled';

export interface AuthResponse {
  idToken: string;
  refreshToken: string;
  localId: string;
  email: string;
  expiresIn: string;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface Notification {
  id: string;
  _id?: string;
  userId: string;
  type: 'order' | 'promotion' | 'system' | 'delivery';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface Favorite {
  id: string;
  _id?: string;
  itemId: string;
  itemType: "store" | "product";
  userId: string;
  createdAt?: string;
}
export interface NotificationSettings {
  orderUpdates: boolean;
  promotions: boolean;
  deliveryUpdates: boolean;
  systemAnnouncements: boolean;
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

// أخدمني Service Types (Errand Service)
export type ErrandCategory =
  | 'docs'
  | 'parcel'
  | 'groceries'
  | 'carton'
  | 'food'
  | 'fragile'
  | 'other';

export type ErrandSize = 'small' | 'medium' | 'large';
export type PaymentMethod = 'wallet' | 'cash' | 'card' | 'mixed';

export interface ErrandPoint {
  label?: string;
  street?: string;
  city?: string;
  contactName?: string;
  phone?: string;
  location: {
    lat: number | null;
    lng: number | null;
  };
}

export interface Waypoint {
  label?: string;
  location: {
    lat: number;
    lng: number;
  };
}

export interface ErrandForm {
  category: ErrandCategory;
  size?: ErrandSize;
  weightKg?: string;
  description?: string;
  pickup: ErrandPoint;
  dropoff: ErrandPoint;
  waypoints: Waypoint[];
  tip: string;
  scheduledFor?: string | null;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface ErrandOrder {
  id: string;
  _id?: string;
  orderNumber: string;
  userId: string;
  category: ErrandCategory;
  size?: ErrandSize;
  weightKg?: string;
  description?: string;
  pickup: ErrandPoint;
  dropoff: ErrandPoint;
  waypoints: Waypoint[];
  tip: number;
  scheduledFor?: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  status: ErrandOrderStatus;
  total: number;
  createdAt: string;
  updatedAt?: string;
}

export type ErrandOrderStatus =
  | 'pending'
  | 'confirmed'
  | 'driver_assigned'
  | 'pickup_in_progress'
  | 'in_transit'
  | 'delivered'
  | 'cancelled';

export interface ErrandCategoryInfo {
  id: ErrandCategory;
  name: string;
  nameAr: string;
  icon: string;
  description: string;
  maxWeight?: number;
  estimatedTime?: string;
  basePrice?: number;
}

export interface ErrandSizeInfo {
  id: ErrandSize;
  name: string;
  nameAr: string;
  maxWeight: number;
  multiplier: number;
}

// Grocery Types (متاجر البقالة)
export type GroceryCategory =
  | 'fruits_vegetables'
  | 'dairy_eggs'
  | 'meat_poultry'
  | 'bakery'
  | 'pantry_staples'
  | 'beverages'
  | 'frozen'
  | 'cleaning'
  | 'personal_care'
  | 'baby_products'
  | 'pet_supplies'
  | 'household';

export interface GroceryCategoryInfo {
  id: GroceryCategory;
  name: string;
  nameAr: string;
  icon: string;
  description: string;
  color?: string;
}

export interface GroceryStore {
  id: string;
  _id?: string;
  name: string;
  description?: string;
  image?: string;
  logo?: string;
  rating?: number;
  deliveryTime?: string;
  deliveryFee?: number;
  minOrder?: number;
  categories?: GroceryCategory[];
  isOpen?: boolean;
  location?: {
    lat: number;
    lng: number;
  };
  isGrocery?: boolean;
  specialties?: string[];
}

export interface GroceryProduct {
  id: string;
  _id?: string;
  name: string;
  nameAr?: string;
  description?: string;
  price: number;
  originalPrice?: number;
  image?: string;
  images?: string[];
  category: GroceryCategory;
  subcategory?: string;
  brand?: string;
  weight?: string;
  unit?: string;
  inStock?: boolean;
  stockQuantity?: number;
  discount?: number;
  rating?: number;
  reviews?: number;
  isOrganic?: boolean;
  isFeatured?: boolean;
  storeId: string;
  store?: GroceryStore;
  nutritionInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
  };
  allergens?: string[];
  tags?: string[];
}

export interface GroceryCartItem extends GroceryProduct {
  quantity: number;
}

export interface GroceryOrder {
  id: string;
  _id?: string;
  orderNumber: string;
  userId: string;
  storeId: string;
  store?: GroceryStore;
  items: GroceryCartItem[];
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  total: number;
  status: GroceryOrderStatus;
  address: Address;
  deliveryTime?: string;
  specialInstructions?: string;
  createdAt: string;
  updatedAt?: string;
  rating?: number;
  review?: string;
}

export type GroceryOrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface GroceryFilters {
  categories?: GroceryCategory[];
  priceRange?: [number, number];
  brands?: string[];
  inStock?: boolean;
  organic?: boolean;
  rating?: number;
  sortBy?: 'name' | 'price' | 'rating' | 'popularity' | 'newest';
}

// Gas Service Types (خدمة الغاز)
export type GasCylinderType =
  | 'small'
  | 'medium'
  | 'large'
  | 'jumbo';

export type GasServiceType =
  | 'new_cylinder'
  | 'refill'
  | 'exchange'
  | 'maintenance';

export interface GasCylinderInfo {
  id: GasCylinderType;
  name: string;
  nameAr: string;
  capacity: number; // بالكيلوغرام
  price: number;
  description: string;
  estimatedTime: string;
  icon: string;
}

export interface GasOrderForm {
  serviceType: GasServiceType;
  cylinderType: GasCylinderType;
  quantity: number;
  deliveryAddress: {
    label?: string;
    street?: string;
    city?: string;
    contactName?: string;
    phone?: string;
    location?: { lat: number; lng: number };
  };
  scheduledDate?: string;
  scheduledTime?: string;
  specialInstructions?: string;
  paymentMethod: PaymentMethod;
}

export interface GasOrder {
  id: string;
  _id?: string;
  orderNumber: string;
  userId: string;
  serviceType: GasServiceType;
  cylinderType: GasCylinderType;
  quantity: number;
  totalPrice: number;
  deliveryAddress: {
    label?: string;
    street?: string;
    city?: string;
    contactName?: string;
    phone?: string;
    location?: { lat: number; lng: number };
  };
  scheduledDate?: string;
  scheduledTime?: string;
  status: GasOrderStatus;
  specialInstructions?: string;
  paymentMethod: PaymentMethod;
  createdAt: string;
  updatedAt?: string;
  rating?: number;
  review?: string;
}

export type GasOrderStatus =
  | 'pending'
  | 'confirmed'
  | 'driver_assigned'
  | 'pickup_in_progress'
  | 'in_transit'
  | 'delivered'
  | 'cancelled';

export interface GasProvider {
  id: string;
  _id?: string;
  name: string;
  nameAr: string;
  logo?: string;
  rating?: number;
  coverageArea?: string[];
  estimatedDeliveryTime: string;
  serviceTypes: GasServiceType[];
  cylinderTypes: GasCylinderType[];
  contactNumber?: string;
  isActive?: boolean;
}

// Water Service Types (خدمة الماء)
export type WaterBottleType =
  | 'small'
  | 'medium'
  | 'large'
  | 'gallon';

export type WaterServiceType =
  | 'bottled_water'
  | 'water_tank'
  | 'water_delivery';

export interface WaterBottleInfo {
  id: WaterBottleType;
  name: string;
  nameAr: string;
  capacity: number; // باللتر
  price: number;
  description: string;
  estimatedTime: string;
  icon: string;
}

export interface WaterOrderForm {
  serviceType: WaterServiceType;
  bottleType: WaterBottleType;
  quantity: number;
  deliveryAddress: {
    label?: string;
    street?: string;
    city?: string;
    contactName?: string;
    phone?: string;
    location?: { lat: number; lng: number };
  };
  scheduledDate?: string;
  scheduledTime?: string;
  specialInstructions?: string;
  paymentMethod: PaymentMethod;
  isRecurring?: boolean;
  recurringFrequency?: 'weekly' | 'biweekly' | 'monthly';
}

export interface WaterOrder {
  id: string;
  _id?: string;
  orderNumber: string;
  userId: string;
  serviceType: WaterServiceType;
  bottleType: WaterBottleType;
  quantity: number;
  totalPrice: number;
  deliveryAddress: {
    label?: string;
    street?: string;
    city?: string;
    contactName?: string;
    phone?: string;
    location?: { lat: number; lng: number };
  };
  scheduledDate?: string;
  scheduledTime?: string;
  status: WaterOrderStatus;
  specialInstructions?: string;
  paymentMethod: PaymentMethod;
  isRecurring?: boolean;
  recurringFrequency?: 'weekly' | 'biweekly' | 'monthly';
  createdAt: string;
  updatedAt?: string;
  rating?: number;
  review?: string;
}

export type WaterOrderStatus =
  | 'pending'
  | 'confirmed'
  | 'driver_assigned'
  | 'pickup_in_progress'
  | 'in_transit'
  | 'delivered'
  | 'cancelled';

export interface WaterProvider {
  id: string;
  _id?: string;
  name: string;
  nameAr: string;
  logo?: string;
  rating?: number;
  coverageArea?: string[];
  estimatedDeliveryTime: string;
  serviceTypes: WaterServiceType[];
  bottleTypes: WaterBottleType[];
  contactNumber?: string;
  isActive?: boolean;
  waterQuality?: string;
  certifications?: string[];
}
