# اختبار الطلبات - إنشاء الطلبات

## نظرة عامة

هذا الملف يغطي اختبار عمليات إنشاء الطلبات.

---

## العمليات

### 1. إنشاء طلب جديد

**Endpoint:** `POST /delivery/order`

**Request Body:**
```json
{
  "items": [
    {
      "productId": "507f1f77bcf86cd799439050",
      "quantity": 2,
      "price": 25.50
    }
  ],
  "addressId": "507f1f77bcf86cd799439020",
  "paymentMethod": "wallet",
  "notes": "ملاحظات خاصة"
}
```

**Expected Response (201 Created):**
```json
{
  "id": "507f1f77bcf86cd799439080",
  "status": "pending",
  "total": 51.00,
  "items": [...],
  "createdAt": "2025-01-27T12:00:00.000Z"
}
```

---

**الملف السابق:** [11-shein-cart.md](11-shein-cart.md)  
**الملف التالي:** [13-order-management.md](13-order-management.md)
