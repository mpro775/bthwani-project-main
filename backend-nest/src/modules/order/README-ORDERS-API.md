# عقود API الطلبات (Orders API Contract)

## أنواع الطلبات

| النوع | orderType | المسار (Base) | الوصف |
|-------|-----------|---------------|--------|
| ديلفري (متاجر) | `marketplace` | `delivery/order` | طلبات من المتاجر مع سلة وعنوان |
| غاز / وايت | `utility` | `utility/order` | طلبات خدمات الغاز والماء |
| اخدمني | `errand` | `akhdimni/errands` | مهام توصيل (من/إلى) |

الباكند هو مصدر الحقيقة لهذه العقود؛ التطبيق (app-user) يتبعها.

---

## إنشاء الطلب

### ديلفري (من السلة)

- **المسار:** `POST /delivery/order/from-cart`
- **Body:** `CreateOrderFromCartDto` — `addressId`, `paymentMethod`, `notes?`, `couponCode?`, `scheduledFor?`, `deliveryMode?`, `captainTip?`
- الباكند يقرأ السلة من CartService والعنوان من UserService، يبني الطلب ويفرّغ السلة.

### ديلفري (payload كامل)

- **المسار:** `POST /delivery/order`
- **Body:** `CreateOrderDto` — `items[]`, `address`, `price`, `deliveryFee`, `companyShare`, `platformShare`, `paymentMethod`, `orderType: 'marketplace'`

### غاز / وايت

- **المسار:** `POST /utility/order`
- **Body:** `CreateUtilityOrderDto` — `kind` (gas|water), `city`, `variant`, `quantity`, `paymentMethod`, `addressId`, `notes?`, `scheduledFor?`

### اخدمني

- **المسار:** `POST /akhdimni/errands`
- **Body:** `CreateErrandDto` — `category`, `pickup`, `dropoff`, `paymentMethod`, `description?`, `scheduledFor?`, `notes?`

---

## قائمة "طلباتي" الموحدة

لا يوجد endpoint موحد في الباكند. التطبيق (app-user) يبني القائمة الموحدة عبر:

1. `GET /delivery/order/user/:userId` (أو `/delivery/order/my-orders`) — طلبات الديلفري
2. `GET /utility/orders` — طلبات الغاز/الوايت
3. `GET /akhdimni/my-errands` — طلبات اخدمني

ثم دمج النتائج وإضافة `orderType` إن لم يكن موجوداً، وترتيب حسب التاريخ، وتطبيق `mapOrder` للعرض الموحّد.

---

## التقييم والإلغاء

| النوع | التقييم | الإلغاء |
|-------|---------|---------|
| ديلفري | `POST /delivery/order/:id/rate` — `{ rating, comment? }` | `POST /delivery/order/:id/cancel` — `{ reason }` |
| غاز/وايت | `POST /utility/order/:id/rate` — `{ rating, review? }` | `PATCH /utility/order/:id/cancel` — `{ reason }` |
| اخدمني | `POST /akhdimni/errands/:id/rate` — `{ driver, service, comments? }` | `PATCH /akhdimni/errands/:id/cancel` — `{ reason }` |

---

## OpenAPI / Swagger

عند تشغيل الباكند، مسار إنشاء الطلب من السلة وـ DTO مُوثَّقان عبر الـ decorators (`@ApiBody`, `@ApiResponse`, …). يمكن الاعتماد على `/api` (أو مسار Swagger المُعدّ في التطبيق) لرؤية المواصفة الحالية.
