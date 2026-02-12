# خطة إصلاح وتوافق Vendor-App مع الباك إند

> **تاريخ:** 2025-02-12  
> **الهدف:** تحقيق توافق كامل بين تطبيق التاجر (vendor-app) والباك إند (backend-nest)

---

## الفهرس

1. [نظرة عامة على الفروقات](#1-نظرة-عامة-على-الفروقات)
2. [إصلاح تسجيل الدخول](#2-إصلاح-تسجيل-الدخول)
3. [إصلاح مسارات Merchant API](#3-إصلاح-مسارات-merchant-api)
4. [إصلاح منطق Vendor vs Merchant](#4-إصلاح-منطق-vendor-vs-merchant)
5. [إصلاح Support API](#5-إصلاح-support-api)
6. [معالجة استجابة API الموحدة](#6-معالجة-استجابة-api-الموحدة)
7. [التحقق والاختبار](#7-التحقق-والاختبار)
8. [جدول زمني مقترح](#8-جدول-زمني-مقترح)

---

## 1. نظرة عامة على الفروقات

### 1.1 الفروقات الحرجة (تؤثر على التشغيل)

| # | المشكلة | الموقع | التأثير |
|---|---------|--------|---------|
| 1 | تسجيل الدخول يرسل `phone` بينما الباك إند يتوقع `email` | LoginScreen + vendor.controller | **تعطيل تسجيل الدخول بالكامل** |
| 2 | مسارات Merchant تستخدم `/merchant/` بدلاً من `/merchants/` | merchant.ts | **404 على جميع عمليات المنتجات** |
| 3 | استخدام Vendor ID بدلاً من Merchant ID لجلب المنتجات | ProductsScreen + merchant.ts | **منتجات لا تُعرض أو بيانات خاطئة** |
| 4 | استيراد خاطئ لـ axiosInstance في Support | support.ts | **خطأ وقت التشغيل عند استخدام الدعم** |

### 1.2 الفروقات الثانوية

| # | المشكلة | الموقع | التأثير |
|---|---------|--------|---------|
| 5 | شكل استجابة API (data wrapper) | عدة ملفات | قد يتطلب تعديل معالجة الاستجابة |
| 6 | GetTickets يتطلب userId في query للباك إند | support.service | قد تُجلب تذاكر أخرى |

---

## 2. إصلاح تسجيل الدخول

### 2.1 المشكلة الحالية

```
vendor-app يرسل:  { phone, password }
backend يتوقع:    { email, password }
backend يبحث:     vendorModel.findOne({ email })
Vendor entity:   لا يحتوي على email مطلوب، بل phone
```

### 2.2 الخيارات

#### الخيار أ: تعديل الباك إند (مُوصى به)

**السبب:** كيان Vendor في الباك إند يعتمد على `phone` كمعرف رئيسي، وهو المنطق المستخدم في التطبيق.

**التعديلات المطلوبة:**

1. **`backend-nest/src/modules/vendor/vendor.controller.ts`**
   ```typescript
   // قبل
   async vendorLogin(@Body() loginDto: { email: string; password: string }) {
     return this.vendorService.vendorLogin(loginDto.email, loginDto.password);
   }

   // بعد
   async vendorLogin(@Body() loginDto: { phone: string; password: string }) {
     return this.vendorService.vendorLogin(loginDto.phone, loginDto.password);
   }
   ```

2. **`backend-nest/src/modules/vendor/vendor.service.ts`**
   ```typescript
   // قبل
   async vendorLogin(email: string, password: string) {
     const vendor = await this.vendorModel.findOne({ email }).select('+password');

   // بعد
   async vendorLogin(phone: string, password: string) {
     const vendor = await this.vendorModel.findOne({ phone }).select('+password');
   ```

3. **إنشاء DTO للتحقق:**
   ```typescript
   // backend-nest/src/modules/vendor/dto/vendor-login.dto.ts
   import { IsString, IsNotEmpty, Matches } from 'class-validator';

   export class VendorLoginDto {
     @IsString()
     @IsNotEmpty()
     @Matches(/^[0-9]{7,15}$/, { message: 'رقم الهاتف غير صالح' })
     phone: string;

     @IsString()
     @IsNotEmpty()
     password: string;
   }
   ```

#### الخيار ب: تعديل vendor-app

إذا كان النظام يعتمد على البريد الإلكتروني:
- استبدال حقل `phone` بحقل `email` في شاشة تسجيل الدخول
- تحديث `handleLogin` ليرسل `email` بدلاً من `phone`

### 2.3 استجابة تسجيل الدخول

التأكد من أن التطبيق يتعامل مع الشكل الصحيح:

```typescript
// الباك إند يرجع:
{
  user: { _id, fullName, phone, store, ... },  // أو vendor
  token: string,
  type: 'vendor'
}
```

**تحقق:** LoginScreen يحفظ `res.data.vendor` — الباك إند قد يرجع `res.data.user`. مراجعة vendor.service لمعرفة المفتاح الفعلي.

---

## 3. إصلاح مسارات Merchant API

### 3.1 جدول التعديلات

| الدالة | المسار الحالي | المسار الصحيح |
|--------|---------------|----------------|
| getMyProducts | `/merchant/${merchantId}/products` | `/merchants/${merchantId}/products` |
| getProduct | `/merchant/products/${productId}` | `/merchants/products/${productId}` |
| createProduct | `/merchant/products` | `/merchants/products` |
| updateProduct | `/merchant/products/${productId}` | `/merchants/products/${productId}` |
| deleteProduct | `/merchant/products/${productId}` | `/merchants/products/${productId}` |
| updateStock | `/merchant/products/${productId}/stock` | `/merchants/products/${productId}/stock` |
| getCatalogProducts | `/merchant/catalog/products` | `/merchants/catalog/products` |

### 3.2 الملف: `vendor-app/src/api/merchant.ts`

**استبدال جميع المسارات:**
- `merchant` → `merchants`

---

## 4. إصلاح منطق Vendor vs Merchant

### 4.1 الفرق بين الكيانين

| Vendor | Merchant |
|--------|----------|
| تاجر له متجر (store) | كيان إدارة المنتجات |
| يسجل دخول بالهاتف | مرتبط بـ Vendor عبر `vendor` field |
| يستخدم في Orders | يستخدم في MerchantProduct |

### 4.2 الخيارات

#### الخيار أ: إضافة endpoint بالباك إند

```
GET /merchants/by-vendor/:vendorId
→ يرجع Merchant المرتبط بهذا Vendor
```

**الاستخدام في التطبيق:**
1. عند تسجيل الدخول، جلب أو إنشاء Merchant المرتبط بـ Vendor
2. حفظ `merchantId` في UserContext أو AsyncStorage
3. استخدام `merchantId` في `getMyProducts` بدلاً من `user._id`

#### الخيار ب: دعم vendorId في الباك إند

تعديل `findMerchantProducts` في merchant.service ليقبل:
- `merchantId` مباشرة، أو
- `vendorId` مع البحث عن Merchant المرتبط

```typescript
// في merchant.controller - إضافة endpoint جديد
@Get('vendor/:vendorId/products')
async getVendorProducts(@Param('vendorId') vendorId: string, ...) {
  const merchant = await this.merchantModel.findOne({ vendor: vendorId });
  if (!merchant) throw new NotFoundException('لا يوجد تاجر مرتبط');
  return this.merchantService.findMerchantProducts(merchant._id, ...);
}
```

#### الخيار ج: ربط تلقائي عند إنشاء Vendor

عند إنشاء Vendor، إنشاء Merchant تلقائياً وربطه.
- يتطلب تعديلات على عملية إنشاء Vendor
- بعدها يمكن استخدام `vendorId` للبحث عن Merchant

### 4.3 التعديلات في vendor-app

**إذا تم اعتماد الخيار ب:**

1. إضافة في `merchant.ts`:
   ```typescript
   export const getVendorProducts = async (vendorId: string, storeId?: string) => {
     const { data } = await axiosInstance.get(
       `/merchants/vendor/${vendorId}/products`,
       { params: { storeId } }
     );
     return data;
   };
   ```

2. في `ProductsScreen.tsx`:
   ```typescript
   // قبل
   const data = await merchantApi.getMyProducts(user._id);

   // بعد
   const data = await merchantApi.getVendorProducts(user._id);
   ```

**إذا تم اعتماد الخيار أ:**

1. إضافة خدمة لجلب merchantId:
   ```typescript
   export const getMerchantByVendor = async (vendorId: string) => {
     const { data } = await axiosInstance.get(`/merchants/by-vendor/${vendorId}`);
     return data;
   };
   ```

2. في UserContext أو عند تسجيل الدخول، جلب وحفظ `merchantId`.

---

## 5. إصلاح Support API

### 5.1 تصحيح الاستيراد

**الملف:** `vendor-app/src/api/support.ts`

```typescript
// قبل (خاطئ)
import { axiosInstance } from './axiosInstance';

// بعد (صحيح)
import axiosInstance from './axiosInstance';
```

### 5.2 التحقق من GetTickets

الباك إند `getTickets` يقبل `GetTicketsQueryDto`. مراجعة:
- هل يتطلب `userId` أو `userModel`؟
- هل يعيد تذاكر المستخدم الحالي تلقائياً من الـ token؟

إذا كان التطبيق يمرر معلومات المستخدم، التأكد من توافقها مع ما يتوقعه الباك إند.

### 5.3 شكل الاستجابة

التأكد من أن التطبيق يتعامل مع الشكل الموحد:

```typescript
{
  success: true,
  data: SupportTicket | SupportTicket[],
  meta?: { ... }
}
```

إذا كان الباك إند يغلف النتائج في `data`، استخراج `response.data.data` عند الحاجة.

---

## 6. معالجة استجابة API الموحدة

### 6.1 شكل استجابة الباك إند

```typescript
{
  success: boolean;
  message?: string;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
  pagination?: PaginationMeta;
}
```

### 6.2 نقاط التحقق

| ملف API | هل يستخرج data بشكل صحيح؟ |
|---------|---------------------------|
| vendor.ts | `return data` — قد يكون `data` هو الـ wrapper كاملاً |
| orders.ts | `return data` — نفس الملاحظة |
| merchant.ts | `return data` — نفس الملاحظة |
| promotions.ts | `return data` — نفس الملاحظة |
| support.ts | `return response.data` — قد يحتاج `response.data.data` |

### 6.3 إنشاء دالة مساعدة

```typescript
// vendor-app/src/utils/apiHelpers.ts

export function unwrapResponse<T>(response: any): T {
  const body = response?.data ?? response;
  if (body?.success !== undefined && body?.success === false) {
    throw new Error(body?.error?.message ?? 'Request failed');
  }
  return (body?.data ?? body) as T;
}
```

استخدامها في جميع استدعاءات API لضمان استخراج المحتوى الفعلي.

---

## 7. التحقق والاختبار

### 7.1 قائمة التحقق

- [ ] تسجيل الدخول يعمل بـ phone + password
- [ ] جلب بيانات التاجر `/vendors/me` يعمل
- [ ] جلب الطلبات `/delivery/order/vendor/orders` يعمل
- [ ] قبول/إلغاء الطلب يعمل
- [ ] جلب المنتجات يعمل (بعد حل merchantId)
- [ ] إضافة/تعديل/حذف منتج يعمل
- [ ] تحديث المخزون يعمل
- [ ] جلب منتجات الكتالوج يعمل
- [ ] العروض الترويجية تعمل
- [ ] إنشاء تذكرة دعم يعمل
- [ ] جلب التذاكر يعمل
- [ ] إضافة رسالة للتذكرة يعمل

### 7.2 سيناريوهات اختبار

1. **تسجيل الدخول:** المستخدم يدخل رقم هاتف وكلمة مرور → يحصل على token ويُوجّه للوحة التحكم
2. **المنتجات:** التاجر يفتح شاشة المنتجات → تُعرض منتجات متجره
3. **الطلبات:** التاجر يفتح الطلبات → يُعرض قائمة الطلبات ويستطيع قبول/رفض
4. **الدعم:** التاجر يفتح الدعم → يرى تذاكره ويستطيع إنشاء تذكرة جديدة

---

## 8. جدول زمني مقترح

| المرحلة | المهام | الوقت المقدر |
|---------|--------|---------------|
| **المرحلة 1** | إصلاح تسجيل الدخول (الباك إند) | 1–2 ساعات |
| **المرحلة 2** | إصلاح مسارات Merchant في vendor-app | 30 دقيقة |
| **المرحلة 3** | إصلاح Vendor/Merchant (الباك إند + vendor-app) | 2–3 ساعات |
| **المرحلة 4** | إصلاح Support API | 15 دقيقة |
| **المرحلة 5** | معالجة استجابة API الموحدة | 1 ساعة |
| **المرحلة 6** | التحقق والاختبار الشامل | 1–2 ساعة |

**الإجمالي:** حوالي 6–9 ساعات عمل.

---

## ملحق: الملفات المتأثرة

### Backend (backend-nest)

- `src/modules/vendor/vendor.controller.ts`
- `src/modules/vendor/vendor.service.ts`
- `src/modules/vendor/dto/` (إنشاء vendor-login.dto.ts)
- `src/modules/merchant/merchant.controller.ts` (اختياري - endpoint جديد)
- `src/modules/merchant/services/merchant.service.ts` (اختياري)

### Vendor-App

- `src/api/merchant.ts`
- `src/api/support.ts`
- `src/screens/LoginScreen.tsx` (إذا تم تعديل التطبيق بدل الباك إند)
- `src/screens/ProductsScreen.tsx`
- `src/screens/AddProductScreen.tsx`
- `src/screens/CatalogProductPickerScreen.tsx` (إن وجد)
- `src/utils/apiHelpers.ts`
- `src/hooks/userContext.tsx` (إذا أضفنا merchantId)

---

*تم إعداد هذه الخطة بناءً على تحليل الكود في 2025-02-12*
