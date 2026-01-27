# اختبار كوادر - الوظائف والخدمات المهنية

## نظرة عامة

هذا الملف يغطي اختبار عمليات إدارة العروض الوظيفية.

---

## العمليات

### 1. إنشاء عرض وظيفي

**Endpoint:** `POST /kawader`

**Request Body:**
```json
{
  "ownerId": "507f1f77bcf86cd799439011",
  "title": "مطور Full Stack مطلوب لمشروع تقني",
  "description": "نحتاج مطور بخبرة 3+ سنوات في React و Node.js",
  "scope": "مشروع 6 أشهر",
  "budget": 15000,
  "metadata": {
    "experience": "3+ years",
    "skills": ["React", "Node.js"]
  }
}
```

### 2. قائمة العروض الوظيفية

**Endpoint:** `GET /kawader`

### 3. تفاصيل عرض وظيفي

**Endpoint:** `GET /kawader/:id`

### 4. تحديث عرض وظيفي

**Endpoint:** `PATCH /kawader/:id`

### 5. حذف عرض وظيفي

**Endpoint:** `DELETE /kawader/:id`

---

**الملف السابق:** [22-es3afni.md](22-es3afni.md)  
**الملف التالي:** [24-kenz.md](24-kenz.md)
