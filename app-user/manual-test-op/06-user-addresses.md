# اختبار المستخدم - إدارة العناوين

## نظرة عامة

هذا الملف يغطي اختبار عمليات إدارة عناوين التوصيل للمستخدم.

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

### 1. جلب جميع العناوين

**الهدف:** الحصول على قائمة جميع عناوين المستخدم

**Endpoint:** `GET /users/addresses` أو `GET /users/address`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**خطوات الاختبار:**

1. أرسل طلب GET إلى `/users/addresses`
2. تحقق من الرد

**Expected Response (200 OK):**
```json
[
  {
    "id": "507f1f77bcf86cd799439020",
    "address": "شارع الملك فهد، حي النرجس",
    "city": "الرياض",
    "district": "النرجس",
    "buildingNumber": "123",
    "apartmentNumber": "45",
    "floor": "3",
    "coordinates": {
      "lat": 24.7136,
      "lng": 46.6753
    },
    "isDefault": true,
    "notes": "بجوار المدرسة"
  },
  {
    "id": "507f1f77bcf86cd799439021",
    "address": "شارع العليا",
    "city": "الرياض",
    "coordinates": {
      "lat": 24.7200,
      "lng": 46.6800
    },
    "isDefault": false
  }
]
```

---

### 2. إضافة عنوان جديد

**الهدف:** إضافة عنوان توصيل جديد

**Endpoint:** `POST /users/addresses` أو `POST /users/address`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "address": "شارع الملك فهد، حي النرجس",
  "city": "الرياض",
  "district": "النرجس",
  "buildingNumber": "123",
  "apartmentNumber": "45",
  "floor": "3",
  "coordinates": {
    "lat": 24.7136,
    "lng": 46.6753
  },
  "notes": "بجوار المدرسة"
}
```

**خطوات الاختبار:**

1. أرسل طلب POST إلى `/users/addresses`
2. أرسل بيانات العنوان في body
3. تحقق من الرد

**Expected Response (201 Created):**
```json
{
  "id": "507f1f77bcf86cd799439022",
  "address": "شارع الملك فهد، حي النرجس",
  "city": "الرياض",
  "district": "النرجس",
  "buildingNumber": "123",
  "apartmentNumber": "45",
  "floor": "3",
  "coordinates": {
    "lat": 24.7136,
    "lng": 46.6753
  },
  "isDefault": false,
  "notes": "بجوار المدرسة",
  "createdAt": "2025-01-27T12:00:00.000Z"
}
```

**حالات الاختبار:**

✅ **حالة النجاح:**
- البيانات صحيحة
- يجب أن يعيد العنوان المضاف

❌ **حالة الفشل (400 Bad Request):**
- بيانات غير صالحة (مثل coordinates مفقودة)

---

### 3. تحديث عنوان موجود

**الهدف:** تحديث بيانات عنوان موجود

**Endpoint:** `PATCH /users/addresses/:addressId` أو `PATCH /users/address/:id`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <accessToken>
```

**Path Parameters:**
- `addressId`: معرف العنوان

**Request Body (جميع الحقول اختيارية):**
```json
{
  "address": "شارع الملك فهد، حي النرجس (محدث)",
  "notes": "ملاحظات محدثة"
}
```

**خطوات الاختبار:**

1. أرسل طلب PATCH إلى `/users/addresses/{addressId}`
2. أرسل البيانات المراد تحديثها في body
3. تحقق من الرد

**Expected Response (200 OK):**
```json
{
  "id": "507f1f77bcf86cd799439020",
  "address": "شارع الملك فهد، حي النرجس (محدث)",
  "notes": "ملاحظات محدثة",
  "updatedAt": "2025-01-27T12:05:00.000Z"
}
```

**حالات الاختبار:**

✅ **حالة النجاح:**
- العنوان موجود
- يجب أن يعيد العنوان المحدث

❌ **حالة الفشل (404 Not Found):**
- العنوان غير موجود

---

### 4. حذف عنوان

**الهدف:** حذف عنوان من القائمة

**Endpoint:** `DELETE /users/addresses/:addressId` أو `DELETE /users/address/:id`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Path Parameters:**
- `addressId`: معرف العنوان

**خطوات الاختبار:**

1. أرسل طلب DELETE إلى `/users/addresses/{addressId}`
2. تحقق من الرد

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "تم حذف العنوان بنجاح"
}
```

**حالات الاختبار:**

✅ **حالة النجاح:**
- العنوان موجود
- يجب أن يتم حذفه

❌ **حالة الفشل (404 Not Found):**
- العنوان غير موجود

---

### 5. تعيين العنوان الافتراضي

**الهدف:** جعل عنوان معين هو العنوان الافتراضي

**Endpoint:** `POST /users/addresses/:addressId/set-default` أو `PATCH /users/default-address`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <accessToken>
```

**Path Parameters (لـ POST):**
- `addressId`: معرف العنوان

**Request Body (لـ PATCH):**
```json
{
  "addressId": "507f1f77bcf86cd799439020"
}
```

**خطوات الاختبار:**

1. أرسل طلب POST إلى `/users/addresses/{addressId}/set-default`
2. تحقق من الرد

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "تم تعيين العنوان الافتراضي بنجاح",
  "data": {
    "id": "507f1f77bcf86cd799439020",
    "isDefault": true
  }
}
```

**حالات الاختبار:**

✅ **حالة النجاح:**
- العنوان موجود
- يجب أن يصبح العنوان الافتراضي
- يجب أن يتم إلغاء العنوان الافتراضي السابق

---

## التحقق

بعد كل عملية، تحقق من:

1. ✅ صحة البيانات المعادة
2. ✅ تحديث/حذف العنوان في قاعدة البيانات
3. ✅ تحديث العنوان الافتراضي عند الحاجة

---

## ملاحظات مهمة

1. **العنوان الافتراضي:** يمكن أن يكون هناك عنوان افتراضي واحد فقط
2. **الإحداثيات:** يجب توفير coordinates (lat, lng) عند إضافة عنوان
3. **الحقول المطلوبة:** address و city و coordinates مطلوبة

---

## أمثلة باستخدام curl

```bash
# جلب جميع العناوين
curl -X GET http://localhost:3000/users/addresses \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# إضافة عنوان جديد
curl -X POST http://localhost:3000/users/addresses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "address": "شارع الملك فهد",
    "city": "الرياض",
    "coordinates": {"lat": 24.7136, "lng": 46.6753}
  }'

# تحديث عنوان
curl -X PATCH http://localhost:3000/users/addresses/ADDRESS_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "address": "عنوان محدث"
  }'

# حذف عنوان
curl -X DELETE http://localhost:3000/users/addresses/ADDRESS_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# تعيين العنوان الافتراضي
curl -X POST http://localhost:3000/users/addresses/ADDRESS_ID/set-default \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

**الملف السابق:** [05-user-profile.md](05-user-profile.md)  
**الملف التالي:** [07-user-pin.md](07-user-pin.md)
