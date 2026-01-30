# اختبار السلة - إدارة السلة العادية

## نظرة عامة

هذا الملف يغطي اختبار عمليات إدارة السلة العادية.

---

## المتطلبات الأساسية

- حساب مستخدم مسجل دخول
- JWT Access Token صالح

---

## البيئة

- **Base URL:** `http://localhost:3000`
- **Authorization:** `Bearer <accessToken>`

---

## العمليات

### 1. جلب السلة

**Endpoint:** `GET /delivery/cart`

**Expected Response:**
```json
{
  "id": "507f1f77bcf86cd799439070",
  "items": [
    {
      "productId": "507f1f77bcf86cd799439050",
      "name": "شاورما دجاج",
      "price": 25.50,
      "quantity": 2,
      "subtotal": 51.00
    }
  ],
  "total": 51.00
}
```

### 2. إضافة منتج للسلة

**Endpoint:** `POST /delivery/cart/items`

**Request Body:**
```json
{
  "productType": "deliveryProduct",
  "productId": "507f1f77bcf86cd799439050",
  "name": "شاورما دجاج",
  "price": 25.50,
  "quantity": 1,
  "store": "507f1f77bcf86cd799439030",
  "image": "https://example.com/product1.jpg"
}
```

### 3. تحديث كمية منتج

**Endpoint:** `PATCH /delivery/cart/items/:productId`

**Request Body:**
```json
{
  "quantity": 3
}
```

### 4. حذف منتج من السلة

**Endpoint:** `DELETE /delivery/cart/items/:productId`

### 5. تفريغ السلة

**Endpoint:** `DELETE /delivery/cart`

### 6. إضافة ملاحظة

**Endpoint:** `PATCH /delivery/cart/note`

**Request Body:**
```json
{
  "note": "ملاحظات خاصة"
}
```

### 7. إضافة عنوان التوصيل

**Endpoint:** `PATCH /delivery/cart/delivery-address`

**Request Body:**
```json
{
  "addressId": "507f1f77bcf86cd799439020"
}
```

### 8. عدد العناصر في السلة

**Endpoint:** `GET /delivery/cart/count`

### 9. حساب رسوم التوصيل

**Endpoint:** `GET /delivery/cart/fee`

---

**الملف السابق:** [09-products.md](09-products.md)  
**الملف التالي:** [11-shein-cart.md](11-shein-cart.md)
