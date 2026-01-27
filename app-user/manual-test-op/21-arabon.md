# اختبار عربون - العروض والحجوزات

## نظرة عامة

هذا الملف يغطي اختبار عمليات إدارة العربونات.

---

## العمليات

### 1. إنشاء عربون

**Endpoint:** `POST /arabon`

**Request Body:**
```json
{
  "ownerId": "507f1f77bcf86cd799439011",
  "title": "عربون لحجز عرض سياحي",
  "description": "حجز عرض لمدة نهاية الأسبوع",
  "depositAmount": 250.5,
  "scheduleAt": "2025-06-01T10:00:00.000Z",
  "metadata": {
    "guests": 2,
    "notes": "بدون تدخين"
  }
}
```

### 2. قائمة العربونات

**Endpoint:** `GET /arabon`

**Query Parameters:**
- `cursor`: مؤشر للصفحة
- `status`: فلترة حسب الحالة
- `ownerId`: فلترة حسب المالك

### 3. العربونات الخاصة بي

**Endpoint:** `GET /arabon/my`

### 4. البحث في العربونات

**Endpoint:** `GET /arabon/search?q=عرض سياحي`

### 5. إحصائيات العربونات

**Endpoint:** `GET /arabon/stats?scope=my`

### 6. سجل تغيير الحالة

**Endpoint:** `GET /arabon/:id/activity`

### 7. تفاصيل عربون

**Endpoint:** `GET /arabon/:id`

### 8. تحديث حالة عربون

**Endpoint:** `PATCH /arabon/:id/status`

### 9. تحديث عربون

**Endpoint:** `PATCH /arabon/:id`

### 10. حذف عربون

**Endpoint:** `DELETE /arabon/:id`

---

**الملف السابق:** [20-amani.md](20-amani.md)  
**الملف التالي:** [22-es3afni.md](22-es3afni.md)
