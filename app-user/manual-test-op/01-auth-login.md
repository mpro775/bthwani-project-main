# اختبار المصادقة - تسجيل الدخول

## نظرة عامة

هذا الملف يغطي اختبار عمليات تسجيل الدخول في التطبيق.

---

## المتطلبات الأساسية

- حساب Firebase صالح
- Firebase ID Token (يمكن الحصول عليه من تطبيق Firebase)
- Base URL للبيئة المستخدمة

---

## البيئة

- **Base URL:** `http://localhost:3000` (أو URL البيئة المستخدمة)
- **API Version:** v1 أو v2
- **Content-Type:** `application/json`

---

## العمليات

### 1. تسجيل الدخول عبر Firebase

**الهدف:** تسجيل دخول المستخدم باستخدام Firebase ID Token

**Endpoint:** `POST /auth/firebase/login`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6Ij..."
}
```

**خطوات الاختبار:**

1. احصل على Firebase ID Token من تطبيق Firebase
2. أرسل طلب POST إلى `/auth/firebase/login`
3. أرسل الـ ID Token في body
4. تحقق من الرد

**Expected Response (201 Created):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_here",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "phone": "+967777123456",
    "name": "أحمد محمد"
  }
}
```

**حالات الاختبار:**

✅ **حالة النجاح:**
- ID Token صالح
- المستخدم موجود في النظام
- يجب أن يعيد accessToken و user data

❌ **حالة الفشل (400 Bad Request):**
- ID Token غير صالح
- Request body غير صحيح

❌ **حالة الفشل (401 Unauthorized):**
- ID Token منتهي الصلاحية
- ID Token غير صحيح

**Rate Limiting:**
- 5 محاولات في الدقيقة الواحدة
- عند تجاوز الحد، سيتم إرجاع 429 Too Many Requests

---

### 2. تسجيل دخول السائق

**الهدف:** تسجيل دخول السائق باستخدام البريد الإلكتروني وكلمة المرور

**Endpoint:** `POST /auth/driver/login`

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

1. أرسل طلب POST إلى `/auth/driver/login`
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
3. ✅ إمكانية استخدام الـ token في الطلبات التالية
4. ✅ صلاحية الـ token (يمكن اختباره بإرسال طلب إلى `/users/me`)

---

## ملاحظات مهمة

1. **حفظ الـ Token:** احفظ الـ `accessToken` لاستخدامه في الطلبات التالية
2. **مدة صلاحية Token:** الـ token له مدة صلاحية محددة، عند انتهائها يجب تسجيل الدخول مرة أخرى
3. **Rate Limiting:** احترم حدود Rate Limiting لتجنب الحظر
4. **الأمان:** لا تشارك الـ tokens في السجلات أو الرسائل

---

## أمثلة باستخدام curl

```bash
# تسجيل الدخول عبر Firebase
curl -X POST http://localhost:3000/auth/firebase/login \
  -H "Content-Type: application/json" \
  -d '{
    "idToken": "YOUR_FIREBASE_ID_TOKEN"
  }'

# تسجيل دخول السائق
curl -X POST http://localhost:3000/auth/driver/login \
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
2. استخدم الـ token في طلب محمي (مثل `/users/me`)
3. يجب أن يعمل الطلب بنجاح

---

**الملف التالي:** [02-auth-consent.md](02-auth-consent.md)
