# Wallet API - تطبيق المستخدم

## نظرة عامة

ملف كامل ومتكامل للتعامل مع جميع عمليات المحفظة المالية في التطبيق.

## الملفات

- `walletApi.ts` - API المحفظة الكامل (410+ سطر، 23+ دالة)

## المميزات

✅ **23+ دالة** لجميع عمليات المحفظة  
✅ **TypeScript interfaces** كاملة  
✅ **تنظيم واضح** حسب الفئات  
✅ **Cursor Pagination** مدعومة  
✅ **Error handling** عبر axios interceptors  

---

## كيفية الاستخدام

### 1. الرصيد (Balance)

```typescript
import { getWalletBalance } from '@/api/walletApi';

const balance = await getWalletBalance();
console.log(balance);
// {
//   balance: 5000,
//   onHold: 500,
//   available: 4500,
//   loyaltyPoints: 120
// }
```

---

### 2. المعاملات (Transactions)

```typescript
import { getTransactions, getTransactionDetails } from '@/api/walletApi';

// جلب السجل
const result = await getTransactions({ limit: 20 });
console.log(result.data); // Transaction[]
console.log(result.hasMore); // boolean
console.log(result.nextCursor); // string

// تفاصيل معاملة
const tx = await getTransactionDetails('64abc...');
console.log(tx);
```

---

### 3. الشحن (Topup)

#### الحصول على طرق الشحن
```typescript
import { getTopupMethods } from '@/api/walletApi';

const methods = await getTopupMethods();
// [
//   {
//     id: 'kuraimi',
//     name: 'كريمي',
//     type: 'kuraimi',
//     enabled: true,
//     minAmount: 100,
//     maxAmount: 100000
//   },
//   ...
// ]
```

#### شحن عبر كريمي
```typescript
import { topupViaKuraimi, verifyTopup } from '@/api/walletApi';

// 1. طلب الشحن
const result = await topupViaKuraimi({
  amount: 1000,
  SCustID: '773xxxxxxxx',
  PINPASS: '****'
});

console.log(result.transactionId); // '64def...'

// 2. التحقق من الشحن
const verification = await verifyTopup(result.transactionId);
if (verification.success) {
  Alert.alert('نجح', 'تم شحن المحفظة بنجاح');
}
```

#### سجل عمليات الشحن
```typescript
import { getTopupHistory } from '@/api/walletApi';

const history = await getTopupHistory({ limit: 10 });
console.log(history.data);
```

---

### 4. السحب (Withdrawals)

```typescript
import { 
  getWithdrawMethods,
  requestWithdrawal,
  getMyWithdrawals,
  cancelWithdrawal 
} from '@/api/walletApi';

// طرق السحب المتاحة
const methods = await getWithdrawMethods();

// طلب سحب
const result = await requestWithdrawal({
  amount: 5000,
  method: 'bank_transfer',
  accountInfo: {
    bankName: 'البنك الأهلي',
    accountNumber: '123456789',
    accountName: 'محمد أحمد'
  }
});

// طلباتي
const my = await getMyWithdrawals();

// إلغاء طلب
await cancelWithdrawal('64abc...');
```

---

### 5. الكوبونات (Coupons)

```typescript
import { 
  validateCoupon,
  applyCoupon,
  getMyCoupons,
  getCouponHistory 
} from '@/api/walletApi';

// التحقق قبل التطبيق
const validation = await validateCoupon('WELCOME2025');
if (validation.valid) {
  console.log('الكوبون صالح:', validation.coupon);
}

// تطبيق كوبون
const result = await applyCoupon({
  code: 'WELCOME2025',
  amount: 1000 // المبلغ المراد تطبيق الخصم عليه
});

console.log('الخصم:', result.discount);

// كوبوناتي المتاحة
const myCoupons = await getMyCoupons();

// السجل
const history = await getCouponHistory();
```

---

### 6. الاشتراكات (Subscriptions)

```typescript
import { 
  subscribe,
  getMySubscriptions,
  cancelSubscription 
} from '@/api/walletApi';

// الاشتراك
const result = await subscribe({
  planId: 'premium-monthly',
  autoRenew: true
});

// اشتراكاتي
const subs = await getMySubscriptions();
// [
//   {
//     _id: '64abc...',
//     plan: 'premium-monthly',
//     amount: 99,
//     status: 'active',
//     startDate: '2025-10-15',
//     endDate: '2025-11-15',
//     autoRenew: true
//   }
// ]

// إلغاء اشتراك
await cancelSubscription('64abc...');
```

---

### 7. دفع الفواتير (Pay Bills)

```typescript
import { payBill, getBills } from '@/api/walletApi';

// دفع فاتورة كهرباء
const result = await payBill({
  billType: 'electricity',
  billNumber: '12345678',
  amount: 500
});

// سجل الفواتير
const bills = await getBills({ limit: 10 });
```

**أنواع الفواتير:**
- `electricity` - كهرباء
- `water` - ماء
- `internet` - إنترنت

---

### 8. التحويلات (Transfers)

```typescript
import { transferFunds, getTransfers } from '@/api/walletApi';

// تحويل لصديق
const result = await transferFunds({
  recipientPhone: '+967773000000',
  amount: 500,
  notes: 'تحويل لصديق'
});

// السجل
const transfers = await getTransfers({ limit: 10 });
```

---

### 9. الاسترجاع (Refunds)

```typescript
import { requestRefund } from '@/api/walletApi';

const result = await requestRefund({
  transactionId: '64abc...',
  reason: 'خطأ في المبلغ'
});
```

---

## Types

### WalletBalance
```typescript
interface WalletBalance {
  balance: number;        // الرصيد الإجمالي
  onHold: number;         // المحجوز
  available: number;      // المتاح
  loyaltyPoints: number;  // نقاط الولاء
}
```

### Transaction
```typescript
interface Transaction {
  _id: string;
  userId: string;
  amount: number;
  type: "credit" | "debit";
  method: string;
  status: "pending" | "completed" | "failed" | "reversed";
  description?: string;
  createdAt: string;
}
```

### Coupon
```typescript
interface Coupon {
  _id: string;
  code: string;
  type: "percentage" | "fixed" | "free_shipping";
  value: number;
  expiryDate: string;
  isUsed: boolean;
  usedCount: number;
  usageLimit?: number;
}
```

### Subscription
```typescript
interface Subscription {
  _id: string;
  plan: string;
  amount: number;
  status: "active" | "cancelled" | "expired";
  startDate: string;
  endDate: string;
  autoRenew: boolean;
}
```

---

## مثال كامل: WalletScreen

```typescript
import React, { useEffect, useState } from 'react';
import { getWalletBalance, getTransactions, getMyCoupons } from '@/api/walletApi';

export default function WalletScreen() {
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [balanceData, txData, couponsData] = await Promise.all([
        getWalletBalance(),
        getTransactions({ limit: 10 }),
        getMyCoupons()
      ]);

      setBalance(balanceData);
      setTransactions(txData.data);
      setCoupons(couponsData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    // ... UI
  );
}
```

---

## Pagination

جميع الدوال التي تُرجع قوائم تدعم cursor pagination:

```typescript
// الصفحة الأولى
const page1 = await getTransactions({ limit: 20 });

// الصفحة التالية
if (page1.hasMore) {
  const page2 = await getTransactions({
    limit: 20,
    cursor: page1.nextCursor
  });
}
```

---

## Error Handling

جميع الدوال ترمي exceptions عند الفشل:

```typescript
try {
  await topupViaKuraimi({ ... });
} catch (error) {
  if (error.response?.status === 400) {
    Alert.alert('خطأ', 'بيانات غير صالحة');
  } else if (error.response?.status === 401) {
    Alert.alert('خطأ', 'يجب تسجيل الدخول');
  } else {
    Alert.alert('خطأ', 'حدث خطأ ما');
  }
}
```

---

## الملفات ذات الصلة

- Backend: `backend-nest/src/modules/wallet/wallet.controller.ts`
- Types: مُضمّنة في `walletApi.ts`
- Screens: `app-user/src/screens/delivery/WalletScreen.tsx`

---

## التوثيق الكامل

راجع: `/WALLET_ENDPOINTS_CLOSURE.md` للتقرير الشامل

---

## ملاحظات مهمة

1. **Authentication:** جميع endpoints تحتاج Firebase Auth token
2. **Version:** جميع المسارات تبدأ بـ `/v2/wallet/`
3. **Rate Limiting:** بعض endpoints محددة (transfers, withdrawals)
4. **Testing:** استخدم environment مناسب (dev/staging) للاختبار

---

**آخر تحديث:** 2025-10-15  
**الحالة:** ✅ جاهز للاستخدام

