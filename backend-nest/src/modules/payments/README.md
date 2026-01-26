# وحدة الدفع والسداد — إدارة الأعرابين والمدفوعات

## نظرة عامة

«الدفع والسداد» هي وحدة متخصصة في إدارة الأعرابين والمدفوعات، مع توثيق كامل عبر Swagger ودعم للعمليات المالية الأساسية.

## الميزات الرئيسية

- **إنشاء عربون**: حجز أموال كعربون للطلبات.
- **إطلاق الأموال**: إكمال الدفع بعد تأكيد الطلب.
- **استرداد الأموال**: إرجاع الأموال في حالة الإلغاء.
- **تتبع الأعرابين**: عرض تفاصيل وحالة الأعرابين.
- **توثيق عربي كامل**: عبر Swagger UI.

## الهيكل التقني

```
src/modules/payments/
├── payments.controller.ts    # واجهة REST وتوثيق Swagger
├── payments.service.ts       # منطق الأعمال والتكامل مع Wallet
├── payments.module.ts        # تجميع الوحدة
├── entities/
│   └── payments.entity.ts    # مخطط البيانات (إن وجد)
└── dto/
    ├── create-payments.dto.ts # DTO الإنشاء
    └── update-payments.dto.ts # DTO التحديث
```

## API Endpoints

| الطريقة | المسار | الوصف |
|---------|--------|--------|
| `POST` | `/api/v2/payments/holds` | إنشاء عربون |
| `GET` | `/api/v2/payments/holds/:holdId` | تفاصيل عربون |
| `POST` | `/api/v2/payments/holds/:holdId/release` | إطلاق الأموال |
| `POST` | `/api/v2/payments/holds/:holdId/refund` | استرداد الأموال |
| `GET` | `/api/v2/payments/holds/my` | أعرابيني |

### أمثلة سريعة

- **إنشاء عربون**:
```bash
POST /api/v2/payments/holds
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "507f1f77bcf86cd799439011",
  "amount": 100.50,
  "reference": "order-123"
}
```

- **إطلاق الأموال**:
```bash
POST /api/v2/payments/holds/507f1f77bcf86cd799439012/release
Authorization: Bearer <token>
```

- **استرداد الأموال**:
```bash
POST /api/v2/payments/holds/507f1f77bcf86cd799439012/refund
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "إلغاء الطلب"
}
```

## التوثيق التفاعلي (Swagger)

- الوصول عبر: `/api/docs`
- `BearerAuth` مطلوب
- أمثلة عربية كاملة لكل العمليات

## التكامل مع Wallet Service

تعتمد هذه الوحدة على `WalletService` للعمليات المالية الأساسية:
- `holdFunds()`: لحجز الأموال
- `releaseFunds()`: لإطلاق الأموال
- `refundHeldFunds()`: لاسترداد الأموال

## التحقق من البيانات

- `class-validator` مستخدم في DTOs
- أنواع مدعومة: `IsString`, `IsNumber`, `IsOptional`

## التطوير المستقبلي

- دعم طرق دفع متعددة (بطاقات ائتمان، محافظ إلكترونية)
- تكامل مع بوابات الدفع الخارجية
- نظام إشعارات للعمليات المالية
- تقارير مالية وإحصائيات
