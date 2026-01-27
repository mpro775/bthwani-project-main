# اختبار المتاجر - تصفح المتاجر والبحث

## نظرة عامة

هذا الملف يغطي اختبار عمليات تصفح المتاجر والبحث عنها.

---

## المتطلبات الأساسية

- لا يتطلب مصادقة (Public endpoints)

---

## البيئة

- **Base URL:** `http://localhost:3000`
- **API Version:** v1 أو v2
- **Content-Type:** `application/json`

---

## العمليات

### 1. جلب قائمة المتاجر

**الهدف:** الحصول على قائمة المتاجر مع إمكانية الفلترة

**Endpoint:** `GET /delivery/stores`

**Headers:**
```
Content-Type: application/json
```

**Query Parameters (جميعها اختيارية):**
- `cursor`: مؤشر للصفحة التالية
- `limit`: عدد النتائج (default: 20)
- `categoryId`: فلترة حسب الفئة
- `isTrending`: فلترة المتاجر الشائعة (true/false)
- `isFeatured`: فلترة المتاجر المميزة (true/false)
- `usageType`: نوع الاستخدام

**خطوات الاختبار:**

1. أرسل طلب GET إلى `/delivery/stores`
2. (اختياري) أضف query parameters للفلترة
3. تحقق من الرد

**Expected Response (200 OK):**
```json
{
  "items": [
    {
      "id": "507f1f77bcf86cd799439030",
      "name": "مطعم الشام",
      "description": "مطعم سوري أصيل",
      "image": "https://example.com/store1.jpg",
      "rating": 4.5,
      "isTrending": true,
      "isFeatured": false,
      "category": {
        "id": "507f1f77bcf86cd799439040",
        "name": "مطاعم"
      }
    }
  ],
  "nextCursor": "507f1f77bcf86cd799439031",
  "hasMore": true
}
```

---

### 2. البحث عن متاجر

**الهدف:** البحث عن متاجر باستخدام كلمة مفتاحية

**Endpoint:** `GET /delivery/stores/search`

**Headers:**
```
Content-Type: application/json
```

**Query Parameters:**
- `q`: كلمة البحث (مطلوب)
- `cursor`: مؤشر للصفحة التالية
- `limit`: عدد النتائج

**خطوات الاختبار:**

1. أرسل طلب GET إلى `/delivery/stores/search?q=مطعم`
2. تحقق من الرد

**Expected Response (200 OK):**
```json
{
  "items": [
    {
      "id": "507f1f77bcf86cd799439030",
      "name": "مطعم الشام",
      "description": "مطعم سوري أصيل",
      "rating": 4.5
    }
  ],
  "nextCursor": null,
  "hasMore": false
}
```

---

### 3. جلب متجر محدد

**الهدف:** الحصول على تفاصيل متجر محدد

**Endpoint:** `GET /delivery/stores/:id`

**Headers:**
```
Content-Type: application/json
```

**Path Parameters:**
- `id`: معرف المتجر

**خطوات الاختبار:**

1. أرسل طلب GET إلى `/delivery/stores/{id}`
2. تحقق من الرد

**Expected Response (200 OK):**
```json
{
  "id": "507f1f77bcf86cd799439030",
  "name": "مطعم الشام",
  "description": "مطعم سوري أصيل",
  "image": "https://example.com/store1.jpg",
  "rating": 4.5,
  "reviewsCount": 150,
  "category": {
    "id": "507f1f77bcf86cd799439040",
    "name": "مطاعم"
  },
  "location": {
    "address": "شارع الملك فهد",
    "coordinates": {
      "lat": 24.7136,
      "lng": 46.6753
    }
  },
  "isOpen": true,
  "deliveryTime": "30-45 دقيقة"
}
```

**حالات الاختبار:**

❌ **حالة الفشل (404 Not Found):**
- المتجر غير موجود

---

### 4. جلب منتجات المتجر

**الهدف:** الحصول على قائمة منتجات متجر محدد

**Endpoint:** `GET /delivery/stores/:id/products`

**Headers:**
```
Content-Type: application/json
```

**Path Parameters:**
- `id`: معرف المتجر

**Query Parameters (اختيارية):**
- `cursor`: مؤشر للصفحة التالية
- `limit`: عدد النتائج

**خطوات الاختبار:**

1. أرسل طلب GET إلى `/delivery/stores/{id}/products`
2. تحقق من الرد

**Expected Response (200 OK):**
```json
{
  "items": [
    {
      "id": "507f1f77bcf86cd799439050",
      "name": "شاورما دجاج",
      "description": "شاورما دجاج طازج",
      "price": 25.50,
      "image": "https://example.com/product1.jpg",
      "isAvailable": true
    }
  ],
  "nextCursor": null,
  "hasMore": false
}
```

---

### 5. إحصائيات المتجر

**الهدف:** الحصول على إحصائيات المتجر

**Endpoint:** `GET /delivery/stores/:id/statistics`

**Headers:**
```
Content-Type: application/json
```

**Path Parameters:**
- `id`: معرف المتجر

**خطوات الاختبار:**

1. أرسل طلب GET إلى `/delivery/stores/{id}/statistics`
2. تحقق من الرد

**Expected Response (200 OK):**
```json
{
  "rating": 4.5,
  "reviewsCount": 150,
  "ordersCount": 1250,
  "totalRevenue": 50000
}
```

---

### 6. مراجعات المتجر

**الهدف:** الحصول على مراجعات المتجر

**Endpoint:** `GET /delivery/stores/:id/reviews`

**Headers:**
```
Content-Type: application/json
```

**Path Parameters:**
- `id`: معرف المتجر

**Query Parameters (اختيارية):**
- `cursor`: مؤشر للصفحة التالية
- `limit`: عدد النتائج

**خطوات الاختبار:**

1. أرسل طلب GET إلى `/delivery/stores/{id}/reviews`
2. تحقق من الرد

**Expected Response (200 OK):**
```json
{
  "items": [
    {
      "id": "507f1f77bcf86cd799439060",
      "user": {
        "name": "أحمد محمد"
      },
      "rating": 5,
      "comment": "مطعم رائع!",
      "createdAt": "2025-01-27T10:00:00.000Z"
    }
  ],
  "nextCursor": null,
  "hasMore": false
}
```

---

## التحقق

بعد كل عملية، تحقق من:

1. ✅ صحة البيانات المعادة
2. ✅ تطابق نتائج البحث مع الكلمة المفتاحية
3. ✅ صحة الفلترة عند استخدام query parameters

---

## ملاحظات مهمة

1. **Public Endpoints:** جميع هذه الـ endpoints عامة ولا تتطلب مصادقة
2. **Pagination:** استخدم cursor للتنقل بين الصفحات
3. **الفلترة:** يمكن دمج عدة فلاتر معاً

---

## أمثلة باستخدام curl

```bash
# جلب قائمة المتاجر
curl -X GET "http://localhost:3000/delivery/stores?limit=20" \
  -H "Content-Type: application/json"

# البحث عن متاجر
curl -X GET "http://localhost:3000/delivery/stores/search?q=مطعم" \
  -H "Content-Type: application/json"

# جلب متجر محدد
curl -X GET http://localhost:3000/delivery/stores/STORE_ID \
  -H "Content-Type: application/json"

# جلب منتجات المتجر
curl -X GET "http://localhost:3000/delivery/stores/STORE_ID/products" \
  -H "Content-Type: application/json"

# إحصائيات المتجر
curl -X GET http://localhost:3000/delivery/stores/STORE_ID/statistics \
  -H "Content-Type: application/json"

# مراجعات المتجر
curl -X GET "http://localhost:3000/delivery/stores/STORE_ID/reviews" \
  -H "Content-Type: application/json"
```

---

**الملف السابق:** [07-user-pin.md](07-user-pin.md)  
**الملف التالي:** [09-products.md](09-products.md)
