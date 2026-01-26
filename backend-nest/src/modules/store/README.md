# موديول المتاجر (Store Module)

## نظرة عامة

موديول **المتاجر** هو نظام لإدارة المتاجر والمنتجات. يتيح هذا الموديول إنشاء وإدارة المتاجر، إدارة المنتجات، تتبع المخزون، وإدارة الموافقات على المتاجر. يدعم الموديول أنواع مختلفة من المتاجر (مطاعم، بقالة، صيدليات، مخابز، مقاهي، أخرى).

---

## الهيكل التنظيمي

```
store/
├── store.controller.ts              # نقاط النهاية الإدارية
├── delivery-store.controller.ts     # نقاط النهاية العامة (Delivery)
├── groceries.controller.ts          # نقاط نهاية البقالة
├── store.module.ts                  # إعدادات الموديول
├── store.service.ts                 # منطق الأعمال
├── dto/                             # كائنات نقل البيانات
│   ├── create-store.dto.ts
│   └── create-product.dto.ts
└── entities/                        # نماذج البيانات
    ├── store.entity.ts
    └── product.entity.ts
```

---

## الكيانات (Entities)

### 1. Store (المتجر)

الكيان الرئيسي الذي يمثل متجر واحد.

#### الحقول الأساسية

| الحقل | النوع | الوصف | مطلوب |
|------|------|-------|-------|
| `name` | String | اسم المتجر | ✓ |
| `name_ar` | String | الاسم بالعربي | ✗ |
| `name_en` | String | الاسم بالإنجليزي | ✗ |
| `address` | String | العنوان | ✓ |
| `category` | ObjectId | مرجع للفئة | ✗ |
| `location` | Location | الموقع الجغرافي (lat, lng) | ✓ |
| `isActive` | Boolean | حالة النشاط | ✗ |
| `image` | String | صورة المتجر | ✗ |
| `logo` | String | شعار المتجر | ✗ |
| `forceClosed` | Boolean | إغلاق قسري | ✗ |
| `forceOpen` | Boolean | فتح قسري | ✗ |
| `schedule` | Array[WorkSchedule] | جدول العمل | ✗ |
| `commissionRate` | Number | نسبة العمولة | ✗ |
| `takeCommission` | Boolean | أخذ عمولة | ✗ |
| `isTrending` | Boolean | متجر شائع | ✗ |
| `isFeatured` | Boolean | متجر مميز | ✗ |
| `tags` | Array[String] | الوسوم | ✗ |
| `rating` | Number | التقييم | ✗ |
| `ratingsCount` | Number | عدد التقييمات | ✗ |
| `avgPrepTimeMin` | Number | متوسط وقت التحضير (بالدقائق) | ✗ |
| `pendingOrders` | Number | عدد الطلبات المعلقة | ✗ |
| `usageType` | Enum | نوع الاستخدام (`restaurant`, `grocery`, `pharmacy`, `bakery`, `cafe`, `other`) | ✗ |
| `source` | Enum | المصدر (`marketerQuickOnboard`, `admin`, `other`) | ✗ |
| `createdByMarketerUid` | String | معرف المسوق | ✗ |
| `deliveryRadiusKm` | Number | نصف قطر التوصيل (بالكيلومتر) | ✗ |
| `deliveryBaseFee` | Number | رسوم التوصيل الأساسية | ✗ |
| `deliveryPerKmFee` | Number | رسوم التوصيل لكل كيلومتر | ✗ |
| `minOrderAmount` | Number | الحد الأدنى لقيمة الطلب | ✗ |
| `glPayableAccount` | ObjectId | حساب الدفع (GL) | ✗ |

#### Location (الموقع)

- `lat`: خط العرض
- `lng`: خط الطول

#### WorkSchedule (جدول العمل)

- `day`: اليوم
- `open`: مفتوح/مغلق
- `from`: وقت الفتح (اختياري)
- `to`: وقت الإغلاق (اختياري)

---

### 2. Product (المنتج)

الكيان الذي يمثل منتج واحد.

#### الحقول الأساسية

| الحقل | النوع | الوصف | مطلوب |
|------|------|-------|-------|
| `name` | String | اسم المنتج | ✓ |
| `name_ar` | String | الاسم بالعربي | ✗ |
| `name_en` | String | الاسم بالإنجليزي | ✗ |
| `description` | String | الوصف | ✗ |
| `price` | Number | السعر | ✓ |
| `store` | ObjectId | مرجع للمتجر | ✓ |
| `category` | ObjectId | مرجع للفئة | ✗ |
| `image` | String | صورة المنتج | ✗ |
| `images` | Array[String] | صور المنتج | ✗ |
| `isActive` | Boolean | حالة النشاط | ✗ |
| `inStock` | Boolean | متوفر في المخزون | ✗ |
| `stockQuantity` | Number | كمية المخزون | ✗ |
| `discount` | Number | الخصم | ✗ |
| `finalPrice` | Number | السعر النهائي (محسوب تلقائياً) | ✗ |
| `tags` | Array[String] | الوسوم | ✗ |
| `rating` | Number | التقييم | ✗ |
| `ratingsCount` | Number | عدد التقييمات | ✗ |
| `salesCount` | Number | عدد المبيعات | ✗ |
| `isFeatured` | Boolean | منتج مميز | ✗ |
| `sku` | String | رمز المنتج | ✗ |
| `barcode` | String | الباركود | ✗ |

---

## العلاقات (Relationships)

### 1. علاقة المنتج مع المتجر (Product-Store)

```typescript
store: Types.ObjectId // مرجع لجدول Store
```

- كل منتج مرتبط بمتجر واحد
- العلاقة: **Many-to-One** (العديد من المنتجات لمتجر واحد)

---

## نقاط النهاية (API Endpoints)

### نقاط نهاية عامة (Public - Delivery)

#### 1. جلب المتاجر

```http
GET /delivery/stores?cursor=&limit=20&categoryId=&isTrending=&isFeatured=&usageType=
```

**الوصف**: الحصول على قائمة المتاجر النشطة (عام).

---

#### 2. البحث عن متاجر

```http
GET /delivery/stores/search?q=بحث&cursor=&limit=20
```

---

#### 3. جلب متجر محدد

```http
GET /delivery/stores/:id
```

---

#### 4. جلب منتجات المتجر

```http
GET /delivery/stores/:id/products?cursor=&limit=20
```

---

#### 5. إحصائيات المتجر

```http
GET /delivery/stores/:id/statistics
```

---

#### 6. مراجعات المتجر

```http
GET /delivery/stores/:id/reviews?cursor=&limit=20
```

---

### نقاط نهاية الإدارة (Admin Only)

#### 1. إنشاء متجر

```http
POST /admin/stores
Authorization: Bearer <token>
```

**الأدوار المطلوبة**: `admin`, `superadmin`

---

#### 2. جلب المتاجر - الإدارة

```http
GET /admin/stores?cursor=&limit=20&isActive=&usageType=&q=
Authorization: Bearer <token>
```

**الأدوار المطلوبة**: `admin`, `superadmin`

---

#### 3. جلب متجر محدد - الإدارة

```http
GET /admin/stores/:id
Authorization: Bearer <token>
```

---

#### 4. تحديث متجر

```http
PATCH /admin/stores/:id
Authorization: Bearer <token>
```

---

#### 5. تفعيل متجر

```http
POST /admin/stores/:id/activate
Authorization: Bearer <token>
```

---

#### 6. تعطيل متجر

```http
POST /admin/stores/:id/deactivate
Authorization: Bearer <token>
```

---

#### 7. إغلاق قسري للمتجر

```http
POST /admin/stores/:id/force-close
Authorization: Bearer <token>
```

---

#### 8. فتح قسري للمتجر

```http
POST /admin/stores/:id/force-open
Authorization: Bearer <token>
```

---

#### 9. إنشاء منتج

```http
POST /admin/stores/products
Authorization: Bearer <token>
```

**الأدوار المطلوبة**: `admin`, `superadmin`, `vendor`

---

#### 10. جلب منتجات المتجر - الإدارة

```http
GET /admin/stores/:id/products?cursor=&limit=20
Authorization: Bearer <token>
```

---

#### 11. تحديث منتج

```http
PATCH /admin/stores/products/:id
Authorization: Bearer <token>
```

**الأدوار المطلوبة**: `admin`, `superadmin`, `vendor`

---

#### 12. تحليلات المتجر

```http
GET /admin/stores/:id/analytics?startDate=&endDate=
Authorization: Bearer <token>
```

---

#### 13. جرد المتجر

```http
GET /admin/stores/:id/inventory
Authorization: Bearer <token>
```

---

#### 14. حذف متجر

```http
DELETE /admin/stores/:id
Authorization: Bearer <token>
```

---

#### 15. المتاجر المعلقة

```http
GET /admin/stores/pending
Authorization: Bearer <token>
```

---

#### 16. الموافقة على متجر

```http
POST /admin/stores/:id/approve
Authorization: Bearer <token>
```

---

#### 17. رفض متجر

```http
POST /admin/stores/:id/reject
Authorization: Bearer <token>
```

**Body**:
```json
{
  "reason": "سبب الرفض"
}
```

---

#### 18. تعليق متجر

```http
POST /admin/stores/:id/suspend
Authorization: Bearer <token>
```

**Body**:
```json
{
  "reason": "سبب التعليق"
}
```

---

## الفهارس (Indexes)

### Store Indexes

1. **Text Index**: `name`, `name_ar`, `name_en` (للبحث النصي)
2. **`isActive`**: فهرس لحالة النشاط
3. **`category`**: فهرس للفئة
4. **`isTrending + isFeatured`**: فهرس مركب
5. **`location.lat + location.lng`**: فهرس للموقع الجغرافي
6. **`createdByMarketerUid`**: فهرس للمسوق

### Product Indexes

1. **Text Index**: `name`, `name_ar`, `name_en`
2. **`store + isActive`**: فهرس مركب
3. **`category`**: فهرس للفئة
4. **`price`**: فهرس للسعر
5. **`isFeatured`**: فهرس للمنتجات المميزة

---

## المصادقة والصلاحيات (Authentication & Authorization)

### أنواع المصادقة

- **Public**: لنقاط النهاية العامة (Delivery stores)
- **JWT Auth**: لنقاط النهاية الإدارية

### الصلاحيات (Roles)

- **العامة**: يمكنهم الوصول للمتاجر والمنتجات العامة فقط
- **الإدارة**: يتطلبون صلاحية `admin` أو `superadmin` (إدارة المتاجر والمنتجات)
- **التجار (Vendors)**: يمكنهم إدارة منتجات متاجرهم (إنشاء وتحديث المنتجات)

---

## الملاحظات التقنية

1. **Automatic Final Price Calculation**:
   - يتم حساب `finalPrice` تلقائياً عند إنشاء المنتج: `finalPrice = price - discount`

2. **Store Approval Flow**:
   - المتاجر الجديدة تكون غير نشطة (`isActive: false`)
   - يجب الموافقة عليها من قبل الإدارة
   - يمكن رفض أو تعليق المتاجر

3. **Force Open/Close**:
   - `forceClosed`: إغلاق قسري للمتجر
   - `forceOpen`: فتح قسري للمتجر

4. **Inventory Management**:
   - يتم تتبع المخزون (`inStock`, `stockQuantity`)
   - يمكن الحصول على تقرير الجرد للمتجر

---

## الأخطاء الشائعة

| الكود | الوصف |
|------|-------|
| 404 | المتجر/المنتج غير موجود |
| 400 | بيانات غير صالحة |
| 401 | غير مصرح (مصادقة فاشلة) |
| 403 | ليس لديك صلاحية |

---

## التبعيات (Dependencies)

- `@nestjs/common`
- `@nestjs/mongoose`
- `@nestjs/swagger`
- `mongoose`
- `class-validator`
- `class-transformer`

---

## التوثيق الإضافي

- [Swagger Documentation](http://localhost:3000/api) (عند تشغيل الخادم)
- ملفات الكود: راجع الملفات في هذا الموديول لمزيد من التفاصيل
- Vendor Module: راجع `../vendor/README.md` لفهم التجار
- Cart Module: راجع `../cart/README.md` لفهم السلة
