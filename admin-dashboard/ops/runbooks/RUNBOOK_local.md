# دليل تشغيل لوحة الإدارة محليًا (Local Development)

## متطلبات النظام
- **Node.js**: v16 أو أحدث
- **Git**: لاستنساخ المشروع

## خطوات الإعداد

### 1. استنساخ المشروع وتثبيت التبعيات
```bash
git clone <repository-url>
cd admin-dashboard
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

#### إعدادات Firebase (اختيارية للتطوير)
```env
VITE_FIREBASE_API_KEY=your-dev-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-dev-domain.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-dev-project-id
```

#### إعدادات التطوير
```env
VITE_DEV_MODE=true
VITE_DEBUG=true
```

#### روابط التطبيق والتواصل الاجتماعي
```env
VITE_APP_APP_STORE_URL=https://apps.apple.com/app/bithawani/id1234567890
VITE_APP_GOOGLE_PLAY_URL=https://play.google.com/store/apps/details?id=com.bthwani.app
VITE_APP_APP_GALLERY_URL=#
VITE_APP_APK_DIRECT_URL=#
VITE_APP_WHATSAPP=https://wa.me/967777123456
VITE_APP_PHONE=+967 777 123 456
VITE_APP_EMAIL=info@bthwani.app
VITE_APP_ADDRESS=صنعاء، اليمن
VITE_APP_DEEPLINK=bthwani://open
VITE_APP_FACEBOOK=https://www.facebook.com/bithawani
VITE_APP_INSTAGRAM=https://www.instagram.com/bithawani
VITE_APP_TIKTOK=https://www.tiktok.com/@bithawani
VITE_APP_WEB_APP=https://bthwaniapp.com
```

#### إعدادات إضافية (اختيارية)
```env
VITE_SITE_URL=http://localhost:5173
VITE_CLOUDINARY_CLOUD_NAME=your-cloudinary-name
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
بعد التشغيل، يجب أن تكون لوحة الإدارة متاحة على:
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
```

### 4. اختبار الوظائف الأساسية
1. اذهب إلى صفحة تسجيل الدخول: `http://localhost:5173/auth/login`
2. اختبر تسجيل دخول المدير (تأكد من وجود حساب مدير في قاعدة البيانات)
3. اختبر التنقل بين الصفحات الرئيسية

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

#### مشكلة في Firebase (إذا كان مفعلاً)
```
❌ Firebase configuration error
```
**الحل**: تأكد من صحة مفاتيح Firebase في `.env`.

## ملاحظات مهمة للتطوير

### 1. هيكل المشروع
- **Frontend**: React + TypeScript + Vite
- **UI Library**: Material-UI (MUI) + Ant Design
- **State Management**: React Query للبيانات
- **Routing**: React Router v6
- **Styling**: Emotion + CSS-in-JS

### 2. ملفات مهمة للتطوير
- `src/App.tsx` - نقطة البداية الرئيسية
- `src/pages/` - صفحات التطبيق
- `src/components/` - المكونات المشتركة
- `src/api/` - دوال API
- `src/utils/axios.ts` - إعدادات Axios

### 3. أدوات التطوير
- **ESLint**: لفحص جودة الكود
- **Vitest**: للاختبارات
- **TypeScript**: للتحقق من الأنواع

### 4. سير العمل المقترح
1. شغل الخلفية أولاً: `cd Backend && npm run dev`
2. شغل لوحة الإدارة: `cd admin-dashboard && npm run dev`
3. اختبر التكامل بين الواجهة الأمامية والخلفية

## نصائح للتطوير الفعال

1. **استخدم Developer Tools**: فعل React DevTools وRedux DevTools في المتصفح
2. **راقب Network Tab**: لمراقبة طلبات API
3. **استخدم Hot Reload**: استفد من إعادة التحميل التلقائي
4. **اختبر الاستجابة**: اختبر على أحجام شاشات مختلفة
5. **راقب الأداء**: استخدم أدوات قياس الأداء في DevTools

## استكشاف الأخطاء المتقدمة

### مشكلة في CORS
إذا كانت هناك مشكلة في CORS عند الاتصال بالخلفية:
1. تأكد من إعدادات CORS في الخلفية
2. فحص رؤوس الطلبات في Network Tab

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

## موارد مفيدة

- **Vite Documentation**: https://vitejs.dev/
- **React Documentation**: https://react.dev/
- **Material-UI Docs**: https://mui.com/
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
