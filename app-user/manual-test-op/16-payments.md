# اختبار المدفوعات - جلسات الدفع والعربونات

## نظرة عامة

هذا الملف يغطي اختبار عمليات المدفوعات والعربونات.

---

## العمليات

### 1. إنشاء عربون (حجز أموال)

**Endpoint:** `POST /payments/holds`

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "amount": 100.50,
  "reference": "order-123"
}
```

### 2. إطلاق الأموال المحجوزة

**Endpoint:** `POST /payments/holds/:holdId/release`

### 3. استرداد الأموال المحجوزة

**Endpoint:** `POST /payments/holds/:holdId/refund`

### 4. تفاصيل عربون

**Endpoint:** `GET /payments/holds/:holdId`

### 5. أعرابيني

**Endpoint:** `GET /payments/holds/my`

### 6. إنشاء جلسة دفع

**Endpoint:** `POST /payments/create-session`

### 7. تأكيد الدفع

**Endpoint:** `POST /payments/confirm`

---

**الملف السابق:** [15-wallet-transactions.md](15-wallet-transactions.md)  
**الملف التالي:** [17-favorites.md](17-favorites.md)
