# دليل تشغيل موقع الويب على البيئة التجريبية (Staging)

## نظرة عامة
هذا الدليل يغطي نشر وتشغيل موقع الويب على البيئة التجريبية باستخدام Render أو خدمات استضافة مشابهة.

## متغيرات البيئة للـ Staging

### رابط API
```env
VITE_API_URL=https://bthwani-backend-staging.onrender.com/api/v1
```

### إعدادات Firebase Staging
```env
VITE_FIREBASE_API_KEY=staging-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=staging-domain.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=staging-firebase-project-id
VITE_FIREBASE_VAPID_KEY=staging-vapid-key
```

### إعدادات Google Maps (Staging)
```env
VITE_GOOGLE_MAPS_API_KEY=staging-google-maps-key
VITE_GOOGLE_MAPS_MAP_ID=staging-map-id
```

### إعدادات التتبع والتحليلات (Staging)
```env
VITE_SENTRY_DSN=staging-sentry-dsn
VITE_POSTHOG_KEY=staging-posthog-key
VITE_POSTHOG_HOST=https://app.posthog.com
```

### إعدادات أخرى للـ Staging
```env
VITE_APP_VERSION=1.0.0-staging
VITE_REALTIME_URL=https://bthwani-backend-staging.onrender.com
```

## خطوات النشر على Staging

### 1. إعداد المتغيرات في Render Dashboard

#### خطوات مفصلة:
1. اذهب إلى [Render Dashboard](https://dashboard.render.com)
2. اختر الخدمة `bthwani-web-staging`
3. اذهب إلى **Environment**
4. اضغط **Add Environment Variable** لكل متغير من القائمة أعلاه

#### متغيرات حساسة خاصة بالـ Staging:
- `VITE_FIREBASE_API_KEY` - مفتاح Firebase للمشروع التجريبي
- `VITE_GOOGLE_MAPS_API_KEY` - مفتاح Google Maps للتجريب
- `VITE_SENTRY_DSN` - Sentry DSN للتجريب

### 2. نشر من GitHub

#### عبر Render Dashboard:
1. اذهب إلى **Manual Deploy** في الخدمة
2. اختر الفرع `staging` إذا كان موجودًا، أو `main`
3. اضغط **Deploy latest commit**

#### عبر GitHub Webhook (تلقائي):
سيتم النشر تلقائيًا عند دفع تغييرات إلى الفرع المحدد.

### 3. فحص النشر

#### مراقبة السجلات:
1. في Render Dashboard، اذهب إلى **Logs**
2. ابحث عن رسائل نجاح:
   ```
   ✅ Build completed successfully
   ✅ Deployed to staging environment
   ✅ Service is live at https://bthwani-web-staging.onrender.com
   ```

#### فحص نقاط النهاية:
```bash
# فحص حالة الخدمة
curl https://bthwani-web-staging.onrender.com/

# فحص اتصال API
curl https://bthwani-backend-staging.onrender.com/health
```

## أدوات المراقبة والتنبيهات

### 1. مراقبة الأداء
- **Render Metrics**: استخدم أدوات Render المدمجة
- **Lighthouse**: لقياس أداء الويب
- **WebPageTest**: لاختبار الأداء من مواقع مختلفة
- **Sentry**: لمراقبة الأخطاء والأداء

### 2. تنبيهات مهمة للمراقبة

#### روابط لإعداد التنبيهات:
- **حالة الخدمة**: `https://bthwani-web-staging.onrender.com/`
- **حالة API**: `https://bthwani-backend-staging.onrender.com/health`
- **أداء الويب**: استخدم GTmetrix أو PageSpeed Insights
- **أخطاء JavaScript**: Sentry Dashboard

### 3. أدوات مقترحة للمراقبة
- **UptimeRobot** أو **Pingdom** لمراقبة حالة الخدمة
- **Google Analytics** لمراقبة استخدام الموقع
- **Hotjar** لمراقبة سلوك المستخدمين

## اختبار شامل قبل النشر للإنتاج

### 1. اختبار الوظائف الأساسية
- [ ] تحميل الصفحة الرئيسية بسرعة
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
- [ ] قياس زمن التحميل على شبكات مختلفة
- [ ] اختبار على متصفحات مختلفة
- [ ] اختبار على أجهزة مختلفة
- [ ] فحص Core Web Vitals

## خطوات الرجوع (Rollback)

### في حالة حدوث مشكلة:

#### 1. فحص السجلات الأخيرة
```bash
# في Render Dashboard - Logs
# ابحث عن أخطاء حديثة
```

#### 2. إعادة النشر السريع
إذا كانت المشكلة في الكود:
```bash
# ارجع إلى commit سابق مستقر
git revert HEAD
git push origin main
```

#### 3. إعادة تشغيل الخدمة
في Render Dashboard:
1. اذهب إلى الخدمة
2. اضغط **Restart Service**

### 4. التحقق من المتغيرات البيئية
تأكد من أن جميع المتغيرات محدثة وصحيحة في Render.

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
- فحص السجلات بحثًا عن أخطاء
- مراقبة استخدام الذاكرة والـ CPU
- فحص حالة الخدمة والـ API
- مراقبة أوقات الاستجابة

### مهام أسبوعية:
- فحص وتحديث التبعيات (dependencies)
- اختبار جميع الوظائف الرئيسية
- مراجعة استخدام الموارد وتحسينها
- تحليل اتجاهات الأداء

### مهام شهرية:
- مراجعة شاملة للأمان
- تحديث الاعتماديات الرئيسية
- اختبار خطط الاستعادة من النسخ الاحتياطي
- تحديث الوثائق والـ runbooks

## نصائح للفريق

### للمطورين:
1. اختبر تغييراتك على staging قبل دمجها في main
2. راقب تأثير تغييراتك على الأداء
3. وثق أي مشاكل تجدها وحلولها
4. اختبر على أجهزة ومتصفحات مختلفة

### للـ DevOps:
1. راقب استخدام الموارد وحدود Render
2. أعد خطط احتياطية في حالة انقطاع الخدمة
3. حافظ على تحديث النسخ الاحتياطية
4. راقب التكاليف والموارد المستخدمة

### للمديرين:
1. اختبر جميع سير العمل بانتظام
2. راقب تعليقات المستخدمين حول الموقع
3. خطط لتحديثات دورية للواجهة والوظائف
4. راقب مؤشرات الأداء الرئيسية (KPIs)

## موارد مفيدة

- **Render Documentation**: https://render.com/docs
- **Vite Deployment Guide**: https://vitejs.dev/guide/static-deploy.html
- **Firebase Hosting Docs**: https://firebase.google.com/docs/hosting
- **Web Performance**: https://web.dev/performance/
- **SEO Best Practices**: https://developers.google.com/search/docs
