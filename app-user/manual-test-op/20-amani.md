# اختبار أماني - النقل النسائي

## نظرة عامة

هذا الملف يغطي اختبار عمليات إدارة طلبات النقل النسائي (أماني).

---

## العمليات

### 1. إنشاء طلب نقل نسائي

**Endpoint:** `POST /amani`

**Request Body:**
```json
{
  "ownerId": "507f1f77bcf86cd799439011",
  "title": "نقل عائلي من الرياض إلى جدة",
  "description": "نقل عائلي مكون من 4 أفراد مع أمتعة",
  "origin": {
    "lat": 24.7136,
    "lng": 46.6753,
    "address": "الرياض، المملكة العربية السعودية"
  },
  "destination": {
    "lat": 21.4858,
    "lng": 39.1925,
    "address": "جدة، المملكة العربية السعودية"
  },
  "metadata": {
    "passengers": 4,
    "luggage": true,
    "specialRequests": "كرسي أطفال"
  },
  "status": "draft"
}
```

### 2. قائمة طلبات النقل

**Endpoint:** `GET /amani`

**Query Parameters:**
- `cursor`: مؤشر للصفحة

### 3. تفاصيل طلب

**Endpoint:** `GET /amani/:id`

### 4. تحديث طلب

**Endpoint:** `PATCH /amani/:id`

### 5. حذف طلب

**Endpoint:** `DELETE /amani/:id`

### 6. تعيين سائق (يدوي)

**Endpoint:** `POST /amani/:id/assign-driver`

**Request Body:**
```json
{
  "driverId": "507f1f77bcf86cd799439013"
}
```

### 7. تعيين سائق (تلقائي)

**Endpoint:** `POST /amani/:id/assign-driver/auto`

### 8. تحديث حالة الطلب

**Endpoint:** `PATCH /amani/:id/status`

**Request Body:**
```json
{
  "status": "in_progress",
  "note": "بدأ السائق الرحلة"
}
```

### 9. إلغاء الطلب

**Endpoint:** `POST /amani/:id/cancel`

**Request Body:**
```json
{
  "reason": "تم الإلغاء من قبل العميل"
}
```

---

**الملف السابق:** [19-support.md](19-support.md)  
**الملف التالي:** [21-arabon.md](21-arabon.md)
