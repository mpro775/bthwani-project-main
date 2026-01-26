# دليل تشغيل تطبيق bThwaniApp على البيئة التجريبية (Staging)

## نظرة عامة
هذا الدليل يغطي بناء ونشر تطبيق bThwaniApp على البيئة التجريبية باستخدام EAS (Expo Application Services).

## متغيرات البيئة للـ Staging

### رابط API
```env
EXPO_PUBLIC_API_URL=https://bthwani-backend-staging.onrender.com/api/v1
```

### إعدادات Firebase Staging
```env
EXPO_PUBLIC_FIREBASE_API_KEY=staging-firebase-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=staging-domain.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=staging-firebase-project-id
EXPO_PUBLIC_FIREBASE_VAPID_KEY=staging-vapid-key
```

### إعدادات Google Maps (Staging)
```env
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=staging-google-maps-key
```

### إعدادات التتبع والتحليلات (Staging)
```env
EXPO_PUBLIC_SENTRY_DSN=staging-sentry-dsn
EXPO_PUBLIC_POSTHOG_KEY=staging-posthog-key
EXPO_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### إعدادات أخرى للـ Staging
```env
EXPO_PUBLIC_APP_VERSION=1.0.0-staging
EXPO_PUBLIC_REALTIME_URL=https://bthwani-backend-staging.onrender.com
EXPO_PUBLIC_ENVIRONMENT=staging
```

## خطوات النشر على Staging

### 1. إعداد EAS (Expo Application Services)

#### متطلبات EAS:
```bash
npm install -g @expo/eas-cli
```

#### تسجيل الدخول إلى EAS:
```bash
eas login
```

### 2. إعداد ملف eas.json (محدث بالفعل)
ملف `eas.json` الحالي يحتوي على البروفايلات التالية:
- `development`: لبناء تطبيق التطوير
- `preview`: لبناء نسخة تجريبية
- `production`: لبناء نسخة الإنتاج

### 3. بناء التطبيق للتجريب

#### بناء للتطوير (Development Build):
```bash
eas build --profile development --platform android
eas build --profile development --platform ios
```

#### بناء للمعاينة (Preview Build):
```bash
eas build --profile preview --platform android
eas build --profile preview --platform ios
```

### 4. إرسال النسخة للاختبار (TestFlight/App Distribution)

#### لـ iOS (TestFlight):
```bash
eas submit --platform ios --profile preview
```

#### لـ Android (Internal Testing):
```bash
eas submit --platform android --profile preview
```

## أدوات المراقبة والتنبيهات

### 1. مراقبة الأداء
- **EAS Dashboard**: https://expo.dev/
- **Sentry**: لمراقبة الأخطاء والأداء
- **PostHog**: لتحليل سلوك المستخدمين

### 2. تنبيهات مهمة للمراقبة

#### روابط لإعداد التنبيهات:
- **حالة بناء EAS**: EAS Dashboard
- **أخطاء التطبيق**: Sentry Dashboard
- **تحليلات المستخدمين**: PostHog Dashboard

### 3. أدوات مقترحة للمراقبة
- **Crashlytics** (Firebase) لمراقبة الأعطال
- **Mixpanel** لتحليلات المنتج
- **Shake** لتعليقات المستخدمين والباغ ريبورت

## اختبار شامل قبل النشر للإنتاج

### 1. اختبار الوظائف الأساسية
- [ ] تشغيل التطبيق بدون أعطال
- [ ] تسجيل دخول المستخدمين
- [ ] البحث عن المنتجات والخدمات
- [ ] إضافة منتجات إلى السلة
- [ ] عملية الدفع (إذا كانت متاحة)
- [ ] الخرائط والمواقع (إذا كانت متاحة)
- [ ] الإشعارات اللحظية

### 2. اختبار التكامل
- [ ] اتصال بـ API التجريبي
- [ ] اختبار Firebase Authentication
- [ ] اختبار Google Maps (إذا كان متاحًا)
- [ ] اختبار الإشعارات اللحظية
- [ ] اختبار الدفع (إذا كان متاحًا)

### 3. اختبار الأداء
- [ ] قياس زمن التشغيل والاستجابة
- [ ] اختبار على شبكات بطيئة
- [ ] اختبار استهلاك البطارية
- [ ] اختبار استهلاك الذاكرة

## خطوات الرجوع (Rollback)

### في حالة اكتشاف مشاكل بعد النشر:

#### 1. إيقاف التوزيع الحالي
```bash
# في TestFlight أو Google Play Console
# قم بإزالة النسخة المشكلة من التوزيع
```

#### 2. بناء نسخة جديدة مصححة
```bash
# ارجع إلى commit مستقر
git revert HEAD

# أعد بناء التطبيق
eas build --profile preview --platform android
eas build --profile preview --platform ios

# أعد الإرسال
eas submit --platform ios --profile preview
eas submit --platform android --profile preview
```

#### 3. إشعار المستخدمين
أرسل إشعار للمستخدمين لتحديث التطبيق إلى النسخة الجديدة.

## ملاحظات أمنية مهمة

### متغيرات حساسة خاصة بالـ Staging:
1. **لا تستخدم نفس مفاتيح الإنتاج**
2. استخدم حسابات Firebase منفصلة عن الإنتاج
3. استخدم مفاتيح Google Maps منفصلة عن الإنتاج
4. راقب استخدام الموارد بانتظام

### جدولة تغيير المفاتيح:
- **Firebase Keys**: بدل كل 3 أشهر أو عند الاشتباه في تسرب
- **Google Maps Keys**: بدل كل 6 أشهر أو عند تغيير المطورين
- **Sentry DSN**: بدل عند الاشتباه في تسرب

## جداول الصيانة

### مهام يومية:
- فحص لوحة EAS بحثًا عن بناءات فاشلة
- مراقبة أخطاء التطبيق في Sentry
- فحص تعليقات المستخدمين والباغ ريبورت

### مهام أسبوعية:
- اختبار النسخة التجريبية على أجهزة مختلفة
- مراجعة تحليلات المستخدمين
- فحص وتحديث التبعيات (dependencies)

### مهام شهرية:
- مراجعة شاملة للأمان
- تحديث الاعتماديات الرئيسية
- اختبار خطط الاستعادة من النسخ الاحتياطي
- تحديث الوثائق والـ runbooks

## نصائح للفريق

### للمطورين:
1. اختبر تغييراتك على staging قبل دمجها في main
2. راقب تأثير تغييراتك على الأداء واستهلاك البطارية
3. وثق أي مشاكل تجدها وحلولها
4. اختبر على أجهزة حقيقية بانتظام

### للـ DevOps:
1. راقب حدود EAS واستهلاك الموارد
2. أعد خطط احتياطية في حالة مشاكل في الخدمة
3. حافظ على تحديث الشهادات والمفاتيح
4. راقب التكاليف وتحسينها

### للمديرين:
1. اختبر جميع سير العمل بانتظام
2. راقب تعليقات المستخدمين حول التطبيق
3. خطط لتحديثات دورية للتطبيق
4. راقب مؤشرات الأداء الرئيسية (KPIs)

## موارد مفيدة

- **EAS Documentation**: https://docs.expo.dev/eas/
- **Expo Build Service**: https://expo.dev/build
- **TestFlight Guide**: https://developer.apple.com/testflight/
- **Google Play Internal Testing**: https://support.google.com/googleplay/android-developer/answer/9303479
