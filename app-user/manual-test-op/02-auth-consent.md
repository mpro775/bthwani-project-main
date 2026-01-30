# اختبار المصادقة - إدارة الموافقات (Consents)

## نظرة عامة

هذا الملف يغطي اختبار عمليات إدارة الموافقات (Consents) في التطبيق.

---

## المتطلبات الأساسية

- حساب مستخدم مسجل دخول
- JWT Access Token صالح
- معرف المستخدم (userId)

---

## البيئة

- **Base URL:** `http://localhost:3000`
- **API Version:** v1 أو v2
- **Content-Type:** `application/json`
- **Authorization:** `Bearer <accessToken>`

---

## أنواع الموافقات المتاحة

- `privacy_policy` - سياسة الخصوصية
- `terms_of_service` - شروط الخدمة
- `marketing` - التسويق
- `data_processing` - معالجة البيانات

---

## العمليات

### 1. تسجيل موافقة واحدة

**الهدف:** تسجيل موافقة واحدة للمستخدم

**Endpoint:** `POST /auth/consent`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "consentType": "privacy_policy",
  "version": "1.0",
  "granted": true,
  "notes": "موافقة على سياسة الخصوصية"
}
```

**خطوات الاختبار:**

1. تأكد من تسجيل الدخول والحصول على accessToken
2. أرسل طلب POST إلى `/auth/consent`
3. أرسل بيانات الموافقة في body
4. تحقق من الرد

**Expected Response (201 Created):**
```json
{
  "success": true,
  "message": "تم تسجيل الموافقة بنجاح",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "userId": "507f1f77bcf86cd799439011",
    "consentType": "privacy_policy",
    "granted": true,
    "version": "1.0",
    "consentDate": "2025-01-27T10:00:00.000Z",
    "ipAddress": "192.168.1.1",
    "userAgent": "Mozilla/5.0...",
    "notes": "موافقة على سياسة الخصوصية"
  }
}
```

**حالات الاختبار:**

✅ **حالة النجاح:**
- accessToken صالح
- consentType صحيح
- يجب أن يعيد بيانات الموافقة المسجلة

❌ **حالة الفشل (400 Bad Request):**
- consentType غير صحيح
- بيانات غير مكتملة

❌ **حالة الفشل (401 Unauthorized):**
- accessToken غير صالح أو منتهي الصلاحية

**Rate Limiting:**
- 10 موافقات في الدقيقة الواحدة

---

### 2. تسجيل موافقات متعددة دفعة واحدة

**الهدف:** تسجيل عدة موافقات في طلب واحد

**Endpoint:** `POST /auth/consent/bulk`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "consents": [
    {
      "consentType": "privacy_policy",
      "version": "1.0",
      "granted": true
    },
    {
      "consentType": "terms_of_service",
      "version": "1.0",
      "granted": true
    },
    {
      "consentType": "marketing",
      "version": "1.0",
      "granted": true
    }
  ]
}
```

**خطوات الاختبار:**

1. أرسل طلب POST إلى `/auth/consent/bulk`
2. أرسل مصفوفة من الموافقات في body
3. تحقق من الرد

**Expected Response (201 Created):**
```json
{
  "success": true,
  "message": "تم تسجيل 3 موافقة بنجاح",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "consentType": "privacy_policy",
      "granted": true,
      "version": "1.0"
    },
    {
      "_id": "507f1f77bcf86cd799439014",
      "consentType": "terms_of_service",
      "granted": true,
      "version": "1.0"
    },
    {
      "_id": "507f1f77bcf86cd799439015",
      "consentType": "marketing",
      "granted": true,
      "version": "1.0"
    }
  ]
}
```

**حالات الاختبار:**

✅ **حالة النجاح:**
- جميع الموافقات صحيحة
- يجب أن يعيد قائمة بجميع الموافقات المسجلة

❌ **حالة الفشل (400 Bad Request):**
- أحد consentType غير صحيح
- مصفوفة consents فارغة

---

### 3. سحب الموافقة

**الهدف:** سحب موافقة موجودة

**Endpoint:** `DELETE /auth/consent/:type`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <accessToken>
```

**Path Parameters:**
- `type`: نوع الموافقة (privacy_policy, terms_of_service, marketing, data_processing)

**Request Body (اختياري):**
```json
{
  "reason": "رغبة في سحب الموافقة"
}
```

**خطوات الاختبار:**

1. أرسل طلب DELETE إلى `/auth/consent/privacy_policy`
2. (اختياري) أرسل reason في body
3. تحقق من الرد

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "تم سحب الموافقة بنجاح",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "consentType": "privacy_policy",
    "granted": false,
    "withdrawnAt": "2025-01-27T11:00:00.000Z",
    "reason": "رغبة في سحب الموافقة"
  }
}
```

**حالات الاختبار:**

✅ **حالة النجاح:**
- الموافقة موجودة
- يجب أن يعيد بيانات الموافقة مع withdrawnAt

❌ **حالة الفشل (404 Not Found):**
- الموافقة غير موجودة

---

### 4. جلب سجل الموافقات

**الهدف:** الحصول على سجل جميع موافقات المستخدم

**Endpoint:** `GET /auth/consent/history`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Query Parameters (اختياري):**
- `type`: نوع الموافقة للفلترة

**خطوات الاختبار:**

1. أرسل طلب GET إلى `/auth/consent/history`
2. (اختياري) أضف query parameter للفلترة
3. تحقق من الرد

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "consentType": "privacy_policy",
      "granted": true,
      "version": "1.0",
      "consentDate": "2025-01-27T10:00:00.000Z",
      "withdrawnAt": null
    },
    {
      "_id": "507f1f77bcf86cd799439014",
      "consentType": "terms_of_service",
      "granted": true,
      "version": "1.0",
      "consentDate": "2025-01-27T10:05:00.000Z",
      "withdrawnAt": null
    }
  ],
  "count": 2
}
```

**حالات الاختبار:**

✅ **حالة النجاح:**
- يجب أن يعيد قائمة بجميع الموافقات
- يمكن الفلترة حسب النوع

---

### 5. ملخص الموافقات

**الهدف:** الحصول على ملخص حالة جميع الموافقات

**Endpoint:** `GET /auth/consent/summary`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**خطوات الاختبار:**

1. أرسل طلب GET إلى `/auth/consent/summary`
2. تحقق من الرد

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "privacy_policy": {
      "hasActiveConsent": true,
      "version": "1.0",
      "consentDate": "2025-01-27T10:00:00.000Z"
    },
    "terms_of_service": {
      "hasActiveConsent": true,
      "version": "1.0",
      "consentDate": "2025-01-27T10:05:00.000Z"
    },
    "marketing": {
      "hasActiveConsent": false
    },
    "data_processing": {
      "hasActiveConsent": false
    }
  }
}
```

**حالات الاختبار:**

✅ **حالة النجاح:**
- يجب أن يعيد ملخص لجميع أنواع الموافقات
- يوضح حالة كل موافقة (نشطة/غير نشطة)

---

### 6. التحقق من موافقة محددة

**الهدف:** التحقق من وجود موافقة نشطة لنوع محدد

**Endpoint:** `GET /auth/consent/check/:type`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Path Parameters:**
- `type`: نوع الموافقة

**خطوات الاختبار:**

1. أرسل طلب GET إلى `/auth/consent/check/privacy_policy`
2. تحقق من الرد

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "consentType": "privacy_policy",
    "hasActiveConsent": true
  }
}
```

**حالات الاختبار:**

✅ **حالة النجاح:**
- يجب أن يعيد حالة الموافقة (true/false)

❌ **حالة الفشل (404 Not Found):**
- نوع الموافقة غير صحيح

---

## التحقق

بعد كل عملية، تحقق من:

1. ✅ صحة البيانات المعادة
2. ✅ تسجيل الموافقة في قاعدة البيانات
3. ✅ تحديث حالة الموافقة عند السحب
4. ✅ صحة السجل والملخص

---

## ملاحظات مهمة

1. **الإصدارات:** كل موافقة لها version، يمكن تحديث الموافقة بإصدار جديد
2. **السحب:** عند سحب موافقة، يتم تسجيل تاريخ السحب والسبب
3. **IP و User Agent:** يتم تسجيل IP و User Agent تلقائياً
4. **Rate Limiting:** احترم حدود Rate Limiting (10 موافقات/دقيقة)

---

## أمثلة باستخدام curl

```bash
# تسجيل موافقة واحدة
curl -X POST http://localhost:3000/auth/consent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "consentType": "privacy_policy",
    "version": "1.0",
    "granted": true
  }'

# تسجيل موافقات متعددة
curl -X POST http://localhost:3000/auth/consent/bulk \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "consents": [
      {"consentType": "privacy_policy", "version": "1.0", "granted": true},
      {"consentType": "terms_of_service", "version": "1.0", "granted": true}
    ]
  }'

# سحب موافقة
curl -X DELETE http://localhost:3000/auth/consent/privacy_policy \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "reason": "رغبة في سحب الموافقة"
  }'

# جلب سجل الموافقات
curl -X GET "http://localhost:3000/auth/consent/history" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# ملخص الموافقات
curl -X GET http://localhost:3000/auth/consent/summary \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# التحقق من موافقة محددة
curl -X GET http://localhost:3000/auth/consent/check/privacy_policy \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## حالات الاختبار الإضافية

### اختبار دورة حياة الموافقة الكاملة

1. سجّل موافقة جديدة
2. تحقق من وجودها
3. سحب الموافقة
4. تحقق من سحبها
5. سجّل موافقة جديدة مرة أخرى

### اختبار الموافقات المتعددة

1. سجّل جميع أنواع الموافقات
2. تحقق من الملخص
3. سحب بعض الموافقات
4. تحقق من التحديثات

---

**الملف السابق:** [01-auth-login.md](01-auth-login.md)  
**الملف التالي:** [03-auth-password-reset.md](03-auth-password-reset.md)
