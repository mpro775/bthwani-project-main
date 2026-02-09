// ✅ أنواع البيانات المركزية للمشروع

// Web-specific type declarations
declare global {
  interface Window {
    addEventListener(type: string, listener: (event: any) => void): void;
  }
}

type Address = {
  id: string;
  label: string;
  city: string;
  street: string;
  location?: {
    latitude: number;
    longitude: number;
  };
};

type Transaction = {
  id: string;
  type: "recharge" | "payment" | "refund";
  amount: number;
  date: string;
  note?: string;
};

type BloodData = {
  name: string;
  age: string;
  isAvailableToDonate: boolean;
  gender: string;
  bloodType: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  governorate: string;
  address: string;
  availableTime: string;
  lastDonation?: string;
  phone: string;
  showPhone: boolean;
  status: "متاح" | "غير متاح";
};

type FreelanceData = {
  bio: string;
  skills: string[];
  serviceCategory: string;
  city: string;
  portfolioImages: string[];
};

type OpportunityData = {
  specialization: string;
  experienceYears?: number;
  description: string;
  city: string;
};

type LostAndFoundStats = {
  lostCount: number;
  foundCount: number;
};
// types/favorites.ts
export type FavoriteType = "product" | "restaurant";

export interface FavoriteSnapshot {
  title?: string;
  image?: string;
  price?: number;
  rating?: number;
  // لفتح صفحة المتجر من مفضلة المنتجات
  storeId?: string;
  storeType?: "grocery" | "restaurant";
}

// العنصر الذي تتعامل معه الواجهة
export interface FavoriteItem {
  _id: string;
  itemId: string;
  itemType: FavoriteType;
  userId?: string;
  title?: string;
  image?: string;
  price?: number;
  rating?: number;
  storeId?: string;
  storeType?: "grocery" | "restaurant";
  createdAt?: string;
}

export type UserProfile = {
  id?: string;
  uid: string;
  fullName: string;
  phone: string;
  email?: string;
  aliasName?: string;
  profileImage?: string;
  gender?: "male" | "female";
  dateOfBirth?: string;
  addresses?: Address[]; // أصبحت اختيارية
  username?: string;
  displayFullName?: boolean;
  wallet?: {
    balance: number;
    lastRecharge?: string;
    transactions?: Transaction[];
  };
  bloodData?: BloodData;
  freelanceData?: FreelanceData;
  opportunityData?: OpportunityData;
  lostAndFoundPosts?: LostAndFoundStats;
  deliveryPreferences?: {
    preferredAddresses?: string[];
    defaultInstructions?: string;
  };
  settings?: {
    notificationsEnabled?: boolean;
    language?: "ar" | "en";
    darkMode?: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
};

export interface DeliveryStore {
  _id: string;
  name: string;
  address?: string;
  category?:
    | string
    | {
        _id: string;
        name: string;
      };
  location: {
    lat: number;
    lng: number;
  };
  image?: string;
  logo?: string;
  tags?: string[];
  rating?: number;
  isActive?: boolean;
  isOpen?: boolean;
  isFavorite?: boolean;
  isTrending?: boolean;
  isFeatured?: boolean;
  // إضافات محلية للحساب
  distance?: string; // مثال: "2.4 كم"
  time?: string; // مثال: "6 دقيقة تقريباً"
}

// ==================== معروف (Lost & Found) Types ====================

export type MaaroufStatus = 'draft' | 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type MaaroufKind = 'lost' | 'found';

export type MaaroufCategory = 'phone' | 'pet' | 'id' | 'wallet' | 'keys' | 'bag' | 'other';

export const MAAROUF_CATEGORIES: { value: MaaroufCategory; label: string }[] = [
  { value: 'phone', label: 'هاتف' },
  { value: 'pet', label: 'حيوان' },
  { value: 'id', label: 'هوية' },
  { value: 'wallet', label: 'محفظة' },
  { value: 'keys', label: 'مفاتيح' },
  { value: 'bag', label: 'حقيبة' },
  { value: 'other', label: 'أخرى' },
];

export interface MaaroufMetadata {
  color?: string;
  location?: string;
  date?: string;
  contact?: string;
  [key: string]: any;
}

export interface MaaroufItem {
  _id: string;
  ownerId: string;
  title: string;
  description?: string;
  kind?: MaaroufKind;
  tags?: string[];
  metadata?: MaaroufMetadata;
  status: MaaroufStatus;
  mediaUrls?: string[];
  category?: MaaroufCategory;
  reward?: number;
  location?: { type: 'Point'; coordinates: [number, number] };
  deliveryToggle?: boolean;
  matchedToId?: string;
  isAnonymous?: boolean;
  expiresAt?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateMaaroufPayload {
  ownerId: string;
  title: string;
  description?: string;
  kind?: MaaroufKind;
  tags?: string[];
  metadata?: MaaroufMetadata;
  status?: MaaroufStatus;
  mediaUrls?: string[];
  category?: MaaroufCategory;
  reward?: number;
  location?: { type: 'Point'; coordinates: [number, number] };
  deliveryToggle?: boolean;
  isAnonymous?: boolean;
  expiresAt?: string;
}

export interface UpdateMaaroufPayload {
  title?: string;
  description?: string;
  kind?: MaaroufKind;
  tags?: string[];
  metadata?: MaaroufMetadata;
  status?: MaaroufStatus;
  mediaUrls?: string[];
  category?: MaaroufCategory;
  reward?: number;
  location?: { type: 'Point'; coordinates: [number, number] };
  deliveryToggle?: boolean;
  isAnonymous?: boolean;
  expiresAt?: string;
}

export interface MaaroufListResponse {
  data: MaaroufItem[];
  nextCursor?: string;
  hasMore: boolean;
}

// ==================== عربون (Rental Listings) Types ====================

export type ArabonStatus = 'draft' | 'pending' | 'confirmed' | 'completed' | 'cancelled';

export type ArabonBookingPeriod = 'hour' | 'day' | 'week';

export interface ArabonSocialLinks {
  whatsapp?: string;
  facebook?: string;
  instagram?: string;
}

export interface ArabonMetadata {
  guests?: number;
  notes?: string;
  [key: string]: any;
}

export interface ArabonItem {
  _id: string;
  ownerId: string;
  title: string;
  description?: string;
  depositAmount?: number;
  scheduleAt?: string;
  metadata?: ArabonMetadata;
  status: ArabonStatus;
  images?: string[];
  contactPhone?: string;
  socialLinks?: ArabonSocialLinks;
  category?: string;
  bookingPrice?: number;
  bookingPeriod?: ArabonBookingPeriod;
  pricePerPeriod?: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateArabonPayload {
  ownerId: string;
  title: string;
  description?: string;
  depositAmount?: number;
  scheduleAt?: string;
  metadata?: ArabonMetadata;
  status?: ArabonStatus;
  images?: string[];
  contactPhone?: string;
  socialLinks?: ArabonSocialLinks;
  category?: string;
  bookingPrice?: number;
  bookingPeriod?: ArabonBookingPeriod;
  pricePerPeriod?: number;
}

export interface UpdateArabonPayload {
  title?: string;
  description?: string;
  depositAmount?: number;
  scheduleAt?: string;
  metadata?: ArabonMetadata;
  status?: ArabonStatus;
  images?: string[];
  contactPhone?: string;
  socialLinks?: ArabonSocialLinks;
  category?: string;
  bookingPrice?: number;
  bookingPeriod?: ArabonBookingPeriod;
  pricePerPeriod?: number;
}

export interface ArabonListResponse {
  data: ArabonItem[];
  nextCursor?: string;
  hasMore: boolean;
}

// ==================== كوادر (Professional Services) Types ====================

export type KawaderStatus = 'draft' | 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface KawaderMetadata {
  experience?: string;
  skills?: string[];
  location?: string;
  remote?: boolean;
  contact?: string;
  [key: string]: any;
}

export interface KawaderItem {
  _id: string;
  ownerId: string | {
    _id: string;
    name?: string;
    email?: string;
    phone?: string;
  };
  owner?: {
    _id: string;
    name?: string;
    email?: string;
    phone?: string;
  };
  title: string;
  description?: string;
  scope?: string;
  budget?: number;
  metadata?: KawaderMetadata;
  status: KawaderStatus;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateKawaderPayload {
  ownerId: string;
  title: string;
  description?: string;
  scope?: string;
  budget?: number;
  metadata?: KawaderMetadata;
  status?: KawaderStatus;
}

export interface UpdateKawaderPayload {
  title?: string;
  description?: string;
  scope?: string;
  budget?: number;
  metadata?: KawaderMetadata;
  status?: KawaderStatus;
}

export interface KawaderListResponse {
  data: KawaderItem[];
  nextCursor?: string;
  hasMore: boolean;
}

// ==================== كوادر — المحادثات Types ====================

export interface KawaderConversation {
  _id: string;
  kawaderId: {
    _id: string;
    title: string;
    budget?: number;
    scope?: string;
    status: string;
  };
  ownerId: {
    _id: string;
    name?: string;
    email?: string;
    phone?: string;
  };
  interestedUserId: {
    _id: string;
    name?: string;
    email?: string;
    phone?: string;
  };
  lastMessage?: string;
  lastMessageAt?: Date | string;
  unreadCountOwner: number;
  unreadCountInterested: number;
  status: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface KawaderMessage {
  _id: string;
  conversationId: string;
  senderId: {
    _id: string;
    name?: string;
    email?: string;
    phone?: string;
  };
  text: string;
  readAt?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface KawaderChatListResponse {
  items: KawaderConversation[];
  nextCursor?: string;
}

export interface KawaderMessageListResponse {
  items: KawaderMessage[];
  nextCursor?: string;
}

// Work scopes constants
export const WORK_SCOPES = [
  'مشروع قصير المدى',
  'مشروع متوسط المدى',
  'مشروع طويل المدى',
  'دوام كامل',
  'دوام جزئي',
  'عقد شهري',
  'عقد سنوي',
  'عمل حر',
] as const;

export type WorkScope = typeof WORK_SCOPES[number];

// ==================== اسعفني (Emergency Blood Donation) Types ====================

export type Es3afniStatus = 'draft' | 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Es3afniLocation {
  lat: number;
  lng: number;
  address: string;
}

export interface Es3afniMetadata {
  contact?: string;
  unitsNeeded?: number;
  urgency?: string;
  [key: string]: any;
}

export interface Es3afniItem {
  _id: string;
  ownerId: string;
  title: string;
  description?: string;
  bloodType?: string;
  location?: Es3afniLocation;
  metadata?: Es3afniMetadata;
  status: Es3afniStatus;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateEs3afniPayload {
  ownerId: string;
  title: string;
  description?: string;
  bloodType?: string;
  location?: Es3afniLocation;
  metadata?: Es3afniMetadata;
  status?: Es3afniStatus;
}

export interface UpdateEs3afniPayload {
  title?: string;
  description?: string;
  bloodType?: string;
  location?: Es3afniLocation;
  metadata?: Es3afniMetadata;
  status?: Es3afniStatus;
}

export interface Es3afniListResponse {
  items: Es3afniItem[];
  nextCursor?: string;
}

// Blood types constants
export const BLOOD_TYPES = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
] as const;

export type BloodType = typeof BLOOD_TYPES[number];

// ==================== كنز (Marketplace) Types ====================

export type KenzStatus = 'draft' | 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface KenzItem {
  _id: string;
  ownerId: string;
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
  /** من الباك اند عند دمج الترويج */
  isBoosted?: boolean;
  boostType?: string | null;
  /** حالة السلعة */
  condition?: 'new' | 'used' | 'refurbished';
  /** نشر بالنيابة: رقم الهاتف */
  postedOnBehalfOfPhone?: string;
  /** نشر بالنيابة: المستخدم (معرّف أو كائن من الباك اند) */
  postedOnBehalfOfUserId?: string | { _id: string; name?: string; phone?: string };
  deliveryOption?: 'meetup' | 'delivery' | 'both';
  deliveryFee?: number;
  /** يقبل الدفع بالإيكرو */
  acceptsEscrow?: boolean;
  isAuction?: boolean;
  auctionEndAt?: Date | string;
  startingPrice?: number;
  winnerId?: string | { _id: string; fullName?: string; phone?: string };
  winningBidAmount?: number;
}

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
  postedOnBehalfOfPhone?: string;
  deliveryOption?: 'meetup' | 'delivery' | 'both';
  deliveryFee?: number;
  acceptsEscrow?: boolean;
  isAuction?: boolean;
  auctionEndAt?: string;
  startingPrice?: number;
}

export interface KenzListResponse {
  items: KenzItem[];
  nextCursor?: string;
}

// فئات الإعلانات المحتملة
export const KENZ_CATEGORIES = [
  'إلكترونيات',
  'سيارات',
  'عقارات',
  'أثاث',
  'ملابس',
  'رياضة',
  'كتب',
  'خدمات',
  'وظائف',
  'حيوانات',
  'أخرى'
] as const;

export type KenzCategory = typeof KENZ_CATEGORIES[number];

/** المدن الـ 22 (المحافظات اليمنية) لكنز */
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

/** العملات المدعومة في كنز */
export const KENZ_CURRENCIES = [
  "ريال يمني",
  "ريال سعودي",
  "دولار أمريكي",
] as const;

export type KenzCurrency = (typeof KENZ_CURRENCIES)[number];

// ==================== سند (Services + Emergency + Charity) Types ====================

export type SanadStatus = 'draft' | 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type SanadKind = 'specialist' | 'emergency' | 'charity';

export interface SanadMetadata {
  location?: string;
  contact?: string;
  [key: string]: any;
}

export interface SanadItem {
  _id: string;
  ownerId: string;
  title: string;
  description?: string;
  kind?: SanadKind;
  metadata?: SanadMetadata;
  status: SanadStatus;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateSanadPayload {
  ownerId: string;
  title: string;
  description?: string;
  kind?: SanadKind;
  metadata?: SanadMetadata;
  status?: SanadStatus;
}

export interface UpdateSanadPayload {
  title?: string;
  description?: string;
  kind?: SanadKind;
  metadata?: SanadMetadata;
  status?: SanadStatus;
}

export interface SanadListResponse {
  items: SanadItem[];
  nextCursor?: string;
}

// ==================== أماني (Women's Transportation) Types ====================

export type AmaniStatus = 'draft' | 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export interface AmaniLocation {
  lat: number;
  lng: number;
  address: string;
}

export interface AmaniMetadata {
  passengers?: number;
  luggage?: boolean;
  specialRequests?: string;
  /** سائقة أنثى فقط */
  womenOnly?: boolean;
  [key: string]: any;
}

/** السائق المعين (من الباكند populate driver) */
export interface AmaniDriver {
  _id: string;
  fullName?: string;
  phone?: string;
  email?: string;
  vehicleType?: string;
}

export interface AmaniItem {
  _id: string;
  ownerId: string;
  title: string;
  description?: string;
  origin?: AmaniLocation;
  destination?: AmaniLocation;
  metadata?: AmaniMetadata;
  status: AmaniStatus;
  /** السائق المعين: إما ObjectId (string) أو كائن بعد populate */
  driver?: AmaniDriver | string;
  assignedAt?: Date | string;
  pickedUpAt?: Date | string;
  completedAt?: Date | string;
  driverLocation?: {
    lat: number;
    lng: number;
    updatedAt: Date | string;
  };
  statusHistory?: Array<{
    status: string;
    timestamp: Date | string;
    note?: string;
    changedBy?: string;
  }>;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateAmaniPayload {
  ownerId: string;
  title: string;
  description?: string;
  origin?: AmaniLocation;
  destination?: AmaniLocation;
  metadata?: AmaniMetadata;
  status?: AmaniStatus;
}

export interface UpdateAmaniPayload {
  title?: string;
  description?: string;
  origin?: AmaniLocation;
  destination?: AmaniLocation;
  metadata?: AmaniMetadata;
  status?: AmaniStatus;
}

export interface AmaniListResponse {
  data: AmaniItem[];
  nextCursor?: string;
  hasMore: boolean;
}