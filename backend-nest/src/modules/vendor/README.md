# موديول التاجر (Vendor Module)

## نظرة عامة

موديول **التاجر** هو نظام لإدارة التجار (المتاجر). يتيح هذا الموديول إنشاء وإدارة حسابات التجار، تتبع مبيعاتهم، وإدارة حساباتهم المالية. يدعم الموديول تسجيل دخول التجار، إدارة ملفاتهم الشخصية، ومتابعة إحصائياتهم المالية.

---

## الهيكل التنظيمي

```
vendor/
├── vendor.controller.ts       # نقاط النهاية (API Endpoints)
├── vendor.module.ts           # إعدادات الموديول
├── vendor.service.ts          # منطق الأعمال
├── dto/                        # كائنات نقل البيانات
│   ├── create-vendor.dto.ts
│   └── update-vendor.dto.ts
└── entities/                   # نماذج البيانات
    └── vendor.entity.ts
```

---

## الكيانات (Entities)

### Vendor (التاجر)

الكيان الرئيسي الذي يمثل تاجر واحد.

#### الحقول الأساسية

| الحقل | النوع | الوصف | مطلوب |
|------|------|-------|-------|
| `fullName` | String | الاسم الكامل | ✓ |
| `phone` | String | رقم الهاتف (فريد) | ✓ |
| `email` | String | البريد الإلكتروني | ✗ |
| `password` | String | كلمة المرور (مشفر، مخفي) | ✓ |
| `store` | ObjectId | مرجع للمتجر | ✓ |
| `isActive` | Boolean | حالة النشاط | ✗ |
| `createdByMarketerUid` | String | معرف المسوق | ✗ |
| `source` | Enum | المصدر (`marketerQuickOnboard`, `admin`, `other`) | ✗ |
| `salesCount` | Number | عدد المبيعات | ✗ |
| `totalRevenue` | Number | إجمالي الإيرادات | ✗ |
| `expoPushToken` | String | توكن الإشعارات | ✗ |
| `notificationSettings` | Object | إعدادات الإشعارات | ✗ |
| `pendingDeletion` | Object | طلب حذف الحساب | ✗ |

#### NotificationSettings (إعدادات الإشعارات)

- `enabled`: تفعيل الإشعارات
- `orderAlerts`: تنبيهات الطلبات
- `financialAlerts`: تنبيهات مالية
- `marketingAlerts`: تنبيهات تسويقية
- `systemUpdates`: تحديثات النظام

---

## العلاقات (Relationships)

### علاقة مع المتجر (Store)

```typescript
store: Types.ObjectId // مرجع لجدول DeliveryStore (فريد)
```

- كل تاجر مرتبط بمتجر واحد فقط
- العلاقة: **One-to-One** (تاجر واحد لكل متجر)

---

## نقاط النهاية (API Endpoints)

### المصادقة

#### 1. تسجيل دخول التاجر

```http
POST /vendors/auth/vendor-login
```

**Body**:
```json
{
  "email": "vendor@example.com",
  "password": "password123"
}
```

---

### نقاط نهاية الإدارة (Admin Only)

#### 1. إنشاء تاجر جديد

```http
POST /vendors
Authorization: Bearer <token>
```

**الأدوار المطلوبة**: `admin`, `superadmin`, `marketer`

**Body**:
```json
{
  "fullName": "أحمد محمد",
  "phone": "+967777123456",
  "email": "vendor@example.com",
  "password": "password123",
  "store": "507f1f77bcf86cd799439011",
  "createdByMarketerUid": "marketer123",
  "source": "admin"
}
```

---

#### 2. جلب كل التجار

```http
GET /vendors?cursor=&limit=20
Authorization: Bearer <token>
```

**الأدوار المطلوبة**: `admin`, `superadmin`

---

#### 3. جلب تاجر محدد

```http
GET /vendors/:id
Authorization: Bearer <token>
```

**الأدوار المطلوبة**: `admin`, `superadmin`

---

#### 4. تحديث تاجر

```http
PATCH /vendors/:id
Authorization: Bearer <token>
```

**الأدوار المطلوبة**: `admin`, `superadmin`

**Body**: نفس حقل تحديث التاجر (جميع الحقول اختيارية)

---

#### 5. تحديث حالة التاجر

```http
PATCH /vendors/:id/status
Authorization: Bearer <token>
```

**الأدوار المطلوبة**: `admin`, `superadmin`

**Body**:
```json
{
  "isActive": true
}
```

---

#### 6. إعادة تعيين كلمة مرور التاجر

```http
POST /vendors/:id/reset-password
Authorization: Bearer <token>
```

**الأدوار المطلوبة**: `admin`, `superadmin`

**Body**:
```json
{
  "password": "newpassword123"
}
```

---

### نقاط نهاية التاجر (Vendor Only)

#### 1. بيانات التاجر الحالي

```http
GET /vendors/me
Authorization: Bearer <token>
```

**نوع المصادقة**: `VENDOR_JWT`

---

#### 2. تحديث بيانات التاجر

```http
PATCH /vendors/me
Authorization: Bearer <token>
```

**نوع المصادقة**: `VENDOR_JWT`

**Body**:
```json
{
  "isActive": true,
  "expoPushToken": "token123",
  "notificationSettings": {
    "enabled": true,
    "orderAlerts": true,
    "financialAlerts": true,
    "marketingAlerts": false,
    "systemUpdates": true
  }
}
```

---

#### 3. لوحة معلومات التاجر

```http
GET /vendors/dashboard/overview
Authorization: Bearer <token>
```

**نوع المصادقة**: `VENDOR_JWT`

---

#### 4. كشف حساب التاجر

```http
GET /vendors/account/statement
Authorization: Bearer <token>
```

**نوع المصادقة**: `VENDOR_JWT`

---

#### 5. طلبات التسوية المالية

```http
GET /vendors/settlements
Authorization: Bearer <token>
```

**نوع المصادقة**: `VENDOR_JWT`

---

#### 6. طلب تسوية مالية

```http
POST /vendors/settlements
Authorization: Bearer <token>
```

**نوع المصادقة**: `VENDOR_JWT`

**Body**:
```json
{
  "amount": 1000,
  "bankAccount": "1234567890"
}
```

---

#### 7. سجل المبيعات

```http
GET /vendors/sales?limit=20
Authorization: Bearer <token>
```

**نوع المصادقة**: `VENDOR_JWT`

---

#### 8. طلب حذف الحساب

```http
POST /vendors/account/delete-request
Authorization: Bearer <token>
```

**نوع المصادقة**: `VENDOR_JWT`

**Body**:
```json
{
  "reason": "سبب الحذف",
  "exportData": true
}
```

---

## العمليات (Operations)

### 1. تسجيل دخول التاجر

**الخطوات**:
1. البحث عن التاجر بالبريد الإلكتروني
2. التحقق من كلمة المرور
3. توليد token
4. إرجاع بيانات التاجر والـ token

---

### 2. إنشاء تاجر

**الخطوات**:
1. التحقق من عدم وجود تاجر بنفس رقم الهاتف
2. تشفير كلمة المرور باستخدام bcrypt
3. إنشاء التاجر
4. إرجاع البيانات (بدون كلمة المرور)

---

### 3. تحديث إحصائيات المبيعات

**الوصف**: تحديث إحصائيات المبيعات بعد إتمام طلب.

**الخطوات**:
1. البحث عن التاجر
2. زيادة `salesCount` و`totalRevenue`
3. حفظ التغييرات

---

## الفهارس (Indexes)

يحتوي Vendor entity على الفهارس التالية:

1. **`phone`**: فهرس فريد (Unique Index)
2. **`store`**: فهرس للمتجر
3. **`createdByMarketerUid + createdAt`**: فهرس مركب للمسوق
4. **`isActive`**: فهرس لحالة النشاط

---

## المصادقة والصلاحيات (Authentication & Authorization)

### أنواع المصادقة

- **JWT Auth**: لنقاط النهاية الإدارية
- **VENDOR_JWT Auth**: لنقاط نهاية التاجر

### الصلاحيات (Roles)

- **الإدارة**: يتطلبون صلاحية `admin`, `superadmin`, أو `marketer` (إنشاء تاجر، إدارة التجار)
- **التجار**: يتطلبون مصادقة `VENDOR_JWT` (الملف الشخصي، المبيعات، الحسابات المالية)

---

## DTOs (Data Transfer Objects)

### 1. CreateVendorDto

استخدامه في إنشاء تاجر جديد.

**الحقول**:
- `fullName`: الاسم الكامل (مطلوب)
- `phone`: رقم الهاتف (مطلوب، فريد)
- `email`: البريد الإلكتروني (اختياري)
- `password`: كلمة المرور (مطلوب، 6+ أحرف)
- `store`: معرف المتجر (مطلوب)
- `createdByMarketerUid`: معرف المسوق (اختياري)
- `source`: المصدر (`marketerQuickOnboard`, `admin`, `other`) (اختياري)

---

### 2. UpdateVendorDto

استخدامه في تحديث بيانات التاجر.

**الحقول** (جميعها اختيارية):
- `isActive`: حالة النشاط
- `expoPushToken`: توكن الإشعارات
- `notificationSettings`: إعدادات الإشعارات

---

## الملاحظات التقنية

1. **Password Security**:
   - كلمة المرور مشفرة باستخدام bcrypt
   - كلمة المرور مخفية افتراضياً (`select: false`)

2. **One Vendor Per Store**:
   - كل متجر لديه تاجر واحد فقط
   - العلاقة: **One-to-One** (تاجر واحد لكل متجر)

3. **Sales Statistics**:
   - يتم تحديث `salesCount` و`totalRevenue` تلقائياً
   - يمكن ربطها بموديول Order لمتابعة المبيعات

4. **Account Deletion**:
   - يمكن للتجار طلب حذف حساباتهم
   - يتم حفظ الطلب في `pendingDeletion`
   - يمكن تصدير البيانات قبل الحذف

---

## الأخطاء الشائعة

| الكود | الوصف |
|------|-------|
| 404 | التاجر غير موجود |
| 409 | التاجر موجود مسبقاً (رقم هاتف مكرر) |
| 400 | بيانات غير صالحة |
| 401 | غير مصرح (مصادقة فاشلة) |
| 403 | ليس لديك صلاحية (admin أو vendor only) |

---

## التبعيات (Dependencies)

- `@nestjs/common`
- `@nestjs/mongoose`
- `@nestjs/swagger`
- `@nestjs/jwt`
- `mongoose`
- `bcrypt`
- `class-validator`
- `class-transformer`

---

## التوثيق الإضافي

- [Swagger Documentation](http://localhost:3000/api) (عند تشغيل الخادم)
- ملفات الكود: راجع الملفات في هذا الموديول لمزيد من التفاصيل
- Store Module: راجع `../store/README.md` لفهم المتاجر
- Finance Module: راجع `../finance/README.md` لفهم الحسابات المالية
