# دليل تشغيل تطبيق التجار محليًا (Local Development)

## نظرة عامة
تطبيق التجار مصمم خصيصًا للتجار وأصحاب المتاجر مع ميزات إدارة المنتجات والطلبات والتحليلات.

## متطلبات النظام
- **Node.js**: v16 أو أحدث
- **Expo CLI**: `npm install -g @expo/cli`
- **Git**: لاستنساخ المشروع

## خطوات الإعداد

### 1. استنساخ المشروع وتثبيت التبعيات
```bash
git clone <repository-url>
cd vendor-app
npm install
```

### 2. إعداد متغيرات البيئة
انسخ ملف `.env.example` إلى `.env` وقم بتعديل القيم:

```bash
cp .env.example .env
```

### 3. المتغيرات البيئية المطلوبة

#### رابط API
```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api/v1
EXPO_PUBLIC_VENDOR_API_URL=http://localhost:3000/api/v1/vendors
```

#### إعدادات Firebase
```env
EXPO_PUBLIC_FIREBASE_API_KEY=your-dev-firebase-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-dev-domain.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-dev-project-id
EXPO_PUBLIC_FIREBASE_VAPID_KEY=your-dev-vapid-key
```

#### إعدادات Google Maps (اختيارية)
```env
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your-dev-google-maps-key
```

#### إعدادات التتبع
```env
EXPO_PUBLIC_SENTRY_DSN=your-dev-sentry-dsn
EXPO_PUBLIC_APP_VERSION=1.0.0
EXPO_PUBLIC_REALTIME_URL=http://localhost:3000
EXPO_PUBLIC_ENVIRONMENT=development
```

## تشغيل المشروع

### تشغيل في وضع التطوير
```bash
npx expo start
```

## ميزات خاصة بالتجار
- إدارة كتالوج المنتجات
- تتبع الطلبات والمبيعات
- نظام التقييمات والمراجعات
- تحليلات المبيعات والأرباح
- إدارة المخزون والأسعار
- نظام التواصل مع العملاء

## اختبار الوظائف الأساسية
1. تسجيل دخول التاجر
2. إضافة/تعديل المنتجات
3. استقبال وإدارة الطلبات
4. تحديث حالة الطلبات
5. مراجعة التحليلات والتقارير
6. إدارة الملف الشخصي للمتجر

## موارد مفيدة
- **Expo Documentation**: https://docs.expo.dev/
- **Vendor Management**: https://stripe.com/docs/payments/quickstart
