# وحدة سند — خدمات متخصصة + فزعة + خيري

## نظرة عامة

«سند» هي وحدة لإدارة الطلبات المتخصصة، ونداءات الفزعة، والمبادرات الخيرية. تتيح للمستخدمين إنشاء طلبات مع تفاصيل ونوع الخدمة المطلوبة، مع توثيق كامل عبر Swagger.

## الميزات الرئيسية

- **إنشاء طلب**: إضافة طلب جديد (متخصص/فزعة/خيري).
- **تحديث الطلب**: تعديل التفاصيل والحالة.
- **حذف الطلب**: إزالة الطلب نهائياً.
- **قائمة الطلبات**: مع دعم pagination بالـ cursor.
- **توثيق عربي كامل**: عبر Swagger UI.

## الهيكل التقني

```
src/modules/sanad/
├── sanad.controller.ts    # واجهة REST وتوثيق Swagger
├── sanad.service.ts       # منطق الأعمال
├── sanad.module.ts        # تجميع الوحدة وتهيئة Mongoose
├── entities/
│   └── sanad.entity.ts    # مخطط البيانات
├── dto/
│   ├── create-sanad.dto.ts # DTO الإنشاء مع التحقق
│   └── update-sanad.dto.ts # DTO التحديث مع التحقق
└── README.md             # هذا الملف
```

## نموذج البيانات

```typescript
interface Sanad {
  _id: string;
  ownerId: string;                 // صاحب الطلب
  title: string;                   // عنوان الطلب
  description?: string;            // تفاصيل إضافية
  kind?: 'specialist' | 'emergency' | 'charity';
  metadata?: Record<string, any>;
  status: 'draft' | 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}
```

## API Endpoints

| الطريقة | المسار | الوصف |
|---------|--------|--------|
| `POST` | `/api/v2/sanad` | إنشاء طلب |
| `GET` | `/api/v2/sanad` | قائمة الطلبات (cursor) |
| `GET` | `/api/v2/sanad/:id` | تفاصيل طلب |
| `PATCH` | `/api/v2/sanad/:id` | تحديث طلب |
| `DELETE` | `/api/v2/sanad/:id` | حذف طلب |
| `GET` | `/api/v2/sanad/my` | طلباتي (cursor) |
| `GET` | `/api/v2/sanad/search` | البحث في الطلبات |

### أمثلة سريعة

- إنشاء:
```bash
POST /api/v2/sanad
Authorization: Bearer <token>
Content-Type: application/json

{
  "ownerId": "507f1f77bcf86cd799439011",
  "title": "طلب فزعة لإسعاف عاجل",
  "description": "حالة طبية تحتاج نقل عاجل",
  "kind": "emergency",
  "metadata": { "location": "الرياض", "contact": "+9665XXXXXXX" },
  "status": "draft"
}
```

- تحديث:
```bash
PATCH /api/v2/sanad/507f1f77bcf86cd799439012
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "confirmed",
  "kind": "specialist",
  "metadata": { "location": "الدمام" }
}
```

## التوثيق التفاعلي (Swagger)

- الوصول عبر: `/api/docs`.
- `BearerAuth` مطلوب.
- أمثلة عربية كاملة لكل الحقول.

## التحقق من البيانات

- `class-validator` مستخدم في DTOs.
- أنواع مدعومة: `IsString`, `IsObject`, `IsEnum`, `IsOptional`.

## قاعدة البيانات

- Mongoose Schema باسم `Sanad`.
- Pagination عبر `_id` تنازلياً و`cursor`.

## التطوير المستقبلي

- فئات فرعية لأنواع الطلب (نماذج حقول مخصّصة لكل نوع).
- إشعارات فورية للمستجيبين.
- لوحة متابعة لحالة الطلبات.

## الاختبار

```bash
npm test
npm run test:e2e
npm run test:cov
```
