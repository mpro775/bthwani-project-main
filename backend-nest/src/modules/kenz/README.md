# وحدة كنز — السوق المفتوح

## نظرة عامة

«كنز» هي وحدة لإدارة الإعلانات في سوق مفتوح، تمكن المستخدمين من نشر وبيع/شراء المنتجات والخدمات مع تفاصيل مثل السعر والفئة والخصائص. تم تجهيزها بتوثيق كامل عبر Swagger.

## الميزات الرئيسية

- **إنشاء إعلان**: إضافة إعلان جديد بتفاصيل كاملة.
- **تحديث الإعلان**: تعديل التفاصيل والحالة.
- **حذف الإعلان**: إزالة الإعلان نهائياً.
- **قائمة الإعلانات**: مع دعم pagination بالـ cursor.
- **توثيق عربي كامل**: عبر Swagger UI.

## الهيكل التقني

```
src/modules/kenz/
├── kenz.controller.ts    # واجهة REST وتوثيق Swagger
├── kenz.service.ts       # منطق الأعمال
├── kenz.module.ts        # تجميع الوحدة وتهيئة Mongoose
├── entities/
│   └── kenz.entity.ts    # مخطط البيانات
├── dto/
│   ├── create-kenz.dto.ts # DTO الإنشاء مع التحقق
│   └── update-kenz.dto.ts # DTO التحديث مع التحقق
└── README.md             # هذا الملف
```

## نموذج البيانات

```typescript
interface Kenz {
  _id: string;
  ownerId: string;                 // صاحب الإعلان
  title: string;                   // عنوان الإعلان
  description?: string;            // تفاصيل إضافية
  price?: number;                  // السعر
  category?: string;               // الفئة
  metadata?: Record<string, any>;  // خصائص إضافية
  status: 'draft' | 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}
```

## API Endpoints

| الطريقة | المسار | الوصف |
|---------|--------|--------|
| `POST` | `/api/v2/kenz` | إنشاء إعلان |
| `GET` | `/api/v2/kenz` | قائمة الإعلانات (cursor) |
| `GET` | `/api/v2/kenz/:id` | تفاصيل إعلان |
| `PATCH` | `/api/v2/kenz/:id` | تحديث إعلان |
| `DELETE` | `/api/v2/kenz/:id` | حذف إعلان |

### أمثلة سريعة

- إنشاء:
```bash
POST /api/v2/kenz
Authorization: Bearer <token>
Content-Type: application/json

{
  "ownerId": "507f1f77bcf86cd799439011",
  "title": "iPhone 14 Pro مستعمل بحالة ممتازة",
  "description": "استخدام خفيف مع ضمان متبقي 6 أشهر",
  "price": 3500,
  "category": "إلكترونيات",
  "metadata": { "color": "فضي", "storage": "256GB" },
  "status": "draft"
}
```

- تحديث:
```bash
PATCH /api/v2/kenz/507f1f77bcf86cd799439012
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "confirmed",
  "price": 3400
}
```

## التوثيق التفاعلي (Swagger)

- الوصول عبر: `/api/docs`.
- `BearerAuth` مطلوب.
- أمثلة عربية كاملة لكل الحقول.

## التحقق من البيانات

- `class-validator` مستخدم في DTOs.
- أنواع مدعومة: `IsString`, `IsNumber`, `IsObject`, `IsEnum`, `IsOptional`.

## قاعدة البيانات

- Mongoose Schema باسم `Kenz`.
- Pagination عبر `_id` تنازلياً و`cursor`.

## التطوير المستقبلي

- تصنيفات متقدمة وفلاتر بحث.
- صور ووسائط للإعلانات.
- محادثات بين البائع والمشتري.
- تكامل دفع وتسويات.

## الاختبار

```bash
npm test
npm run test:e2e
npm run test:cov
```
