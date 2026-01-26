# موديول العروض الترويجية (Promotion Module)

## نظرة عامة

موديول **العروض الترويجية** هو نظام لإدارة العروض والخصومات الترويجية. يتيح هذا الموديول إنشاء وإدارة العروض الترويجية، تتبع أداءها (المشاهدات، النقرات، التحويلات)، وعرضها في مواضع مختلفة في التطبيق. يدعم الموديول أنواع مختلفة من الأهداف (منتج، متجر، فئة) ومواضع عرض متعددة.

---

## الهيكل التنظيمي

```
promotion/
├── promotion.controller.ts    # نقاط النهاية (API Endpoints)
├── promotions-by-stores.controller.ts  # عروض المتاجر
├── promotion.module.ts        # إعدادات الموديول
├── dto/                        # كائنات نقل البيانات
│   └── create-promotion.dto.ts
├── entities/                   # نماذج البيانات
│   └── promotion.entity.ts
└── services/                   # منطق الأعمال
    └── promotion.service.ts
```

---

## الكيانات (Entities)

### Promotion (العرض الترويجي)

الكيان الرئيسي الذي يمثل عرض ترويجي واحد.

#### الحقول الأساسية

| الحقل | النوع | الوصف | مطلوب |
|------|------|-------|-------|
| `title` | String | عنوان العرض | ✗ |
| `description` | String | وصف العرض | ✗ |
| `image` | String | رابط الصورة | ✗ |
| `link` | String | رابط (deep-link أو خارجي) | ✗ |
| `target` | Enum | الهدف (`product`, `store`, `category`) | ✓ |
| `value` | Number | قيمة الخصم (نسبة أو مبلغ) | ✗ |
| `valueType` | Enum | نوع القيمة (`percentage`, `fixed`) | ✗ |
| `product` | ObjectId | معرف المنتج (إذا كان target = product) | ✗ |
| `store` | ObjectId | معرف المتجر (إذا كان target = store) | ✗ |
| `category` | ObjectId | معرف الفئة (إذا كان target = category) | ✗ |
| `placements` | Array[Enum] | مواضع العرض | ✓ |
| `cities` | Array[String] | المدن المسموحة (فارغة = كل المدن) | ✗ |
| `channels` | Array[Enum] | القنوات (`app`, `web`) | ✗ |
| `stacking` | Enum | قاعدة التكديس (`none`, `best`, `stack_same_target`) | ✗ |
| `minQty` | Number | الحد الأدنى للكمية | ✗ |
| `minOrderSubtotal` | Number | الحد الأدنى لقيمة الطلب | ✗ |
| `maxDiscountAmount` | Number | سقف الخصم | ✗ |
| `order` | Number | ترتيب العرض (للعرض) | ✗ |
| `startDate` | Date | تاريخ البداية | ✓ |
| `endDate` | Date | تاريخ النهاية | ✓ |
| `isActive` | Boolean | حالة النشاط | ✗ |
| `viewsCount` | Number | عدد المشاهدات | ✗ |
| `clicksCount` | Number | عدد النقرات | ✗ |
| `conversionsCount` | Number | عدد التحويلات (طلبات) | ✗ |
| `createdBy` | ObjectId | مرجع للمسؤول الذي أنشأ العرض | ✗ |
| `metadata` | Object | بيانات إضافية | ✗ |

#### أنواع الأهداف (Target)

- **`product`**: عرض على منتج محدد
- **`store`**: عرض على متجر محدد
- **`category`**: عرض على فئة محدد

#### أنواع القيم (ValueType)

- **`percentage`**: نسبة مئوية (مثال: 20%)
- **`fixed`**: مبلغ ثابت (مثال: 500 ريال)

#### مواضع العرض (Placement)

- **`home_hero`**: السلايدر الرئيسي في الصفحة الرئيسية
- **`home_strip`**: شريط في الصفحة الرئيسية
- **`category_header`**: أعلى صفحة الفئة
- **`category_feed`**: وسط صفحة الفئة
- **`store_header`**: أعلى صفحة المتجر
- **`search_banner`**: صفحة البحث
- **`cart`**: شاشة السلة
- **`checkout`**: شاشة الدفع

#### قواعد التكديس (StackingRule)

- **`none`**: لا يمكن دمجها مع عروض أخرى
- **`best`**: اختيار الأفضل (افتراضي)
- **`stack_same_target`**: دمج لنفس الهدف

---

## العلاقات (Relationships)

### 1. علاقة مع المنتج (Product)

```typescript
product?: Types.ObjectId // مرجع لجدول Product
```

- فقط عندما يكون `target = 'product'`
- العلاقة: **Many-to-One** (العديد من العروض لمنتج واحد)

### 2. علاقة مع المتجر (Store)

```typescript
store?: Types.ObjectId // مرجع لجدول Store
```

- فقط عندما يكون `target = 'store'`
- العلاقة: **Many-to-One** (العديد من العروض لمتجر واحد)

### 3. علاقة مع الفئة (Category)

```typescript
category?: Types.ObjectId // مرجع لجدول Category
```

- فقط عندما يكون `target = 'category'`
- العلاقة: **Many-to-One** (العديد من العروض لفئة واحدة)

---

## نقاط النهاية (API Endpoints)

### نقاط نهاية عامة (Public)

#### 1. الحصول على عروض حسب الموضع

```http
GET /promotions/by-placement?placement=home_hero&city=صنعاء&channel=app
```

**الوصف**: الحصول على العروض النشطة في موضع معين.

**Query Parameters**:
- `placement` (مطلوب): موضع العرض
- `city` (اختياري): المدينة
- `channel` (اختياري): القناة (`app`, `web`)

**ملاحظة**: هذا endpoint عام (لا يتطلب مصادقة).

---

#### 2. تسجيل نقرة على عرض

```http
POST /promotions/:id/click
```

**الوصف**: تسجيل نقرة على عرض ترويجي.

---

#### 3. تسجيل تحويل (طلب من العرض)

```http
POST /promotions/:id/conversion
```

**الوصف**: تسجيل تحويل (إنشاء طلب من العرض).

---

### نقاط نهاية الإدارة (Admin Only)

#### 1. إنشاء عرض ترويجي

```http
POST /promotions
Authorization: Bearer <token>
```

**الأدوار المطلوبة**: `admin`, `superadmin`

**Body**:
```json
{
  "title": "عرض خاص",
  "description": "خصم 20% على جميع المنتجات",
  "image": "https://example.com/promo.jpg",
  "link": "/products/123",
  "target": "product",
  "product": "507f1f77bcf86cd799439011",
  "value": 20,
  "valueType": "percentage",
  "placements": ["home_hero", "category_header"],
  "cities": ["صنعاء", "عدن"],
  "channels": ["app", "web"],
  "stacking": "best",
  "minQty": 2,
  "minOrderSubtotal": 100,
  "maxDiscountAmount": 50,
  "order": 1,
  "startDate": "2025-01-01",
  "endDate": "2025-12-31",
  "isActive": true
}
```

---

#### 2. الحصول على كل العروض

```http
GET /promotions?isActive=true
Authorization: Bearer <token>
```

**الأدوار المطلوبة**: `admin`, `superadmin`

**Query Parameters**:
- `isActive` (اختياري): تصفية حسب الحالة

---

#### 3. الحصول على عرض محدد

```http
GET /promotions/:id
Authorization: Bearer <token>
```

**الأدوار المطلوبة**: `admin`, `superadmin`

---

#### 4. تحديث عرض

```http
PATCH /promotions/:id
Authorization: Bearer <token>
```

**الأدوار المطلوبة**: `admin`, `superadmin`

**Body**: نفس حقل إنشاء العرض (جميع الحقول اختيارية)

---

#### 5. حذف عرض

```http
DELETE /promotions/:id
Authorization: Bearer <token>
```

**الأدوار المطلوبة**: `admin`, `superadmin`

---

#### 6. إحصائيات العروض

```http
GET /promotions/stats/overview
Authorization: Bearer <token>
```

**الأدوار المطلوبة**: `admin`, `superadmin`

---

## العمليات (Operations)

### 1. إنشاء عرض ترويجي

**الخطوات**:
1. التحقق من التواريخ (endDate > startDate)
2. التحقق من وجود الهدف المطلوب (product/store/category)
3. إنشاء العرض مع القيم الافتراضية (viewsCount=0, clicksCount=0, conversionsCount=0)
4. حفظ العرض

---

### 2. الحصول على عروض حسب الموضع

**الخطوات**:
1. بناء الاستعلام:
   - `placements`: يحتوي على الموضع المطلوب
   - `isActive`: true
   - `startDate`: <= الآن
   - `endDate`: >= الآن
   - `cities`: فارغة أو تحتوي على المدينة المطلوبة
   - `channels`: يحتوي على القناة المطلوبة
2. البحث مع الترتيب (`order` ثم `createdAt`)
3. زيادة عداد المشاهدات
4. إرجاع النتائج

---

### 3. تسجيل نقرة

**الخطوات**:
1. البحث عن العرض
2. زيادة `clicksCount`
3. حفظ التغييرات

---

### 4. تسجيل تحويل

**الخطوات**:
1. البحث عن العرض
2. زيادة `conversionsCount`
3. حفظ التغييرات

---

## الفهارس (Indexes)

يحتوي Promotion entity على الفهارس التالية:

1. **`isActive + startDate + endDate`**: فهرس مركب للعروض النشطة
2. **`target + product + store + category`**: فهرس مركب للأهداف
3. **`placements + order`**: فهرس مركب للمواضع
4. **`cities`**: فهرس للمدن
5. **`channels`**: فهرس للقنوات

---

## المصادقة والصلاحيات (Authentication & Authorization)

### أنواع المصادقة

- **Public**: لنقاط النهاية العامة (الحصول على العروض حسب الموضع، تسجيل النقرات)
- **JWT Auth**: لنقاط النهاية الإدارية

### الصلاحيات (Roles)

- **العامة**: يمكنهم الوصول للعروض العامة فقط
- **الإدارة**: يتطلبون صلاحية `admin` أو `superadmin` (إنشاء، تحديث، حذف، إحصائيات)

---

## DTOs (Data Transfer Objects)

### 1. CreatePromotionDto

استخدامه في إنشاء عرض ترويجي.

**الحقول**:
- `title`: العنوان (اختياري)
- `description`: الوصف (اختياري)
- `image`: رابط الصورة (اختياري)
- `link`: الرابط (اختياري)
- `target`: الهدف (مطلوب)
- `value`: القيمة (اختياري)
- `valueType`: نوع القيمة (اختياري)
- `product`: معرف المنتج (اختياري)
- `store`: معرف المتجر (اختياري)
- `category`: معرف الفئة (اختياري)
- `placements`: المواضع (مطلوب)
- `cities`: المدن (اختياري)
- `channels`: القنوات (اختياري)
- `stacking`: قاعدة التكديس (اختياري)
- `minQty`: الحد الأدنى للكمية (اختياري)
- `minOrderSubtotal`: الحد الأدنى لقيمة الطلب (اختياري)
- `maxDiscountAmount`: سقف الخصم (اختياري)
- `order`: الترتيب (اختياري)
- `startDate`: تاريخ البداية (مطلوب)
- `endDate`: تاريخ النهاية (مطلوب)
- `isActive`: حالة النشاط (مطلوب)

---

### 2. UpdatePromotionDto

استخدامه في تحديث عرض.

**الحقول** (جميعها اختيارية):
- `title`: العنوان
- `description`: الوصف
- `image`: رابط الصورة
- `isActive`: حالة النشاط
- `endDate`: تاريخ النهاية
- `placements`: المواضع
- `order`: الترتيب

---

### 3. GetPromotionsByPlacementDto

استخدامه في الحصول على العروض حسب الموضع.

**الحقول**:
- `placement`: الموضع (مطلوب)
- `city`: المدينة (اختياري)
- `channel`: القناة (اختياري)

---

## الملاحظات التقنية

1. **Automatic View Tracking**:
   - يتم زيادة عداد المشاهدات تلقائياً عند جلب العروض حسب الموضع

2. **Date Validation**:
   - يجب أن يكون `endDate` بعد `startDate`
   - يتم التحقق من ذلك عند الإنشاء

3. **Target Validation**:
   - إذا كان `target = 'product'`، يجب توفير `product`
   - إذا كان `target = 'store'`، يجب توفير `store`
   - إذا كان `target = 'category'`، يجب توفير `category`

4. **City Filtering**:
   - إذا كانت `cities` فارغة، يتم عرض العرض في جميع المدن
   - إذا كانت `cities` تحتوي على قيم، يتم عرض العرض فقط في المدن المحددة

5. **Channel Filtering**:
   - يمكن تحديد القنوات (`app`, `web`)
   - إذا لم يتم تحديد قنوات، يتم عرض العرض في جميع القنوات

6. **Performance Tracking**:
   - يتم تتبع المشاهدات (`viewsCount`)
   - يتم تتبع النقرات (`clicksCount`)
   - يتم تتبع التحويلات (`conversionsCount`)

---

## الأخطاء الشائعة

| الكود | الوصف |
|------|-------|
| 404 | العرض غير موجود |
| 400 | تاريخ النهاية يجب أن يكون بعد تاريخ البداية |
| 400 | معرف المنتج/المتجر/الفئة مطلوب |
| 401 | غير مصرح (مصادقة فاشلة) |
| 403 | ليس لديك صلاحية (admin only) |

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
- Store Module: راجع `../store/README.md` لفهم المتاجر
- Product Module: راجع `../store/README.md` لفهم المنتجات
