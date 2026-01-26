# دليل تشغيل تطبيق السائقين محليًا (Local Development)

## نظرة عامة
تطبيق السائقين مشابه للتطبيق الرئيسي ولكن مع ميزات خاصة بالسائقين مثل تتبع الطلبات والتنقل والتقييمات.

## متطلبات النظام
- **Node.js**: v16 أو أحدث
- **Expo CLI**: `npm install -g @expo/cli`
- **Git**: لاستنساخ المشروع

## خطوات الإعداد

### 1. استنساخ المشروع وتثبيت التبعيات
```bash
git clone <repository-url>
cd rider-app
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
EXPO_PUBLIC_RIDER_API_URL=http://localhost:3000/api/v1/riders
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

### اختبار على الهاتف
استخدم Expo Go أو محاكي Android/iOS للاختبار.

## ميزات خاصة بالسائقين
- تتبع حالة الطلبات في الوقت الفعلي
- نظام التنقل والخرائط
- إدارة حالة السائق (متاح/مشغول/غير متاح)
- نظام التقييمات والمراجعات
- إدارة الملف الشخصي والمركبة

## اختبار الوظائف الأساسية
1. تسجيل دخول السائق
2. تحديث حالة السائق إلى "متاح"
3. استقبال طلبات جديدة
4. قبول/رفض الطلبات
5. تتبع التنقل أثناء التوصيل
6. إتمام الطلب وتحديث الحالة

## استكشاف الأخطاء
نفس المشاكل والحلول في دليل التطبيق الرئيسي مع التركيز على:
- اختبار التنقل والخرائط
- اختبار الإشعارات اللحظية للطلبات الجديدة
- اختبار تتبع الموقع الجغرافي

## موارد مفيدة
- **Expo Documentation**: https://docs.expo.dev/
- **React Native Maps**: https://github.com/react-native-maps/react-native-maps
- **Background Location**: https://docs.expo.dev/versions/latest/sdk/location/
