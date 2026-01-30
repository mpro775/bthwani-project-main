# اختبار المستخدم - إدارة رمز PIN

## نظرة عامة

هذا الملف يغطي اختبار عمليات إدارة رمز PIN للمستخدم.

---

## المتطلبات الأساسية

- حساب مستخدم مسجل دخول
- JWT Access Token صالح

---

## البيئة

- **Base URL:** `http://localhost:3000`
- **API Version:** v1 أو v2
- **Content-Type:** `application/json`
- **Authorization:** `Bearer <accessToken>`

---

## العمليات

### 1. تعيين رمز PIN

**الهدف:** تعيين رمز PIN جديد (4-6 أرقام)

**Endpoint:** `POST /users/pin/set`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "pin": "1234",
  "confirmPin": "1234"
}
```

**خطوات الاختبار:**

1. أرسل طلب POST إلى `/users/pin/set`
2. أرسل pin و confirmPin في body
3. تحقق من الرد

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "تم تعيين PIN بنجاح"
}
```

**حالات الاختبار:**

✅ **حالة النجاح:**
- PIN صحيح (4-6 أرقام)
- pin و confirmPin متطابقان
- يجب أن يعيد رسالة نجاح

❌ **حالة الفشل (400 Bad Request):**
- PIN ضعيف (أقل من 4 أرقام أو أكثر من 6)
- pin و confirmPin غير متطابقين

---

### 2. التحقق من رمز PIN

**الهدف:** التحقق من صحة رمز PIN

**Endpoint:** `POST /users/pin/verify`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "pin": "1234"
}
```

**خطوات الاختبار:**

1. أرسل طلب POST إلى `/users/pin/verify`
2. أرسل pin في body
3. تحقق من الرد

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "PIN صحيح"
}
```

**حالات الاختبار:**

✅ **حالة النجاح:**
- PIN صحيح
- يجب أن يعيد رسالة نجاح

❌ **حالة الفشل (401 Unauthorized):**
- PIN غير صحيح
- PIN محظور (بعد عدة محاولات فاشلة)

**ملاحظة:** يوجد حماية من Brute Force - بعد عدة محاولات فاشلة سيتم حظر PIN مؤقتاً

---

### 3. تغيير رمز PIN

**الهدف:** تغيير PIN الحالي (يتطلب PIN القديم)

**Endpoint:** `POST /users/pin/change`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "oldPin": "1234",
  "newPin": "5678",
  "confirmNewPin": "5678"
}
```

**خطوات الاختبار:**

1. أرسل طلب POST إلى `/users/pin/change`
2. أرسل oldPin و newPin و confirmNewPin في body
3. تحقق من الرد

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "تم تغيير PIN بنجاح"
}
```

**حالات الاختبار:**

✅ **حالة النجاح:**
- oldPin صحيح
- newPin صالح (4-6 أرقام)
- newPin و confirmNewPin متطابقان

❌ **حالة الفشل (401 Unauthorized):**
- oldPin غير صحيح

❌ **حالة الفشل (400 Bad Request):**
- newPin غير صالح
- newPin و confirmNewPin غير متطابقين

---

### 4. حالة رمز PIN

**الهدف:** التحقق من وجود PIN وحالة القفل

**Endpoint:** `GET /users/pin/status`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**خطوات الاختبار:**

1. أرسل طلب GET إلى `/users/pin/status`
2. تحقق من الرد

**Expected Response (200 OK):**
```json
{
  "hasPin": true,
  "isLocked": false,
  "lockedUntil": null,
  "attemptsRemaining": 5
}
```

**حالات الاختبار:**

✅ **حالة النجاح:**
- يجب أن يعيد حالة PIN
- يوضح إذا كان PIN موجود
- يوضح إذا كان PIN مقفول
- يوضح عدد المحاولات المتبقية

---

## التحقق

بعد كل عملية، تحقق من:

1. ✅ صحة البيانات المعادة
2. ✅ تحديث PIN في قاعدة البيانات (مشفّر)
3. ✅ إمكانية استخدام PIN الجديد في التحقق

---

## ملاحظات مهمة

1. **التشفير:** PIN يتم تشفيره باستخدام bcrypt
2. **حماية Brute Force:** بعد عدة محاولات فاشلة، سيتم حظر PIN مؤقتاً
3. **طول PIN:** يجب أن يكون بين 4-6 أرقام
4. **الأمان:** لا تشارك PIN مع أي شخص

---

## أمثلة باستخدام curl

```bash
# تعيين PIN
curl -X POST http://localhost:3000/users/pin/set \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "pin": "1234",
    "confirmPin": "1234"
  }'

# التحقق من PIN
curl -X POST http://localhost:3000/users/pin/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "pin": "1234"
  }'

# تغيير PIN
curl -X POST http://localhost:3000/users/pin/change \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "oldPin": "1234",
    "newPin": "5678",
    "confirmNewPin": "5678"
  }'

# حالة PIN
curl -X GET http://localhost:3000/users/pin/status \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## حالات الاختبار الإضافية

### اختبار حماية Brute Force

1. حاول التحقق من PIN بخاطئ 6 مرات متتالية
2. يجب أن يتم حظر PIN مؤقتاً
3. تحقق من حالة PIN - يجب أن يكون isLocked: true

### اختبار PIN ضعيف

1. حاول تعيين PIN أقل من 4 أرقام
2. يجب أن يفشل مع رسالة خطأ

### اختبار تطابق PIN

1. حاول تعيين PIN مع confirmPin غير متطابق
2. يجب أن يفشل مع رسالة خطأ

---

**الملف السابق:** [06-user-addresses.md](06-user-addresses.md)  
**الملف التالي:** [08-store-browsing.md](08-store-browsing.md)
