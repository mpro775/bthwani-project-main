# اختبار سند - الخدمات المتخصصة

## نظرة عامة

هذا الملف يغطي اختبار عمليات إدارة طلبات سند (خدمات متخصصة، فزعة، خيري).

---

## العمليات

### 1. إنشاء طلب سند

**Endpoint:** `POST /sanad`

**Request Body:**
```json
{
  "ownerId": "507f1f77bcf86cd799439011",
  "title": "طلب فزعة لإسعاف عاجل",
  "description": "حالة طبية تحتاج نقل عاجل",
  "kind": "emergency",
  "metadata": {
    "location": "الرياض",
    "contact": "+9665XXXXXXX"
  }
}
```

**أنواع الطلبات (kind):**
- `specialist` - خدمات متخصصة
- `emergency` - فزعة
- `charity` - خيري

### 2. قائمة الطلبات

**Endpoint:** `GET /sanad`

### 3. تفاصيل طلب

**Endpoint:** `GET /sanad/:id`

### 4. تحديث طلب

**Endpoint:** `PATCH /sanad/:id`

### 5. حذف طلب

**Endpoint:** `DELETE /sanad/:id`

### 6. طلباتي

**Endpoint:** `GET /sanad/my`

### 7. البحث في الطلبات

**Endpoint:** `GET /sanad/search?q=إسعاف&kind=emergency`

---

**الملف السابق:** [25-maarouf.md](25-maarouf.md)  
**العودة للفهرس:** [00-INDEX.md](00-INDEX.md)
