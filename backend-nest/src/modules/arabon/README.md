# وحدة عربون — العروض والحجوزات بعربون

## نظرة عامة

وحدة «عربون» تُعنى بإدارة العروض والحجوزات التي تتطلب دفع عربون مسبق، مع دعم الجدولة وتتبع الحالة. تهدف لتقديم عملية حجز مرنة وموثوقة مع توثيق كامل وسهل عبر Swagger.

## الميزات الرئيسية

- **إنشاء عربون**: إضافة سجل جديد يتضمن مبلغ العربون والجدولة.
- **تحديث العربون**: تعديل التفاصيل والحالة.
- **حذف العربون**: إزالة السجل نهائياً.
- **قائمة العربونات**: استرجاع قائمة مع دعم التنقل بالـ cursor.
- **توثيق عربي كامل**: عبر Swagger UI.

## الهيكل التقني

```
src/modules/arabon/
├── arabon.controller.ts    # واجهة REST وتوثيق Swagger
├── arabon.service.ts       # منطق الأعمال والاستعلامات
├── arabon.module.ts        # تجميع الوحدة وتهيئة Mongoose
├── entities/
│   └── arabon.entity.ts    # مخطط البيانات (Mongoose)
├── dto/
│   ├── create-arabon.dto.ts # DTO الإنشاء مع التحقق
│   └── update-arabon.dto.ts # DTO التحديث مع التحقق
└── README.md               # هذا الملف
```

## نموذج البيانات

```typescript
interface Arabon {
  _id: string;
  ownerId: string;                 // معرف صاحب العربون
  title: string;                   // عنوان
  description?: string;            // وصف اختياري
  depositAmount?: number;          // قيمة العربون
  scheduleAt?: string;             // موعد التنفيذ ISO8601
  metadata?: Record<string, any>;  // بيانات إضافية
  status: 'draft' | 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;               // تاريخ الإنشاء
  updatedAt: string;               // تاريخ التحديث
}
```

## API Endpoints

| الطريقة | المسار | الوصف |
|---------|--------|--------|
| `POST` | `/api/v2/arabon` | إنشاء عربون |
| `GET` | `/api/v2/arabon` | قائمة العربونات (cursor) |
| `GET` | `/api/v2/arabon/:id` | تفاصيل عربون |
| `PATCH` | `/api/v2/arabon/:id` | تحديث عربون |
| `DELETE` | `/api/v2/arabon/:id` | حذف عربون |

### أمثلة سريعة

- إنشاء:
```bash
POST /api/v2/arabon
Authorization: Bearer <token>
Content-Type: application/json

{
  "ownerId": "507f1f77bcf86cd799439011",
  "title": "عربون لحجز عرض سياحي",
  "depositAmount": 250.5,
  "scheduleAt": "2025-06-01T10:00:00.000Z",
  "metadata": { "guests": 2 },
  "status": "draft"
}
```

- قائمة:
```bash
GET /api/v2/arabon?cursor=507f1f77bcf86cd799439012
Authorization: Bearer <token>
```

- تحديث:
```bash
PATCH /api/v2/arabon/507f1f77bcf86cd799439012
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "confirmed",
  "depositAmount": 300
}
```

## التوثيق التفاعلي (Swagger)

- تم توثيق كافة النقاط مع أمثلة عربية.
- الوصول عبر: `/api/docs`.
- يتطلب `BearerAuth`.

## التحقق من البيانات

- استخدام `class-validator` في DTOs:
  - `IsString`, `IsNumber`, `IsISO8601`, `IsEnum`, `IsOptional`.
- رسائل خطأ واضحة عند إدخال غير صحيح.

## قاعدة البيانات

- Mongoose مع مخطط `Arabon`.
- مؤشرات فرز وتصفح بالـ cursor عبر `_id` تنازلياً.

## التطوير المستقبلي

- عمليات دفع متكاملة.
- إعدادات مهلة للعربون وإلغائه تلقائياً.
- إشعارات بالحالة.

## الاختبار

```bash
npm test
npm run test:e2e
npm run test:cov
```

## المساهمة

- افتح فرع، نفّذ التعديلات، ثم قدّم Pull Request.
