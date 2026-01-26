# Utility API Files - توضيح

## ⚠️ تنبيه مهم

يوجد ملفان مختلفان في هذا المجلد:

### 1. `utility.ts` (القديم - Errands Service)
**الغرض:** خدمات المهام والطلبات العامة (errands)

**Endpoints:**
- `POST /utility/order` - إنشاء طلب مهمة
- `GET /utility/orders/user/:userId` - طلبات المستخدم
- `GET /utility/order/:orderId` - تفاصيل طلب
- `PATCH /utility/order/:orderId/status` - تحديث حالة
- `PATCH /utility/order/:orderId/cancel` - إلغاء طلب
- `POST /utility/order/:orderId/rate` - تقييم

**الاستخدام:**
```typescript
import { createUtilityOrder } from './api/utility';

// إنشاء طلب مهمة
await createUtilityOrder({
  title: "تصليح كهرباء",
  description: "...",
  category: "electrical",
  urgency: "high"
});
```

**⚠️ ملاحظة:** هذه الـ endpoints **ليست** للغاز والماء!

---

### 2. `utility-pricing.ts` (الجديد - Gas & Water)
**الغرض:** تسعير وحسابات الغاز والماء

**Endpoints:**
- `GET /utility/options` - الحصول على خيارات التسعير
- `POST /utility/calculate-price` - حساب سعر الغاز أو الماء

**الاستخدام:**
```typescript
import { getUtilityOptions, calculateUtilityPrice } from './api/utility-pricing';

// الحصول على أسعار الغاز والماء
const options = await getUtilityOptions('صنعاء');
console.log(options.gas?.pricePerCylinder);
console.log(options.water?.sizes);

// حساب السعر
const price = await calculateUtilityPrice({
  serviceType: 'gas',
  city: 'صنعاء',
  quantity: 2
});
```

---

## متى تستخدم أي منهما؟

### استخدم `utility.ts` عندما:
- ✅ تريد إنشاء طلب مهمة/errand
- ✅ تريد عرض طلبات المهام للمستخدم
- ✅ تريد تحديث حالة طلب مهمة
- ✅ تريد تقييم خدمة مهمة

### استخدم `utility-pricing.ts` عندما:
- ✅ تريد عرض أسعار الغاز والماء
- ✅ تريد حساب تكلفة طلب غاز أو ماء
- ✅ تريد عرض خيارات الأحجام للماء
- ✅ تريد معرفة سياسة التسعير (نصف وايت، رسوم توصيل، إلخ)

---

## جدول المقارنة

| الميزة | utility.ts | utility-pricing.ts |
|--------|-----------|-------------------|
| **الغرض** | Errands/مهام | Gas & Water |
| **Endpoints** | `/utility/order/*` | `/utility/options`, `/utility/calculate-price` |
| **يدعم إنشاء طلبات؟** | ✅ نعم | ❌ لا (فقط تسعير) |
| **يدعم التقييم؟** | ✅ نعم | ❌ لا |
| **يدعم حساب السعر؟** | ❌ لا | ✅ نعم |
| **متى أُنشئ؟** | القديم | 2025-10-15 (جديد) |

---

## ⚠️ الخلط الشائع

### ❌ خطأ شائع
```typescript
// ❌ خطأ: استخدام utility.ts للغاز والماء
import { createUtilityOrder } from './api/utility';
await createUtilityOrder({ ... }); // هذا لـ errands!
```

### ✅ الصحيح
```typescript
// ✅ صحيح: استخدام utility-pricing.ts للغاز والماء
import { getUtilityOptions } from './api/utility-pricing';
const options = await getUtilityOptions('صنعاء');
```

---

## Backend Endpoints

### Errands (utility.ts)
```
POST   /utility/order
GET    /utility/orders/user/:userId
GET    /utility/order/:orderId
PATCH  /utility/order/:orderId/status
PATCH  /utility/order/:orderId/cancel
POST   /utility/order/:orderId/rate
```

### Gas & Water (utility-pricing.ts)
```
GET    /utility/options
POST   /utility/calculate-price
```

---

## الملاحظات النهائية

1. **لا تحذف `utility.ts`** - لا يزال يستخدم لـ errands
2. **استخدم `utility-pricing.ts`** للغاز والماء فقط
3. **لإنشاء طلب غاز/ماء:** حالياً غير متوفر في bthwani-web (موجود فقط في app-user)
4. **للمستقبل:** قد نحتاج endpoint موحد في order module

---

## انظر أيضاً

- `/UTILITY_ENDPOINTS_CLOSURE.md` - التقرير الكامل
- `backend-nest/src/modules/utility/README.md` - توثيق Backend
- `app-user/src/api/README_UTILITY.md` - توثيق App User

