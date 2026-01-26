# دليل تشغيل لوحة الإدارة على البيئة الإنتاجية (Production)

## نظرة عامة
هذا الدليل يغطي متغيرات البيئة الإنتاجية وإعدادات المراقبة والأمان للوحة الإدارة في الإنتاج.

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
```

### إعدادات الإنتاج
```env
VITE_DEV_MODE=false
VITE_DEBUG=false
NODE_ENV=production
```

### روابط التطبيق والتواصل الاجتماعي (Production)
```env
VITE_APP_APP_STORE_URL=https://apps.apple.com/app/bithawani/id1234567890
VITE_APP_GOOGLE_PLAY_URL=https://play.google.com/store/apps/details?id=com.bthwani.app
VITE_APP_APP_GALLERY_URL=https://appgallery.huawei.com/app/C123456789
VITE_APP_APK_DIRECT_URL=https://downloads.bthwani.com/app.apk
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

### إعدادات إضافية للإنتاج
```env
VITE_SITE_URL=https://admin.yourdomain.com
VITE_CLOUDINARY_CLOUD_NAME=production-cloudinary-name
```

## روابط المراقبة والتنبيهات

### 1. حالة الخدمة الأساسية
- **Production Admin Panel**: `https://admin.yourdomain.com`
- **Health Check**: `https://admin.yourdomain.com/`
- **API Health**: `https://api.yourdomain.com/health`

### 2. مراقبة الأداء
- **Google PageSpeed Insights**: https://pagespeed.web.dev/
- **GTmetrix**: https://gtmetrix.com/
- **WebPageTest**: https://www.webpagetest.org/

### 3. مراقبة المستخدمين والتحليلات
- **Google Analytics 4**: إعداد لمراقبة استخدام لوحة الإدارة
- **Hotjar**: لمراقبة سلوك المستخدمين
- **LogRocket**: لتسجيل جلسات المستخدمين

### 4. مراقبة الأخطاء والمشاكل
- **Sentry**: https://sentry.io (للأخطاء والـ performance)
- **Bugsnag**: https://www.bugsnag.com/
- **Rollbar**: https://rollbar.com/

### 5. مراقبة البنية التحتية (Render)
- **Render Dashboard**: `https://dashboard.render.com`
  - مراقبة CPU، Memory، و Network usage
  - سجلات التطبيق (Application Logs)
  - إشعارات عند انقطاع الخدمة

## إعداد التنبيهات

### 1. تنبيهات حالة الخدمة
```bash
# إعداد مراقبة كل دقيقة على:
URL: https://admin.yourdomain.com/
الرد المتوقع: صفحة تسجيل الدخول محملة بنجاح
```

### 2. تنبيهات الأداء
- **Response time > 3 seconds** لأي صفحة رئيسية
- **JavaScript errors > 5%** في آخر 10 دقائق
- **Page load time > 5 seconds** في أي موقع جغرافي

### 3. تنبيهات الأمان
- **Failed login attempts > 10** في آخر 5 دقائق
- **Suspicious API calls** من عناوين IP غير معروفة
- **File upload attempts** خارج الحدود المسموحة

## جداول الصيانة والمراقبة

### المراقبة اليومية (Daily Checks)
- [ ] فحص حالة جميع الخدمات (Frontend + API)
- [ ] مراجعة السجلات بحثًا عن أخطاء جديدة
- [ ] فحص استخدام الموارد (CPU/Memory)
- [ ] مراقبة أوقات الاستجابة
- [ ] فحص شهادات SSL وتاريخ انتهائها

### المراقبة الأسبوعية (Weekly Checks)
- [ ] تحليل اتجاهات الأداء والاستخدام
- [ ] مراجعة السجلات المؤرشفة
- [ ] اختبار خطة الاستعادة من النسخ الاحتياطي
- [ ] فحص الأمان وتحديث الاعتماديات
- [ ] اختبار جميع سير العمل الرئيسية

### المراقبة الشهرية (Monthly Checks)
- [ ] مراجعة شاملة للأمان والبنية التحتية
- [ ] تحديث الاعتماديات الرئيسية والمكتبات
- [ ] اختبار سيناريوهات الكوارث والاستعادة
- [ ] تحديث الوثائق والـ runbooks
- [ ] مراجعة تعليقات المستخدمين وتحسين الواجهة

## إجراءات الطوارئ

### 1. في حالة انقطاع الخدمة (Service Down)
```bash
# خطوات فورية:
1. فحص Render Dashboard للسجلات
2. فحص حالة الـ API backend
3. فحص حالة قاعدة البيانات
4. إعادة تشغيل الخدمة إذا لزم الأمر
5. إشعار الفريق عبر Slack/Email
6. إشعار المستخدمين إذا استمر الانقطاع
```

### 2. في حالة مشكلة في الأداء
```bash
# إجراءات:
1. فحص استخدام الموارد في Render
2. تحليل السجلات بحثًا عن استعلامات بطيئة
3. فحص قاعدة البيانات بحثًا عن مشاكل في الفهارس
4. تحسين الصور والموارد الثابتة إذا لزم الأمر
5. النظر في ترقية خطة Render إذا كان الحمل زائدًا
```

### 3. في حالة هجوم أمني
```bash
# إجراءات أمنية فورية:
1. إيقاف الخدمة مؤقتًا إذا لزم الأمر
2. بدل مفاتيح Firebase وCloudinary فورًا
3. فحص السجلات بحثًا عن أنشطة مشبوهة
4. إشعار فريق الأمان والإدارة
5. التحقيق في سبب الهجوم وإصلاح الثغرات
6. استعادة النسخة الاحتياطية إذا كانت البيانات متضررة
```

## قائمة التحقق من الأمان (Security Checklist)

### متغيرات البيئة الآمنة:
- [ ] جميع مفاتيح Firebase صالحة وغير مشتركة
- [ ] مفاتيح Cloudinary محمية ومحدودة الصلاحيات
- [ ] لا توجد مفاتيح اختبار في الإنتاج
- [ ] جميع الروابط الخارجية آمنة وموثوقة

### إعدادات الأمان:
- [ ] HTTPS مفعل وشهادة SSL صالحة
- [ ] Content Security Policy (CSP) مضبوطة بشكل صحيح
- [ ] X-Frame-Options مضبوط لمنع clickjacking
- [ ] X-Content-Type-Options مضبوط لمنع MIME sniffing

### مراقبة الأمان:
- [ ] سجلات محفوظة ومراقبة بحثًا عن هجمات
- [ ] تنبيهات على محاولات الدخول الفاشلة
- [ ] مراقبة استخدام API غير الطبيعي
- [ ] فحوصات دورية للثغرات الأمنية

## معلومات الاتصال للطوارئ

### فريق التطوير:
- **DevOps Engineer**: [الاسم] - [البريد الإلكتروني] - [الهاتف]
- **Frontend Lead**: [الاسم] - [البريد الإلكتروني] - [الهاتف]
- **Security Officer**: [الاسم] - [البريد الإلكتروني] - [الهاتف]

### خدمات خارجية:
- **Render Support**: https://render.com/support
- **Firebase Support**: https://firebase.google.com/support
- **Cloudinary Support**: https://cloudinary.com/documentation

## جدولة بدل المفاتيح (Key Rotation Schedule)

### مفاتيح يجب بدلها دوريًا:
| المفتاح | الدورة | آخر تحديث | المسؤول |
|---------|--------|-------------|----------|
| Firebase API Keys | كل 6 أشهر | [التاريخ] | [المسؤول] |
| Cloudinary Keys | كل 6 أشهر | [التاريخ] | [المسؤول] |
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
