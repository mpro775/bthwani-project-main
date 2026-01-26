# موديول التاجر (Merchant Module)

## نظرة عامة

موديول **التاجر** هو نظام لإدارة التجار ومنتجاتهم وكatalogs. يتيح هذا الموديول إنشاء وإدارة التجار، إدارة كتالوجات المنتجات، إدارة منتجات التجار، وإدارة الفئات والخصائص. يدعم الموديول ربط التجار بـ Vendor و Store modules.

---

## الهيكل التنظيمي

```
merchant/
├── merchant.controller.ts       # نقاط النهاية (API Endpoints)
├── merchant.module.ts           # إعدادات الموديول
├── dto/                         # كائنات نقل البيانات
│   ├── create-merchant.dto.ts
│   ├── create-merchant-product.dto.ts
│   ├── create-product-catalog.dto.ts
│   ├── create-category.dto.ts
│   └── create-attribute.dto.ts
├── entities/                   # نماذج البيانات
│   ├── merchant.entity.ts
│   ├── merchant-product.entity.ts
│   ├── product-catalog.entity.ts
│   ├── merchant-category.entity.ts
│   └── attribute.entity.ts
└── services/                    # منطق الأعمال
    └── merchant.service.ts
```

---

## الكيانات (Entities)

### 1. Merchant (التاجر)

الكيان الرئيسي الذي يمثل تاجر واحد.

#### الحقول الأساسية

| الحقل | النوع | الوصف | مطلوب |
|------|------|-------|-------|
| `name` | String | اسم التاجر | ✓ |
| `email` | String | البريد الإلكتروني (فريد) | ✓ |
| `phone` | String | رقم الهاتف (فريد، sparse) | ✗ |
| `logo` | String | الشعار | ✗ |
| `description` | String | الوصف | ✗ |
| `vendor` | ObjectId | مرجع لـ Vendor | ✗ |
| `store` | ObjectId | مرجع لـ Store | ✗ |
| `isActive` | Boolean | حالة النشاط | ✗ |
| `businessCategories` | Array[String] | فئات العمل | ✗ |
| `address` | Object | العنوان | ✗ |
| `businessHours` | Object | ساعات العمل | ✗ |
| `contact` | Object | معلومات الاتصال | ✗ |
| `metadata` | Object | بيانات إضافية | ✗ |

---

### 2. ProductCatalog (كتالوج المنتجات)

الكيان الذي يمثل منتج في الكتالوج العام.

---

### 3. MerchantProduct (منتج التاجر)

الكيان الذي يمثل منتج للتاجر (مرتبط بكتالوج).

---

### 4. MerchantCategory (فئة التاجر)

الكيان الذي يمثل فئة للمنتجات.

---

### 5. Attribute (خاصية)

الكيان الذي يمثل خاصية للمنتجات (مثل الحجم، اللون، إلخ).

---

## العلاقات (Relationships)

### 1. علاقة Merchant مع Vendor

```typescript
vendor?: Types.ObjectId // مرجع لجدول Vendor
```

- كل تاجر يمكن أن يكون مرتبط بـ vendor واحد
- العلاقة: **Many-to-One** (العديد من التجار لـ vendor واحد)

### 2. علاقة Merchant مع Store

```typescript
store?: Types.ObjectId // مرجع لجدول Store
```

- كل تاجر يمكن أن يكون مرتبط بمتجر واحد
- العلاقة: **Many-to-One** (العديد من التجار لمتجر واحد)

---

## نقاط النهاية (API Endpoints)

### نقاط نهاية Merchant

#### 1. إنشاء تاجر جديد

```http
POST /merchants
Authorization: Bearer <token>
```

**الأدوار المطلوبة**: `admin`, `superadmin`

---

#### 2. الحصول على كل التجار

```http
GET /merchants?isActive=true
Authorization: Bearer <token>
```

**الأدوار المطلوبة**: `admin`, `superadmin`

---

#### 3. الحصول على تاجر محدد

```http
GET /merchants/:id
Authorization: Bearer <token>
```

**الأدوار المطلوبة**: `admin`, `superadmin`, `vendor`

---

#### 4. تحديث تاجر

```http
PATCH /merchants/:id
Authorization: Bearer <token>
```

**الأدوار المطلوبة**: `admin`, `superadmin`, `vendor`

---

#### 5. حذف تاجر

```http
DELETE /merchants/:id
Authorization: Bearer <token>
```

**الأدوار المطلوبة**: `admin`, `superadmin`

---

### نقاط نهاية Product Catalog

#### 1. إضافة منتج للكتالوج

```http
POST /merchants/catalog/products
Authorization: Bearer <token>
```

**الأدوار المطلوبة**: `admin`, `superadmin`

---

#### 2. الحصول على منتجات الكتالوج (Public)

```http
GET /merchants/catalog/products?usageType=
```

**ملاحظة**: هذا endpoint عام (لا يتطلب مصادقة).

---

#### 3. الحصول على منتج من الكتالوج

```http
GET /merchants/catalog/products/:id
```

**ملاحظة**: هذا endpoint عام (لا يتطلب مصادقة).

---

#### 4. تحديث منتج في الكتالوج

```http
PATCH /merchants/catalog/products/:id
Authorization: Bearer <token>
```

**الأدوار المطلوبة**: `admin`, `superadmin`

---

### نقاط نهاية Merchant Products

#### 1. إضافة منتج للتاجر

```http
POST /merchants/:merchantId/products
Authorization: Bearer <token>
```

**الأدوار المطلوبة**: `admin`, `superadmin`, `vendor`

---

#### 2. الحصول على منتجات التاجر

```http
GET /merchants/:merchantId/products
Authorization: Bearer <token>
```

---

### نقاط نهاية Categories

#### 1. إنشاء فئة

```http
POST /merchants/categories
Authorization: Bearer <token>
```

---

#### 2. الحصول على الفئات

```http
GET /merchants/categories
```

---

### نقاط نهاية Attributes

#### 1. إنشاء خاصية

```http
POST /merchants/attributes
Authorization: Bearer <token>
```

---

#### 2. الحصول على الخصائص

```http
GET /merchants/attributes
```

---

## الفهارس (Indexes)

### Merchant Indexes

1. **`email`**: فهرس فريد (Unique Index)
2. **`phone`**: فهرس فريد (Unique Index, Sparse)
3. **`isActive`**: فهرس لحالة النشاط
4. **`vendor`**: فهرس لـ Vendor
5. **`store`**: فهرس لـ Store

---

## المصادقة والصلاحيات (Authentication & Authorization)

### أنواع المصادقة

- **Public**: لبعض نقاط النهاية (كتالوج المنتجات)
- **JWT Auth**: لنقاط النهاية الإدارية

### الصلاحيات (Roles)

- **العامة**: يمكنهم الوصول لكتالوج المنتجات فقط
- **الإدارة**: يتطلبون صلاحية `admin` أو `superadmin` (إدارة التجار والكتالوجات)
- **التجار (Vendors)**: يمكنهم إدارة منتجاتهم (تحديث منتجاتهم)

---

## الملاحظات التقنية

1. **Catalog System**:
   - ProductCatalog يمثل منتجات عامة في الكتالوج
   - MerchantProduct يمثل منتجات خاصة بالتاجر (مرتبطة بالكتالوج)

2. **Relationships**:
   - Merchant يمكن ربطه بـ Vendor أو Store
   - MerchantProduct مرتبط بـ ProductCatalog

3. **Categories & Attributes**:
   - MerchantCategory: فئات للمنتجات
   - Attribute: خصائص للمنتجات (مثل الحجم، اللون)

---

## الأخطاء الشائعة

| الكود | الوصف |
|------|-------|
| 404 | التاجر/المنتج غير موجود |
| 400 | التاجر موجود بالفعل (بريد/هاتف مكرر) |
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
- Store Module: راجع `../store/README.md` لفهم المتاجر
