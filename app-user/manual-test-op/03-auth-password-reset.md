# اختبار المصادقة - إعادة تعيين كلمة المرور

## نظرة عامة

هذا الملف يغطي اختبار عمليات إعادة تعيين كلمة المرور في التطبيق.

---

## المتطلبات الأساسية

- حساب مستخدم موجود في النظام
- بريد إلكتروني أو رقم هاتف مسجل
- إمكانية الوصول للبريد الإلكتروني أو الرسائل النصية

---

## البيئة

- **Base URL:** `http://localhost:3000`
- **API Version:** v1 أو v2
- **Content-Type:** `application/json`

---

## العمليات

### 1. طلب إعادة تعيين كلمة المرور

**الهدف:** طلب رمز إعادة تعيين كلمة المرور

**Endpoint:** `POST /auth/forgot`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "emailOrPhone": "user@example.com"
}
```

أو

```json
{
  "emailOrPhone": "+967777123456"
}
```

**خطوات الاختبار:**

1. أرسل طلب POST إلى `/auth/forgot`
2. أرسل email أو phone في body
3. تحقق من الرد
4. تحقق من وصول رمز إعادة التعيين (بريد/رسالة نصية)

**Expected Response (201 Created):**
```json
{
  "success": true,
  "message": "تم إرسال رمز إعادة التعيين",
  "userMessage": "تم إرسال رمز التحقق إلى بريدك الإلكتروني أو هاتفك"
}
```

**حالات الاختبار:**

✅ **حالة النجاح:**
- emailOrPhone موجود في النظام
- يجب أن يعيد رسالة نجاح
- يجب أن يصل رمز إعادة التعيين

❌ **حالة الفشل (400 Bad Request):**
- emailOrPhone غير صحيح
- Request body غير مكتمل

❌ **حالة الفشل (404 Not Found):**
- المستخدم غير موجود

**Rate Limiting:**
- 3 طلبات في الدقيقة الواحدة

---

### 2. التحقق من رمز إعادة التعيين

**الهدف:** التحقق من صحة رمز إعادة التعيين

**Endpoint:** `POST /auth/reset/verify`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "emailOrPhone": "user@example.com",
  "code": "123456"
}
```

**خطوات الاختبار:**

1. احصل على رمز إعادة التعيين من البريد/الرسالة
2. أرسل طلب POST إلى `/auth/reset/verify`
3. أرسل emailOrPhone و code في body
4. تحقق من الرد

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "الرمز صحيح",
  "data": {
    "valid": true
  }
}
```

**حالات الاختبار:**

✅ **حالة النجاح:**
- الرمز صحيح
- يجب أن يعيد valid: true

❌ **حالة الفشل (400 Bad Request):**
- الرمز غير صحيح
- يجب أن يعيد valid: false

❌ **حالة الفشل (404 Not Found):**
- المستخدم غير موجود

**Rate Limiting:**
- 5 محاولات في الدقيقة الواحدة

---

### 3. إعادة تعيين كلمة المرور

**الهدف:** إعادة تعيين كلمة المرور باستخدام الرمز

**Endpoint:** `POST /auth/reset`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "emailOrPhone": "user@example.com",
  "code": "123456",
  "newPassword": "NewPassword123!"
}
```

**خطوات الاختبار:**

1. تأكد من التحقق من الرمز أولاً
2. أرسل طلب POST إلى `/auth/reset`
3. أرسل emailOrPhone و code و newPassword في body
4. تحقق من الرد
5. جرب تسجيل الدخول بكلمة المرور الجديدة

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "تم إعادة تعيين كلمة المرور بنجاح",
  "userMessage": "تم تغيير كلمة المرور بنجاح، يمكنك تسجيل الدخول الآن"
}
```

**حالات الاختبار:**

✅ **حالة النجاح:**
- الرمز صحيح
- كلمة المرور الجديدة صالحة
- يجب أن يعيد رسالة نجاح
- يجب أن تعمل كلمة المرور الجديدة في تسجيل الدخول

❌ **حالة الفشل (400 Bad Request):**
- الرمز غير صحيح أو منتهي الصلاحية
- كلمة المرور الجديدة ضعيفة
- Request body غير مكتمل

❌ **حالة الفشل (404 Not Found):**
- المستخدم غير موجود

**Rate Limiting:**
- 3 محاولات في الدقيقة الواحدة

---

## التحقق

بعد كل عملية، تحقق من:

1. ✅ وصول رمز إعادة التعيين (بريد/رسالة)
2. ✅ صحة الرمز عند التحقق
3. ✅ نجاح إعادة تعيين كلمة المرور
4. ✅ إمكانية تسجيل الدخول بكلمة المرور الجديدة

---

## ملاحظات مهمة

1. **مدة صلاحية الرمز:** الرمز له مدة صلاحية محددة (عادة 15-30 دقيقة)
2. **قوة كلمة المرور:** تأكد من استخدام كلمة مرور قوية
3. **Rate Limiting:** احترم حدود Rate Limiting لتجنب الحظر
4. **الأمان:** لا تشارك رموز إعادة التعيين

---

## أمثلة باستخدام curl

```bash
# طلب إعادة تعيين كلمة المرور
curl -X POST http://localhost:3000/auth/forgot \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrPhone": "user@example.com"
  }'

# التحقق من رمز إعادة التعيين
curl -X POST http://localhost:3000/auth/reset/verify \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrPhone": "user@example.com",
    "code": "123456"
  }'

# إعادة تعيين كلمة المرور
curl -X POST http://localhost:3000/auth/reset \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrPhone": "user@example.com",
    "code": "123456",
    "newPassword": "NewPassword123!"
  }'
```

---

## حالات الاختبار الإضافية

### اختبار دورة إعادة التعيين الكاملة

1. اطلب رمز إعادة التعيين
2. تحقق من وصول الرمز
3. تحقق من صحة الرمز
4. أعد تعيين كلمة المرور
5. سجّل الدخول بكلمة المرور الجديدة

### اختبار الرمز المنتهي الصلاحية

1. اطلب رمز إعادة التعيين
2. انتظر انتهاء صلاحية الرمز
3. حاول استخدام الرمز
4. يجب أن يفشل

### اختبار Rate Limiting

1. أرسل 4 طلبات إعادة تعيين في أقل من دقيقة
2. يجب أن يعيد الطلب الرابع 429 Too Many Requests

---

**الملف السابق:** [02-auth-consent.md](02-auth-consent.md)  
**الملف التالي:** [04-auth-otp.md](04-auth-otp.md)
