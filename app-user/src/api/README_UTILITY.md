# Utility API - تطبيق المستخدم

## نظرة عامة

هذا الملف يوفر واجهة للتعامل مع endpoints الغاز والماء في Backend.

## الملفات

- `utilityApi.ts` - API للغاز والماء
- ~~`utility.ts`~~ - **غير موجود** (لأن bthwani-web يستخدم هذا الاسم لـ errands)

## كيفية الاستخدام

### 1. الحصول على خيارات التسعير

```typescript
import { getUtilityOptions } from '@/api/utilityApi';

const options = await getUtilityOptions('صنعاء');

console.log(options.gas?.pricePerCylinder); // 5000
console.log(options.water?.sizes); // [small, medium, large]
```

### 2. حساب السعر

```typescript
import { calculateUtilityPrice } from '@/api/utilityApi';

// للغاز
const gasPrice = await calculateUtilityPrice({
  serviceType: 'gas',
  city: 'صنعاء',
  quantity: 2,
  customerLocation: {
    lat: 15.3694,
    lng: 44.1910
  }
});

console.log(gasPrice.total); // 10500 (product + delivery)

// للماء
const waterPrice = await calculateUtilityPrice({
  serviceType: 'water',
  city: 'صنعاء',
  size: 'medium',
  half: false,
  customerLocation: {
    lat: 15.3694,
    lng: 44.1910
  }
});
```

## الشاشات المستخدمة

### UtilityGasScreen.tsx
- يعرض واجهة طلب دبّة الغاز
- يستخدم `GET /utility/options` لجلب الأسعار
- **⚠️ يحتاج:** `POST /utility/order` (غير متوفر حالياً)

**الحل المؤقت:**
```typescript
// بدلاً من POST /utility/order
// يستخدم مباشرة:
const { data } = await axiosInstance.post("/utility/order", payload);
```

### UtilityWaterScreen.tsx
- يعرض واجهة طلب وايت الماء
- يدعم: أحجام متعددة، نصف وايت، عدد متعدد
- **⚠️ يحتاج:** `POST /utility/order` (غير متوفر حالياً)

## ⚠️ النقص الحالي

### POST /utility/order غير موجود

**المشكلة:**
```typescript
// ❌ هذا endpoint غير موجود في backend
await axiosInstance.post("/utility/order", {
  kind: "gas",
  city: "صنعاء",
  variant: "20L",
  quantity: 2,
  addressId: "xxx",
  paymentMethod: "cash"
});
```

**الحل المقترح:**
يجب إضافة دعم في `order` module:

```typescript
// backend-nest/src/modules/order/
POST /orders (يدعم kind: 'gas' | 'water')
```

**حتى ذلك الحين:**
- ✅ يمكن الحصول على الأسعار
- ✅ يمكن حساب السعر
- ❌ لا يمكن إنشاء طلب فعلي

## Types

### UtilityOptionsResponse
```typescript
{
  city: string;
  gas: {
    cylinderSizeLiters: number;
    pricePerCylinder: number;
    minQty: number;
    deliveryPolicy: "flat" | "strategy";
    flatFee: number | null;
  } | null;
  water: {
    sizes: Array<{
      key: "small" | "medium" | "large";
      capacityLiters: number;
      pricePerTanker: number;
    }>;
    allowHalf: boolean;
    halfPolicy: "linear" | "multiplier" | "fixed";
    deliveryPolicy: "flat" | "strategy";
    flatFee: number | null;
  } | null;
}
```

### CalculatePriceRequest
```typescript
{
  serviceType: "gas" | "water";
  city?: string;
  // للغاز
  quantity?: number;
  // للماء
  size?: "small" | "medium" | "large";
  half?: boolean;
  // الموقع
  customerLocation?: {
    lat: number;
    lng: number;
  };
}
```

### CalculatePriceResponse
```typescript
{
  productPrice: number;
  deliveryFee: number;
  total: number;
  breakdown: {
    serviceType: "gas" | "water";
    city: string;
    quantity?: number;
    size?: string;
    half?: boolean;
  };
}
```

## الاختبار

```typescript
// في DevTools أو console
import { getUtilityOptions, calculateUtilityPrice } from '@/api/utilityApi';

// اختبار 1: الحصول على الخيارات
const options = await getUtilityOptions('صنعاء');
console.log('Options:', options);

// اختبار 2: حساب سعر الغاز
const gasPrice = await calculateUtilityPrice({
  serviceType: 'gas',
  city: 'صنعاء',
  quantity: 2
});
console.log('Gas Price:', gasPrice);

// اختبار 3: حساب سعر الماء
const waterPrice = await calculateUtilityPrice({
  serviceType: 'water',
  city: 'صنعاء',
  size: 'medium',
  half: false
});
console.log('Water Price:', waterPrice);
```

## ملاحظات

1. **Axios Instance:** يستخدم `axiosInstance` من `@/utils/api/axiosInstance`
2. **Auth:** لا تحتاج endpoints الـ utility إلى auth (public)
3. **Error Handling:** يرمي errors تلقائياً عبر axios interceptors

## الملفات ذات الصلة

- Backend: `backend-nest/src/modules/utility/`
- Screens: `app-user/src/screens/delivery/Utility*.tsx`
- Types: `app-user/src/api/utilityApi.ts`

## انظر أيضاً

- `/UTILITY_ENDPOINTS_CLOSURE.md` - التقرير الكامل
- `backend-nest/src/modules/utility/README.md` - توثيق Backend

