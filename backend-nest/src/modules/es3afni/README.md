# وحدة اسعفني — شبكة تبرع بالدم عاجلة

## نظرة عامة

«اسعفني» هي وحدة لإدارة بلاغات التبرع بالدم العاجلة، تساعد في نشر النداءات بسرعة مع تحديد نوع الدم والموقع ووسائل التواصل. تم تجهيزها بتوثيق كامل عبر Swagger.

## الميزات الرئيسية

- **إنشاء بلاغ**: إضافة نداء تبرع بالدم.
- **تحديث البلاغ**: تعديل التفاصيل والحالة.
- **حذف البلاغ**: إزالة البلاغ نهائياً.
- **قائمة البلاغات**: مع دعم pagination بالـ cursor.
- **توثيق عربي كامل**: عبر Swagger UI.

## الهيكل التقني

```
src/modules/es3afni/
├── es3afni.controller.ts    # واجهة REST وتوثيق Swagger
├── es3afni.service.ts       # منطق الأعمال
├── es3afni.module.ts        # تجميع الوحدة وتهيئة Mongoose
├── entities/
│   └── es3afni.entity.ts    # مخطط البيانات
├── dto/
│   ├── create-es3afni.dto.ts # DTO الإنشاء مع التحقق
│   └── update-es3afni.dto.ts # DTO التحديث مع التحقق
└── README.md               # هذا الملف
```

## نموذج البيانات

```typescript
interface Es3afni {
  _id: string;
  ownerId: string;                 // صاحب البلاغ
  title: string;                   // عنوان النداء
  description?: string;            // تفاصيل إضافية
  bloodType?: string;              // فصيلة الدم المطلوبة
  location?: { lat: number; lng: number; address: string };
  metadata?: Record<string, any>;
  status: 'draft' | 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}
```

## API Endpoints

| الطريقة | المسار | الوصف |
|---------|--------|--------|
| `POST` | `/api/v2/es3afni` | إنشاء بلاغ |
| `GET` | `/api/v2/es3afni` | قائمة البلاغات (cursor) |
| `GET` | `/api/v2/es3afni/:id` | تفاصيل بلاغ |
| `PATCH` | `/api/v2/es3afni/:id` | تحديث بلاغ |
| `DELETE` | `/api/v2/es3afni/:id` | حذف بلاغ |

### أمثلة سريعة

- إنشاء:
```bash
POST /api/v2/es3afni
Authorization: Bearer <token>
Content-Type: application/json

{
  "ownerId": "507f1f77bcf86cd799439011",
  "title": "حاجة عاجلة لفصيلة O+ في الرياض",
  "description": "المريض بحاجة عاجلة خلال 24 ساعة",
  "bloodType": "O+",
  "location": { "lat": 24.7136, "lng": 46.6753, "address": "الرياض" },
  "metadata": { "contact": "+9665XXXXXXX", "unitsNeeded": 3 },
  "status": "draft"
}
```

- تحديث:
```bash
PATCH /api/v2/es3afni/507f1f77bcf86cd799439012
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "confirmed",
  "metadata": { "unitsNeeded": 2 }
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

- Mongoose Schema باسم `Es3afni`.
- Pagination عبر `_id` تنازلياً و`cursor`.

## التطوير المستقبلي

- ربط مع بنوك الدم.
- تنبيهات فورية للمتبرعين المناسبين.
- إحصائيات وإنذارات زمنية.

## الاختبار

```bash
npm test
npm run test:e2e
npm run test:cov
```
