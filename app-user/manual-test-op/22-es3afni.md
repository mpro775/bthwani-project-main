# اختبار اسعفني - التبرع بالدم

## نظرة عامة

هذا الملف يغطي اختبار عمليات إدارة بلاغات التبرع بالدم.

---

## العمليات

### 1. إنشاء نداء تبرع بالدم

**Endpoint:** `POST /es3afni`

**Request Body:**
```json
{
  "ownerId": "507f1f77bcf86cd799439011",
  "title": "حاجة عاجلة لفصيلة O+ في الرياض",
  "description": "المريض بحاجة عاجلة للتبرع خلال 24 ساعة",
  "bloodType": "O+",
  "location": {
    "lat": 24.7136,
    "lng": 46.6753,
    "address": "مستشفى الملك فيصل التخصصي، الرياض"
  },
  "metadata": {
    "contact": "+9665XXXXXXX",
    "unitsNeeded": 3
  }
}
```

### 2. قائمة البلاغات

**Endpoint:** `GET /es3afni`

### 3. تفاصيل بلاغ

**Endpoint:** `GET /es3afni/:id`

### 4. تحديث بلاغ

**Endpoint:** `PATCH /es3afni/:id`

### 5. حذف بلاغ

**Endpoint:** `DELETE /es3afni/:id`

### 6. بلاغاتي الخاصة

**Endpoint:** `GET /es3afni/my`

### 7. البحث في البلاغات

**Endpoint:** `GET /es3afni/search?q=فصيلة O+&bloodType=O+`

---

**الملف السابق:** [21-arabon.md](21-arabon.md)  
**الملف التالي:** [23-kawader.md](23-kawader.md)
