# دليل تشغيل تطبيق bThwaniApp محليًا (Local Development)

## متطلبات النظام
- **Node.js**: v16 أو أحدث
- **Expo CLI**: `npm install -g @expo/cli`
- **Git**: لاستنساخ المشروع

## متطلبات إضافية للتطوير
- **Android Studio** (للاختبار على Android)
- **Xcode** (للاختبار على iOS - macOS فقط)
- **Expo Go App** على الهاتف للاختبار السريع

## خطوات الإعداد

### 1. استنساخ المشروع وتثبيت التبعيات
```bash
git clone <repository-url>
cd bThwaniApp
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
EXPO_PUBLIC_API_URL=http://localhost:3000/api/v1
```

#### إعدادات Firebase (للإشعارات)
```env
EXPO_PUBLIC_FIREBASE_API_KEY=your-dev-firebase-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-dev-domain.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-dev-project-id
EXPO_PUBLIC_FIREBASE_VAPID_KEY=your-dev-vapid-key
```

#### إعدادات Google Maps (للخرائط)
```env
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your-dev-google-maps-key
```

#### إعدادات التتبع والتحليلات
```env
EXPO_PUBLIC_SENTRY_DSN=your-dev-sentry-dsn
EXPO_PUBLIC_POSTHOG_KEY=your-dev-posthog-key
EXPO_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

#### إعدادات أخرى
```env
EXPO_PUBLIC_APP_VERSION=1.0.0
EXPO_PUBLIC_REALTIME_URL=http://localhost:3000
EXPO_PUBLIC_ENVIRONMENT=development
```

## تشغيل المشروع في وضع التطوير

### 1. تشغيل مع Expo CLI
```bash
npx expo start
```

سيقوم هذا بالتشغيل على المنفذ الافتراضي 8081 وإنتاج رمز QR للمسح.

### 2. تشغيل على الويب (اختياري)
```bash
npm run web
```

### 3. تشغيل الاختبارات
```bash
npm test
```

## اختبار التطبيق

### 1. استخدام Expo Go (الأسرع)
1. حمل تطبيق Expo Go على هاتفك
2. امسح رمز QR الذي يظهر في الكونسول
3. التطبيق سيعمل على هاتفك مباشرة

### 2. تشغيل على محاكي (Android/iOS)
```bash
# Android
npm run android

# iOS (macOS فقط)
npm run ios
```

### 3. فحص السجلات (Console Logs)
في وضع التطوير، ستظهر السجلات في الكونسول وExpo DevTools. ابحث عن:
```
✅ Expo development server running
✅ Connected to API at http://localhost:3000/api/v1
✅ Firebase initialized successfully
✅ Google Maps loaded successfully
```

### 4. اختبار الوظائف الأساسية
1. اذهب إلى شاشة تسجيل الدخول
2. اختبر تسجيل دخول المستخدم (تأكد من وجود حساب في قاعدة البيانات)
3. اختبر البحث عن المنتجات والخدمات
4. اختبر إضافة منتجات إلى السلة
5. اختبر عملية الدفع (إذا كانت متاحة)
6. اختبر الخرائط والمواقع (إذا كانت متاحة)

## استكشاف الأخطاء

### مشاكل شائعة وحلولها:

#### خطأ في الاتصال بـ API
```
❌ Network request failed
```
**الحل**: تأكد من أن الخلفية تعمل على المنفذ 3000 وأن `EXPO_PUBLIC_API_URL` صحيح.

#### مشكلة في متغيرات البيئة
```
❌ import.meta.env.EXPO_PUBLIC_API_URL is undefined
```
**الحل**: تأكد من وجود ملف `.env` وأنه يحتوي على المتغيرات الصحيحة.

#### مشكلة في المنفذ
```
❌ Error: listen EADDRINUSE: address already in use :::8081
```
**الحل**: أغلق أي خدمة تستخدم المنفذ 8081 أو غير المنفذ في متغيرات البيئة.

#### مشكلة في Google Maps (إذا كان مفعلاً)
```
❌ Google Maps API error
```
**الحل**: تأكد من صحة مفتاح Google Maps API في `.env`.

## ملاحظات مهمة للتطوير

### 1. هيكل المشروع
- **Framework**: Expo + React Native
- **Navigation**: Expo Router
- **State Management**: React Query + AsyncStorage
- **Styling**: React Native Paper + Custom Components
- **Internationalization**: i18next

### 2. ملفات مهمة للتطوير
- `app/` - مجلد الصفحات والتنقل
- `src/components/` - المكونات المشتركة
- `src/api/` - دوال API
- `src/hooks/` - React Hooks المخصصة
- `src/constants/` - الثوابت والتكوينات

### 3. أدوات التطوير
- **Expo DevTools**: لمراقبة الأداء والشبكة
- **React Native Debugger**: لفحص الحالة والـ props
- **Flipper**: لفحص قاعدة البيانات والشبكة

### 4. سير العمل المقترح
1. شغل الخلفية أولاً: `cd Backend && npm run dev`
2. شغل التطبيق: `cd bThwaniApp && npx expo start`
3. اختبر التكامل بين التطبيق والخلفية

## نصائح للتطوير الفعال

1. **استخدم Expo Go**: للاختبار السريع على الهاتف الحقيقي
2. **راقب Metro Bundler**: لمراقبة عملية البناء والأخطاء
3. **استخدم Hot Reload**: استفد من إعادة التحميل التلقائي
4. **اختبر على أجهزة مختلفة**: Android وiOS إذا أمكن
5. **راقب استخدام البطارية**: خاصة مع الخرائط والـ GPS

## استكشاف الأخطاء المتقدمة

### مشكلة في البناء
```bash
# لحل مشاكل البناء الشائعة:
npx expo start --clear

# إذا فشل، جرب:
rm -rf node_modules package-lock.json .expo
npm install
npx expo start
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

- **Expo Documentation**: https://docs.expo.dev/
- **React Native Docs**: https://reactnative.dev/
- **Expo Router**: https://expo.github.io/router/
- **React Native Paper**: https://callstack.github.io/react-native-paper/
