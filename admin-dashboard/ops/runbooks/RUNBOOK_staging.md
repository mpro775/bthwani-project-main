# دليل تشغيل لوحة الإدارة على البيئة التجريبية (Staging)

## نظرة عامة
هذا الدليل يغطي نشر وتشغيل لوحة الإدارة على البيئة التجريبية باستخدام Render أو خدمات استضافة مشابهة.

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
```

### إعدادات التجريب
```env
VITE_DEV_MODE=false
VITE_DEBUG=false
NODE_ENV=staging
```

### روابط التطبيق والتواصل الاجتماعي (Staging)
```env
VITE_APP_APP_STORE_URL=https://testflight.apple.com/join/sample
VITE_APP_GOOGLE_PLAY_URL=https://play.google.com/apps/testing/com.bthwani.staging
VITE_APP_APP_GALLERY_URL=#
VITE_APP_APK_DIRECT_URL=https://staging-downloads.bthwani.com/app.apk
VITE_APP_WHATSAPP=https://wa.me/967777123456
VITE_APP_PHONE=+967 777 123 456
VITE_APP_EMAIL=staging@bthwani.app
VITE_APP_ADDRESS=صنعاء، اليمن (بيئة التجريب)
VITE_APP_DEEPLINK=bthwani-staging://open
VITE_APP_FACEBOOK=https://www.facebook.com/bithawani.staging
VITE_APP_INSTAGRAM=https://www.instagram.com/bithawani.staging
VITE_APP_TIKTOK=https://www.tiktok.com/@bthawani.staging
VITE_APP_WEB_APP=https://staging.bthwaniapp.com
```

### إعدادات إضافية للـ Staging
```env
VITE_SITE_URL=https://bthwani-admin-staging.onrender.com
VITE_CLOUDINARY_CLOUD_NAME=staging-cloudinary-name
```

## خطوات النشر على Staging

### 1. إعداد المتغيرات في Render Dashboard

#### خطوات مفصلة:
1. اذهب إلى [Render Dashboard](https://dashboard.render.com)
2. اختر الخدمة `bthwani-admin-staging`
3. اذهب إلى **Environment**
4. اضغط **Add Environment Variable** لكل متغير من القائمة أعلاه

#### متغيرات حساسة خاصة بالـ Staging:
- `VITE_FIREBASE_API_KEY` - مفتاح Firebase للمشروع التجريبي
- `VITE_CLOUDINARY_CLOUD_NAME` - حساب Cloudinary للتجريب

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
   ✅ Service is live at https://bthwani-admin-staging.onrender.com
   ```

#### فحص نقاط النهاية:
```bash
# فحص حالة الخدمة
curl https://bthwani-admin-staging.onrender.com/

# فحص اتصال API
curl https://bthwani-backend-staging.onrender.com/health
```

## أدوات المراقبة والتنبيهات

### 1. مراقبة الأداء
- **Render Metrics**: استخدم أدوات Render المدمجة
- **Lighthouse**: لقياس أداء الويب
- **WebPageTest**: لاختبار الأداء من مواقع مختلفة

### 2. تنبيهات مهمة للمراقبة

#### روابط لإعداد التنبيهات:
- **حالة الخدمة**: `https://bthwani-admin-staging.onrender.com/`
- **حالة API**: `https://bthwani-backend-staging.onrender.com/health`
- **أداء الويب**: استخدم GTmetrix أو PageSpeed Insights

### 3. أدوات مقترحة للمراقبة
- **UptimeRobot** أو **Pingdom** لمراقبة حالة الخدمة
- **Google Analytics** لمراقبة استخدام لوحة الإدارة
- **Sentry** لمراقبة أخطاء JavaScript

## اختبار شامل قبل النشر للإنتاج

### 1. اختبار الوظائف الأساسية
- [ ] تسجيل دخول المدير
- [ ] التنقل بين جميع الصفحات الرئيسية
- [ ] اختبار نماذج البيانات (إضافة/تعديل/حذف)
- [ ] اختبار التقارير والتصدير
- [ ] اختبار التنبيهات والإشعارات

### 2. اختبار التكامل
- [ ] اتصال بـ API التجريبي
- [ ] اختبار رفع الملفات (إذا كان مدعومًا)
- [ ] اختبار الخرائط والمواقع (إذا كان مدعومًا)
- [ ] اختبار الإشعارات اللحظية

### 3. اختبار الأداء
- [ ] قياس زمن التحميل
- [ ] اختبار على شبكات بطيئة
- [ ] اختبار على أجهزة مختلفة
- [ ] اختبار على متصفحات مختلفة

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
2. استخدم عناوين بريد مختلفة للاختبار
3. استخدم حسابات Firebase منفصلة عن الإنتاج
4. راقب استخدام الموارد بانتظام

### جدولة تغيير المفاتيح:
- **Firebase Keys**: بدل كل 3 أشهر أو عند الاشتباه في تسرب
- **Cloudinary Keys**: بدل كل 6 أشهر أو عند تغيير المطورين

## جداول الصيانة

### مهام يومية:
- فحص السجلات بحثًا عن أخطاء
- مراقبة استخدام الذاكرة والـ CPU
- فحص حالة الخدمة والـ API

### مهام أسبوعية:
- فحص وتحديث التبعيات (dependencies)
- اختبار جميع الوظائف الرئيسية
- مراجعة استخدام الموارد وتحسينها

### مهام شهرية:
- مراجعة شاملة للأمان
- تحديث الاعتماديات الرئيسية
- اختبار خطط الاستعادة من النسخ الاحتياطي

## نصائح للفريق

### للمطورين:
1. اختبر تغييراتك على staging قبل دمجها في main
2. راقب تأثير تغييراتك على الأداء
3. وثق أي مشاكل تجدها وحلولها

### للـ DevOps:
1. راقب استخدام الموارد وحدود Render
2. أعد خطط احتياطية في حالة انقطاع الخدمة
3. حافظ على تحديث النسخ الاحتياطية

### للمديرين:
1. اختبر جميع سير العمل بانتظام
2. راقب تعليقات المستخدمين حول لوحة الإدارة
3. خطط لتحديثات دورية للواجهة والوظائف

## موارد مفيدة

- **Render Documentation**: https://render.com/docs
- **Vite Deployment Guide**: https://vitejs.dev/guide/static-deploy.html
- **Firebase Hosting Docs**: https://firebase.google.com/docs/hosting
- **Web Performance**: https://web.dev/performance/
