# موديول المستخدم (User Module)

## نظرة عامة

موديول **المستخدم** هو نظام لإدارة ملفات المستخدمين الشخصية وبياناتهم. يتيح هذا الموديول للمستخدمين إدارة ملفاتهم الشخصية، عناوين التوصيل، وإعدادات الأمان (PIN Code). يدعم الموديول التخزين المؤقت (Caching) لتحسين الأداء.

---

## الهيكل التنظيمي

```
user/
├── user.controller.ts          # نقاط النهاية (API Endpoints)
├── user-compat.controller.ts   # نقاط النهاية المتوافقة (Compatibility)
├── user.module.ts              # إعدادات الموديول
├── user.service.ts             # منطق الأعمال
└── dto/                        # كائنات نقل البيانات
    ├── add-address.dto.ts
    ├── set-pin.dto.ts
    └── update-user.dto.ts
```

**ملاحظة**: كيان `User` موجود في موديول `auth` (`../auth/entities/user.entity.ts`)، ويتم استخدامه في هذا الموديول.

---

## الكيانات (Entities)

### User (المستخدم)

الكيان الرئيسي للمستخدم. موجود في `auth/entities/user.entity.ts`.

#### الحقول الأساسية

| الحقل | النوع | الوصف | مطلوب |
|------|------|-------|-------|
| `fullName` | String | الاسم الكامل | ✓ |
| `aliasName` | String | الاسم المستعار | ✗ |
| `email` | String | البريد الإلكتروني (فريد) | ✗ |
| `phone` | String | رقم الهاتف | ✗ |
| `profileImage` | String | رابط صورة الملف الشخصي | ✗ |
| `emailVerified` | Boolean | حالة التحقق من البريد | ✗ |
| `phoneVerified` | Boolean | حالة التحقق من الهاتف | ✗ |
| `classification` | Enum | التصنيف (`regular`, `bronze`, `silver`, `gold`, `vip`) | ✗ |
| `role` | Enum | الدور (`user`, `admin`, `superadmin`) | ✗ |
| `language` | Enum | اللغة (`ar`, `en`) | ✗ |
| `theme` | Enum | الثيم (`light`, `dark`) | ✗ |
| `isActive` | Boolean | حالة التفعيل | ✗ |
| `isBanned` | Boolean | حالة الحظر | ✗ |
| `isVerified` | Boolean | حالة التحقق | ✗ |
| `authProvider` | Enum | مزود المصادقة (`firebase`, `local`) | ✗ |
| `firebaseUID` | String | معرف Firebase (فريد) | ✗ |
| `pushToken` | String | توكن الإشعارات | ✗ |

#### حقول التاريخ والوقت

| الحقل | النوع | الوصف |
|------|------|-------|
| `lastLoginAt` | Date | تاريخ آخر تسجيل دخول |
| `createdAt` | Date | تاريخ الإنشاء (تلقائي) |
| `updatedAt` | Date | تاريخ التحديث الأخير (تلقائي) |

#### الحقول المتداخلة

**Address (العنوان)**:
- `label`: تسمية العنوان (منزل، عمل، إلخ)
- `street`: اسم الشارع
- `city`: المدينة
- `location`: الموقع الجغرافي (`{lat: number, lng: number}`)

**Security (الأمان)**:
- `pinCodeHash`: رمز PIN المشفر (مخفي افتراضياً)
- `twoFactorEnabled`: تفعيل المصادقة الثنائية
- `pinAttempts`: عدد محاولات PIN الفاشلة
- `pinLockedUntil`: تاريخ انتهاء قفل PIN

**Wallet (المحفظة)**:
- `balance`: الرصيد
- `onHold`: المبلغ المحتجز
- `currency`: العملة (افتراضي: YER)
- `totalSpent`: إجمالي الإنفاق
- `totalEarned`: إجمالي الأرباح
- `loyaltyPoints`: نقاط الولاء
- `savings`: المدخرات

**NotificationPreferences (تفضيلات الإشعارات)**:
- `email`: إشعارات البريد الإلكتروني
- `sms`: إشعارات الرسائل النصية
- `push`: إشعارات الدفع

#### حقول أخرى

| الحقل | النوع | الوصف |
|------|------|-------|
| `addresses` | Array | قائمة عناوين التوصيل |
| `defaultAddressId` | ObjectId | معرف العنوان الافتراضي |
| `favorites` | Array[ObjectId] | المنتجات المفضلة |
| `wallet` | Wallet | بيانات المحفظة |
| `security` | Security | بيانات الأمان |
| `transactions` | Array | سجل المعاملات |
| `notificationsFeed` | Array | سجل الإشعارات |

---

## نقاط النهاية (API Endpoints)

### نقاط نهاية الملف الشخصي

#### 1. الحصول على بيانات المستخدم الحالي

```http
GET /users/me
Authorization: Bearer <token>
```

**الوصف**: جلب جميع بيانات المستخدم الحالي مع العنوان الافتراضي.

**Response**: بيانات المستخدم مع العنوان الافتراضي

---

#### 2. تحديث الملف الشخصي

```http
PATCH /users/me
Authorization: Bearer <token>
```

**Body**:
```json
{
  "fullName": "أحمد محمد",
  "aliasName": "أحمد",
  "phone": "+967777123456",
  "profileImage": "https://example.com/image.jpg",
  "language": "ar",
  "theme": "dark",
  "pushToken": "token123"
}
```

**ملاحظة**: جميع الحقول اختيارية.

---

#### 3. حذف حساب المستخدم

```http
DELETE /users/me
Authorization: Bearer <token>
```

**الوصف**: حذف حساب المستخدم الحالي نهائياً.

---

#### 4. إلغاء تفعيل الحساب

```http
DELETE /users/deactivate
Authorization: Bearer <token>
```

**الوصف**: تعطيل حساب المستخدم بشكل مؤقت.

---

### نقاط نهاية العناوين

#### 1. جلب جميع العناوين

```http
GET /users/addresses
Authorization: Bearer <token>
```

**الوصف**: الحصول على قائمة عناوين التوصيل المحفوظة.

**Response**:
```json
{
  "addresses": [...],
  "defaultAddressId": "507f1f77bcf86cd799439011"
}
```

---

#### 2. إضافة عنوان جديد

```http
POST /users/addresses
Authorization: Bearer <token>
```

**Body**:
```json
{
  "label": "المنزل",
  "city": "صنعاء",
  "street": "شارع الزبيري",
  "location": {
    "lat": 15.369445,
    "lng": 44.191006
  }
}
```

---

#### 3. تحديث عنوان

```http
PATCH /users/addresses/:addressId
Authorization: Bearer <token>
```

**Body**: نفس حقل إضافة العنوان (جميع الحقول اختيارية)

---

#### 4. حذف عنوان

```http
DELETE /users/addresses/:addressId
Authorization: Bearer <token>
```

---

#### 5. تعيين العنوان الافتراضي

```http
POST /users/addresses/:addressId/set-default
Authorization: Bearer <token>
```

---

### نقاط نهاية PIN Code

#### 1. تعيين رمز PIN

```http
POST /users/pin/set
Authorization: Bearer <token>
```

**Body**:
```json
{
  "pin": "1234",
  "confirmPin": "1234"
}
```

**الوصف**: تعيين رمز PIN من 4-6 أرقام مع تشفير bcrypt.

**الشروط**:
- PIN يجب أن يكون بين 4-6 أرقام
- PIN يجب أن يكون قوياً (لا يتسلسل أو متكرر)
- PIN وconfirmPin يجب أن يتطابقا

---

#### 2. التحقق من رمز PIN

```http
POST /users/pin/verify
Authorization: Bearer <token>
```

**Body**:
```json
{
  "pin": "1234"
}
```

**الوصف**: التحقق من صحة رمز PIN مع حماية من Brute Force.

**الحماية**:
- الحد الأقصى للمحاولات: 5 محاولات
- مدة القفل: 30 دقيقة بعد المحاولات الفاشلة

---

#### 3. تغيير رمز PIN

```http
POST /users/pin/change
Authorization: Bearer <token>
```

**Body**:
```json
{
  "oldPin": "1234",
  "newPin": "5678",
  "confirmNewPin": "5678"
}
```

**الوصف**: تغيير PIN الحالي (يتطلب PIN القديم).

---

#### 4. التحقق من حالة PIN

```http
GET /users/pin/status
Authorization: Bearer <token>
```

**Response**:
```json
{
  "hasPin": true,
  "isLocked": false,
  "lockedUntil": null,
  "attemptsRemaining": 5
}
```

---

### نقاط نهاية الإدارة (Admin Only)

#### 1. البحث عن مستخدمين

```http
GET /users/search?q=أحمد&cursor=&limit=20
Authorization: Bearer <token>
```

**الأدوار المطلوبة**: `admin`, `superadmin`

**Query Parameters**:
- `q`: نص البحث (اسم، رقم، email)
- `cursor`: مؤشر التصفح
- `limit`: عدد النتائج

---

#### 2. إعادة تعيين PIN

```http
DELETE /users/pin/reset/:userId
Authorization: Bearer <token>
```

**الأدوار المطلوبة**: `admin`, `superadmin`

**الوصف**: إعادة تعيين PIN لمستخدم معين.

---

## العمليات (Operations)

### 1. تحديث الملف الشخصي

**الإجراءات**:
- تحديث البيانات المطلوبة
- مسح Cache بعد التحديث
- إرجاع البيانات المحدثة

---

### 2. إدارة العناوين

**إضافة عنوان**:
- التحقق من صحة البيانات
- إضافة العنوان إلى المصفوفة
- حفظ المستخدم
- مسح Cache

**تحديث عنوان**:
- البحث عن العنوان المطلوب
- تحديث البيانات
- حفظ المستخدم

**حذف عنوان**:
- إزالة العنوان من المصفوفة
- تحديث العنوان الافتراضي إذا كان محذوفاً
- حفظ المستخدم

**تعيين العنوان الافتراضي**:
- التحقق من وجود العنوان
- تحديث `defaultAddressId`
- حفظ المستخدم

---

### 3. إدارة PIN Code

**تعيين PIN**:
- التحقق من تطابق PIN
- التحقق من قوة PIN
- تشفير PIN باستخدام bcrypt (12 rounds)
- حفظ PIN المشفر
- إعادة تعيين المحاولات

**التحقق من PIN**:
- التحقق من وجود PIN
- التحقق من القفل
- مقارنة PIN مع المشفر
- زيادة المحاولات الفاشلة
- قفل PIN بعد 5 محاولات فاشلة
- إعادة تعيين المحاولات عند النجاح

**قوة PIN**:
- رفض الأرقام المتسلسلة (0123, 1234, إلخ)
- رفض الأرقام المتكررة (1111, 2222, إلخ)
- رفض الأنماط الشائعة (0000, 1234, 4321, إلخ)

---

## الفهارس (Indexes)

يحتوي User entity على الفهارس التالية:

1. **`email`**: فهرس فريد (Unique Index)
2. **`phone`**: فهرس للبحث
3. **`firebaseUID`**: فهرس فريد (Unique Index)
4. **`createdAt`**: فهرس لترتيب حسب التاريخ
5. **`role + isActive`**: فهرس مركب
6. **`phone + isActive`**: فهرس مركب للبحث
7. **`wallet.balance`**: فهرس للمحفظة
8. **`classification + createdAt`**: فهرس مركب
9. **`isActive + isBanned`**: فهرس مركب للفلترة
10. **`wallet.loyaltyPoints`**: فهرس لترتيب حسب النقاط

---

## المصادقة والصلاحيات (Authentication & Authorization)

### أنواع المصادقة

- **Firebase Auth**: لجميع نقاط النهاية العامة (GET /users/me, PATCH /users/me, إلخ)
- **JWT Auth**: لنقاط النهاية الإدارية (البحث عن المستخدمين)

### الصلاحيات (Roles)

- **المستخدمون**: لا يتطلبون صلاحية خاصة (افتراضي)
- **الإدارة**: يتطلبون صلاحية `admin` أو `superadmin` (البحث، إعادة تعيين PIN)

---

## DTOs (Data Transfer Objects)

### 1. UpdateUserDto

استخدامه في تحديث الملف الشخصي.

**الحقول** (جميعها اختيارية):
- `fullName`: الاسم الكامل
- `aliasName`: الاسم المستعار
- `phone`: رقم الهاتف
- `profileImage`: رابط صورة الملف الشخصي
- `language`: اللغة (`ar`, `en`)
- `theme`: الثيم (`light`, `dark`)
- `pushToken`: توكن الإشعارات

---

### 2. AddAddressDto

استخدامه في إضافة/تحديث عنوان.

**الحقول**:
- `label`: تسمية العنوان (مطلوب)
- `city`: المدينة (مطلوب)
- `street`: الشارع (مطلوب)
- `location`: الموقع الجغرافي (`{lat: number, lng: number}`) (اختياري)

---

### 3. SetPinDto

استخدامه في تعيين PIN.

**الحقول**:
- `pin`: رمز PIN (4-6 أرقام) (مطلوب)
- `confirmPin`: تأكيد رمز PIN (مطلوب)

---

### 4. VerifyPinDto

استخدامه في التحقق من PIN.

**الحقول**:
- `pin`: رمز PIN للتحقق (مطلوب)

---

## التخزين المؤقت (Caching)

يستخدم الموديول نظام Cache لتحسين الأداء:

- **User Profile Cache**: TTL = 5 دقائق
- **User Cache**: TTL = 10 دقائق

**Cache Keys**:
- `user:profile:${userId}`: ملف المستخدم الشخصي
- `user:${userId}`: بيانات المستخدم

**مسح Cache**: يتم مسح Cache تلقائياً عند:
- تحديث الملف الشخصي
- إضافة/تحديث/حذف عنوان
- حذف المستخدم

---

## الأخطاء الشائعة

| الكود | الوصف |
|------|-------|
| 404 | المستخدم غير موجود |
| 400 | بيانات غير صالحة (PIN ضعيف، عنوان غير صالح، إلخ) |
| 401 | غير مصرح (مصادقة فاشلة) |
| 403 | ليس لديك صلاحية (admin only) |
| 401 | PIN غير صحيح أو محظور |

---

## الملاحظات التقنية

1. **PIN Code Security**:
   - يستخدم bcrypt للتشفير (12 rounds)
   - PIN مخفي افتراضياً (`select: false`)
   - حماية من Brute Force (5 محاولات، قفل 30 دقيقة)

2. **Caching**:
   - يستخدم Cache Manager لتحسين الأداء
   - يتم مسح Cache تلقائياً عند التحديثات

3. **Address Management**:
   - العناوين مخزنة كـ Array في User document
   - يتم استخدام `defaultAddressId` للإشارة للعنوان الافتراضي
   - عند حذف العنوان الافتراضي، يتم تعيين العنوان الأول كافتراضي

4. **User Entity Location**:
   - كيان User موجود في `auth/entities/user.entity.ts`
   - هذا الموديول يستخدم User entity من auth module

---

## التبعيات (Dependencies)

- `@nestjs/common`
- `@nestjs/mongoose`
- `@nestjs/swagger`
- `@nestjs/cache-manager`
- `mongoose`
- `bcrypt`
- `class-validator`
- `class-transformer`

---

## التوثيق الإضافي

- [Swagger Documentation](http://localhost:3000/api) (عند تشغيل الخادم)
- ملفات الكود: راجع الملفات في هذا الموديول لمزيد من التفاصيل
- User Entity: راجع `../auth/entities/user.entity.ts` لفهم بنية User
