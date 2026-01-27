# اختبار المستخدم - إدارة الملف الشخصي

## نظرة عامة

هذا الملف يغطي اختبار عمليات إدارة الملف الشخصي للمستخدم.

---

## المتطلبات الأساسية

- حساب مستخدم مسجل دخول
- Firebase Access Token صالح

---

## البيئة

- **Base URL:** `http://localhost:3000`
- **API Version:** v1 أو v2
- **Content-Type:** `application/json`
- **Authorization:** `Bearer <accessToken>`

---

## العمليات

### 1. جلب بيانات المستخدم الحالي

**الهدف:** الحصول على جميع بيانات المستخدم الحالي

**Endpoint:** `GET /users/me`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**خطوات الاختبار:**

1. تأكد من تسجيل الدخول والحصول على accessToken
2. أرسل طلب GET إلى `/users/me`
3. تحقق من الرد

**Expected Response (200 OK):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "phone": "+967777123456",
  "fullName": "أحمد محمد",
  "aliasName": "أحمد",
  "profileImage": "https://example.com/image.jpg",
  "language": "ar",
  "theme": "dark",
  "defaultAddressId": "507f1f77bcf86cd799439020",
  "defaultAddress": {
    "id": "507f1f77bcf86cd799439020",
    "address": "شارع الملك فهد",
    "city": "الرياض",
    "coordinates": {
      "lat": 24.7136,
      "lng": 46.6753
    }
  },
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-27T10:00:00.000Z"
}
```

**حالات الاختبار:**

✅ **حالة النجاح:**
- accessToken صالح
- يجب أن يعيد جميع بيانات المستخدم

❌ **حالة الفشل (401 Unauthorized):**
- accessToken غير صالح أو منتهي الصلاحية

---

### 2. تحديث الملف الشخصي

**الهدف:** تحديث بيانات المستخدم

**Endpoint:** `PATCH /users/me` أو `PATCH /users/profile`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <accessToken>
```

**Request Body (جميع الحقول اختيارية):**
```json
{
  "fullName": "أحمد محمد علي",
  "aliasName": "أحمد",
  "phone": "+967777123456",
  "profileImage": "https://example.com/new-image.jpg",
  "language": "ar",
  "theme": "light"
}
```

**خطوات الاختبار:**

1. أرسل طلب PATCH إلى `/users/me`
2. أرسل البيانات المراد تحديثها في body
3. تحقق من الرد

**Expected Response (200 OK):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "fullName": "أحمد محمد علي",
  "aliasName": "أحمد",
  "phone": "+967777123456",
  "profileImage": "https://example.com/new-image.jpg",
  "language": "ar",
  "theme": "light",
  "updatedAt": "2025-01-27T11:00:00.000Z"
}
```

**حالات الاختبار:**

✅ **حالة النجاح:**
- البيانات صحيحة
- يجب أن يعيد البيانات المحدثة

❌ **حالة الفشل (400 Bad Request):**
- بيانات غير صالحة (مثل phone format خاطئ)

❌ **حالة الفشل (401 Unauthorized):**
- accessToken غير صالح

---

### 3. تحديث صورة الملف الشخصي

**الهدف:** تحديث صورة الملف الشخصي فقط

**Endpoint:** `PATCH /users/avatar`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "image": "https://example.com/new-avatar.jpg"
}
```

**خطوات الاختبار:**

1. أرسل طلب PATCH إلى `/users/avatar`
2. أرسل رابط الصورة في body
3. تحقق من الرد

**Expected Response (200 OK):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "profileImage": "https://example.com/new-avatar.jpg",
  "updatedAt": "2025-01-27T11:05:00.000Z"
}
```

---

### 4. حذف حساب المستخدم

**الهدف:** حذف حساب المستخدم نهائياً

**Endpoint:** `DELETE /users/me`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**خطوات الاختبار:**

1. ⚠️ **تحذير:** هذه العملية لا يمكن التراجع عنها
2. أرسل طلب DELETE إلى `/users/me`
3. تحقق من الرد

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "تم حذف الحساب بنجاح"
}
```

**حالات الاختبار:**

✅ **حالة النجاح:**
- يجب أن يعيد رسالة نجاح
- يجب أن يتم حذف الحساب من النظام

❌ **حالة الفشل (401 Unauthorized):**
- accessToken غير صالح

---

### 5. إلغاء تفعيل الحساب

**الهدف:** تعطيل حساب المستخدم بشكل مؤقت

**Endpoint:** `DELETE /users/deactivate`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**خطوات الاختبار:**

1. أرسل طلب DELETE إلى `/users/deactivate`
2. تحقق من الرد

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "تم تعطيل الحساب بنجاح"
}
```

**حالات الاختبار:**

✅ **حالة النجاح:**
- يجب أن يعيد رسالة نجاح
- يجب أن يتم تعطيل الحساب

---

## التحقق

بعد كل عملية، تحقق من:

1. ✅ صحة البيانات المعادة
2. ✅ تحديث البيانات في قاعدة البيانات
3. ✅ إمكانية استخدام البيانات المحدثة في الطلبات التالية

---

## ملاحظات مهمة

1. **الحقول الاختيارية:** جميع الحقول في تحديث الملف الشخصي اختيارية
2. **حذف الحساب:** عملية لا يمكن التراجع عنها، استخدمها بحذر
3. **إلغاء التفعيل:** يمكن إعادة تفعيل الحساب لاحقاً (حسب النظام)

---

## أمثلة باستخدام curl

```bash
# جلب بيانات المستخدم
curl -X GET http://localhost:3000/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# تحديث الملف الشخصي
curl -X PATCH http://localhost:3000/users/me \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "fullName": "أحمد محمد علي",
    "aliasName": "أحمد",
    "theme": "light"
  }'

# تحديث صورة الملف الشخصي
curl -X PATCH http://localhost:3000/users/avatar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "image": "https://example.com/new-avatar.jpg"
  }'

# حذف الحساب
curl -X DELETE http://localhost:3000/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## حالات الاختبار الإضافية

### اختبار تحديث جزئي

1. حدّث حقل واحد فقط (مثل fullName)
2. تحقق من تحديث الحقل فقط
3. تحقق من عدم تغيير الحقول الأخرى

### اختبار صحة البيانات

1. حاول تحديث phone بتنسيق خاطئ
2. يجب أن يفشل مع رسالة خطأ مناسبة

---

**الملف السابق:** [04-auth-otp.md](04-auth-otp.md)  
**الملف التالي:** [06-user-addresses.md](06-user-addresses.md)
