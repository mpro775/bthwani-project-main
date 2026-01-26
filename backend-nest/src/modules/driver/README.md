# موديول السائقين (Driver Module)

## نظرة عامة

موديول **السائقين** هو نظام لإدارة السائقين وتتبعهم. يتيح هذا الموديول إنشاء وإدارة حسابات السائقين، تتبع مواقعهم الجغرافية، إدارة الطلبات، الأرباح، والمستندات. يدعم الموديول أنواع مختلفة من السائقين (سائق دراجة نارية، سائق سيارة، سائقة أنثى) ومركبات مختلفة.

---

## الهيكل التنظيمي

```
driver/
├── driver.controller.ts       # نقاط النهاية (API Endpoints)
├── driver.module.ts           # إعدادات الموديول
├── driver.service.ts          # منطق الأعمال
├── dto/                        # كائنات نقل البيانات
│   ├── create-driver.dto.ts
│   └── update-location.dto.ts
└── entities/                   # نماذج البيانات
    ├── driver.entity.ts
    └── driver-shift.entity.ts
```

---

## الكيانات (Entities)

### 1. Driver (السائق)

الكيان الرئيسي الذي يمثل سائق واحد.

#### الحقول الأساسية

| الحقل | النوع | الوصف | مطلوب |
|------|------|-------|-------|
| `fullName` | String | الاسم الكامل | ✓ |
| `email` | String | البريد الإلكتروني (فريد) | ✓ |
| `password` | String | كلمة المرور (مشفر، مخفي) | ✓ |
| `phone` | String | رقم الهاتف (فريد) | ✓ |
| `role` | Enum | الدور (`rider_driver`, `light_driver`, `women_driver`) | ✓ |
| `vehicleType` | Enum | نوع المركبة (`motor`, `bike`, `car`) | ✓ |
| `vehicleClass` | Enum | فئة المركبة (`light`, `medium`, `heavy`) | ✗ |
| `vehiclePower` | Number | قوة المركبة | ✗ |
| `driverType` | Enum | نوع السائق (`primary`, `joker`) | ✗ |
| `isAvailable` | Boolean | حالة التوفر | ✗ |
| `isFemaleDriver` | Boolean | سائقة أنثى | ✗ |
| `isVerified` | Boolean | حالة التحقق | ✗ |
| `isBanned` | Boolean | حالة الحظر | ✗ |
| `profileImage` | String | صورة الملف الشخصي | ✗ |

#### أنواع الأدوار (Role)

- **`rider_driver`**: سائق دراجة نارية
- **`light_driver`**: سائق خفيف
- **`women_driver`**: سائقة أنثى

#### أنواع المركبات (VehicleType)

- **`motor`**: دراجة نارية
- **`bike`**: دراجة هوائية
- **`car`**: سيارة

#### فئات المركبات (VehicleClass)

- **`light`**: خفيفة
- **`medium`**: متوسطة
- **`heavy`**: ثقيلة

#### أنواع السائقين (DriverType)

- **`primary`**: أساسي
- **`joker`**: احتياطي (Joker)

#### الحقول المتداخلة

**CurrentLocation (الموقع الحالي)**:
- `lat`: خط العرض
- `lng`: خط الطول
- `updatedAt`: تاريخ آخر تحديث

**ResidenceLocation (موقع الإقامة)**:
- `lat`: خط العرض
- `lng`: خط الطول
- `address`: العنوان
- `governorate`: المحافظة
- `city`: المدينة

**Wallet (المحفظة)**:
- `balance`: الرصيد
- `earnings`: الأرباح
- `lastUpdated`: تاريخ آخر تحديث

**DeliveryStats (إحصائيات التوصيل)**:
- `deliveredCount`: عدد الطلبات المكتملة
- `canceledCount`: عدد الطلبات الملغاة
- `totalDistanceKm`: المسافة الإجمالية بالكيلومتر

#### حقول أخرى

| الحقل | النوع | الوصف |
|------|------|-------|
| `currentLocation` | CurrentLocation | الموقع الحالي |
| `residenceLocation` | ResidenceLocation | موقع الإقامة |
| `wallet` | Wallet | بيانات المحفظة |
| `deliveryStats` | DeliveryStats | إحصائيات التوصيل |
| `jokerFrom` | Date | تاريخ بداية Joker |
| `jokerTo` | Date | تاريخ نهاية Joker |
| `glReceivableAccount` | ObjectId | حساب القبض (GL) |
| `glDepositAccount` | ObjectId | حساب الإيداع (GL) |
| `createdAt` | Date | تاريخ الإنشاء (تلقائي) |
| `updatedAt` | Date | تاريخ التحديث الأخير (تلقائي) |

---

## نقاط النهاية (API Endpoints)

### نقاط نهاية الإدارة (Admin Only)

#### 1. إنشاء سائق جديد

```http
POST /drivers
Authorization: Bearer <token>
```

**الأدوار المطلوبة**: `admin`, `superadmin`

**Body**:
```json
{
  "fullName": "أحمد محمد",
  "email": "driver@example.com",
  "password": "password123",
  "phone": "+967777123456",
  "role": "rider_driver",
  "vehicleType": "motor",
  "vehicleClass": "light",
  "vehiclePower": 150,
  "driverType": "primary",
  "isFemaleDriver": false
}
```

---

#### 2. جلب السائقين المتاحين

```http
GET /drivers/available?cursor=&limit=20
Authorization: Bearer <token>
```

**الوصف**: الحصول على قائمة السائقين المتاحين وغير المحظورين.

---

#### 3. جلب سائق محدد

```http
GET /drivers/:id
Authorization: Bearer <token>
```

---

### نقاط نهاية السائقين (Driver Only)

#### 1. بيانات السائق الحالي

```http
GET /drivers/me
Authorization: Bearer <token>
```

**الأدوار المطلوبة**: `driver`

---

#### 2. تحديث موقع السائق

```http
POST /drivers/locations
Authorization: Bearer <token>
```

**الأدوار المطلوبة**: `driver`

**Body**:
```json
{
  "lat": 15.369445,
  "lng": 44.191006,
  "accuracy": 10
}
```

---

#### 3. تحديث حالة التوفر

```http
PATCH /drivers/availability
Authorization: Bearer <token>
```

**الأدوار المطلوبة**: `driver`

**Body**:
```json
{
  "isAvailable": true
}
```

---

### نقاط نهاية الملف الشخصي

#### 1. الملف الشخصي

```http
GET /drivers/profile
Authorization: Bearer <token>
```

**الأدوار المطلوبة**: `driver`

---

#### 2. تحديث الملف الشخصي

```http
PATCH /drivers/profile
Authorization: Bearer <token>
```

**الأدوار المطلوبة**: `driver`

**Body**:
```json
{
  "fullName": "أحمد محمد",
  "phone": "+967777123456",
  "vehicle": {
    "type": "motor",
    "class": "light"
  }
}
```

---

#### 3. تغيير كلمة المرور

```http
POST /drivers/change-password
Authorization: Bearer <token>
```

**الأدوار المطلوبة**: `driver`

**Body**:
```json
{
  "oldPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

---

### نقاط نهاية الأرباح

#### 1. الأرباح

```http
GET /drivers/earnings?startDate=2025-01-01&endDate=2025-01-31
Authorization: Bearer <token>
```

**الأدوار المطلوبة**: `driver`

**Query Parameters**:
- `startDate` (اختياري): تاريخ البدء
- `endDate` (اختياري): تاريخ النهاية

---

#### 2. أرباح اليوم

```http
GET /drivers/earnings/daily
Authorization: Bearer <token>
```

**الأدوار المطلوبة**: `driver`

---

#### 3. أرباح الأسبوع

```http
GET /drivers/earnings/weekly
Authorization: Bearer <token>
```

**الأدوار المطلوبة**: `driver`

---

### نقاط نهاية الإحصائيات

#### 1. الإحصائيات

```http
GET /drivers/statistics
Authorization: Bearer <token>
```

**الأدوار المطلوبة**: `driver`

---

### نقاط نهاية المستندات

#### 1. رفع مستند

```http
POST /drivers/documents/upload
Authorization: Bearer <token>
```

**الأدوار المطلوبة**: `driver`

**Body**:
```json
{
  "type": "license",
  "fileUrl": "https://example.com/file.pdf",
  "expiryDate": "2025-12-31"
}
```

---

#### 2. مستنداتي

```http
GET /drivers/documents
Authorization: Bearer <token>
```

**الأدوار المطلوبة**: `driver`

---

#### 3. مستندات سائق (Admin)

```http
GET /drivers/:driverId/documents
Authorization: Bearer <token>
```

**الأدوار المطلوبة**: `admin`, `superadmin`

---

#### 4. التحقق من مستند (Admin)

```http
POST /drivers/:driverId/documents/:docId/verify
Authorization: Bearer <token>
```

**الأدوار المطلوبة**: `admin`, `superadmin`

**Body**:
```json
{
  "verified": true,
  "notes": "تم التحقق"
}
```

---

### نقاط نهاية الإجازات

#### 1. طلب إجازة

```http
POST /drivers/vacations/request
Authorization: Bearer <token>
```

**الأدوار المطلوبة**: `driver`

**Body**:
```json
{
  "startDate": "2025-02-01",
  "endDate": "2025-02-05",
  "type": "annual",
  "reason": "عطلة عائلية"
}
```

---

#### 2. إجازاتي

```http
GET /drivers/vacations/my
Authorization: Bearer <token>
```

**الأدوار المطلوبة**: `driver`

---

#### 3. إلغاء طلب إجازة

```http
PATCH /drivers/vacations/:id/cancel
Authorization: Bearer <token>
```

**الأدوار المطلوبة**: `driver`

---

#### 4. رصيد الإجازات

```http
GET /drivers/vacations/balance
Authorization: Bearer <token>
```

**الأدوار المطلوبة**: `driver`

---

#### 5. سياسة الإجازات

```http
GET /drivers/vacations/policy
Authorization: Bearer <token>
```

**الأدوار المطلوبة**: `driver`

---

### نقاط نهاية السحب

#### 1. سحوباتي

```http
GET /drivers/withdrawals/my
Authorization: Bearer <token>
```

**الأدوار المطلوبة**: `driver`

---

#### 2. طلب سحب أموال

```http
POST /drivers/withdrawals/request
Authorization: Bearer <token>
```

**الأدوار المطلوبة**: `driver`

**Body**:
```json
{
  "amount": 500,
  "method": "bank_transfer",
  "details": {
    "accountNumber": "1234567890",
    "bankName": "بنك اليمن"
  }
}
```

---

### نقاط نهاية الطلبات

#### 1. الطلبات المتاحة للاستلام

```http
GET /drivers/orders/available
Authorization: Bearer <token>
```

**الأدوار المطلوبة**: `driver`

---

#### 2. قبول طلب

```http
POST /drivers/orders/:id/accept
Authorization: Bearer <token>
```

**الأدوار المطلوبة**: `driver`

---

#### 3. رفض طلب

```http
POST /drivers/orders/:id/reject
Authorization: Bearer <token>
```

**الأدوار المطلوبة**: `driver`

**Body**:
```json
{
  "reason": "المسافة بعيدة جداً"
}
```

---

#### 4. بدء التوصيل

```http
POST /drivers/orders/:id/start-delivery
Authorization: Bearer <token>
```

**الأدوار المطلوبة**: `driver`

---

#### 5. إتمام التوصيل

```http
POST /drivers/orders/:id/complete
Authorization: Bearer <token>
```

**الأدوار المطلوبة**: `driver`

---

#### 6. سجل الطلبات

```http
GET /drivers/orders/history?cursor=&limit=20
Authorization: Bearer <token>
```

**الأدوار المطلوبة**: `driver`

---

### نقاط نهاية أخرى

#### 1. الإبلاغ عن مشكلة

```http
POST /drivers/issues/report
Authorization: Bearer <token>
```

**الأدوار المطلوبة**: `driver`

**Body**:
```json
{
  "type": "technical",
  "description": "مشكلة في التطبيق",
  "orderId": "ORDER123"
}
```

---

#### 2. إرسال إشارة SOS

```http
POST /drivers/sos
Authorization: Bearer <token>
```

**الأدوار المطلوبة**: `driver`

**Body**:
```json
{
  "message": "مساعدة",
  "location": {
    "lat": 15.369445,
    "lng": 44.191006
  }
}
```

---

## العمليات (Operations)

### 1. إنشاء سائق

**الخطوات**:
1. التحقق من عدم وجود سائق بنفس البريد أو الهاتف
2. تشفير كلمة المرور باستخدام bcrypt
3. إنشاء السائق
4. إرجاع البيانات (بدون كلمة المرور)

---

### 2. تحديث الموقع

**الوصف**: تحديث الموقع الجغرافي الحالي للسائق.

**الخطوات**:
1. التحقق من وجود السائق
2. تحديث `currentLocation` مع `updatedAt`
3. حفظ التغييرات

---

### 3. تحديث حالة التوفر

**الوصف**: تحديث حالة توفر السائق (متاح/غير متاح).

**الخطوات**:
1. التحقق من وجود السائق
2. تحديث `isAvailable`
3. حفظ التغييرات

---

### 4. تحديث إحصائيات التوصيل

**الوصف**: تحديث إحصائيات التوصيل بعد إكمال أو إلغاء طلب.

**الخطوات**:
1. التحقق من وجود السائق
2. زيادة `deliveredCount` أو `canceledCount`
3. تحديث `totalDistanceKm` (إن وجد)
4. حفظ التغييرات

---

## الفهارس (Indexes)

يحتوي Driver entity على الفهارس التالية:

1. **`email`**: فهرس فريد (Unique Index)
2. **`phone`**: فهرس فريد (Unique Index)
3. **`isAvailable`**: فهرس للبحث عن السائقين المتاحين
4. **`vehicleClass + vehiclePower`**: فهرس مركب
5. **`driverType`**: فهرس لنوع السائق
6. **`currentLocation.lat + currentLocation.lng`**: فهرس للموقع الجغرافي

---

## المصادقة والصلاحيات (Authentication & Authorization)

### أنواع المصادقة

- **JWT Auth**: لجميع نقاط النهاية

### الصلاحيات (Roles)

- **الإدارة**: يتطلبون صلاحية `admin` أو `superadmin` (إنشاء سائق، إدارة المستندات)
- **السائقين**: يتطلبون صلاحية `driver` (الملف الشخصي، الطلبات، الأرباح، إلخ)

---

## DTOs (Data Transfer Objects)

### 1. CreateDriverDto

استخدامه في إنشاء سائق جديد (Admin Only).

**الحقول**:
- `fullName`: الاسم الكامل (مطلوب)
- `email`: البريد الإلكتروني (مطلوب، فريد)
- `password`: كلمة المرور (مطلوب، 6+ أحرف)
- `phone`: رقم الهاتف (مطلوب، فريد)
- `role`: الدور (`rider_driver`, `light_driver`, `women_driver`) (مطلوب)
- `vehicleType`: نوع المركبة (`motor`, `bike`, `car`) (مطلوب)
- `vehicleClass`: فئة المركبة (`light`, `medium`, `heavy`) (اختياري)
- `vehiclePower`: قوة المركبة (اختياري)
- `driverType`: نوع السائق (`primary`, `joker`) (اختياري)
- `isFemaleDriver`: سائقة أنثى (اختياري)

---

### 2. UpdateLocationDto

استخدامه في تحديث موقع السائق.

**الحقول**:
- `lat`: خط العرض (مطلوب)
- `lng`: خط الطول (مطلوب)
- `accuracy`: دقة الموقع (اختياري)

---

## الملاحظات التقنية

1. **Password Security**:
   - كلمة المرور مشفرة باستخدام bcrypt
   - كلمة المرور مخفية افتراضياً (`select: false`)

2. **Location Tracking**:
   - يتم تحديث الموقع الحالي (`currentLocation`) عند كل تحديث
   - يتم حفظ `updatedAt` مع كل تحديث

3. **Availability**:
   - `isAvailable` يحدد ما إذا كان السائق متاح للطلبات
   - يستخدم للبحث عن السائقين المتاحين

4. **Driver Types**:
   - **Primary**: سائق أساسي
   - **Joker**: سائق احتياطي (يستخدم في أوقات الذروة أو كبديل)

5. **Sanitization**:
   - يتم إزالة كلمة المرور من الاستجابات
   - استخدام `SanitizationHelper` لتنظيف البيانات

---

## الأخطاء الشائعة

| الكود | الوصف |
|------|-------|
| 404 | السائق غير موجود |
| 409 | السائق موجود مسبقاً (بريد أو هاتف مكرر) |
| 400 | بيانات غير صالحة |
| 401 | غير مصرح (مصادقة فاشلة) |
| 403 | ليس لديك صلاحية (driver أو admin only) |

---

## التبعيات (Dependencies)

- `@nestjs/common`
- `@nestjs/mongoose`
- `@nestjs/swagger`
- `mongoose`
- `bcrypt`
- `class-validator`
- `class-transformer`

---

## التوثيق الإضافي

- [Swagger Documentation](http://localhost:3000/api) (عند تشغيل الخادم)
- ملفات الكود: راجع الملفات في هذا الموديول لمزيد من التفاصيل
- Wallet Module: راجع `../wallet/README.md` لفهم نظام المحفظة
- Withdrawal Module: راجع `../withdrawal/README.md` لفهم نظام السحب
