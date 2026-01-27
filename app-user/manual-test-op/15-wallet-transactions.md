# اختبار المحفظة - سجل المعاملات

## نظرة عامة

هذا الملف يغطي اختبار عمليات سجل معاملات المحفظة.

---

## العمليات

### 1. جلب سجل المعاملات

**Endpoint:** `GET /wallet/transactions`

**Query Parameters:**
- `cursor`: مؤشر للصفحة
- `limit`: عدد النتائج

### 2. تفاصيل معاملة

**Endpoint:** `GET /wallet/transaction/:id`

### 3. سجل التحويلات

**Endpoint:** `GET /wallet/transfers`

### 4. سجل الفواتير المدفوعة

**Endpoint:** `GET /wallet/bills`

### 5. طلب استرجاع

**Endpoint:** `POST /wallet/refund/request`

---

**الملف السابق:** [14-wallet-balance.md](14-wallet-balance.md)  
**الملف التالي:** [16-payments.md](16-payments.md)
