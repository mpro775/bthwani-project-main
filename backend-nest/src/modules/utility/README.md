# Utility Module - الغاز والماء

## نظرة عامة

هذا الـ module مسؤول عن إدارة تسعير خدمات الغاز والماء حسب المدينة.

## الوظائف الرئيسية

### 1. إدارة التسعير (Pricing Management)
- تسعير الغاز: حجم الأسطوانة، السعر، الحد الأدنى
- تسعير الماء: أحجام متعددة (small, medium, large)، نصف وايت، سياسات التسعير
- رسوم التوصيل: ثابتة أو حسب المسافة

### 2. الأسعار اليومية (Daily Pricing)
- تغيير الأسعار بشكل يومي (override)
- تخزين تاريخي للأسعار

### 3. حساب الأسعار (Price Calculation)
- حساب سعر المنتج
- حساب رسوم التوصيل بناءً على المسافة
- الإجمالي النهائي

## البنية

```
utility/
├── dto/
│   ├── create-utility-pricing.dto.ts  # DTOs للتسعير الأساسي
│   └── daily-price.dto.ts             # DTOs للأسعار اليومية
├── entities/
│   ├── utility-pricing.entity.ts      # التسعير الأساسي
│   └── daily-price.entity.ts          # الأسعار اليومية
├── services/
│   └── utility.service.ts             # منطق الأعمال
├── utility.controller.ts              # REST API endpoints
├── utility.module.ts                  # تعريف الـ module
└── README.md                          # هذا الملف
```

## API Endpoints

تم تنظيم الـ endpoints في 5 فئات رئيسية:
1. **Public** - متاحة للجميع (تسعير وحساب)
2. **Admin - Pricing** - إدارة التسعير الأساسي
3. **Admin - Daily Pricing** - الأسعار اليومية
4. **Orders - User** - طلبات الغاز/الماء للمستخدمين
5. **Orders - Admin** - إدارة الطلبات

### Public Endpoints

#### `GET /utility/options`
الحصول على خيارات التسعير لمدينة معينة.

**Query Parameters:**
- `city` (optional): اسم المدينة (افتراضي: صنعاء)

**Response:**
```json
{
  "city": "صنعاء",
  "gas": {
    "cylinderSizeLiters": 20,
    "pricePerCylinder": 5000,
    "minQty": 1,
    "deliveryPolicy": "flat",
    "flatFee": 500
  },
  "water": {
    "sizes": [
      { "key": "small", "capacityLiters": 8000, "pricePerTanker": 3000 },
      { "key": "medium", "capacityLiters": 12000, "pricePerTanker": 4500 },
      { "key": "large", "capacityLiters": 20000, "pricePerTanker": 7000 }
    ],
    "allowHalf": true,
    "halfPolicy": "multiplier",
    "deliveryPolicy": "strategy",
    "flatFee": null
  }
}
```

#### `POST /utility/calculate-price`
حساب سعر خدمة الغاز أو الماء.

**Body:**
```json
{
  "serviceType": "gas",
  "city": "صنعاء",
  "quantity": 2,
  "customerLocation": {
    "lat": 15.3694,
    "lng": 44.1910
  }
}
```

**Response:**
```json
{
  "productPrice": 10000,
  "deliveryFee": 500,
  "total": 10500,
  "breakdown": {
    "serviceType": "gas",
    "city": "صنعاء",
    "quantity": 2
  }
}
```

### Admin Endpoints

#### `POST /utility/pricing`
إنشاء تسعير جديد لمدينة.

#### `GET /utility/pricing`
الحصول على كل التسعيرات.

#### `GET /utility/pricing/:city`
الحصول على تسعير مدينة محددة.

#### `PATCH /utility/pricing/:city`
تحديث تسعير مدينة.

#### `DELETE /utility/pricing/:city`
حذف تسعير مدينة.

#### `PATCH /utility/options/gas`
إنشاء/تحديث إعدادات الغاز (للـ admin dashboard).

#### `PATCH /utility/options/water`
إنشاء/تحديث إعدادات الماء (للـ admin dashboard).

#### `GET /utility/daily`
الحصول على قائمة الأسعار اليومية.

**Query Parameters:**
- `kind`: gas | water
- `city`: اسم المدينة

#### `POST /utility/daily`
إضافة/تحديث سعر يومي.

**Body:**
```json
{
  "kind": "gas",
  "city": "صنعاء",
  "date": "2025-10-15",
  "price": 5500,
  "variant": "20L"
}
```

#### `DELETE /utility/daily/:id`
حذف سعر يومي حسب ID.

#### `DELETE /utility/daily`
حذف سعر يومي حسب المفتاح المركب.

**Query Parameters:**
- `kind`: gas | water
- `city`: اسم المدينة
- `date`: YYYY-MM-DD
- `variant` (optional): small|medium|large للماء، حجم الأسطوانة للغاز

---

### Utility Orders Endpoints

#### `POST /utility/order`
إنشاء طلب غاز أو ماء جديد.

**Body:**
```json
{
  "kind": "gas",
  "city": "صنعاء",
  "variant": "20L",
  "quantity": 2,
  "paymentMethod": "cash",
  "addressId": "64abc...",
  "notes": [
    { "body": "الرجاء الاتصال قبل الوصول", "visibility": "public" }
  ],
  "scheduledFor": "2025-10-16T10:00:00Z",
  "customerLocation": {
    "lat": 15.3694,
    "lng": 44.1910
  }
}
```

**Response:**
```json
{
  "_id": "64def...",
  "user": "64abc...",
  "kind": "gas",
  "city": "صنعاء",
  "variant": "20L",
  "quantity": 2,
  "productPrice": 10000,
  "deliveryFee": 500,
  "total": 10500,
  "status": "created",
  "paymentMethod": "cash",
  "address": { ... },
  "createdAt": "2025-10-15T12:00:00Z"
}
```

#### `GET /utility/orders`
جلب طلبات المستخدم الحالي.

**Response:**
```json
[
  {
    "_id": "64def...",
    "kind": "gas",
    "city": "صنعاء",
    "variant": "20L",
    "quantity": 2,
    "total": 10500,
    "status": "delivered",
    "createdAt": "2025-10-15T12:00:00Z"
  }
]
```

#### `GET /utility/order/:id`
جلب تفاصيل طلب محدد.

#### `PATCH /utility/order/:id/status`
تحديث حالة الطلب (admin/driver).

**Body:**
```json
{
  "status": "in_transit"
}
```

**الحالات المتاحة:**
- `created` - تم الإنشاء
- `confirmed` - تم التأكيد
- `assigned` - تم التعيين لسائق
- `picked_up` - تم الاستلام من المصدر
- `in_transit` - في الطريق
- `delivered` - تم التسليم
- `cancelled` - ملغي

#### `PATCH /utility/order/:id/cancel`
إلغاء الطلب (customer).

**Body:**
```json
{
  "reason": "لم أعد بحاجة للطلب"
}
```

#### `POST /utility/order/:id/rate`
تقييم الطلب بعد التسليم.

**Body:**
```json
{
  "rating": 5,
  "review": "خدمة ممتازة وسريعة"
}
```

#### `POST /utility/order/:id/assign-driver`
تعيين سائق للطلب (admin).

**Body:**
```json
{
  "driverId": "64xyz..."
}
```

#### `GET /utility/admin/orders`
جلب جميع الطلبات (admin).

**Query Parameters (اختيارية):**
- `kind`: gas | water
- `city`: المدينة
- `status`: الحالة
- `driver`: معرف السائق

## كيفية الاستخدام

### في Frontend

#### App User (React Native)
```typescript
import { getUtilityOptions, calculateUtilityPrice } from '@/api/utilityApi';

// الحصول على الخيارات
const options = await getUtilityOptions('صنعاء');

// حساب السعر
const price = await calculateUtilityPrice({
  serviceType: 'gas',
  city: 'صنعاء',
  quantity: 2,
  customerLocation: { lat: 15.3694, lng: 44.1910 }
});
```

#### Admin Dashboard (React)
```typescript
import { UtilityApi } from './services/utilityApi';

// تحديث تسعير الغاز
await UtilityApi.upsertGas({
  city: 'صنعاء',
  cylinderSizeLiters: 20,
  pricePerCylinder: 5000,
  minQty: 1,
  deliveryPolicy: 'flat',
  flatFee: 500
});

// إضافة سعر يومي
await UtilityApi.upsertDaily({
  kind: 'water',
  city: 'صنعاء',
  date: '2025-10-15',
  price: 3500,
  variant: 'small'
});
```

## التطوير المستقبلي

### ✅ تم إنجازه: نظام الطلبات
تم إنشاء نظام طلبات مستقل ومتكامل في utility module:

✅ **UtilityOrder Entity** - نموذج بيانات خاص بطلبات الغاز والماء  
✅ **UtilityOrderService** - منطق الأعمال الكامل  
✅ **8 Endpoints** - لإدارة الطلبات من الإنشاء للتقييم  
✅ **حساب تلقائي** - يستخدم UtilityService لحساب الأسعار  
✅ **Status Tracking** - تتبع كامل لحالة الطلب  

### 🔄 تحسينات مقترحة
1. **دمج مع User Service** - جلب العناوين تلقائياً من profile المستخدم
2. **دمج مع Wallet Service** - التحقق الفعلي من رصيد المحفظة
3. **دمج مع Driver Service** - تعيين تلقائي للسائق الأقرب
4. **Notifications** - إشعارات في الوقت الفعلي لتغيير الحالة
5. **Analytics** - تحليلات الطلبات والإيرادات

## الملاحظات

- **الأمان:** جميع admin endpoints محمية بـ JWT و Roles guard
- **التخزين:** MongoDB مع indexes على city, date, kind
- **المسافة:** يستخدم geolib لحساب المسافة بين نقاط GPS
- **الافتراضي:** المدينة الافتراضية هي "صنعاء"

## التواصل

لأي استفسارات أو مشاكل، يرجى مراجعة:
- `/docs/UTILITY_ENDPOINTS_CLOSURE.md` للتقرير الكامل

