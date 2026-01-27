# إصلاح مشكلة 'qa' initialization في MUI Vendor

## المشكلة
```
mui-vendor-*.js:1 Uncaught ReferenceError: Cannot access 'qa' before initialization
```

## الحلول المطبقة

### 1. دمج MUI و Emotion في نفس الـ chunk
تم دمج `@mui` و `@emotion` في نفس الـ chunk (`mui-vendor`) لتجنب التبعيات الدائرية.

### 2. إعدادات البناء المحسّنة
- `constBindings: false` - لتجنب مشاكل التهيئة
- `preserveEntrySignatures: 'strict'` - للحفاظ على ترتيب التحميل
- معالجة التبعيات الدائرية في `onwarn`

### 3. Service Worker محسّن
- استخدام `Promise.allSettled` بدلاً من `cache.addAll`
- معالجة أفضل للأخطاء

## خطوات البناء مع Docker

```bash
# 1. بناء الصورة
docker build -t admin-dashboard .

# 2. تشغيل الحاوية
docker run -d -p 80:80 admin-dashboard

# أو إذا كنت تستخدم docker-compose
docker-compose up --build
```

## ملاحظات مهمة

1. **تأكد من حذف الـ cache القديم** قبل البناء:
   ```bash
   rm -rf dist node_modules/.vite
   ```

2. **في حالة استمرار المشكلة**، جرب:
   ```bash
   npm run build:prod -- --force
   ```

3. **للتحقق من الـ chunks** بعد البناء:
   ```bash
   ls -lh dist/js/*.js
   ```

## التحقق من الحل

بعد البناء والرفع، تحقق من:
- عدم وجود خطأ `Cannot access 'qa' before initialization`
- تحميل `mui-vendor` بشكل صحيح
- عمل Service Worker بدون أخطاء
