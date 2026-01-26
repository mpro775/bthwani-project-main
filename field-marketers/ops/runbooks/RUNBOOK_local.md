# دليل تشغيل تطبيق المندوبين محليًا (Local Development)

## نظرة عامة
تطبيق المندوبين مصمم لفريق التسويق الميداني مع ميزات تتبع العملاء والحملات التسويقية.

## متطلبات النظام
- **Node.js**: v16 أو أحدث
- **Expo CLI**: `npm install -g @expo/cli`
- **Git**: لاستنساخ المشروع

## خطوات الإعداد

### 1. استنساخ المشروع وتثبيت التبعيات
```bash
git clone <repository-url>
cd field-marketers
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
EXPO_PUBLIC_MARKETER_API_URL=http://localhost:3000/api/v1/marketing
```

#### إعدادات Firebase
```env
EXPO_PUBLIC_FIREBASE_API_KEY=your-dev-firebase-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-dev-domain.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-dev-project-id
EXPO_PUBLIC_FIREBASE_VAPID_KEY=your-dev-vapid-key
```

#### إعدادات Google Maps
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

## ميزات خاصة بالمندوبين
- تتبع العملاء والزيارات الميدانية
- إدارة الحملات التسويقية
- نظام التقارير والتحليلات
- تتبع الأهداف والإنجازات
- نظام التواصل مع الفريق
- إدارة الملف الشخصي والمناطق

## اختبار الوظائف الأساسية
1. تسجيل دخول المندوب
2. تحديث حالة المندوب إلى "نشط"
3. إضافة زيارات عملاء جديدة
4. تتبع مسار التنقل
5. إرسال تقارير يومية
6. مراجعة الأهداف والإنجازات

## موارد مفيدة
- **Expo Documentation**: https://docs.expo.dev/
- **Field Marketing Tools**: https://www.hubspot.com/products/crm/field-sales
