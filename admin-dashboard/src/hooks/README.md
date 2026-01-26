# 🪝 Admin API Hooks

## 📚 المحتويات

- `useAdminAPI.ts` - Hook رئيسي موحد لجميع API calls
- `examples/` - أمثلة شاملة للاستخدام

---

## 🚀 useAdminAPI

Hook موحد للتعامل مع جميع Admin Endpoints بطريقة type-safe.

### الميزات

✅ **Type-safe** - استخدام كامل للـ TypeScript  
✅ **Flexible** - يدعم GET, POST, PATCH, DELETE  
✅ **Error Handling** - معالجة أخطاء شاملة  
✅ **Loading States** - إدارة حالات التحميل  
✅ **Callbacks** - onSuccess و onError  

---

## 📖 الاستخدام الأساسي

### 1. استيراد الـ Hook

```typescript
import { useAdminAPI } from '@/hooks/useAdminAPI';
import { ALL_ADMIN_ENDPOINTS } from '@/config/admin-endpoints';
```

### 2. استخدام بسيط

```typescript
function MyComponent() {
  const { callEndpoint, loading, error, data } = useAdminAPI();

  async function fetchData() {
    const endpoint = ALL_ADMIN_ENDPOINTS.find(
      (ep) => ep.id === 'admin-dashboard'
    );

    const result = await callEndpoint(endpoint!);
    console.log(result);
  }

  return (
    <button onClick={fetchData} disabled={loading}>
      {loading ? 'جاري التحميل...' : 'جلب البيانات'}
    </button>
  );
}
```

---

## 🎯 الأنماط المتقدمة

### Pattern 1: useAdminQuery (للـ GET requests)

```typescript
import { useAdminQuery } from '@/hooks/useAdminAPI';

function DriversList() {
  const endpoint = ALL_ADMIN_ENDPOINTS.find(
    (ep) => ep.id === 'admin-drivers-all'
  );

  const { data, loading, refetch } = useAdminQuery(
    endpoint!,
    { query: { page: '1', limit: '20' } },
    { enabled: true }
  );

  if (loading) return <CircularProgress />;

  return (
    <div>
      <h2>السائقين: {data?.total}</h2>
      <button onClick={refetch}>تحديث</button>
    </div>
  );
}
```

### Pattern 2: useAdminMutation (للـ POST/PATCH/DELETE)

```typescript
import { useAdminMutation } from '@/hooks/useAdminAPI';

function CreateMarketer() {
  const endpoint = ALL_ADMIN_ENDPOINTS.find(
    (ep) => ep.handler === 'createMarketer'
  );

  const { mutate, loading } = useAdminMutation(endpoint!, {
    onSuccess: () => alert('تم الإنشاء'),
  });

  async function handleSubmit(formData: any) {
    await mutate(formData);
  }

  return (
    <button onClick={() => handleSubmit({ name: 'أحمد' })} disabled={loading}>
      إنشاء مسوق
    </button>
  );
}
```

### Pattern 3: مع Parameters

```typescript
async function updateDriver(driverId: string) {
  const endpoint = ALL_ADMIN_ENDPOINTS.find(
    (ep) => ep.handler === 'updateDriver'
  );

  await callEndpoint(endpoint!, {
    params: { id: driverId }, // سيتم استبدال :id في URL
    body: { status: 'active' },
    query: { notify: 'true' },
  });
}
```

---

## 🔧 الـ API Reference

### useAdminAPI()

```typescript
interface UseAdminAPIOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  showSuccessMessage?: boolean;
  showErrorMessage?: boolean;
}

const {
  callEndpoint,
  loading,
  error,
  data,
  reset,
} = useAdminAPI(options?);
```

### callEndpoint()

```typescript
interface CallEndpointConfig {
  params?: Record<string, string>;    // URL params (:id)
  body?: any;                         // Request body
  query?: Record<string, string>;     // Query params (?page=1)
  headers?: Record<string, string>;   // Custom headers
}

const data = await callEndpoint<T>(
  endpoint: AdminEndpoint,
  config?: CallEndpointConfig
): Promise<T>;
```

### useAdminQuery()

```typescript
const {
  data,
  loading,
  error,
  refetch,
} = useAdminQuery<T>(
  endpoint: AdminEndpoint,
  config?: CallEndpointConfig,
  options?: UseAdminAPIOptions & { enabled?: boolean }
);
```

### useAdminMutation()

```typescript
const {
  mutate,
  loading,
  error,
  data,
  reset,
} = useAdminMutation<TData, TVariables>(
  endpoint: AdminEndpoint,
  options?: UseAdminAPIOptions
);

await mutate(variables?, config?);
```

---

## 💡 أمثلة عملية

راجع `examples/useAdminAPI-examples.tsx` للحصول على 9 أمثلة شاملة:

1. ✅ استخدام أساسي
2. ✅ GET Request مع Auto-fetch
3. ✅ POST Request (Create)
4. ✅ PATCH Request (Update)
5. ✅ استخدام مع Parameters
6. ✅ Error Handling متقدم
7. ✅ استخدام في صفحة كاملة
8. ✅ التكامل مع React Query
9. ✅ إنشاء Custom Hooks

---

## 🧪 صفحة الاختبار

تم إنشاء صفحة اختبار كاملة:

```
src/pages/admin/test/ApiTestPage.tsx
```

يمكنك الوصول إليها عبر:

```
http://localhost:5173/admin/test/api
```

---

## 🔗 الاستخدام مع Existing Code

### التكامل مع useDrivers

```typescript
// قديم:
import { useDrivers } from '@/hooks/useDrivers';
const { drivers, loading } = useDrivers();

// جديد (باستخدام useAdminAPI):
import { useAdminQuery } from '@/hooks/useAdminAPI';
import { ALL_ADMIN_ENDPOINTS } from '@/config/admin-endpoints';

const endpoint = ALL_ADMIN_ENDPOINTS.find(ep => ep.id === 'admin-drivers-all');
const { data: drivers, loading } = useAdminQuery(endpoint!, {
  query: { page: '1', limit: '20' }
});
```

### إنشاء Custom Hook للـ Drivers

```typescript
// src/hooks/useDriversAPI.ts
import { useAdminAPI } from './useAdminAPI';
import { ALL_ADMIN_ENDPOINTS } from '@/config/admin-endpoints';

export function useDriversAPI() {
  const { callEndpoint } = useAdminAPI();

  const getAllDrivers = async (query?: Record<string, string>) => {
    const endpoint = ALL_ADMIN_ENDPOINTS.find(
      (ep) => ep.id === 'admin-drivers-all'
    );
    return callEndpoint(endpoint!, { query });
  };

  const getDriverDetails = async (driverId: string) => {
    const endpoint = ALL_ADMIN_ENDPOINTS.find(
      (ep) => ep.id === 'admin-driver-details'
    );
    return callEndpoint(endpoint!, { params: { id: driverId } });
  };

  return { getAllDrivers, getDriverDetails };
}

// الاستخدام:
const driversAPI = useDriversAPI();
const drivers = await driversAPI.getAllDrivers({ page: '1' });
```

---

## 🐛 حل المشاكل

### المشكلة: `Cannot find module '@/hooks/useAdminAPI'`

**الحل:**
```bash
# أعد تشغيل dev server
npm run dev
```

### المشكلة: TypeScript errors في import.meta.env

**الحل:**
تأكد من وجود `vite/client` types في `tsconfig.app.json`:
```json
{
  "compilerOptions": {
    "types": ["vite/client"]
  }
}
```

### المشكلة: Network Error

**الحل:**
تحقق من `.env`:
```env
VITE_API_BASE_URL=https://api.bthwani.com/api/v1
```

---

## 🎨 Best Practices

### 1. استخدم Type Generics

```typescript
interface Driver {
  _id: string;
  fullName: string;
}

const { data } = useAdminQuery<{ data: Driver[] }>(endpoint);
// الآن data.data له type صحيح
```

### 2. استخدم Callbacks للـ Side Effects

```typescript
const { mutate } = useAdminMutation(endpoint, {
  onSuccess: (data) => {
    // إعادة جلب القوائم
    refetchDrivers();
    // إغلاق Modal
    closeModal();
    // رسالة نجاح
    toast.success('تم الحفظ');
  },
});
```

### 3. أنشئ Custom Hooks لكل Module

```typescript
// useMarketersAPI.ts
// useWithdrawalsAPI.ts
// useStoresAPI.ts
// useOnboardingAPI.ts
```

### 4. استخدم React Query للـ Caching

```typescript
import { useQuery } from '@tanstack/react-query';

const { data } = useQuery({
  queryKey: ['drivers', page],
  queryFn: () => callEndpoint(endpoint, { query: { page } }),
  staleTime: 5 * 60 * 1000, // 5 دقائق
});
```

---

## 📊 الأداء

### Tips لتحسين الأداء:

1. **استخدم React Query** - للـ caching والـ background refetching
2. **Debounce Search Inputs** - لتقليل الـ API calls
3. **Pagination** - استخدم limit و page
4. **Lazy Loading** - حمّل البيانات عند الحاجة فقط

---

## 🔄 التحديثات المستقبلية

- [ ] إضافة Retry Logic
- [ ] إضافة Request Cancellation
- [ ] إضافة Optimistic Updates
- [ ] إضافة Offline Support
- [ ] إضافة Request Queue

---

## 📚 الموارد

- [Config Documentation](../config/README.md)
- [Examples](./examples/useAdminAPI-examples.tsx)
- [Test Page](../pages/admin/test/ApiTestPage.tsx)
- [Integration Plan](../../docs/INTEGRATION_ACTION_PLAN.md)

---

**Last Updated:** 15 أكتوبر 2025

