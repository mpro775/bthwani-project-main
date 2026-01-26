# دليل تشغيل تطبيق bThwaniApp على البيئة الإنتاجية (Production)

## نظرة عامة
هذا الدليل يغطي متغيرات البيئة الإنتاجية وإعدادات المراقبة والأمان لتطبيق bThwaniApp في الإنتاج.

## متغيرات البيئة الإنتاجية

### رابط API Production
```env
EXPO_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
```

### إعدادات Firebase Production
```env
EXPO_PUBLIC_FIREBASE_API_KEY=production-firebase-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=yourdomain.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-production-project-id
EXPO_PUBLIC_FIREBASE_VAPID_KEY=production-vapid-key
```

### إعدادات Google Maps (Production)
```env
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=production-google-maps-key
```

### إعدادات التتبع والتحليلات (Production)
```env
EXPO_PUBLIC_SENTRY_DSN=production-sentry-dsn
EXPO_PUBLIC_POSTHOG_KEY=production-posthog-key
EXPO_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### إعدادات أخرى للإنتاج
```env
EXPO_PUBLIC_APP_VERSION=1.0.0
EXPO_PUBLIC_REALTIME_URL=https://api.yourdomain.com
EXPO_PUBLIC_ENVIRONMENT=production
```

## بناء ونشر الإنتاج

### 1. بناء النسخة الإنتاجية

#### بناء للإنتاج:
```bash
eas build --profile production --platform android
eas build --profile production --platform ios
```

### 2. إرسال للمتاجر

#### لـ App Store (iOS):
```bash
eas submit --platform ios --profile production
```

#### لـ Google Play (Android):
```bash
eas submit --platform android --profile production
```

### 3. إدارة التحديثات (OTA Updates)

#### إنشاء تحديث جديد:
```bash
eas update --branch production
```

#### معاينة التحديثات:
```bash
eas update --branch preview
```

## روابط المراقبة والتنبيهات

### 1. حالة التطبيق الأساسية
- **App Store**: https://apps.apple.com/app/bthwani/id1234567890
- **Google Play**: https://play.google.com/store/apps/details?id=com.bthwani.app
- **TestFlight**: https://testflight.apple.com/join/sample

### 2. مراقبة الأداء والأعطال
- **Sentry Dashboard**: https://sentry.io/
- **Firebase Crashlytics**: https://console.firebase.google.com/
- **Google Play Console**: https://play.google.com/console/
- **App Store Connect**: https://appstoreconnect.apple.com/

### 3. مراقبة المستخدمين والتحليلات
- **PostHog Dashboard**: https://app.posthog.com/
- **Firebase Analytics**: https://console.firebase.google.com/
- **Google Analytics**: https://analytics.google.com/

### 4. مراقبة الأداء
- **Expo Dashboard**: https://expo.dev/
- **EAS Build Status**: https://expo.dev/build
- **OTA Updates**: https://expo.dev/eas-update

## إعداد التنبيهات

### 1. تنبيهات الأعطال والأخطاء
- **Crash rate > 5%** في آخر 24 ساعة
- **ANR (Application Not Responding) > 1%**
- **JavaScript errors > 10%** من الجلسات

### 2. تنبيهات الأداء
- **App launch time > 5 seconds**
- **Memory usage > 200MB** في الأجهزة المتوسطة
- **Battery consumption > 20%** في الساعة

### 3. تنبيهات الأمان
- **Suspicious login attempts** من دول غير متوقعة
- **Unusual API usage patterns**
- **Failed authentication > 50** في آخر 10 دقائق

## جداول الصيانة والمراقبة

### المراقبة اليومية (Daily Checks)
- [ ] فحص معدل الأعطال في Sentry
- [ ] مراجعة تعليقات المستخدمين في المتاجر
- [ ] فحص حالة بناء EAS وتحديثات OTA
- [ ] مراقبة مؤشرات الأداء في Firebase
- [ ] فحص تقييمات التطبيق في المتاجر

### المراقبة الأسبوعية (Weekly Checks)
- [ ] تحليل اتجاهات استخدام التطبيق
- [ ] مراجعة تقارير الأداء والأعطال
- [ ] اختبار التحديثات الجديدة على أجهزة مختلفة
- [ ] فحص الأمان وتحديث الاعتماديات
- [ ] مراجعة تعليقات المستخدمين والباغ ريبورت

### المراقبة الشهرية (Monthly Checks)
- [ ] مراجعة شاملة للأمان والبنية التحتية
- [ ] تحديث الاعتماديات الرئيسية والمكتبات
- [ ] اختبار سيناريوهات الكوارث والاستعادة
- [ ] تحديث الوثائق والـ runbooks
- [ ] مراجعة مؤشرات الأداء الرئيسية (KPIs)
- [ ] خطط لتحسينات دورية للتطبيق

## إجراءات الطوارئ

### 1. في حالة انتشار تطبيق معطل (Bad Release)
```bash
# خطوات فورية:
1. أوقف التوزيع في المتاجر مؤقتًا
2. أعد بناء نسخة مصححة فورًا
3. أرسل تحديث OTA إذا أمكن
4. أرسل إشعار للمستخدمين بالمشكلة والحل
5. حقق في سبب المشكلة ومنع تكرارها
```

### 2. في حالة هجوم أمني
```bash
# إجراءات أمنية فورية:
1. أوقف التطبيق مؤقتًا إذا لزم الأمر
2. بدل جميع مفاتيح Firebase وGoogle Maps فورًا
3. فحص السجلات بحثًا عن أنشطة مشبوهة
4. إشعار فريق الأمان والإدارة فورًا
5. التحقيق في سبب الهجوم وإصلاح الثغرات
6. إصدار تحديث أمني عاجل
```

### 3. في حالة مشاكل في الأداء
```bash
# إجراءات:
1. تحليل السجلات بحثًا عن أسباب البطء
2. تحسين الاستعلامات والصور إذا لزم الأمر
3. النظر في تحديث مكتبات الأداء
4. اختبار على أجهزة مختلفة لتحديد المشكلة
5. إصدار تحديث محسّن للأداء
```

## قائمة التحقق من الأمان (Security Checklist)

### متغيرات البيئة الآمنة:
- [ ] جميع مفاتيح Firebase صالحة وغير مشتركة
- [ ] مفاتيح Google Maps محمية ومحدودة الاستخدام
- [ ] مفاتيح التتبع (Sentry/PostHog) محمية
- [ ] لا توجد مفاتيح اختبار في الإنتاج

### إعدادات الأمان:
- [ ] تشفير البيانات الحساسة في التخزين المحلي
- [ ] تنفيذ مبدأ Least Privilege للصلاحيات
- [ ] فحص دوري للثغرات الأمنية
- [ ] تحديث دوري للاعتماديات الأمنية

### مراقبة الأمان:
- [ ] سجلات محفوظة ومراقبة بحثًا عن هجمات
- [ ] تنبيهات على محاولات الدخول الفاشلة
- [ ] مراقبة استخدام API غير الطبيعي
- [ ] فحوصات دورية للثغرات الأمنية

## معلومات الاتصال للطوارئ

### فريق التطوير:
- **DevOps Engineer**: [الاسم] - [البريد الإلكتروني] - [الهاتف]
- **Mobile Lead**: [الاسم] - [البريد الإلكتروني] - [الهاتف]
- **Security Officer**: [الاسم] - [البريد الإلكتروني] - [الهاتف]

### خدمات خارجية:
- **EAS Support**: https://expo.dev/contact
- **Firebase Support**: https://firebase.google.com/support
- **Apple Developer Support**: https://developer.apple.com/support/
- **Google Play Support**: https://support.google.com/googleplay/android-developer

## جدولة بدل المفاتيح (Key Rotation Schedule)

### مفاتيح يجب بدلها دوريًا:
| المفتاح | الدورة | آخر تحديث | المسؤول |
|---------|--------|-------------|----------|
| Firebase API Keys | كل 6 أشهر | [التاريخ] | [المسؤول] |
| Google Maps API Keys | كل 6 أشهر | [التاريخ] | [المسؤول] |
| Sentry DSN | كل سنة | [التاريخ] | [المسؤول] |
| App Signing Keys | سنويًا | [التاريخ] | [المسؤول] |

## متطلبات الامتثال والقوانين

### GDPR Compliance:
- [ ] جمع موافقات صريحة للبيانات الشخصية
- [ ] إمكانية حذف البيانات (Right to Erasure)
- [ ] تشفير البيانات الحساسة أثناء النقل والتخزين
- [ ] سجلات واضحة لمعالجة البيانات

### App Store Guidelines:
- [ ] اتباع إرشادات Apple App Store
- [ ] تحديث سياسة الخصوصية بانتظام
- [ ] الامتثال لقوانين حماية البيانات المحلية
- [ ] مراقبة تقييمات التطبيق وتعليقات المستخدمين

## ملاحظات نهائية مهمة

1. **لا تشارك هذه الوثيقة مع أي شخص خارج الفريق المصرح له**
2. **راجع وحدث هذا الدليل كل 3 أشهر**
3. **احتفظ بنسخة آمنة من هذا الدليل في نظام إدارة كلمات المرور**
4. **تأكد من تحديث معلومات الاتصال بانتظام**
5. **اختبر خطط الطوارئ بانتظام**
6. **راقب التغييرات في قوانين حماية البيانات**

## موارد مفيدة إضافية

- **Expo Production Guide**: https://docs.expo.dev/workflow/publishing/
- **React Native Performance**: https://reactnative.dev/docs/performance
- **Mobile Security Guidelines**: https://owasp.org/www-project-mobile-app-security/
- **App Store Optimization**: https://developer.apple.com/app-store/
- **Google Play Policies**: https://play.google.com/about/developer-content-policy/
