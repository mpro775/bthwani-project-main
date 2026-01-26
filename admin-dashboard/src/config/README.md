# 📁 Config Directory

## 📄 الملفات

### `admin-endpoints.ts`
ملف تكوين شامل يحتوي على جميع Admin Endpoints من الـ Backend.

**المحتويات:**
- ✅ 110 Admin Endpoints
- ✅ 12 Modules
- ✅ Type definitions كاملة
- ✅ Helper functions

**الاستخدام:**

```typescript
import { 
  ADMIN_ENDPOINTS_BY_MODULE,
  ALL_ADMIN_ENDPOINTS,
  buildEndpointUrl,
  hasPermission,
  getEndpointsByModule 
} from '@/config/admin-endpoints';

// 1. الحصول على كل الـ endpoints
const allEndpoints = ALL_ADMIN_ENDPOINTS;

// 2. الحصول على endpoints حسب module
const driversModule = ADMIN_ENDPOINTS_BY_MODULE.drivers;
const driversEndpoints = driversModule.endpoints;

// 3. بناء URL
const endpoint = ALL_ADMIN_ENDPOINTS[0];
const url = buildEndpointUrl(endpoint);
// النتيجة: https://api.bthwani.com/api/v1/admin/dashboard

// 4. بناء URL مع parameters
const url2 = buildEndpointUrl(endpoint, { id: '12345' });
// النتيجة: https://api.bthwani.com/api/v1/admin/drivers/12345

// 5. التحقق من الصلاحيات
const userRoles = ['admin'];
const canAccess = hasPermission(userRoles, endpoint);

// 6. Filter endpoints حسب الصلاحيات
import { filterEndpointsByPermissions } from '@/config/admin-endpoints';
const allowedEndpoints = filterEndpointsByPermissions(['admin']);
```

## 🔧 Environment Variables

يحتاج الملف إلى متغير بيئة واحد:

```env
# .env
VITE_API_BASE_URL=https://api.bthwani.com/api/v1
```

إذا لم يتم تعريفه، سيستخدم القيمة الافتراضية: `https://api.bthwani.com/api/v1`

## 📊 الإحصائيات

```typescript
import { ENDPOINTS_STATS } from '@/config/admin-endpoints';

console.log(ENDPOINTS_STATS);
// {
//   total: 110,
//   byMethod: {
//     GET: 56,
//     POST: 31,
//     PATCH: 18,
//     DELETE: 5
//   },
//   modules: 12
// }
```

## 🎯 الـ Modules المتاحة

```
- admin: الإدارة العامة
- drivers: إدارة السائقين
- withdrawals: طلبات السحب
- stores: إدارة المتاجر
- marketers: إدارة المسوقين
- onboarding: طلبات الانضمام
- analytics: التحليلات
- finance: النظام المالي
- akhdimni: خدمة أخدمني
- merchant: إدارة الشركاء
- content: إدارة المحتوى
- er: الموارد البشرية
```

## 🔄 التحديث

لتحديث الملف بعد تغييرات في الـ Backend:

```bash
cd backend-nest
npm run docs:endpoints

cd ../admin-dashboard
cp ../backend-nest/docs/admin-endpoints.ts src/config/
cp ../backend-nest/docs/admin-endpoints.json public/data/
```

## ✅ الاختبار

```bash
# تشغيل الاختبارات
npm run dev

# ثم في console المتصفح:
import('@/config/test-endpoints')
```

---

**Last Updated:** 15 أكتوبر 2025  
**Source:** `backend-nest/docs/admin-endpoints.ts`

