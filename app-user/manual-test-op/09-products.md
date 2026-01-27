# اختبار المنتجات - عرض المنتجات والعروض

## نظرة عامة

هذا الملف يغطي اختبار عمليات عرض المنتجات والعروض.

---

## المتطلبات الأساسية

- لا يتطلب مصادقة (Public endpoints)

---

## البيئة

- **Base URL:** `http://localhost:3000`
- **API Version:** v1 أو v2

---

## ملاحظة

هذا الملف يحتوي على عمليات عرض المنتجات. معظم عمليات المنتجات متاحة من خلال:
- `/delivery/stores/:id/products` - منتجات متجر محدد
- `/delivery/products` - قائمة المنتجات العامة (إن وجدت)
- `/delivery/products/:id` - تفاصيل منتج محدد (إن وجدت)
- `/delivery/products/daily-offers` - العروض اليومية (إن وجدت)

---

## العمليات الأساسية

### 1. جلب منتجات متجر

راجع [08-store-browsing.md](08-store-browsing.md) - القسم 4

### 2. العروض اليومية

**Endpoint:** `GET /delivery/products/daily-offers` (إن وجد)

---

## التحقق

تحقق من صحة البيانات المعادة وتوفر المنتجات.

---

**الملف السابق:** [08-store-browsing.md](08-store-browsing.md)  
**الملف التالي:** [10-cart-management.md](10-cart-management.md)
