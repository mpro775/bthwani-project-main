# Admin Wallet Endpoints - التوثيق

## نظرة عامة

تم إضافة 4 endpoints جديدة لإدارة المحافظ من قبل الإدارة. جميع هذه الـ endpoints محمية بـ `@Roles('admin', 'superadmin')` وتتطلب JWT Authentication.

---

## 1. جلب جميع المستخدمين مع محافظهم

### Endpoint
```
GET /wallet/admin/users
```

### الوصف
جلب قائمة بجميع المستخدمين مع معلومات محافظهم مع إمكانية الفلترة والترتيب.

### Authentication
- **Type**: JWT
- **Roles**: `admin`, `superadmin`

### Query Parameters

| المعامل | النوع | مطلوب | الوصف | مثال |
|---------|------|-------|-------|------|
| `search` | string | ❌ | البحث في الاسم، البريد الإلكتروني، أو رقم الهاتف | `ahmed` |
| `minBalance` | number | ❌ | الحد الأدنى للرصيد | `100` |
| `maxBalance` | number | ❌ | الحد الأقصى للرصيد | `10000` |
| `minOnHold` | number | ❌ | الحد الأدنى للرصيد المحجوز | `0` |
| `maxOnHold` | number | ❌ | الحد الأقصى للرصيد المحجوز | `500` |
| `sortBy` | enum | ❌ | ترتيب النتائج (`balance`, `onHold`, `totalEarned`, `totalSpent`, `createdAt`) | `balance` |
| `sortOrder` | enum | ❌ | ترتيب تصاعدي أو تنازلي (`asc`, `desc`) | `desc` |
| `page` | number | ❌ | رقم الصفحة (افتراضي: 1) | `1` |
| `limit` | number | ❌ | عدد العناصر في الصفحة (افتراضي: 20، حد أقصى: 100) | `20` |

### Response Example
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "fullName": "أحمد محمد",
      "email": "ahmed@example.com",
      "phone": "+967777123456",
      "profileImage": "https://...",
      "wallet": {
        "balance": 1000,
        "onHold": 200,
        "available": 800,
        "totalSpent": 5000,
        "totalEarned": 6000,
        "loyaltyPoints": 100,
        "savings": 0,
        "currency": "YER",
        "lastUpdated": "2025-01-20T10:00:00Z"
      },
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-20T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

### Example Request
```bash
curl -X GET "http://localhost:3000/wallet/admin/users?minBalance=100&sortBy=balance&sortOrder=desc&page=1&limit=20" \
  -H "Authorization: Bearer <admin_jwt_token>"
```

---

## 2. إحصائيات المحفظة الشاملة

### Endpoint
```
GET /wallet/admin/stats
```

### الوصف
جلب إحصائيات شاملة عن المحفظة (المستخدمين، الأرصدة، المعاملات).

### Authentication
- **Type**: JWT
- **Roles**: `admin`, `superadmin`

### Query Parameters

| المعامل | النوع | مطلوب | الوصف | مثال |
|---------|------|-------|-------|------|
| `period` | enum | ❌ | الفترة الزمنية (`today`, `week`, `month`, `year`, `all`) | `month` |

### Response Example
```json
{
  "totalUsers": 1500,
  "usersWithWallet": 1200,
  "totalBalance": 5000000,
  "totalOnHold": 50000,
  "totalAvailable": 4950000,
  "totalTransactions": 50000,
  "transactionsToday": 150,
  "transactionsInPeriod": 5000,
  "creditsInPeriod": 3000000,
  "debitsInPeriod": 2500000,
  "netInPeriod": 500000,
  "averageBalance": 4166.67,
  "period": "month"
}
```

### Example Request
```bash
curl -X GET "http://localhost:3000/wallet/admin/stats?period=month" \
  -H "Authorization: Bearer <admin_jwt_token>"
```

---

## 3. جلب جميع المعاملات مع فلترة

### Endpoint
```
GET /wallet/admin/transactions
```

### الوصف
جلب جميع المعاملات مع إمكانية الفلترة المتقدمة.

### Authentication
- **Type**: JWT
- **Roles**: `admin`, `superadmin`

### Query Parameters

| المعامل | النوع | مطلوب | الوصف | مثال |
|---------|------|-------|-------|------|
| `userId` | string (MongoID) | ❌ | معرف المستخدم | `507f1f77bcf86cd799439011` |
| `userModel` | enum | ❌ | نوع النموذج (`User`, `Driver`) | `User` |
| `type` | enum | ❌ | نوع العملية (`credit`, `debit`) | `credit` |
| `method` | enum | ❌ | طريقة الدفع | `kuraimi` |
| `status` | enum | ❌ | حالة المعاملة (`pending`, `completed`, `failed`, `reversed`) | `completed` |
| `minAmount` | number | ❌ | الحد الأدنى للمبلغ | `100` |
| `maxAmount` | number | ❌ | الحد الأقصى للمبلغ | `10000` |
| `startDate` | string (ISO 8601) | ❌ | تاريخ البداية | `2025-01-01T00:00:00Z` |
| `endDate` | string (ISO 8601) | ❌ | تاريخ النهاية | `2025-01-31T23:59:59Z` |
| `search` | string | ❌ | البحث في الوصف | `شحن` |
| `cursor` | string | ❌ | Cursor للصفحة التالية | `507f1f77bcf86cd799439011` |
| `limit` | number | ❌ | عدد العناصر (افتراضي: 20، حد أقصى: 100) | `20` |

### Response Example
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": {
        "_id": "507f1f77bcf86cd799439012",
        "fullName": "أحمد محمد",
        "email": "ahmed@example.com",
        "phone": "+967777123456"
      },
      "userModel": "User",
      "amount": 1000,
      "type": "credit",
      "method": "kuraimi",
      "status": "completed",
      "description": "شحن المحفظة عبر كريمي",
      "createdAt": "2025-01-20T10:00:00Z",
      "updatedAt": "2025-01-20T10:00:00Z"
    }
  ],
  "pagination": {
    "nextCursor": "507f1f77bcf86cd799439011",
    "hasMore": true,
    "limit": 20
  }
}
```

### Example Request
```bash
curl -X GET "http://localhost:3000/wallet/admin/transactions?type=credit&status=completed&startDate=2025-01-01T00:00:00Z&endDate=2025-01-31T23:59:59Z&limit=20" \
  -H "Authorization: Bearer <admin_jwt_token>"
```

---

## 4. جلب محفظة مستخدم محدد

### Endpoint
```
GET /wallet/admin/user/:id
```

### الوصف
جلب معلومات محفظة مستخدم محدد مع آخر 10 معاملات.

### Authentication
- **Type**: JWT
- **Roles**: `admin`, `superadmin`

### Path Parameters

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|-------|
| `id` | string (MongoID) | ✅ | معرف المستخدم |

### Response Example
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "fullName": "أحمد محمد",
    "email": "ahmed@example.com",
    "phone": "+967777123456",
    "profileImage": "https://...",
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-20T10:00:00Z"
  },
  "wallet": {
    "balance": 1000,
    "onHold": 200,
    "available": 800,
    "totalSpent": 5000,
    "totalEarned": 6000,
    "loyaltyPoints": 100,
    "savings": 0,
    "currency": "YER",
    "lastUpdated": "2025-01-20T10:00:00Z"
  },
  "recentTransactions": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "amount": 1000,
      "type": "credit",
      "method": "kuraimi",
      "status": "completed",
      "description": "شحن المحفظة عبر كريمي",
      "createdAt": "2025-01-20T10:00:00Z"
    }
  ]
}
```

### Example Request
```bash
curl -X GET "http://localhost:3000/wallet/admin/user/507f1f77bcf86cd799439011" \
  -H "Authorization: Bearer <admin_jwt_token>"
```

---

## ملاحظات مهمة

1. **الأمان**: جميع الـ endpoints محمية بـ Roles Guard وتتطلب صلاحيات `admin` أو `superadmin`.

2. **Pagination**: 
   - `/admin/users` يستخدم **offset-based pagination** (page/limit)
   - `/admin/transactions` يستخدم **cursor-based pagination** (cursor/limit)

3. **الأداء**: 
   - استخدم الفلترة لتقليل حجم البيانات
   - الحد الأقصى للـ `limit` هو 100
   - الـ queries محسّنة باستخدام indexes

4. **التواريخ**: استخدم تنسيق ISO 8601 للتواريخ (مثال: `2025-01-01T00:00:00Z`)

---

## أخطاء محتملة

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```
**السبب**: لم يتم إرسال token أو token غير صالح.

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```
**السبب**: المستخدم ليس لديه صلاحيات admin أو superadmin.

### 404 Not Found
```json
{
  "code": "USER_NOT_FOUND",
  "message": "User not found",
  "userMessage": "المستخدم غير موجود"
}
```
**السبب**: المستخدم المطلوب غير موجود (في `/admin/user/:id`).

---

**آخر تحديث**: 2026-01-23
