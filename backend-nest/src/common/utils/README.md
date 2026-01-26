# 🛠️ Utility Helpers Documentation

مجموعة من الـ Helper Classes التي توحد العمليات المتكررة عبر المشروع وتقلل التكرار.

---

## 📚 الـ Helpers المتاحة

### 1. PaginationHelper

**الغرض:** توحيد منطق الـ Cursor Pagination عبر المشروع

**الاستخدام:**
```typescript
import { PaginationHelper } from '@common/utils';

// Cursor pagination
const result = await PaginationHelper.paginate(
  this.orderModel,
  { user: userId },
  pagination,
  { 
    populate: 'driver',
    select: 'fullName phone',
    lean: true 
  }
);

// Offset pagination (للـ admin panels)
const result = await PaginationHelper.paginateOffset(
  this.userModel,
  { isActive: true },
  page,
  limit,
  { sortBy: 'createdAt', sortOrder: 'desc' }
);
```

---

### 2. EntityHelper

**الغرض:** توحيد منطق التحقق من وجود الـ entities

**الاستخدام:**
```typescript
import { EntityHelper } from '@common/utils';

// جلب entity أو رمي NotFoundException
const user = await EntityHelper.findByIdOrFail(
  this.userModel,
  userId,
  'User'
);

// مع options
const driver = await EntityHelper.findByIdOrFail(
  this.driverModel,
  driverId,
  'Driver',
  { 
    select: '-password',
    populate: 'vehicle',
    lean: true 
  }
);

// جلب متعدد
const users = await EntityHelper.findManyByIdsOrFail(
  this.userModel,
  userIds,
  'User'
);

// التحقق من الوجود فقط
const exists = await EntityHelper.exists(
  this.userModel,
  { email: 'test@example.com' }
);
```

---

### 3. TransactionHelper

**الغرض:** توحيد منطق الـ Database Transactions

**الاستخدام:**
```typescript
import { TransactionHelper } from '@common/utils';

// تنفيذ عملية ضمن transaction
const result = await TransactionHelper.executeInTransaction(
  this.connection,
  async (session) => {
    const user = await this.userModel.findById(userId).session(session);
    user.wallet.balance += amount;
    await user.save({ session });
    
    const transaction = await this.transactionModel.create([dto], { session });
    return transaction[0];
  }
);

// مع retry logic
const result = await TransactionHelper.executeWithRetry(
  this.connection,
  async (session) => {
    // ... عمليات
  },
  3, // maxRetries
  1000 // retryDelay in ms
);
```

---

### 4. SanitizationHelper

**الغرض:** إزالة الحقول الحساسة من الـ responses

**الاستخدام:**
```typescript
import { SanitizationHelper } from '@common/utils';

// إزالة الحقول الافتراضية (password, pinCodeHash, etc.)
const sanitized = SanitizationHelper.sanitize<User>(user);

// مع حقول مخصصة
const sanitized = SanitizationHelper.sanitize<Driver>(
  driver,
  ['password', 'bankAccount', 'ssn']
);

// للمصفوفات
const sanitized = SanitizationHelper.sanitizeMany<User>(users);

// إزالة null/undefined
const cleaned = SanitizationHelper.removeNullFields(obj);
```

---

### 5. CacheHelper

**الغرض:** توحيد عمليات الـ Caching

**الاستخدام:**
```typescript
import { CacheHelper } from '@common/utils';

// Cache with factory pattern
const user = await CacheHelper.getOrSet(
  this.cacheManager,
  `user:${userId}`,
  600, // TTL in seconds
  async () => this.userModel.findById(userId)
);

// مسح cache entity وعلاقاته
await CacheHelper.invalidateEntity(
  this.cacheManager,
  'order',
  orderId,
  ['orders:user:{userId}', 'orders:driver:{driverId}']
);

// مسح متعدد
await CacheHelper.invalidateMultiple(
  this.cacheManager,
  ['key1', 'key2', 'key3']
);

// بناء cache key
const key = CacheHelper.buildKey(['user', userId, 'orders']);
// => 'user:123:orders'
```

---

### 6. ModerationHelper

**الغرض:** توحيد عمليات الـ Ban/Suspend/Approve

**الاستخدام:**
```typescript
import { ModerationHelper } from '@common/utils';

// حظر
await ModerationHelper.ban(
  this.driverModel,
  driverId,
  'سبب الحظر',
  adminId,
  'Driver'
);

// إلغاء حظر
await ModerationHelper.unban(
  this.userModel,
  userId,
  adminId,
  'User'
);

// تعليق
await ModerationHelper.suspend(
  this.storeModel,
  storeId,
  'سبب التعليق',
  adminId,
  'Store'
);

// الموافقة
await ModerationHelper.approve(
  this.vendorModel,
  vendorId,
  adminId,
  'Vendor'
);

// رفض
await ModerationHelper.reject(
  this.storeModel,
  storeId,
  'سبب الرفض',
  adminId,
  'Store'
);
```

---

### 7. WalletHelper

**الغرض:** توحيد عمليات المحفظة

**الاستخدام:**
```typescript
import { WalletHelper } from '@common/utils';

// التحقق من الرصيد
WalletHelper.validateBalance(
  user.wallet.balance,
  user.wallet.onHold,
  amount
);

// حساب الرصيد المتاح
const available = WalletHelper.getAvailableBalance(
  user.wallet.balance,
  user.wallet.onHold
);

// إنشاء update query
const updateQuery = WalletHelper.createWalletUpdate(amount, 'credit');
await this.userModel.findByIdAndUpdate(userId, updateQuery);

// update queries متخصصة
const creditUpdate = WalletHelper.createCreditUpdate(100);
const debitUpdate = WalletHelper.createDebitUpdate(50);
const holdUpdate = WalletHelper.createHoldUpdate(200);
const releaseUpdate = WalletHelper.createReleaseUpdate(200);

// التحقق من المبلغ
WalletHelper.validateAmount(amount, 1, 10000); // min, max

// حساب نسبة
const commission = WalletHelper.calculatePercentage(1000, 10); // => 100
```

---

### 8. BulkOperationsUtil

**الغرض:** عمليات جماعية على الـ database (موجود مسبقاً)

**الاستخدام:**
```typescript
import { BulkOperationsUtil } from '@common/utils';

// تحديث متعدد
await BulkOperationsUtil.bulkUpdateByIds(
  this.orderModel,
  orderIds,
  { status: 'processed' }
);

// معالجة على دفعات
await BulkOperationsUtil.processInChunks(
  items,
  100, // chunk size
  async (chunk) => {
    // معالجة كل دفعة
  }
);
```

---

## 🎯 فوائد استخدام الـ Helpers

### 1. تقليل التكرار
- **قبل:** 200+ سطر متكرر
- **بعد:** استدعاء دالة واحدة

### 2. Consistency
- نفس المنطق في كل مكان
- نفس رسائل الأخطاء
- نفس الـ patterns

### 3. سهولة الصيانة
- تحديث في مكان واحد
- اختبار مركزي
- توثيق موحد

### 4. Best Practices
- Type safety
- Error handling
- Performance optimization

---

## 📝 ملاحظات

### Import Path
يمكن استخدام الـ path alias:
```typescript
import { PaginationHelper, EntityHelper } from '@common/utils';
```

بدلاً من:
```typescript
import { PaginationHelper } from '../../common/utils/pagination.helper';
```

### Type Safety
جميع الـ helpers تدعم TypeScript Generics:
```typescript
const user = await EntityHelper.findByIdOrFail<User>(
  this.userModel,
  userId,
  'User'
);
// user is typed as User
```

### Error Handling
جميع الـ helpers ترمي exceptions موحدة:
- `NotFoundException` - entity غير موجود
- `BadRequestException` - بيانات غير صحيحة
- مع رسائل عربية للـ userMessage

---

## 🚀 Migration Guide

### مثال: تحويل OrderService

**قبل:**
```typescript
async findUserOrders(userId: string, pagination: CursorPaginationDto) {
  const query: any = { user: new Types.ObjectId(userId) };
  
  if (pagination.cursor) {
    query._id = { $gt: new Types.ObjectId(pagination.cursor) };
  }
  
  const limit = pagination.limit || 20;
  const items = await this.orderModel
    .find(query)
    .sort({ createdAt: -1 })
    .limit(limit + 1)
    .populate('driver', 'fullName phone profileImage');
  
  const hasMore = items.length > limit;
  const results = hasMore ? items.slice(0, -1) : items;
  
  return {
    data: results,
    pagination: {
      nextCursor: hasMore ? results[results.length - 1]._id.toString() : null,
      hasMore,
      limit,
    },
  };
}
```

**بعد:**
```typescript
async findUserOrders(userId: string, pagination: CursorPaginationDto) {
  return PaginationHelper.paginate(
    this.orderModel,
    { user: new Types.ObjectId(userId) },
    pagination,
    { 
      populate: { path: 'driver', select: 'fullName phone profileImage' }
    }
  );
}
```

**التوفير:** من 23 سطر إلى 9 أسطر! 🎉

---

## 📞 الخلاصة

استخدام الـ Helpers يوفر:
- ✅ **80% أقل كود**
- ✅ **Consistency عبر المشروع**
- ✅ **سهولة الصيانة**
- ✅ **أقل احتمالية للأخطاء**

**نصيحة:** ابدأ بتحويل module واحد كتجربة، ثم طبق على باقي المشروع.

