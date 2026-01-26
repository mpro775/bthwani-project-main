# 🔧 خطة إصلاح المسارات المكررة - BTW-AUD-002

## 📊 الملخص

- **إجمالي المسارات**: 473
- **مسارات فريدة**: 439
- **مسارات مكررة**: 23 (34 تكرار)
- **الحالة**: ❌ FAIL

---

## 🎯 الإصلاحات المطلوبة

### 1. إصلاح Generic Routes (/:id)

#### ❌ المشكلة: 8 controllers بنفس المسار `GET /:id`

**الملفات:**
- `driver.controller.ts` → يجب أن يكون: `GET /drivers/:id`
- `merchant.controller.ts` → يجب أن يكون: `GET /merchants/:id`
- `order-cqrs.controller.ts` → يجب أن يكون: `GET /orders/:id`
- `order.controller.ts` → **تكرار!** دمج مع order-cqrs
- `promotion.controller.ts` → يجب أن يكون: `GET /promotions/:id`
- `delivery-store.controller.ts` → يجب أن يكون: `GET /delivery-stores/:id`
- `store.controller.ts` → يجب أن يكون: `GET /stores/:id`
- `vendor.controller.ts` → يجب أن يكون: `GET /vendors/:id`

**الحل:**
```typescript
// في كل controller، تأكد من وجود prefix:

@Controller('drivers')  // ✓
export class DriverController {
  @Get(':id')  // سيصبح: GET /drivers/:id
}

@Controller('merchants')  // ✓
export class MerchantController {
  @Get(':id')  // سيصبح: GET /merchants/:id
}

// ... وهكذا
```

---

### 2. إصلاح Order Controllers التكرار

#### ❌ المشكلة: `order.controller.ts` و `order-cqrs.controller.ts`

**مسارات مكررة:**
- `GET /:id`
- `POST /:id/assign-driver`
- `POST /:id/cancel`
- `PATCH /:id/status`

**الحل المقترح:**

**الخيار 1: دمج Controllers**
```typescript
// احتفظ بـ order-cqrs.controller.ts فقط (CQRS pattern)
// انقل كل المسارات من order.controller.ts إليه
// احذف order.controller.ts
```

**الخيار 2: تقسيم حسب الوظيفة**
```typescript
// order.controller.ts - العمليات الأساسية
@Controller('orders')
export class OrderController {
  @Get(':id')
  @Post()
}

// order-admin.controller.ts - عمليات الإدارة
@Controller('admin/orders')
export class OrderAdminController {
  @Post(':id/assign-driver')
  @Post(':id/cancel')
  @Patch(':id/status')
}
```

**الخيار 3: API Versioning**
```typescript
// v1 (deprecated)
@Controller({ path: 'orders', version: '1' })
export class OrderController { }

// v2 (CQRS)
@Controller({ path: 'orders', version: '2' })
export class OrderCqrsController { }
```

---

### 3. إصلاح مسارات Profile/Me

#### ❌ المشكلة: مسارات متعددة لـ "الحساب الحالي"

| المسار | Controllers | المشكلة |
|--------|------------|---------|
| `GET /me` | user, vendor | تكرار |
| `PATCH /me` | user, vendor | تكرار |
| `GET /profile` | driver, marketer | تكرار |
| `PATCH /profile` | driver, marketer | تكرار |

**الحل:**

```typescript
// ✅ استخدم prefix واضح لكل role:

@Controller('users')
export class UserController {
  @Get('me')  // GET /users/me
  @Patch('me')  // PATCH /users/me
}

@Controller('vendors')
export class VendorController {
  @Get('me')  // GET /vendors/me
  @Patch('me')  // PATCH /vendors/me
}

@Controller('drivers')
export class DriverController {
  @Get('profile')  // GET /drivers/profile
  @Patch('profile')  // PATCH /drivers/profile
}

@Controller('marketers')
export class MarketerController {
  @Get('profile')  // GET /marketers/profile
  @Patch('profile')  // PATCH /marketers/profile
}
```

---

### 4. إصلاح مسارات Consent

#### ❌ المشكلة: `POST /consent` في auth و legal

**الملفات:**
- `auth.controller.ts` → `POST /consent`
- `legal.controller.ts` → `POST /consent`

**الحل:**

```typescript
// الخيار 1: استخدام prefix
@Controller('auth')
export class AuthController {
  @Post('consent')  // POST /auth/consent
}

@Controller('legal')
export class LegalController {
  @Post('consent')  // POST /legal/consent
}

// الخيار 2: دمج في controller واحد
@Controller('legal')
export class LegalController {
  @Post('consent')  // POST /legal/consent
  
  @Get('consent/check/:type')  // POST /legal/consent/check/:type
}
```

---

### 5. إصلاح مسارات Store

#### ❌ المشكلة: `store.controller.ts` و `delivery-store.controller.ts`

**مسارات مكررة:**
- `GET /:id`
- `GET /:id/products`

**الحل:**

```typescript
// ✅ استخدم prefixes مختلفة:

@Controller('stores')
export class StoreController {
  @Get(':id')  // GET /stores/:id
  @Get(':id/products')  // GET /stores/:id/products
}

@Controller('delivery/stores')
export class DeliveryStoreController {
  @Get(':id')  // GET /delivery/stores/:id
  @Get(':id/products')  // GET /delivery/stores/:id/products
}

// أو إذا كانا نفس الشيء، ادمجهما:
@Controller('stores')
export class StoreController {
  @Get(':id')
  @Get(':id/products')
}
```

---

### 6. إصلاح مسارات المنتجات

#### ❌ المشكلة: `POST /products` في merchant و store

**الحل:**

```typescript
@Controller('merchants')
export class MerchantController {
  @Post('products')  // POST /merchants/products
  @Patch('products/:id')  // PATCH /merchants/products/:id
}

@Controller('stores')
export class StoreController {
  @Post('products')  // POST /stores/products
  @Patch('products/:id')  // PATCH /stores/products/:id
}
```

---

### 7. إصلاح مسارات Finance

#### ❌ المشكلة: `GET /commissions/my` في finance و marketer

**الحل:**

```typescript
@Controller('finance')
export class FinanceController {
  @Get('commissions/my')  // GET /finance/commissions/my
  @Post('settlements')  // GET /finance/settlements
}

@Controller('marketers')
export class MarketerController {
  @Get('commissions/my')  // GET /marketers/commissions/my
  // أو: @Get('my-commissions')
}
```

---

### 8. إصلاح Throttler Config

#### ❌ المشكلة: `POST /wallet/transfer` مكرر في throttler config

**الملف:** `src/common/config/throttler.config.ts`

**الحل:**
```typescript
// احذف التكرار - احتفظ بواحد فقط:
{
  path: 'wallet/transfer',
  method: RequestMethod.POST,
  // ...
}
```

---

## 📝 قائمة المهام

### مرحلة 1: إصلاح Prefixes (يوم 1)

- [ ] تأكد من كل controller له `@Controller('prefix')` واضح
- [ ] افتح كل ملف وتحقق:
  ```typescript
  // ❌ بدون prefix
  @Controller()
  
  // ✅ مع prefix
  @Controller('drivers')
  ```

### مرحلة 2: دمج Controllers المكررة (يوم 2)

- [ ] دمج `order.controller.ts` و `order-cqrs.controller.ts`
- [ ] دمج أو فصل `store.controller.ts` و `delivery-store.controller.ts`
- [ ] دمج consent routes في controller واحد

### مرحلة 3: التحقق والاختبار (يوم 3)

- [ ] أعد تشغيل فحص المسارات:
  ```bash
  npm run audit:routes
  ```
- [ ] يجب أن يكون: `Duplicate keys: 0` ✓

- [ ] أعد توليد OpenAPI:
  ```bash
  npm run audit:openapi
  ```

- [ ] شغل Contract Tests:
  ```bash
  npm run test:contract
  ```

- [ ] حدّث Typed Clients:
  ```bash
  ./scripts/generate-typed-clients.sh
  ```

---

## 🎯 النتيجة المتوقعة

بعد الإصلاحات:

```
✅ Found 473 routes
✅ Unique routes: 473
✅ Duplicate keys: 0
Status: ✅ PASS
```

---

## 📚 مرجع سريع

### تحقق من Controller Prefix

```bash
# ابحث عن controllers بدون prefix
grep -r "@Controller()" src/modules/

# ابحث عن controllers مع prefix
grep -r "@Controller('" src/modules/
```

### أنماط صحيحة

```typescript
// ✅ صحيح
@Controller('users')
@Controller('drivers')
@Controller('admin/orders')
@Controller('api/v1/payments')

// ❌ خطأ
@Controller()
@Controller('')
```

---

## 🆘 المساعدة

إذا كنت غير متأكد من prefix مناسب:
1. انظر إلى اسم Module/Controller
2. استخدم الجمع (drivers, orders, users)
3. للـ admin endpoints: استخدم `admin/...`
4. للـ API versioning: استخدم `api/v1/...` أو `v1/...`

---

**التحديث الأخير:** 2025-10-18  
**الحالة:** ⚠️ يحتاج إصلاح  
**الأولوية:** 🔴 عالية

