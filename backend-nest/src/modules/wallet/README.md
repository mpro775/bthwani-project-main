# موديول المحفظة (Wallet Module)

## نظرة عامة

موديول **المحفظة** هو نظام لإدارة المحافظ الإلكترونية والمعاملات المالية. يتيح هذا الموديول للمستخدمين إدارة أرصدتهم، إجراء معاملات مالية (شحن، سحب، تحويل)، وحجز الأموال (Escrow) للطلبات. يدعم الموديول عمليات الشحن عبر كريمي، السحب، والتحويلات بين المستخدمين.

---

## الهيكل التنظيمي

```
wallet/
├── wallet.controller.ts       # نقاط النهاية (API Endpoints)
├── v2-wallet.controller.ts    # نقاط النهاية (V2)
├── wallet.module.ts           # إعدادات الموديول
├── wallet.service.ts          # منطق الأعمال
├── dto/                       # كائنات نقل البيانات
│   ├── create-transaction.dto.ts
│   └── wallet-balance.dto.ts
├── entities/                  # نماذج البيانات
│   ├── wallet-transaction.entity.ts
│   └── wallet-event.entity.ts
├── services/                  # خدمات إضافية
│   └── wallet-event.service.ts
└── interfaces/                # واجهات
    └── wallet-event.interface.ts
```

**ملاحظة**: بيانات المحفظة (Wallet) موجودة في User entity (`../auth/entities/user.entity.ts`)، بينما المعاملات (WalletTransaction) محفوظة في جدول منفصل.

---

## الكيانات (Entities)

### 1. WalletTransaction (معاملة المحفظة)

الكيان الرئيسي الذي يمثل معاملة مالية واحدة.

#### الحقول الأساسية

| الحقل | النوع | الوصف | مطلوب |
|------|------|-------|-------|
| `userId` | ObjectId | مرجع للمستخدم (User أو Driver) | ✓ |
| `userModel` | Enum | نوع النموذج (`User`, `Driver`) | ✓ |
| `amount` | Number | المبلغ | ✓ |
| `type` | Enum | نوع العملية (`credit`, `debit`) | ✓ |
| `method` | Enum | طريقة الدفع (انظر أدناه) | ✗ |
| `status` | Enum | حالة المعاملة (`pending`, `completed`, `failed`, `reversed`) | ✗ |
| `description` | String | وصف المعاملة | ✗ |
| `bankRef` | String | رقم مرجعي بنكي (فريد) | ✗ |
| `meta` | Object | بيانات إضافية | ✗ |

#### طرق الدفع (Method)

- `agent`: وكيل
- `card`: بطاقة
- `transfer`: تحويل
- `payment`: دفع
- `escrow`: حجز (ضمان)
- `reward`: مكافأة
- `kuraimi`: كريمي
- `withdrawal`: سحب

#### حالات المعاملة (Status)

- **`pending`**: قيد الانتظار
- **`completed`**: مكتملة
- **`failed`**: فاشلة
- **`reversed`**: معكوسة (إرجاع)

---

### 2. WalletEvent (حدث المحفظة)

كيان لسجل الأحداث (Event Sourcing) للمحفظة.

#### الحقول

| الحقل | النوع | الوصف |
|------|------|-------|
| `userId` | ObjectId | مرجع للمستخدم |
| `eventType` | Enum | نوع الحدث (DEPOSIT, WITHDRAWAL, HOLD, RELEASE, REFUND, TRANSFER_OUT, TRANSFER_IN, TOPUP, BILL_PAYMENT, COMMISSION) |
| `amount` | Number | المبلغ |
| `timestamp` | Date | وقت الحدث |
| `metadata` | Object | بيانات إضافية |
| `version` | Number | إصدار الحدث |
| `aggregateId` | String | معرف المجمع (userId + sequence) |
| `sequence` | Number | رقم تسلسلي |
| `correlationId` | String | معرف الارتباط |
| `causationId` | String | معرف السبب |
| `isReplayed` | Boolean | هل تم إعادة التشغيل |
| `replayedAt` | Date | تاريخ إعادة التشغيل |

---

## العلاقات (Relationships)

### 1. علاقة مع المستخدم (User)

```typescript
userId: Types.ObjectId // مرجع لجدول User
```

- كل معاملة ترتبط بمستخدم واحد
- العلاقة: **Many-to-One** (العديد من المعاملات لمستخدم واحد)
- بيانات المحفظة (balance, onHold, إلخ) موجودة في User entity

---

## نقاط النهاية (API Endpoints)

### نقاط نهاية الرصيد والمعاملات

#### 1. جلب رصيد المحفظة

```http
GET /wallet/balance
Authorization: Bearer <token>
```

**الوصف**: الحصول على الرصيد الحالي والرصيد المحجوز.

**Response**:
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "balance": 1000,
  "onHold": 200,
  "availableBalance": 800,
  "totalSpent": 5000,
  "totalEarned": 6000,
  "loyaltyPoints": 100,
  "savings": 0,
  "currency": "YER",
  "lastUpdated": "2025-01-20T10:00:00Z"
}
```

---

#### 2. جلب سجل المعاملات

```http
GET /wallet/transactions?cursor=&limit=20
Authorization: Bearer <token>
```

**Query Parameters**:
- `cursor` (اختياري): مؤشر التصفح
- `limit` (اختياري): عدد النتائج

---

#### 3. الحصول على تفاصيل معاملة

```http
GET /wallet/transaction/:id
Authorization: Bearer <token>
```

---

### نقاط نهاية الحجز (Escrow)

#### 1. حجز مبلغ (Admin Only)

```http
POST /wallet/hold
Authorization: Bearer <token>
```

**الأدوار المطلوبة**: `admin`, `superadmin`

**Body**:
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "amount": 200,
  "orderId": "ORDER123"
}
```

---

#### 2. إطلاق المبلغ المحجوز (Admin Only)

```http
POST /wallet/release
Authorization: Bearer <token>
```

**الأدوار المطلوبة**: `admin`, `superadmin`

**Body**:
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "amount": 200,
  "orderId": "ORDER123"
}
```

---

#### 3. إرجاع المبلغ المحجوز (Admin Only)

```http
POST /wallet/refund
Authorization: Bearer <token>
```

**الأدوار المطلوبة**: `admin`, `superadmin`

**Body**:
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "amount": 200,
  "orderId": "ORDER123",
  "reason": "تم إلغاء الطلب"
}
```

---

### نقاط نهاية الشحن (Topup)

#### 1. شحن المحفظة عبر كريمي

```http
POST /wallet/topup/kuraimi
Authorization: Bearer <token>
```

**Body**:
```json
{
  "amount": 1000,
  "SCustID": "1234567890",
  "PINPASS": "1234"
}
```

---

#### 2. التحقق من عملية الشحن

```http
POST /wallet/topup/verify
Authorization: Bearer <token>
```

**Body**:
```json
{
  "transactionId": "507f1f77bcf86cd799439011"
}
```

---

#### 3. سجل عمليات الشحن

```http
GET /wallet/topup/history?cursor=&limit=20
Authorization: Bearer <token>
```

---

#### 4. طرق الشحن المتاحة

```http
GET /wallet/topup/methods
Authorization: Bearer <token>
```

---

### نقاط نهاية السحب (Withdrawal)

#### 1. طلب سحب

```http
POST /wallet/withdraw/request
Authorization: Bearer <token>
```

**Body**:
```json
{
  "amount": 500,
  "method": "bank_transfer",
  "accountInfo": {
    "bankName": "بنك اليمن",
    "accountNumber": "1234567890",
    "accountName": "أحمد محمد"
  }
}
```

---

#### 2. طلبات السحب الخاصة بي

```http
GET /wallet/withdraw/my?cursor=&limit=20
Authorization: Bearer <token>
```

---

#### 3. إلغاء طلب سحب

```http
PATCH /wallet/withdraw/:id/cancel
Authorization: Bearer <token>
```

---

#### 4. طرق السحب المتاحة

```http
GET /wallet/withdraw/methods
Authorization: Bearer <token>
```

---

### نقاط نهاية الإدارة (Admin Only)

#### 1. جميع طلبات السحب

```http
GET /wallet/admin/withdrawals?status=pending&userModel=User&page=1&limit=20
Authorization: Bearer <token>
```

**الأدوار المطلوبة**: `admin`, `superadmin`

---

#### 2. طلبات السحب المعلقة

```http
GET /wallet/admin/withdrawals/pending
Authorization: Bearer <token>
```

---

#### 3. الموافقة على طلب سحب

```http
PATCH /wallet/admin/withdrawals/:id/approve
Authorization: Bearer <token>
```

**Body**:
```json
{
  "transactionRef": "REF123",
  "notes": "تم التحويل"
}
```

---

#### 4. رفض طلب سحب

```http
PATCH /wallet/admin/withdrawals/:id/reject
Authorization: Bearer <token>
```

**Body**:
```json
{
  "reason": "بيانات الحساب غير صحيحة"
}
```

---

#### 5. إنشاء معاملة (Admin Only)

```http
POST /wallet/transaction
Authorization: Bearer <token>
```

**الأدوار المطلوبة**: `admin`, `superadmin`

**Body**:
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "userModel": "User",
  "amount": 100,
  "type": "credit",
  "method": "reward",
  "description": "مكافأة"
}
```

---

### نقاط نهاية الفواتير (Bills)

#### 1. دفع فاتورة

```http
POST /wallet/pay-bill
Authorization: Bearer <token>
```

**Body**:
```json
{
  "billType": "electricity",
  "billNumber": "1234567890",
  "amount": 5000
}
```

**billType**: `electricity`, `water`, `internet`

---

#### 2. سجل الفواتير المدفوعة

```http
GET /wallet/bills?cursor=&limit=20
Authorization: Bearer <token>
```

---

### نقاط نهاية التحويلات (Transfers)

#### 1. تحويل رصيد

```http
POST /wallet/transfer
Authorization: Bearer <token>
```

**Body**:
```json
{
  "recipientPhone": "+967777123456",
  "amount": 100,
  "notes": "شكراً"
}
```

---

#### 2. سجل التحويلات

```http
GET /wallet/transfers?cursor=&limit=20
Authorization: Bearer <token>
```

---

### نقاط نهاية أخرى

#### 1. طلب استرجاع

```http
POST /wallet/refund/request
Authorization: Bearer <token>
```

**Body**:
```json
{
  "transactionId": "507f1f77bcf86cd799439011",
  "reason": "طلب استرجاع"
}
```

---

## العمليات (Operations)

### 1. حجز المبلغ (Hold Funds)

**الوصف**: حجز مبلغ من المحفظة لضمان الدفع (Escrow).

**الخطوات**:
1. التحقق من وجود المستخدم
2. التحقق من الرصيد الكافي
3. تحديث `wallet.onHold` (زيادة)
4. إنشاء معاملة بحالة `pending`
5. استخدام Transaction لضمان التكامل

---

### 2. إطلاق المبلغ (Release Funds)

**الوصف**: إطلاق المبلغ المحجوز بعد تأكيد الطلب.

**الخطوات**:
1. التحقق من وجود المستخدم
2. تحديث `wallet.onHold` (نقصان) و `wallet.balance` (نقصان)
3. تحديث `wallet.totalSpent` (زيادة)
4. تحديث حالة المعاملة إلى `completed`
5. استخدام Transaction

---

### 3. إرجاع المبلغ (Refund Funds)

**الوصف**: إرجاع المبلغ المحجوز عند إلغاء الطلب.

**الخطوات**:
1. التحقق من وجود المستخدم
2. تحديث `wallet.onHold` (نقصان فقط)
3. تحديث حالة المعاملة إلى `reversed`
4. استخدام Transaction

---

### 4. الشحن عبر كريمي

**الخطوات**:
1. التحقق من بيانات كريمي
2. إجراء عملية الشحن
3. تحديث `wallet.balance` (زيادة)
4. إنشاء معاملة بحالة `completed`
5. استخدام Transaction

---

### 5. السحب

**الخطوات**:
1. التحقق من الرصيد الكافي
2. إنشاء طلب سحب
3. حجز المبلغ (`onHold`)
4. انتظار موافقة الإدارة
5. عند الموافقة: خصم المبلغ ودفعه

---

### 6. التحويل

**الخطوات**:
1. التحقق من وجود المستلم (باستخدام رقم الهاتف)
2. التحقق من الرصيد الكافي
3. خصم المبلغ من المرسل
4. إضافة المبلغ للمستلم
5. إنشاء معاملتين (debit للمرسل، credit للمستلم)
6. استخدام Transaction

---

## الفهارس (Indexes)

### WalletTransaction

1. **`userId + createdAt`**: فهرس مركب لاستعلامات معاملات المستخدم
2. **`bankRef`**: فهرس فريد (Unique Index)
3. **`userId + meta.orderId + method + status`**: فهرس فريد لمعاملات Escrow
4. **`type + status + createdAt`**: فهرس مركب للتقارير المالية
5. **`method + status`**: فهرس مركب لتحليلات طرق الدفع
6. **`userId + type + status`**: فهرس مركب لمعاملات المستخدم
7. **`status + createdAt`**: فهرس مركب للمعاملات المعلقة
8. **`userModel + userId`**: فهرس مركب للبحث السريع

### WalletEvent

1. **`userId + sequence`**: فهرس مركب
2. **`aggregateId + sequence`**: فهرس فريد (Unique Index)
3. **`timestamp`**: فهرس للوقت
4. **`eventType + timestamp`**: فهرس مركب
5. **`correlationId`**: فهرس للربط

---

## المصادقة والصلاحيات (Authentication & Authorization)

### أنواع المصادقة

- **JWT Auth**: لجميع نقاط النهاية العامة (الرصيد، المعاملات، الشحن، السحب، إلخ)
- **JWT Auth**: لنقاط النهاية الإدارية (إنشاء معاملة، الحجز، إلخ)

### الصلاحيات (Roles)

- **المستخدمون**: لا يتطلبون صلاحية خاصة (افتراضي)
- **الإدارة**: يتطلبون صلاحية `admin` أو `superadmin` (إنشاء معاملة، الحجز، إدارة السحب)

---

## DTOs (Data Transfer Objects)

### 1. CreateTransactionDto

استخدامه في إنشاء معاملة جديدة (Admin Only).

**الحقول**:
- `userId`: معرف المستخدم (مطلوب)
- `userModel`: نوع النموذج (`User`, `Driver`) (مطلوب)
- `amount`: المبلغ (مطلوب)
- `type`: نوع العملية (`credit`, `debit`) (مطلوب)
- `method`: طريقة الدفع (مطلوب)
- `description`: الوصف (اختياري)
- `bankRef`: رقم مرجعي بنكي (اختياري)
- `meta`: بيانات إضافية (اختياري)

---

## Rate Limiting

- **إنشاء معاملة (Admin)**: 10 معاملات في الدقيقة
- **طلب سحب**: 10 طلبات في الدقيقة
- **تحويل رصيد**: 5 تحويلات في الدقيقة
- **جلب الرصيد**: بدون حد (SkipThrottle)

---

## الملاحظات التقنية

1. **Transactions (MongoDB Transactions)**:
   - جميع العمليات المالية الحساسة تستخدم MongoDB Transactions
   - يضمن التكامل والاتساق

2. **Wallet Balance**:
   - الرصيد موجود في User entity (`user.wallet.balance`)
   - المبلغ المحجوز (`user.wallet.onHold`) يُستخدم للطلبات

3. **Event Sourcing**:
   - يستخدم WalletEvent لسجل الأحداث
   - يدعم إعادة بناء الحالة (Event Replay)

4. **Escrow Pattern**:
   - يستخدم نمط Escrow لحجز الأموال للطلبات
   - يضمن الدفع قبل التسليم

5. **Pagination**:
   - يستخدم Cursor-based pagination للمعاملات

---

## الأخطاء الشائعة

| الكود | الوصف |
|------|-------|
| 404 | المستخدم غير موجود |
| 400 | رصيد غير كافٍ |
| 400 | بيانات غير صالحة |
| 401 | غير مصرح (مصادقة فاشلة) |
| 403 | ليس لديك صلاحية (admin only) |
| 400 | المعاملة فاشلة |

---

## التبعيات (Dependencies)

- `@nestjs/common`
- `@nestjs/mongoose`
- `@nestjs/swagger`
- `@nestjs/throttler`
- `mongoose`
- `class-validator`
- `class-transformer`

---

## التوثيق الإضافي

- [Swagger Documentation](http://localhost:3000/api) (عند تشغيل الخادم)
- ملفات الكود: راجع الملفات في هذا الموديول لمزيد من التفاصيل
- User Entity: راجع `../auth/entities/user.entity.ts` لفهم بنية Wallet
