# اختبار المصادقة - تسجيل الدخول

## نظرة عامة

هذا الملف يغطي اختبار عمليات تسجيل الدخول في التطبيق (JWT).

---

## المتطلبات الأساسية

- حساب مستخدم صالح (بريد وكلمة مرور)
- Base URL للبيئة المستخدمة

---

## البيئة

- **Base URL:** `http://localhost:3000` (أو URL البيئة المستخدمة)
- **API Version:** v1
- **Content-Type:** `application/json`

---

## العمليات

### 1. تسجيل الدخول (JWT)

**الهدف:** تسجيل دخول المستخدم باستخدام البريد الإلكتروني وكلمة المرور

**Endpoint:** `POST /api/v1/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**خطوات الاختبار:**

1. أرسل طلب POST إلى `/api/v1/auth/login`
2. أرسل email و password في body
3. تحقق من الرد

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "تم تسجيل الدخول بنجاح",
  "data": {
    "token": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": "7d"
    },
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "phone": "+967777123456",
      "fullName": "أحمد محمد"
    }
  }
}
```

**حالات الاختبار:**

✅ **حالة النجاح:**
- البريد وكلمة المرور صحيحان
- المستخدم موجود ونشط
- يعيد accessToken و user data

❌ **حالة الفشل (400 Bad Request):**
- Request body غير صحيح

❌ **حالة الفشل (401 Unauthorized):**
- البريد أو كلمة المرور غير صحيحة
- الحساب غير نشط

**Rate Limiting:**
- 5 محاولات في الدقيقة الواحدة
- عند تجاوز الحد، سيتم إرجاع 429 Too Many Requests

---

### 2. تسجيل دخول السائق

**الهدف:** تسجيل دخول السائق باستخدام البريد الإلكتروني وكلمة المرور

**Endpoint:** `POST /api/v1/auth/driver/login`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "driver@example.com",
  "password": "password123"
}
```

**خطوات الاختبار:**

1. أرسل طلب POST إلى `/api/v1/auth/driver/login`
2. أرسل email و password في body
3. تحقق من الرد

**Expected Response (201 Created):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "driver": {
    "id": "507f1f77bcf86cd799439012",
    "email": "driver@example.com",
    "name": "سائق تجريبي",
    "status": "active"
  }
}
```

**حالات الاختبار:**

✅ **حالة النجاح:**
- البريد الإلكتروني وكلمة المرور صحيحة
- السائق مفعّل في النظام

❌ **حالة الفشل (400 Bad Request):**
- بيانات غير صحيحة
- Request body غير مكتمل

❌ **حالة الفشل (401 Unauthorized):**
- البريد الإلكتروني أو كلمة المرور غير صحيحة
- السائق غير موجود

**Rate Limiting:**
- 5 محاولات في الدقيقة الواحدة

---

## التحقق

بعد كل عملية تسجيل دخول ناجحة، تحقق من:

1. ✅ وجود `accessToken` في الرد
2. ✅ صحة بيانات المستخدم/السائق
3. ✅ إمكانية استخدام الـ token في الطلبات التالية (Header: `Authorization: Bearer <token>`)
4. ✅ صلاحية الـ token (يمكن اختباره بإرسال طلب إلى `/api/v1/users/me` أو ما يعادله)

---

## ملاحظات مهمة

1. **حفظ الـ Token:** احفظ الـ `accessToken` لاستخدامه في الطلبات التالية
2. **مدة صلاحية Token:** الـ token له مدة صلاحية محددة، عند انتهائها يجب تسجيل الدخول مرة أخرى
3. **Rate Limiting:** احترم حدود Rate Limiting لتجنب الحظر
4. **الأمان:** لا تشارك الـ tokens في السجلات أو الرسائل

---

## أمثلة باستخدام curl

```bash
# تسجيل الدخول (JWT)
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# تسجيل دخول السائق
curl -X POST http://localhost:3000/api/v1/auth/driver/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "driver@example.com",
    "password": "password123"
  }'
```

---

## حالات الاختبار الإضافية

### اختبار Rate Limiting

1. أرسل 6 طلبات تسجيل دخول في أقل من دقيقة
2. يجب أن يعيد الطلب السادس 429 Too Many Requests

### اختبار Token الصلاحية

1. سجّل الدخول بنجاح
2. استخدم الـ token في طلب محمي (مثل `/api/v1/users/me`)
3. يجب أن يعمل الطلب بنجاح

---

**الملف التالي:** [02-auth-consent.md](02-auth-consent.md)
