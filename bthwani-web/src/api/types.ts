// ✅ أنواع البيانات المركزية للمشروع

// Web-specific type declarations
declare global {
  interface Window {
    addEventListener(type: string, listener: (event: unknown) => void): void;
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
export type FavoriteType = "product" | "restaurant" | "grocery";

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
  id?: string; // For compatibility with local interface
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

// Raw API response for favorites
export interface RawFavoriteResponse {
  _id?: string | number;
  itemId?: string;
  item?: string;
  itemType?: string;
  userId?: string;
  user?: string | number;
  title?: string;
  image?: string;
  price?: number;
  rating?: number;
  storeId?: string;
  storeType?: string;
  createdAt?: string;
  itemSnapshot?: FavoriteSnapshot;
}

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
