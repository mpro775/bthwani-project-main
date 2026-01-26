# دليل تشغيل موقع الويب على البيئة الإنتاجية (Production)

## نظرة عامة
هذا الدليل يغطي متغيرات البيئة الإنتاجية وإعدادات المراقبة والأمان لموقع الويب في الإنتاج.

## متغيرات البيئة الإنتاجية

### رابط API Production
```env
VITE_API_URL=https://api.yourdomain.com/api/v1
```

### إعدادات Firebase Production
```env
VITE_FIREBASE_API_KEY=production-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=yourdomain.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-production-project-id
VITE_FIREBASE_VAPID_KEY=production-vapid-key
```

### إعدادات Google Maps (Production)
```env
VITE_GOOGLE_MAPS_API_KEY=production-google-maps-key
VITE_GOOGLE_MAPS_MAP_ID=production-map-id
```

### إعدادات التتبع والتحليلات (Production)
```env
VITE_SENTRY_DSN=production-sentry-dsn
VITE_POSTHOG_KEY=production-posthog-key
VITE_POSTHOG_HOST=https://app.posthog.com
```

### إعدادات أخرى للإنتاج
```env
VITE_APP_VERSION=1.0.0
VITE_REALTIME_URL=https://api.yourdomain.com
```

## روابط المراقبة والتنبيهات

### 1. حالة الخدمة الأساسية
- **Production Website**: `https://yourdomain.com`
- **Health Check**: `https://yourdomain.com/`
- **API Health**: `https://api.yourdomain.com/health`

### 2. مراقبة الأداء
- **Google PageSpeed Insights**: https://pagespeed.web.dev/
- **GTmetrix**: https://gtmetrix.com/
- **WebPageTest**: https://www.webpagetest.org/
- **Lighthouse CI**: للمراقبة المستمرة

### 3. مراقبة المستخدمين والتحليلات
- **Google Analytics 4**: إعداد لمراقبة حركة المستخدمين
- **PostHog**: لتحليل سلوك المستخدمين
- **Hotjar**: لتسجيل جلسات المستخدمين وخرائط الحرارة

### 4. مراقبة الأخطاء والمشاكل
- **Sentry**: https://sentry.io (للأخطاء والـ performance)
- **LogRocket**: https://logrocket.com/ (لتسجيل جلسات المستخدمين)
- **Bugsnag**: https://www.bugsnag.com/

### 5. مراقبة البنية التحتية (Render)
- **Render Dashboard**: `https://dashboard.render.com`
  - مراقبة CPU، Memory، و Network usage
  - سجلات التطبيق (Application Logs)
  - إشعارات عند انقطاع الخدمة

## إعداد التنبيهات

### 1. تنبيهات حالة الخدمة
```bash
# إعداد مراقبة كل دقيقة على:
URL: https://yourdomain.com/
الرد المتوقع: صفحة الموقع محملة بنجاح (< 3 seconds)
```

### 2. تنبيهات الأداء
- **Response time > 3 seconds** للصفحة الرئيسية
- **JavaScript errors > 5%** في آخر 10 دقائق
- **Page load time > 4 seconds** في أي موقع جغرافي
- **Core Web Vitals** خارج الحدود المقبولة

### 3. تنبيهات الأمان
- **Failed login attempts > 20** في آخر 5 دقائق
- **Suspicious API calls** من عناوين IP غير معروفة
- **Unusual traffic patterns** قد تشير لهجوم DDoS

## جداول الصيانة والمراقبة

### المراقبة اليومية (Daily Checks)
- [ ] فحص حالة جميع الخدمات (Frontend + API)
- [ ] مراجعة السجلات بحثًا عن أخطاء جديدة
- [ ] فحص استخدام الموارد (CPU/Memory)
- [ ] مراقبة أوقات الاستجابة وسرعة التحميل
- [ ] فحص شهادات SSL وتاريخ انتهائها
- [ ] مراقبة حركة المستخدمين ومعدلات التحويل

### المراقبة الأسبوعية (Weekly Checks)
- [ ] تحليل اتجاهات الأداء والاستخدام
- [ ] مراجعة السجلات المؤرشفة بحثًا عن أنماط
- [ ] اختبار خطة الاستعادة من النسخ الاحتياطي
- [ ] فحص الأمان وتحديث الاعتماديات
- [ ] اختبار جميع سير العمل الرئيسية
- [ ] مراجعة تعليقات المستخدمين وتقييمات التطبيق

### المراقبة الشهرية (Monthly Checks)
- [ ] مراجعة شاملة للأمان والبنية التحتية
- [ ] تحديث الاعتماديات الرئيسية والمكتبات
- [ ] اختبار سيناريوهات الكوارث والاستعادة
- [ ] تحديث الوثائق والـ runbooks
- [ ] مراجعة مؤشرات الأداء الرئيسية (KPIs)
- [ ] تحليل سلوك المستخدمين واقتراح تحسينات

## إجراءات الطوارئ

### 1. في حالة انقطاع الخدمة (Service Down)
```bash
# خطوات فورية:
1. فحص Render Dashboard للسجلات والحالة
2. فحص حالة الـ API backend
3. فحص حالة قاعدة البيانات
4. فحص حالة خدمات Firebase وGoogle Maps
5. إعادة تشغيل الخدمة إذا لزم الأمر
6. إشعار الفريق عبر Slack/Email
7. إشعار المستخدمين إذا استمر الانقطاع أكثر من 5 دقائق
```

### 2. في حالة مشكلة في الأداء
```bash
# إجراءات:
1. فحص استخدام الموارد في Render
2. تحليل السجلات بحثًا عن استعلامات بطيئة
3. فحص صور وموارد كبيرة قد تؤثر على السرعة
4. تحسين الصور والموارد الثابتة إذا لزم الأمر
5. النظر في ترقية خطة Render إذا كان الحمل زائدًا
6. فحص CDN وتوزيع المحتوى
```

### 3. في حالة هجوم أمني
```bash
# إجراءات أمنية فورية:
1. إيقاف الخدمة مؤقتًا إذا لزم الأمر (للهجمات الشديدة)
2. بدل مفاتيح Firebase وGoogle Maps فورًا
3. فحص السجلات بحثًا عن أنشطة مشبوهة
4. إشعار فريق الأمان والإدارة فورًا
5. التحقيق في سبب الهجوم وإصلاح الثغرات
6. استعادة النسخة الاحتياطية إذا كانت البيانات متضررة
7. إشعار الجهات المعنية إذا كان الهجوم شديدًا
```

## قائمة التحقق من الأمان (Security Checklist)

### متغيرات البيئة الآمنة:
- [ ] جميع مفاتيح Firebase صالحة وغير مشتركة
- [ ] مفاتيح Google Maps محمية ومحدودة الاستخدام
- [ ] مفاتيح التتبع (Sentry/PostHog) محمية
- [ ] لا توجد مفاتيح اختبار في الإنتاج

### إعدادات الأمان:
- [ ] HTTPS مفعل وشهادة SSL صالحة
- [ ] Content Security Policy (CSP) مضبوطة بشكل صحيح
- [ ] X-Frame-Options مضبوط لمنع clickjacking
- [ ] X-Content-Type-Options مضبوط لمنع MIME sniffing
- [ ] Strict-Transport-Security مضبوط لفرض HTTPS

### مراقبة الأمان:
- [ ] سجلات محفوظة ومراقبة بحثًا عن هجمات
- [ ] تنبيهات على محاولات الدخول الفاشلة
- [ ] مراقبة استخدام API غير الطبيعي
- [ ] فحوصات دورية للثغرات الأمنية
- [ ] مراقبة محاولات الوصول غير المصرح بها

## معلومات الاتصال للطوارئ

### فريق التطوير:
- **DevOps Engineer**: [الاسم] - [البريد الإلكتروني] - [الهاتف]
- **Frontend Lead**: [الاسم] - [البريد الإلكتروني] - [الهاتف]
- **Security Officer**: [الاسم] - [البريد الإلكتروني] - [الهاتف]

### خدمات خارجية:
- **Render Support**: https://render.com/support
- **Firebase Support**: https://firebase.google.com/support
- **Google Cloud Support**: https://cloud.google.com/support
- **Sentry Support**: https://sentry.io/support/

## جدولة بدل المفاتيح (Key Rotation Schedule)

### مفاتيح يجب بدلها دوريًا:
| المفتاح | الدورة | آخر تحديث | المسؤول |
|---------|--------|-------------|----------|
| Firebase API Keys | كل 6 أشهر | [التاريخ] | [المسؤول] |
| Google Maps API Keys | كل 6 أشهر | [التاريخ] | [المسؤول] |
| Sentry DSN | كل سنة | [التاريخ] | [المسؤول] |
| SSL Certificates | سنويًا | [التاريخ] | [المسؤول] |

## متطلبات الامتثال والقوانين

### GDPR Compliance:
- [ ] جمع موافقات صريحة للبيانات الشخصية
- [ ] إمكانية حذف البيانات (Right to Erasure)
- [ ] تشفير البيانات الحساسة أثناء النقل والتخزين
- [ ] سجلات واضحة لمعالجة البيانات

### Data Protection:
- [ ] نسخ احتياطية مشفرة ومحمية
- [ ] خطط استعادة من الكوارث محدثة
- [ ] اختبار دوري للنسخ الاحتياطية
- [ ] حدود صارمة للوصول إلى البيانات الحساسة

## ملاحظات نهائية مهمة

1. **لا تشارك هذه الوثيقة مع أي شخص خارج الفريق المصرح له**
2. **راجع وحدث هذا الدليل كل 3 أشهر**
3. **احتفظ بنسخة آمنة من هذا الدليل في نظام إدارة كلمات المرور**
4. **تأكد من تحديث معلومات الاتصال بانتظام**
5. **اختبر خطط الطوارئ بانتظام**
6. **راقب التغييرات في قوانين حماية البيانات**

## موارد مفيدة إضافية

- **Web Security Guidelines**: https://owasp.org/www-project-top-ten/
- **Performance Optimization**: https://web.dev/fast/
- **SEO Best Practices**: https://developers.google.com/search/docs
- **Accessibility Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
- **Progressive Web Apps**: https://web.dev/pwa/
