# دليل تشغيل موقع الويب محليًا (Local Development)

## متطلبات النظام
- **Node.js**: v16 أو أحدث
- **Git**: لاستنساخ المشروع

## خطوات الإعداد

### 1. استنساخ المشروع وتثبيت التبعيات
```bash
git clone <repository-url>
cd bthwani-web
npm install
```

### 2. إعداد متغيرات البيئة
انسخ ملف `.env.example` إلى `.env` وقم بتعديل القيم حسب البيئة المحلية:

```bash
cp .env.example .env
```

### 3. المتغيرات البيئية المطلوبة

#### رابط API
```env
VITE_API_URL=http://localhost:3000/api/v1
```

#### إعدادات Firebase (للإشعارات)
```env
VITE_FIREBASE_API_KEY=your-dev-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-dev-domain.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-dev-project-id
VITE_FIREBASE_VAPID_KEY=your-dev-vapid-key
```

#### إعدادات Google Maps (للخرائط)
```env
VITE_GOOGLE_MAPS_API_KEY=your-dev-google-maps-key
VITE_GOOGLE_MAPS_MAP_ID=your-dev-map-id
```

#### إعدادات التتبع والتحليلات
```env
VITE_SENTRY_DSN=your-dev-sentry-dsn
VITE_POSTHOG_KEY=your-dev-posthog-key
VITE_POSTHOG_HOST=https://app.posthog.com
```

#### إعدادات أخرى
```env
VITE_APP_VERSION=1.0.0
VITE_REALTIME_URL=http://localhost:3000
```

### 4. تشغيل المشروع في وضع التطوير

#### تشغيل مع إعادة التحميل التلقائي
```bash
npm run dev
```

سيقوم هذا بالتشغيل على المنفذ الافتراضي 5173 مع إعادة التحميل التلقائي عند تغيير الملفات.

#### تشغيل في وضع المعاينة (إنتاج محلي)
```bash
npm run build
npm run preview
```

## اختبار التشغيل

### 1. فحص حالة الخدمة
بعد التشغيل، يجب أن يكون الموقع متاحًا على:
```
http://localhost:5173
```

### 2. فحص الاتصال بـ API
تأكد من أن الخلفية تعمل على `http://localhost:3000` وأن API متاح:
```bash
curl http://localhost:3000/health
```

### 3. فحص السجلات (Console Logs)
في وضع التطوير، ستظهر السجلات في الكونسول ومتصفح DevTools. ابحث عن:
```
✅ Vite dev server running on http://localhost:5173
✅ Connected to API at http://localhost:3000/api/v1
✅ Firebase initialized successfully (إذا كان مفعلاً)
✅ Google Maps loaded successfully (إذا كان مفعلاً)
```

### 4. اختبار الوظائف الأساسية
1. اذهب إلى الصفحة الرئيسية: `http://localhost:5173/`
2. اختبر تسجيل دخول المستخدم (تأكد من وجود حساب مستخدم في قاعدة البيانات)
3. اختبر البحث عن المنتجات
4. اختبر إضافة منتجات إلى السلة
5. اختبر عملية الدفع (إذا كانت متاحة)

## استكشاف الأخطاء

### مشاكل شائعة وحلولها:

#### خطأ في الاتصال بـ API
```
❌ Failed to fetch API endpoints
```
**الحل**: تأكد من أن الخلفية تعمل على المنفذ 3000 وأن `VITE_API_URL` صحيح.

#### مشكلة في متغيرات البيئة
```
❌ import.meta.env.VITE_API_URL is undefined
```
**الحل**: تأكد من وجود ملف `.env` وأنه يحتوي على `VITE_API_URL` الصحيح.

#### مشكلة في المنفذ
```
❌ Error: listen EADDRINUSE: address already in use :::5173
```
**الحل**: أغلق أي خدمة تستخدم المنفذ 5173 أو غير المنفذ في متغيرات البيئة.

#### مشكلة في Google Maps (إذا كان مفعلاً)
```
❌ Google Maps API error
```
**الحل**: تأكد من صحة مفتاح Google Maps API في `.env`.

## ملاحظات مهمة للتطوير

### 1. هيكل المشروع
- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + Emotion
- **State Management**: Zustand + React Query
- **Routing**: React Router v7
- **Internationalization**: i18next

### 2. ملفات مهمة للتطوير
- `src/App.tsx` - نقطة البداية الرئيسية
- `src/pages/` - صفحات التطبيق
- `src/components/` - المكونات المشتركة
- `src/api/` - دوال API
- `src/features/` - ميزات محددة (خدمات، منتجات، إلخ)

### 3. أدوات التطوير
- **ESLint**: لفحص جودة الكود
- **TypeScript**: للتحقق من الأنواع
- **Tailwind CSS**: للتصميم السريع
- **Vitest**: للاختبارات (إذا كان مفعلاً)

### 4. سير العمل المقترح
1. شغل الخلفية أولاً: `cd Backend && npm run dev`
2. شغل موقع الويب: `cd bthwani-web && npm run dev`
3. اختبر التكامل بين الواجهة الأمامية والخلفية

## نصائح للتطوير الفعال

1. **استخدم Developer Tools**: فعل React DevTools في المتصفح
2. **راقب Network Tab**: لمراقبة طلبات API
3. **استخدم Hot Reload**: استفد من إعادة التحميل التلقائي
4. **اختبر الاستجابة**: اختبر على أحجام شاشات مختلفة
5. **راقب الأداء**: استخدم أدوات قياس الأداء في DevTools

## استكشاف الأخطاء المتقدمة

### مشكلة في البناء
```bash
# لحل مشاكل البناء الشائعة:
npm run build  # محاولة البناء
# إذا فشل، جرب:
rm -rf node_modules package-lock.json
npm install
npm run build
```

### مشكلة في التبعيات
```bash
# تحديث جميع التبعيات:
npm update

# فحص التبعيات المفقودة:
npm ls --depth=0
```

### مشكلة في Firebase
```bash
# تأكد من إعداد Firebase بشكل صحيح:
1. تفعيل Authentication في Firebase Console
2. تفعيل Firestore Database
3. إضافة مفتاح VAPID للإشعارات
4. السماح للنطاق localhost في Firebase
```

## موارد مفيدة

- **Vite Documentation**: https://vitejs.dev/
- **React Documentation**: https://react.dev/
- **Tailwind CSS Docs**: https://tailwindcss.com/
- **Firebase Docs**: https://firebase.google.com/docs
