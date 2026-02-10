# خطة التوافق النهائي: تطبيق السائق × الباك إند × لوحة التحكم

> **تاريخ:** 11 فبراير 2025  
> **الهدف:** توافق كامل بين rider-app و backend-nest و admin-dashboard  
> **المعايير:**
> - رقم الهاتف هو المعرف المعتمد (وليس الإيميل) لتسجيل دخول السائق
> - المحفظة v1 فقط — لا v2 (المشروع لم ينطلق بعد)

---

## 1. ملخص التنفيذ

| المرحلة | الوصف | الأولوية |
|---------|-------|----------|
| 1 | توحيد المصادقة على أساس الهاتف | عالية |
| 2 | توحيد مسارات المحفظة على v1 | عالية |
| 3 | إصلاح مسارات Auth في rider-app | عالية |
| 4 | إنشاء/إصلاح ملف axiosInstance | متوسطة |
| 5 | مراجعة لوحة التحكم | متوسطة |

---

## 2. المصادقة — اعتماد رقم الهاتف

### 2.1 الباك إند (backend-nest)

#### 2.1.1 تعديل `auth.controller.ts`
- **الملف:** `backend-nest/src/modules/auth/auth.controller.ts`
- **التغيير:** دعم `phone` بدل `email` في driver/login

```ts
// قبل
@Post('driver/login')
async driverLogin(@Body() loginDto: { email: string; password: string }) {
  return this.authService.driverLogin(loginDto.email, loginDto.password);
}

// بعد
@Post('driver/login')
async driverLogin(@Body() loginDto: { phone: string; password: string }) {
  return this.authService.driverLogin(loginDto.phone, loginDto.password);
}
```

#### 2.1.2 تعديل `auth.service.ts`
- **الملف:** `backend-nest/src/modules/auth/auth.service.ts`
- **التغيير:** البحث بالهاتف بدل الإيميل في `driverLogin`

```ts
// قبل
async driverLogin(email: string, password: string) {
  const driver = await this.driverModel.findOne({ email }).select('+password');
  // ...
}

// بعد
async driverLogin(phone: string, password: string) {
  const driver = await this.driverModel.findOne({ phone }).select('+password');
  // ...
}
```

#### 2.1.3 DTO (اختياري)
- إنشاء أو تحديث DTO لتسجيل دخول السائق:
  - `DriverLoginDto`: `{ phone: string; password: string }`

### 2.2 تطبيق السائق (rider-app)

#### 2.2.1 تصحيح مسار تسجيل الدخول
- **الملف:** `rider-app/src/api/auth.ts`
- **المشكلة:** يستدعي `/driver/login` بينما المسار الصحيح `/auth/driver/login`
- **التغيير:**

```ts
// قبل
const res = await axios.post("/driver/login", { phone, password });

// بعد
const res = await axios.post("/auth/driver/login", { phone, password });
```

- **ملاحظة:** التطبيق يرسل بالفعل `{ phone, password }` — يتوافق مع التعديل في الباك إند.

#### 2.2.2 شاشة تسجيل الدخول
- **الملف:** `rider-app/app/(auth)/login.tsx`
- **التحقق:** التأكد أن الحقل المستخدم هو رقم الهاتف وليس الإيميل.

### 2.3 لوحة التحكم (admin-dashboard)

- **التحقق:** التأكد أن لوحة التحكم تستخدم `auth/driver/login` أو مسار Admin الخاص بها ولا تعتمد على مسار تسجيل دخول السائق القديم.
- **إنشاء السائقين:** عند إنشاء سائق من اللوحة، التأكد من جعل `phone` حقلًا إلزاميًا و`email` اختياريًا إن أمكن، بما يلائم نموذج السائق.

---

## 3. المحفظة — استخدام v1 فقط

### 3.1 الباك إند

#### 3.1.1 تعطيل أو إزالة V2WalletController
- **الملف:** `backend-nest/src/modules/wallet/wallet.module.ts`
- **الوضع الحالي:** التسجيل فقط على `WalletController` (v1).
- **التحقق:** التأكد أن `V2WalletController` غير مسجّل في أي مكان. إن وُجد، إزالته أو عدم تسجيله.

#### 3.1.2 إضافة endpoints المحفظة الناقصة في v1 (إن وجدت)
- **الملف:** `backend-nest/src/modules/wallet/wallet.controller.ts`
- **المسار:** `api/v1/wallet/...`
- **التأكد من وجود:**
  - `GET /wallet/balance`
  - `GET /wallet/transactions`
  - `GET /wallet/transaction/:id`
  - `GET /wallet/withdraw/methods`
  - `POST /wallet/withdraw/request`
  - `GET /wallet/withdraw/my`
  - `PATCH /wallet/withdraw/:id/cancel`
- إذا كانت بعض هذه الـ endpoints موجودة فقط في v2، ينقل إلى WalletController (v1).

### 3.2 تطبيق السائق (rider-app)

#### 3.2.1 تحديث `walletApi.ts`
- **الملف:** `rider-app/src/api/walletApi.ts`
- **التغيير:** استبدال كل مسارات `/v2/wallet/*` بـ `/wallet/*`

| قبل | بعد |
|-----|-----|
| `/v2/wallet/balance` | `/wallet/balance` |
| `/v2/wallet/transactions` | `/wallet/transactions` |
| `/v2/wallet/transaction/:id` | `/wallet/transaction/:id` |
| `/v2/wallet/withdraw/methods` | `/wallet/withdraw/methods` |
| `/v2/wallet/withdraw/request` | `/wallet/withdraw/request` |
| `/v2/wallet/withdraw/my` | `/wallet/withdraw/my` |
| `/v2/wallet/withdraw/:id/cancel` | `/wallet/withdraw/:id/cancel` |

### 3.3 لوحة التحكم (admin-dashboard)

#### 3.3.1 تحديث `wallet.ts`
- **الملف:** `admin-dashboard/src/api/wallet.ts`
- **التغيير:** استبدال `/v2/wallet/*` بـ `/wallet/*` في جميع الاستدعاءات.

---

## 4. إصلاح مسارات Auth في rider-app

| الاستدعاء | المسار الحالي (إن كان خاطئًا) | المسار الصحيح |
|----------|-------------------------------|----------------|
| تسجيل دخول السائق | `/driver/login` | `/auth/driver/login` |

- **baseURL:** `https://api.bthwani.com/api/v1`
- **النتيجة النهائية:** `https://api.bthwani.com/api/v1/auth/driver/login`

---

## 5. ملف axiosInstance

### 5.1 المشكلة
- `rider-app/src/api/support.ts` يستورد من `./axiosInstance`
- `rider-app/src/notify.ts` يستورد من `@/utils/api/axiosInstance`
- لا يوجد ملف `axiosInstance` في المشروع.

### 5.2 الحل

**الخيار أ:** إنشاء `rider-app/src/api/axiosInstance.ts`:
```ts
import axios from "./axios";
export const axiosInstance = axios;
```

**الخيار ب:** استبدال الاستيراد في `support.ts` و`notify.ts` بـ:
```ts
import axios from "./axios";
```
واستخدام `axios` مباشرة بدل `axiosInstance`.

---

## 6. مراجعة لوحة التحكم

### 6.1 نقطة النهاية الأساسية
- **الملف:** `admin-dashboard/src/services/api.ts`
- **Base URL:** `https://api.bthwani.com/api/v1` — مناسب.

### 6.2 التحقق من التوافق
- التحقق من استخدام لوحة التحكم لـ `/auth/*` و `/wallet/*` بدل `/v2/wallet/*`.
- التأكد أن إنشاء وتعديل السائقين يستخدم `phone` كحقل أساسي.

---

## 7. ملخص الملفات المطلوب تعديلها

### Backend (backend-nest)
| الملف | التعديل |
|-------|---------|
| `auth.controller.ts` | دعم `phone` في driver/login |
| `auth.service.ts` | البحث بالهاتف في driverLogin |
| `wallet.module.ts` | التأكد أن V2WalletController غير مسجّل |
| `wallet.controller.ts` | إضافة أو تأكيد endpoints السحب إن كانت ناقصة |

### Rider App (rider-app)
| الملف | التعديل |
|-------|---------|
| `auth.ts` | تغيير المسار إلى `/auth/driver/login` |
| `walletApi.ts` | استبدال `/v2/wallet/*` بـ `/wallet/*` |
| `support.ts` / `notify.ts` | إنشاء أو إصلاح axiosInstance |
| `app/(auth)/login.tsx` | التحقق من استخدام حقل الهاتف |

### Admin Dashboard (admin-dashboard)
| الملف | التعديل |
|-------|---------|
| `api/wallet.ts` | استبدال `/v2/wallet/*` بـ `/wallet/*` |
| صفحات السائقين | التأكد من استخدام `phone` كحقل أساسي |

---

## 8. ترتيب التنفيذ المقترح

1. **الباك إند:**
   - تعديل Auth (phone) في auth.controller و auth.service
   - مراجعة wallet.controller وإضافة endpoints الناقصة
   - التأكد من عدم تسجيل V2WalletController

2. **تطبيق السائق:**
   - تعديل auth.ts (المسار)
   - تعديل walletApi.ts (استخدام v1)
   - إنشاء/إصلاح axiosInstance

3. **لوحة التحكم:**
   - تحديث api/wallet.ts لاستخدام v1
   - مراجعة نموذج السائقين (phone)

4. **الاختبار:**
   - تسجيل دخول السائق بالهاتف
   - استدعاءات المحفظة من rider-app
   - استدعاءات المحفظة من admin-dashboard

---

## 9. ملاحظات إضافية

- **Driver Entity:** يحتوي على `email` و `phone`؛ `phone` مطلوب و unique. اعتماد الهاتف في تسجيل الدخول لا يتعارض مع الـ schema.
- **JWT Payload:** التأكد أن الـ payload يحتوي على `sub` (id) و `role`؛ إضافة `phone` اختياري للاستخدام في اللوحة أو التحليلات.
- **إزالة V2:** عدم استخدام أي v2 في المحفظة أو المصادقة حتى انطلاق المشروع.
