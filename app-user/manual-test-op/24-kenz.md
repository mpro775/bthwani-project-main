# اختبار كنز - السوق المفتوح

## نظرة عامة

هذا الملف يغطي اختبار عمليات إدارة إعلانات السوق.

---

## العمليات

### 1. إنشاء إعلان سوق

**Endpoint:** `POST /kenz`

**Request Body:**
```json
{
  "ownerId": "507f1f77bcf86cd799439011",
  "title": "iPhone 14 Pro مستعمل بحالة ممتازة",
  "description": "استخدام خفيف مع ضمان متبقي 6 أشهر",
  "price": 3500,
  "category": "إلكترونيات",
  "metadata": {
    "color": "فضي",
    "storage": "256GB"
  }
}
```

### 2. قائمة الإعلانات

**Endpoint:** `GET /kenz`

### 3. تفاصيل إعلان

**Endpoint:** `GET /kenz/:id`

### 4. تحديث إعلان

**Endpoint:** `PATCH /kenz/:id`

### 5. حذف إعلان

**Endpoint:** `DELETE /kenz/:id`

---

**الملف السابق:** [23-kawader.md](23-kawader.md)  
**الملف التالي:** [25-maarouf.md](25-maarouf.md)
