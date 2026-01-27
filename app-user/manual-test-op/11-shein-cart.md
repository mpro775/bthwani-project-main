# اختبار السلة - إدارة سلة Shein

## نظرة عامة

هذا الملف يغطي اختبار عمليات إدارة سلة Shein.

---

## العمليات

### 1. جلب سلة Shein

**Endpoint:** `GET /delivery/cart/shein`

### 2. إضافة منتج Shein

**Endpoint:** `POST /delivery/cart/shein/items`

### 3. تحديث كمية منتج Shein

**Endpoint:** `PATCH /delivery/cart/shein/items/:sheinProductId`

### 4. حذف منتج Shein

**Endpoint:** `DELETE /delivery/cart/shein/items/:sheinProductId`

### 5. تفريغ سلة Shein

**Endpoint:** `DELETE /delivery/cart/shein`

### 6. تحديث تكاليف الشحن

**Endpoint:** `PATCH /delivery/cart/shein/shipping`

### 7. إضافة ملاحظة

**Endpoint:** `PATCH /delivery/cart/shein/note`

### 8. السلة الموحدة (دمج السلات)

**Endpoint:** `GET /delivery/cart/combined`

### 9. تفريغ كل السلات

**Endpoint:** `DELETE /delivery/cart/combined/clear-all`

---

**الملف السابق:** [10-cart-management.md](10-cart-management.md)  
**الملف التالي:** [12-order-creation.md](12-order-creation.md)
