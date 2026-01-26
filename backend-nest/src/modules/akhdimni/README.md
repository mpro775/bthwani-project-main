# موديول أخدمني (Akhdimni Module)

## نظرة عامة

موديول **أخدمني** هو نظام لإدارة طلبات المهام والتوصيل (Errand Orders). يتيح هذا النظام للعملاء إنشاء طلبات مهام (مثل توصيل مستندات، طرود، بضائع، وغيرها) وتعيين سائقين لتوصيلها. يدعم النظام تتبع حالة المهمة من بداية إنشائها حتى التسليم، بالإضافة إلى نظام تقييم ودفع.

---

## الهيكل التنظيمي

```
akhdimni/
├── akhdimni.controller.ts    # نقاط النهاية (API Endpoints)
├── akhdimni.module.ts        # إعدادات الموديول
├── dto/                      # كائنات نقل البيانات
│   ├── calculate-fee.dto.ts
│   └── create-errand.dto.ts
├── entities/                 # نماذج البيانات
│   └── errand-order.entity.ts
└── services/                 # منطق الأعمال
    └── akhdimni.service.ts
```

---

## الكيانات (Entities)

### 1. ErrandOrder (طلب المهمة)

الكيان الرئيسي الذي يمثل طلب مهمة واحد.

#### الحقول الأساسية

| الحقل | النوع | الوصف | مطلوب |
|------|------|-------|-------|
| `orderNumber` | String | رقم المهمة الفريد (مثال: ERR-202501-0001) | ✓ |
| `user` | ObjectId | مرجع للمستخدم (العميل) | ✓ |
| `driver` | ObjectId | مرجع للسائق | ✗ |
| `status` | Enum | حالة المهمة (انظر أدناه) | ✓ |
| `deliveryFee` | Number | رسوم التوصيل | ✓ |
| `totalPrice` | Number | الإجمالي (رسوم التوصيل + إكرامية) | ✓ |
| `paymentMethod` | Enum | طريقة الدفع (`wallet`, `cash`, `card`, `mixed`) | ✓ |
| `paid` | Boolean | حالة الدفع | ✗ |
| `walletUsed` | Number | المبلغ المستخدم من المحفظة | ✗ |
| `cashDue` | Number | المبلغ المستحق نقداً | ✗ |

#### حقول التاريخ والوقت

| الحقل | النوع | الوصف |
|------|------|-------|
| `assignedAt` | Date | تاريخ ووقت تعيين السائق |
| `pickedUpAt` | Date | تاريخ ووقت استلام المهمة من السائق |
| `deliveredAt` | Date | تاريخ ووقت التسليم |
| `scheduledFor` | Date | التاريخ المجدول للمهمة |
| `createdAt` | Date | تاريخ الإنشاء (تلقائي) |
| `updatedAt` | Date | تاريخ التحديث الأخير (تلقائي) |

#### حقول أخرى

| الحقل | النوع | الوصف |
|------|------|-------|
| `errand` | ErrandDetails | تفاصيل المهمة (انظر أدناه) |
| `cancellationReason` | String | سبب الإلغاء |
| `statusHistory` | Array | سجل تغيرات الحالة |
| `rating` | Object | التقييم (إن وجد) |
| `notes` | String | ملاحظات إضافية |

### 2. ErrandDetails (تفاصيل المهمة)

كيان متداخل يحتوي على تفاصيل المهمة نفسها.

#### الحقول

| الحقل | النوع | الوصف | مطلوب |
|------|------|-------|-------|
| `category` | Enum | نوع المهمة (`docs`, `parcel`, `groceries`, `other`) | ✓ |
| `description` | String | وصف المهمة | ✗ |
| `size` | Enum | حجم الغرض (`small`, `medium`, `large`) | ✗ |
| `weightKg` | Number | الوزن بالكيلوجرام | ✗ |
| `pickup` | ErrandPoint | نقطة الاستلام | ✓ |
| `dropoff` | ErrandPoint | نقطة التسليم | ✓ |
| `waypoints` | Array | نقاط طريق إضافية | ✗ |
| `distanceKm` | Number | المسافة الإجمالية بالكيلومتر | ✓ |
| `tip` | Number | الإكرامية | ✗ |

### 3. ErrandPoint (نقطة المهمة)

كيان متداخل يمثل موقع جغرافي (نقطة استلام أو تسليم).

#### الحقول

| الحقل | النوع | الوصف | مطلوب |
|------|------|-------|-------|
| `label` | String | اسم النقطة | ✓ |
| `street` | String | اسم الشارع | ✗ |
| `city` | String | المدينة | ✗ |
| `contactName` | String | اسم جهة الاتصال | ✗ |
| `phone` | String | رقم الهاتف | ✗ |
| `location` | Object | الموقع (`{lat: number, lng: number}`) | ✓ |
| `geo` | GeoJSON | الموقع بتنسيق GeoJSON | ✗ |

---

## حالات المهمة (Status Flow)

تدفق حالات المهمة من الإنشاء حتى الإكمال:

```
created
  ↓
assigned (عند تعيين سائق)
  ↓
driver_enroute_pickup (السائق في طريقه لاستلام المهمة)
  ↓
picked_up (تم الاستلام)
  ↓
driver_enroute_dropoff (السائق في طريقه للتسليم)
  ↓
delivered (تم التسليم) ✅
  أو
cancelled (تم الإلغاء) ❌
```

### تفاصيل الحالات

- **`created`**: تم إنشاء الطلب وانتظار تعيين سائق
- **`assigned`**: تم تعيين سائق للمهمة
- **`driver_enroute_pickup`**: السائق في طريقه إلى نقطة الاستلام
- **`picked_up`**: تم استلام المهمة من السائق
- **`driver_enroute_dropoff`**: السائق في طريقه إلى نقطة التسليم
- **`delivered`**: تم تسليم المهمة بنجاح
- **`cancelled`**: تم إلغاء المهمة

---

## العلاقات (Relationships)

### 1. علاقة مع المستخدم (User)

```typescript
user: Types.ObjectId // مرجع لجدول User
```

- كل طلب مهمة يرتبط بمستخدم واحد (العميل الذي أنشأ الطلب)
- العلاقة: **Many-to-One** (العديد من الطلبات لمستخدم واحد)

### 2. علاقة مع السائق (Driver)

```typescript
driver?: Types.ObjectId // مرجع لجدول Driver
```

- كل طلب مهمة يمكن أن يرتبط بسائق واحد (اختياري)
- العلاقة: **Many-to-One** (العديد من الطلبات لسائق واحد)
- يكون الحقل `null` حتى يتم تعيين سائق

---

## نقاط النهاية (API Endpoints)

### نقاط نهاية العملاء (Customer Endpoints)

#### 1. حساب رسوم المهمة

```http
POST /akhdimni/errands/calculate-fee
Authorization: Bearer <token>
```

**الوصف**: حساب رسوم المهمة قبل إنشائها.

**Body**:
```json
{
  "category": "parcel",
  "size": "medium",
  "weightKg": 2.5,
  "pickup": {
    "location": { "lat": 15.369445, "lng": 44.191006 },
    "city": "صنعاء",
    "street": "شارع الزبيري"
  },
  "dropoff": {
    "location": { "lat": 15.369445, "lng": 44.191006 },
    "city": "صنعاء",
    "street": "شارع التحلية"
  },
  "tip": 0
}
```

**Response**:
```json
{
  "distanceKm": 5.5,
  "deliveryFee": 1125,
  "totalWithTip": 1125,
  "breakdown": {
    "baseFee": 300,
    "distanceFee": 825,
    "sizeFee": 90,
    "weightFee": 0,
    "tip": 0
  }
}
```

---

#### 2. إنشاء طلب مهمة

```http
POST /akhdimni/errands
Authorization: Bearer <token>
```

**الوصف**: إنشاء طلب مهمة جديد.

**Body**:
```json
{
  "category": "parcel",
  "description": "توصيل طرد",
  "size": "medium",
  "weightKg": 2.5,
  "pickup": {
    "label": "المنزل",
    "street": "شارع الزبيري",
    "city": "صنعاء",
    "contactName": "أحمد",
    "phone": "777123456",
    "location": { "lat": 15.369445, "lng": 44.191006 }
  },
  "dropoff": {
    "label": "المكتب",
    "street": "شارع التحلية",
    "city": "صنعاء",
    "contactName": "محمد",
    "phone": "777654321",
    "location": { "lat": 15.369445, "lng": 44.191006 }
  },
  "waypoints": [
    {
      "label": "نقطة توقف",
      "location": { "lat": 15.370000, "lng": 44.192000 }
    }
  ],
  "tip": 100,
  "paymentMethod": "wallet",
  "scheduledFor": "2025-01-20T10:00:00Z",
  "notes": "ملاحظات إضافية"
}
```

---

#### 3. الحصول على طلباتي

```http
GET /akhdimni/my-errands?status=created
Authorization: Bearer <token>
```

**الوصف**: الحصول على جميع طلبات المستخدم الحالي.

**Query Parameters**:
- `status` (اختياري): تصفية حسب الحالة

---

#### 4. الحصول على طلب محدد

```http
GET /akhdimni/errands/:id
Authorization: Bearer <token>
```

**الوصف**: الحصول على تفاصيل طلب محدد.

---

#### 5. إلغاء طلب

```http
PATCH /akhdimni/errands/:id/cancel
Authorization: Bearer <token>
```

**Body**:
```json
{
  "reason": "لم أعد أحتاج للمهمة"
}
```

---

#### 6. تقييم المهمة

```http
POST /akhdimni/errands/:id/rate
Authorization: Bearer <token>
```

**Body**:
```json
{
  "driver": 5,
  "service": 4,
  "comments": "خدمة ممتازة"
}
```

---

### نقاط نهاية السائقين (Driver Endpoints)

#### 1. مهماتي كسائق

```http
GET /akhdimni/driver/my-errands?status=assigned
Authorization: Bearer <token>
```

**الأدوار المطلوبة**: `driver`

**الوصف**: الحصول على جميع مهمات السائق.

**Query Parameters**:
- `status` (اختياري): تصفية حسب الحالة

---

#### 2. تحديث حالة المهمة

```http
PATCH /akhdimni/errands/:id/status
Authorization: Bearer <token>
```

**الأدوار المطلوبة**: `driver`

**Body**:
```json
{
  "status": "picked_up",
  "note": "تم الاستلام بنجاح"
}
```

---

### نقاط نهاية الإدارة (Admin Endpoints)

#### 1. جميع طلبات أخدمني

```http
GET /akhdimni/admin/errands?status=created&limit=20&cursor=<cursor>
Authorization: Bearer <token>
```

**الأدوار المطلوبة**: `admin`, `superadmin`

**الوصف**: الحصول على جميع الطلبات مع نظام تصفح (pagination).

**Query Parameters**:
- `status` (اختياري): تصفية حسب الحالة
- `limit` (اختياري): عدد النتائج (افتراضي: 20)
- `cursor` (اختياري): مؤشر التصفح

**Response**:
```json
{
  "data": [...],
  "pagination": {
    "nextCursor": "<cursor>",
    "hasMore": true,
    "limit": 20
  }
}
```

---

#### 2. تعيين سائق لمهمة

```http
POST /akhdimni/admin/errands/:id/assign-driver
Authorization: Bearer <token>
```

**الأدوار المطلوبة**: `admin`, `superadmin`

**Body**:
```json
{
  "driverId": "507f1f77bcf86cd799439011"
}
```

---

## العمليات (Operations)

### 1. إنشاء طلب (Create Order)

**الخطوات**:
1. حساب المسافة بين نقطة الاستلام والتسليم
2. حساب رسوم التوصيل بناءً على:
   - رسوم أساسية (300 ريال)
   - رسوم المسافة (150 ريال/كيلومتر)
   - رسوم الحجم (حسب الحجم)
   - رسوم الوزن (إذا كان أكثر من 5 كجم)
3. توليد رقم طلب فريد (ERR-YYYYMM-XXXX)
4. تحويل الإحداثيات إلى تنسيق GeoJSON
5. حفظ الطلب بحالة `created`

---

### 2. تعيين سائق (Assign Driver)

**الشروط**:
- يجب أن تكون حالة الطلب `created`
- لا يمكن تعيين سائق لطلب ملغي

**الإجراءات**:
- تحديث الحقل `driver`
- تغيير الحالة إلى `assigned`
- تسجيل `assignedAt`
- إضافة سجل في `statusHistory`

---

### 3. تحديث الحالة (Update Status)

**الإجراءات حسب الحالة**:
- عند `picked_up`: تسجيل `pickedUpAt`
- عند `delivered`: تسجيل `deliveredAt`
- إضافة سجل في `statusHistory` في جميع الحالات

---

### 4. إلغاء طلب (Cancel Order)

**الشروط**:
- لا يمكن إلغاء طلب تم تسليمه (`delivered`)

**الإجراءات**:
- تغيير الحالة إلى `cancelled`
- حفظ سبب الإلغاء
- إضافة سجل في `statusHistory`

---

### 5. تقييم المهمة (Rate Order)

**الشروط**:
- يجب أن تكون حالة الطلب `delivered`

**الإجراءات**:
- حفظ التقييم (السائق والخدمة)
- حفظ التعليقات (إن وجدت)
- تسجيل تاريخ التقييم

---

### 6. حساب الرسوم (Calculate Fee)

**معايير الحساب**:

- **الرسوم الأساسية**: 300 ريال
- **رسوم المسافة**: 150 ريال لكل كيلومتر
- **رسوم الحجم**:
  - `small`: بدون رسوم إضافية
  - `medium`: 30% من الرسوم الأساسية
  - `large`: 60% من الرسوم الأساسية
- **رسوم الوزن**: 50 ريال لكل كيلوجرام بعد 5 كجم
- **الإكرامية**: يحددها العميل

**مثال**:
- المسافة: 5.5 كم
- الحجم: medium
- الوزن: 2.5 كجم
- الإكرامية: 100 ريال

**الحساب**:
```
الرسوم الأساسية: 300
رسوم المسافة: 5.5 × 150 = 825
رسوم الحجم: 300 × 0.3 = 90
رسوم الوزن: 0 (أقل من 5 كجم)
───────────────────────────
إجمالي الرسوم: 1215
الإكرامية: 100
───────────────────────────
الإجمالي النهائي: 1315 ريال
```

---

## الفهارس (Indexes)

يحتوي الموديول على الفهارس التالية لتحسين الأداء:

1. **`orderNumber`**: فهرس فريد (Unique Index)
2. **`user + createdAt`**: فهرس مركب لاستعلامات طلبات المستخدم
3. **`driver + status`**: فهرس مركب لاستعلامات مهمات السائق
4. **`status + createdAt`**: فهرس مركب لاستعلامات الطلبات حسب الحالة
5. **`errand.pickup.geo`**: فهرس جغرافي (2dsphere) للبحث الجغرافي
6. **`errand.dropoff.geo`**: فهرس جغرافي (2dsphere) للبحث الجغرافي

---

## المصادقة والصلاحيات (Authentication & Authorization)

### أنواع المصادقة

- **Firebase Auth**: للعملاء والسائقين (نقاط النهاية العامة)
- **JWT Auth**: للإدارة (نقاط النهاية الإدارية)

### الصلاحيات (Roles)

- **عملاء**: لا يتطلبون صلاحية خاصة (افتراضي)
- **سائقين**: يتطلبون صلاحية `driver`
- **إدارة**: يتطلبون صلاحية `admin` أو `superadmin`

---

## DTOs (Data Transfer Objects)

### 1. CreateErrandDto

استخدامه في إنشاء طلب جديد.

**الحقول**:
- `category`: نوع المهمة
- `description`: الوصف
- `size`: الحجم
- `weightKg`: الوزن
- `pickup`: نقطة الاستلام (ErrandPointDto)
- `dropoff`: نقطة التسليم (ErrandPointDto)
- `waypoints`: نقاط طريق (اختياري)
- `tip`: الإكرامية (اختياري)
- `paymentMethod`: طريقة الدفع
- `scheduledFor`: التاريخ المجدول (اختياري)
- `notes`: ملاحظات (اختياري)

### 2. UpdateErrandStatusDto

استخدامه في تحديث حالة المهمة.

**الحقول**:
- `status`: الحالة الجديدة
- `note`: ملاحظة (اختياري)

### 3. AssignDriverDto

استخدامه في تعيين سائق.

**الحقول**:
- `driverId`: معرف السائق

### 4. RateErrandDto

استخدامه في تقييم المهمة.

**الحقول**:
- `driver`: تقييم السائق (1-5)
- `service`: تقييم الخدمة (1-5)
- `comments`: تعليقات (اختياري)

### 5. CalculateFeeDto

استخدامه في حساب الرسوم.

**الحقول**:
- `category`: نوع المهمة
- `size`: الحجم
- `weightKg`: الوزن (اختياري)
- `pickup`: نقطة الاستلام
- `dropoff`: نقطة التسليم
- `tip`: الإكرامية (اختياري)

---

## أمثلة الاستخدام

### مثال 1: إنشاء طلب مهمة كاملة

```typescript
// 1. حساب الرسوم أولاً
const feeResult = await calculateFee({
  category: 'parcel',
  size: 'medium',
  weightKg: 3,
  pickup: { location: { lat: 15.369445, lng: 44.191006 } },
  dropoff: { location: { lat: 15.370000, lng: 44.192000 } }
});

// 2. إنشاء الطلب
const order = await create({
  category: 'parcel',
  size: 'medium',
  weightKg: 3,
  pickup: {
    label: 'المنزل',
    location: { lat: 15.369445, lng: 44.191006 }
  },
  dropoff: {
    label: 'المكتب',
    location: { lat: 15.370000, lng: 44.192000 }
  },
  paymentMethod: 'wallet',
  tip: 50
});
```

### مثال 2: تتبع حالة المهمة

```typescript
// 1. العميل ينشئ الطلب (status: 'created')
// 2. الإدارة تعين سائق (status: 'assigned')
// 3. السائق يبدأ الطريق (status: 'driver_enroute_pickup')
// 4. السائق يستلم المهمة (status: 'picked_up')
// 5. السائق يذهب للتسليم (status: 'driver_enroute_dropoff')
// 6. السائق يسلم المهمة (status: 'delivered')
// 7. العميل يقيم المهمة
```

---

## الملاحظات التقنية

1. **توليد رقم الطلب**: يتم توليد رقم فريد بناءً على السنة والشهر ورقم تسلسلي (ERR-YYYYMM-XXXX)

2. **حساب المسافة**: يستخدم المكتبة `geolib` لحساب المسافة بين النقاط

3. **GeoJSON**: يتم تحويل الإحداثيات إلى تنسيق GeoJSON لدعم البحث الجغرافي

4. **التصفح (Pagination)**: تستخدم نقاط النهاية الإدارية نظام Cursor-based pagination

5. **سجل الحالة**: يتم الاحتفاظ بسجل كامل لتغيرات الحالة مع التواريخ والملاحظات

---

## الأخطاء الشائعة

| الكود | الوصف |
|------|-------|
| 404 | الطلب غير موجود |
| 400 | حالة الطلب غير صحيحة (مثلاً: محاولة إلغاء طلب تم تسليمه) |
| 401 | غير مصرح (مصادقة فاشلة) |
| 403 | غير مسموح (عدم وجود الصلاحية المطلوبة) |

---

## التطويرات المستقبلية المقترحة

- [ ] إضافة نظام إشعارات في الوقت الفعلي
- [ ] دعم المهام المتعددة النقاط (Multi-stop)
- [ ] إضافة نظام تتبع الموقع الجغرافي للسائق
- [ ] دعم المهام المجدولة المتكررة
- [ ] تحسين خوارزمية حساب الرسوم
- [ ] إضافة نظام استرداد الأموال (Refund)
- [ ] دعم المهام الجماعية (Group Orders)

---

## التبعيات (Dependencies)

- `@nestjs/common`
- `@nestjs/mongoose`
- `@nestjs/swagger`
- `mongoose`
- `geolib`
- `class-validator`
- `class-transformer`

---

## التوثيق الإضافي

- [Swagger Documentation](http://localhost:3000/api) (عند تشغيل الخادم)
- ملفات الكود: راجع الملفات في هذا الموديول لمزيد من التفاصيل
