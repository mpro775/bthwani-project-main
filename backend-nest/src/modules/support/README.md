# موديول الدعم الفني (Support Module)

## نظرة عامة

موديول **الدعم الفني** هو نظام لإدارة تذاكر الدعم الفني. يتيح هذا الموديول للمستخدمين إنشاء تذاكر دعم، التواصل مع فريق الدعم، وتتبع حالة التذاكر. يدعم الموديول أنواع مختلفة من التذاكر (تقني، دفع، حساب، طلب، عام، شكوى، ملاحظات) وحالات مختلفة (مفتوح، معين، قيد المعالجة، في انتظار المستخدم، محلول، مغلق، ملغي).

---

## الهيكل التنظيمي

```
support/
├── support.controller.ts   # نقاط النهاية (API Endpoints)
├── support.module.ts       # إعدادات الموديول
├── support.service.ts      # منطق الأعمال
├── dto/                        # كائنات نقل البيانات
│   └── support.dto.ts
└── entities/                   # نماذج البيانات
    └── support-ticket.entity.ts
```

---

## الكيانات (Entities)

### SupportTicket (تذكرة الدعم)

الكيان الرئيسي الذي يمثل تذكرة دعم واحدة.

#### الحقول الأساسية

| الحقل | النوع | الوصف | مطلوب |
|------|------|-------|-------|
| `ticketNumber` | String | رقم التذكرة (فريد) | ✓ |
| `userId` | ObjectId | مرجع للمستخدم (User/Driver/Vendor) | ✗ |
| `userModel` | Enum | نوع المستخدم (`User`, `Driver`, `Vendor`) | ✗ |
| `subject` | String | موضوع التذكرة | ✓ |
| `description` | String | وصف التذكرة | ✓ |
| `priority` | Enum | الأولوية (`low`, `medium`, `high`, `urgent`) | ✓ |
| `status` | Enum | الحالة (انظر أدناه) | ✓ |
| `category` | Enum | الفئة (انظر أدناه) | ✓ |
| `assignedTo` | ObjectId | مرجع للمسؤول المعين | ✗ |
| `assignedAt` | Date | تاريخ التعيين | ✗ |
| `messages` | Array[Message] | الرسائل | ✗ |
| `resolution` | String | الحل | ✗ |
| `resolvedAt` | Date | تاريخ الحل | ✗ |
| `resolvedBy` | ObjectId | مرجع للمسؤول الذي حل التذكرة | ✗ |
| `closedAt` | Date | تاريخ الإغلاق | ✗ |
| `rating` | Number | التقييم (1-5) | ✗ |
| `feedback` | String | الملاحظات | ✗ |
| `tags` | Array[String] | الوسوم | ✗ |
| `relatedOrder` | ObjectId | مرجع للطلب المرتبط | ✗ |
| `firstResponseAt` | Date | تاريخ أول رد | ✗ |
| `responseTime` | Number | وقت الرد (بالدقائق) | ✗ |
| `resolutionTime` | Number | وقت الحل (بالدقائق) | ✗ |
| `slaBreached` | Boolean | انتهاك SLA | ✗ |

#### الحالات (Status)

- **`open`**: مفتوح
- **`assigned`**: معين
- **`in-progress`**: قيد المعالجة
- **`pending-user`**: في انتظار المستخدم
- **`resolved`**: محلول
- **`closed`**: مغلق
- **`cancelled`**: ملغي

#### الأولويات (Priority)

- **`low`**: منخفضة
- **`medium`**: متوسطة (افتراضي)
- **`high`**: عالية
- **`urgent`**: عاجلة

#### الفئات (Category)

- **`technical`**: تقني
- **`payment`**: دفع
- **`account`**: حساب
- **`order`**: طلب
- **`general`**: عام
- **`complaint`**: شكوى
- **`feedback`**: ملاحظات

#### TicketMessage (رسالة التذكرة)

| الحقل | النوع | الوصف |
|------|------|-------|
| `message` | String | نص الرسالة |
| `sender` | ObjectId | مرجع للمرسل |
| `senderModel` | String | نوع المرسل |
| `createdAt` | Date | تاريخ الإنشاء |
| `attachments` | Array[String] | المرفقات |

---

## العلاقات (Relationships)

### 1. علاقة مع المستخدم (User/Driver/Vendor)

```typescript
userId: Types.ObjectId // مرجع لجدول User/Driver/Vendor (refPath)
userModel: String // نوع المستخدم ('User', 'Driver', 'Vendor')
```

- كل تذكرة مرتبطة بمستخدم واحد (يمكن أن يكون User أو Driver أو Vendor)
- العلاقة: **Many-to-One** (العديد من التذاكر لمستخدم واحد)

### 2. علاقة مع المسؤول (User)

```typescript
assignedTo?: Types.ObjectId // مرجع لجدول User (المسؤول)
```

- كل تذكرة يمكن أن تكون معينة لمسؤول واحد
- العلاقة: **Many-to-One** (العديد من التذاكر لمسؤول واحد)

### 3. علاقة مع الطلب (Order)

```typescript
relatedOrder?: Types.ObjectId // مرجع لجدول Order
```

- كل تذكرة يمكن أن تكون مرتبطة بطلب واحد
- العلاقة: **Many-to-One** (العديد من التذاكر لطلب واحد)

---

## نقاط النهاية (API Endpoints)

### نقاط نهاية المستخدم

#### 1. إنشاء تذكرة دعم جديدة

```http
POST /support/tickets
Authorization: Bearer <token>
```

**Body**:
```json
{
  "subject": "مشكلة في الدفع",
  "description": "لا يمكنني إتمام عملية الدفع",
  "priority": "high",
  "category": "payment",
  "relatedOrder": "507f1f77bcf86cd799439011",
  "tags": ["دفع", "مشكلة"]
}
```

---

#### 2. جلب التذاكر

```http
GET /support/tickets?status=open&priority=high&page=1&limit=20
Authorization: Bearer <token>
```

**Query Parameters**:
- `status` (اختياري): حالة التذكرة
- `priority` (اختياري): الأولوية
- `assignedTo` (اختياري): معرف المسؤول المعين
- `page` (اختياري): رقم الصفحة (افتراضي: 1)
- `limit` (اختياري): عدد العناصر (افتراضي: 20)

---

#### 3. تفاصيل تذكرة

```http
GET /support/tickets/:id
Authorization: Bearer <token>
```

---

#### 4. إضافة رسالة للتذكرة

```http
PATCH /support/tickets/:id/messages
Authorization: Bearer <token>
```

**Body**:
```json
{
  "message": "شكراً لمساعدتك",
  "attachments": ["https://example.com/file.pdf"]
}
```

---

#### 5. تقييم التذكرة

```http
PATCH /support/tickets/:id/rate
Authorization: Bearer <token>
```

**Body**:
```json
{
  "rating": 5,
  "feedback": "خدمة ممتازة"
}
```

---

#### 6. الإحصائيات

```http
GET /support/stats
Authorization: Bearer <token>
```

---

### نقاط نهاية الإدارة (Admin Only)

#### 1. تعيين تذكرة

```http
PATCH /support/admin/tickets/:id/assign
Authorization: Bearer <token>
```

**Body**:
```json
{
  "assigneeId": "507f1f77bcf86cd799439012"
}
```

---

#### 2. حل تذكرة

```http
PATCH /support/admin/tickets/:id/resolve
Authorization: Bearer <token>
```

**Body**:
```json
{
  "resolution": "تم حل المشكلة بنجاح"
}
```

---

#### 3. مقاييس SLA

```http
GET /support/admin/sla-metrics
Authorization: Bearer <token>
```

---

## العمليات (Operations)

### 1. إنشاء تذكرة

**الخطوات**:
1. توليد رقم تذكرة فريد (ST-YYYYMMDD-XXXX)
2. إنشاء التذكرة
3. حفظ التذكرة
4. إرجاع التذكرة

---

### 2. إضافة رسالة

**الخطوات**:
1. البحث عن التذكرة
2. إضافة الرسالة إلى المصفوفة
3. تتبع وقت الرد الأول (إذا كان أول رد)
4. تحديث الحالة (إذا لزم الأمر)
5. حفظ التذكرة

---

### 3. حل تذكرة

**الخطوات**:
1. البحث عن التذكرة
2. التحقق من أن التذكرة لم يتم حلها بالفعل
3. تحديث الحالة إلى `resolved`
4. حساب وقت الحل
5. إضافة رسالة الحل
6. حفظ التذكرة

---

### 4. تقييم التذكرة

**الخطوات**:
1. البحث عن التذكرة
2. التحقق من أن التذكرة محلولة
3. تحديث التقييم والملاحظات
4. حفظ التذكرة

---

## الفهارس (Indexes)

يحتوي SupportTicket entity على الفهارس التالية:

1. **`ticketNumber`**: فهرس فريد (Unique Index)
2. **`userId + status`**: فهرس مركب
3. **`status + priority`**: فهرس مركب
4. **`assignedTo + status`**: فهرس مركب
5. **`category + status`**: فهرس مركب
6. **`createdAt`**: فهرس لترتيب حسب التاريخ

---

## Pre-save Middleware

يتم توليد رقم التذكرة تلقائياً قبل الحفظ:

```typescript
ticketNumber = `ST-${YYYYMMDD}-${XXXX}`
```

---

## المصادقة والصلاحيات (Authentication & Authorization)

### أنواع المصادقة

- **Unified Auth**: لجميع نقاط النهاية

### الصلاحيات (Roles)

- **المستخدمون**: يمكنهم إنشاء التذاكر وإدارة تذاكرهم
- **الإدارة**: يتطلبون صلاحية خاصة (تعيين، حل، مقاييس SLA)

---

## DTOs (Data Transfer Objects)

### 1. CreateTicketDto

استخدامه في إنشاء تذكرة جديدة.

**الحقول**:
- `userId`: معرف المستخدم (اختياري، يتم تلقائياً)
- `userModel`: نوع المستخدم (اختياري، يتم تلقائياً)
- `subject`: الموضوع (مطلوب)
- `description`: الوصف (مطلوب)
- `priority`: الأولوية (مطلوب)
- `category`: الفئة (مطلوب)
- `relatedOrder`: معرف الطلب المرتبط (اختياري)
- `tags`: الوسوم (اختياري)

---

### 2. AddMessageDto

استخدامه في إضافة رسالة.

**الحقول**:
- `message`: نص الرسالة (مطلوب)
- `attachments`: المرفقات (اختياري)

---

### 3. RateTicketDto

استخدامه في تقييم التذكرة.

**الحقول**:
- `rating`: التقييم (1-5) (مطلوب)
- `feedback`: الملاحظات (اختياري)

---

## الملاحظات التقنية

1. **Automatic Ticket Number Generation**:
   - يتم توليد رقم التذكرة تلقائياً قبل الحفظ (Pre-save middleware)
   - التنسيق: `ST-YYYYMMDD-XXXX`

2. **SLA Tracking**:
   - يتم تتبع وقت الرد الأول (`firstResponseAt`, `responseTime`)
   - يتم تتبع وقت الحل (`resolvedAt`, `resolutionTime`)
   - يتم تتبع انتهاكات SLA (`slaBreached`)

3. **Status Flow**:
   - `open` → `assigned` → `in-progress` → `resolved` → `closed`
   - يمكن أن يكون `pending-user` في أي وقت
   - يمكن إلغاء التذكرة (`cancelled`)

4. **Multi-Model Support**:
   - يدعم الموديول أنواع مختلفة من المستخدمين (User, Driver, Vendor)
   - استخدام `refPath` لربط أنواع مختلفة من المستخدمين

---

## الأخطاء الشائعة

| الكود | الوصف |
|------|-------|
| 404 | التذكرة غير موجودة |
| 400 | بيانات غير صالحة |
| 400 | التذكرة محلولة بالفعل |
| 400 | لا يمكن تقييم تذكرة غير محلولة |
| 401 | غير مصرح (مصادقة فاشلة) |

---

## التبعيات (Dependencies)

- `@nestjs/common`
- `@nestjs/mongoose`
- `@nestjs/swagger`
- `mongoose`
- `class-validator`
- `class-transformer`

---

## التوثيق الإضافي

- [Swagger Documentation](http://localhost:3000/api) (عند تشغيل الخادم)
- ملفات الكود: راجع الملفات في هذا الموديول لمزيد من التفاصيل
- User Module: راجع `../user/README.md` لفهم المستخدمين
