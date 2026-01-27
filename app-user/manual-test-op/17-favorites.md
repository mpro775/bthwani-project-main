# اختبار المفضلة - إدارة المفضلة

## نظرة عامة

هذا الملف يغطي اختبار عمليات إدارة المفضلة.

---

## العمليات

### 1. جلب جميع المفضلة

**Endpoint:** `GET /favorites`

**Query Parameters:**
- `flat`: إرجاع البيانات بشكل مسطح (1 أو 0)

### 2. إضافة عنصر للمفضلة

**Endpoint:** `POST /favorites`

**Request Body:**
```json
{
  "itemType": "store",
  "itemId": "507f1f77bcf86cd799439030"
}
```

### 3. حذف عنصر من المفضلة

**Endpoint:** `DELETE /favorites/:type/:id`

### 4. التحقق من وجود عنصر في المفضلة

**Endpoint:** `GET /favorites/exists/:type/:id`

### 5. جلب عدد المفضلة لعدة عناصر

**Endpoint:** `GET /favorites/counts?type=store&ids=id1,id2,id3`

---

**الملف السابق:** [16-payments.md](16-payments.md)  
**الملف التالي:** [18-notifications.md](18-notifications.md)
