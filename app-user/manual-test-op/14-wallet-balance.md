# اختبار المحفظة - الرصيد والمعاملات

## نظرة عامة

هذا الملف يغطي اختبار عمليات رصيد المحفظة.

---

## العمليات

### 1. جلب رصيد المحفظة

**Endpoint:** `GET /wallet/balance`

**Expected Response:**
```json
{
  "balance": 500.00,
  "heldBalance": 50.00,
  "availableBalance": 450.00
}
```

### 2. شحن المحفظة (كريمي)

**Endpoint:** `POST /wallet/topup/kuraimi`

### 3. التحقق من عملية الشحن

**Endpoint:** `POST /wallet/topup/verify`

### 4. سجل عمليات الشحن

**Endpoint:** `GET /wallet/topup/history`

### 5. طرق الشحن المتاحة

**Endpoint:** `GET /wallet/topup/methods`

### 6. طلب سحب

**Endpoint:** `POST /wallet/withdraw/request`

### 7. طلبات السحب الخاصة بي

**Endpoint:** `GET /wallet/withdraw/my`

### 8. إلغاء طلب سحب

**Endpoint:** `PATCH /wallet/withdraw/:id/cancel`

### 9. تحويل رصيد

**Endpoint:** `POST /wallet/transfer`

### 10. دفع فاتورة

**Endpoint:** `POST /wallet/pay-bill`

---

**الملف السابق:** [13-order-management.md](13-order-management.md)  
**الملف التالي:** [15-wallet-transactions.md](15-wallet-transactions.md)
