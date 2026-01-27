# 🔧 حل مشكلة 502 Bad Gateway

## المشكلة
عند الوصول إلى `api-bthwani.smartagency-ye.com` يظهر خطأ **502 Bad Gateway** من OpenResty (Nginx Proxy Manager) رغم أن الـ Proxy Host يظهر كـ "Online" في Nginx Proxy Manager.

## الأسباب المحتملة

### 1. الباك إند لا يستمع على `0.0.0.0`
**المشكلة:** إذا كان الباك إند يستمع على `localhost` فقط، لن يتمكن Nginx Proxy Manager من الوصول إليه.

**الحل:** ✅ تم التعديل في `src/main.ts`:
```typescript
await app.listen(port, '0.0.0.0'); // الاستماع على جميع الواجهات
```

### 2. الـ Container غير قيد التشغيل
**التحقق:**
```bash
docker ps | grep bthwani-backend
```

**الحل:**
```bash
docker start bthwani-backend
# أو
docker-compose up -d backend
```

### 3. الـ Container لم يكمل البدء بعد
**المشكلة:** الباك إند يحتاج وقت للبدء (خاصة الاتصال بـ MongoDB و Redis).

**الحل:** ✅ تم إضافة `start_period: 60s` في healthcheck.

**التحقق:**
```bash
docker logs -f bthwani-backend
```

### 4. مشكلة في الشبكة (Network)
**المشكلة:** الـ containers غير متصلة بنفس الشبكة.

**التحقق:**
```bash
docker network inspect bthwani-network
```

**الحل:** تأكد أن جميع الـ containers في نفس الشبكة:
- `bthwani-proxy` (Nginx Proxy Manager)
- `bthwani-backend`
- `bthwani-redis`

### 5. الباك إند لا يستجيب على `/health/liveness`
**التحقق:**
```bash
docker exec bthwani-backend node -e "require('http').get('http://localhost:3000/health/liveness', (r) => {console.log('Status:', r.statusCode); process.exit(r.statusCode === 200 ? 0 : 1)})"
```

**الحل:** تأكد من وجود endpoint `/health/liveness` في الباك إند.

### 6. مشكلة في إعدادات Nginx Proxy Manager
**التحقق:**
- تأكد أن الـ **Forward Hostname/IP** هو: `bthwani-backend`
- تأكد أن الـ **Forward Port** هو: `3000`
- تأكد أن الـ **Scheme** هو: `http` (ليس https)

## خطوات التشخيص

### 1. استخدام السكريبت التشخيصي
```bash
# Linux/Mac
./backend-nest/check-backend-status.sh

# Windows PowerShell
.\backend-nest\check-backend-status.ps1
```

### 2. فحص الـ Logs
```bash
# Logs الباك إند
docker logs -f bthwani-backend

# Logs Nginx Proxy Manager
docker logs -f bthwani-proxy
```

### 3. اختبار الاتصال من داخل Nginx Proxy Manager
```bash
docker exec bthwani-proxy wget -O- http://bthwani-backend:3000/health/liveness
```

### 4. فحص حالة الـ Health Check
```bash
docker inspect bthwani-backend | grep -A 10 Health
```

## الحلول المطبقة

✅ **1. تعديل `src/main.ts`:**
- تغيير `app.listen(port)` إلى `app.listen(port, '0.0.0.0')`
- هذا يضمن أن الباك إند يستمع على جميع الواجهات وليس localhost فقط

✅ **2. إضافة Health Check في `docker-compose.yml`:**
```yaml
healthcheck:
  test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/health/liveness', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 60s
```

✅ **3. إنشاء سكريبتات تشخيصية:**
- `check-backend-status.sh` (Linux/Mac)
- `check-backend-status.ps1` (Windows)

## خطوات إعادة التشغيل

بعد التعديلات، قم بإعادة بناء وتشغيل الباك إند:

```bash
# إعادة بناء الـ image
docker-compose build backend

# إعادة تشغيل الـ container
docker-compose up -d backend

# متابعة الـ logs
docker logs -f bthwani-backend
```

## التحقق النهائي

1. **تحقق من حالة الـ container:**
   ```bash
   docker ps | grep bthwani-backend
   ```

2. **تحقق من Health Check:**
   ```bash
   docker inspect bthwani-backend | grep Health -A 5
   ```

3. **اختبر من داخل الـ container:**
   ```bash
   docker exec bthwani-backend wget -O- http://localhost:3000/health/liveness
   ```

4. **اختبر من Nginx Proxy Manager:**
   ```bash
   docker exec bthwani-proxy wget -O- http://bthwani-backend:3000/health/liveness
   ```

5. **اختبر من المتصفح:**
   - افتح: `https://api-bthwani.smartagency-ye.com/health/liveness`
   - يجب أن ترى استجابة JSON

## ملاحظات إضافية

- ⏱️ **الوقت المطلوب للبدء:** قد يحتاج الباك إند 30-60 ثانية للبدء الكامل
- 🔄 **إعادة المحاولة:** Nginx Proxy Manager يحاول الاتصال تلقائياً
- 📊 **Monitoring:** راقب الـ logs للتأكد من عدم وجود أخطاء

## إذا استمرت المشكلة

1. تحقق من ملف `.env` في `backend-nest/`
2. تحقق من اتصال MongoDB و Redis
3. راجع logs الباك إند للأخطاء
4. تأكد من أن جميع المتغيرات البيئية صحيحة
