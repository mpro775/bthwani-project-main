# اختبار الطلبات - إدارة الطلبات

## نظرة عامة

هذا الملف يغطي اختبار عمليات إدارة الطلبات (عرض، تحديث، إلغاء).

---

## العمليات

### 1. جلب طلبات المستخدم

**Endpoint:** `GET /delivery/order` أو `GET /delivery/order/my-orders`

### 2. جلب تفاصيل طلب

**Endpoint:** `GET /delivery/order/:id`

### 3. إلغاء الطلب

**Endpoint:** `POST /delivery/order/:id/cancel`

**Request Body:**
```json
{
  "reason": "سبب الإلغاء"
}
```

### 4. طلب إرجاع

**Endpoint:** `POST /delivery/order/:id/return`

### 5. تقييم الطلب

**Endpoint:** `POST /delivery/order/:id/rate`

**Request Body:**
```json
{
  "rating": 5,
  "comment": "تجربة رائعة!"
}
```

### 6. إعادة طلب سابق

**Endpoint:** `POST /delivery/order/:id/repeat`

### 7. تتبع الطلب

**Endpoint:** `GET /delivery/order/:id/tracking`

---

**الملف السابق:** [12-order-creation.md](12-order-creation.md)  
**الملف التالي:** [14-wallet-balance.md](14-wallet-balance.md)
