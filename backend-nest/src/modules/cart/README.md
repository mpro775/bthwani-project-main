# موديول عربة التسوق (Cart Module)

## نظرة عامة

موديول **عربة التسوق** هو نظام لإدارة سلّة التسوق للمستخدمين. يتيح هذا الموديول للمستخدمين إضافة المنتجات إلى السلة، تحديث الكميات، وحذف المنتجات. يدعم الموديول أنواع مختلفة من المنتجات (منتجات تجارية، منتجات توصيل، منتجات مطاعم) وسلة Shein منفصلة.

---

## الهيكل التنظيمي

```
cart/
├── cart.controller.ts          # نقاط النهاية (API Endpoints)
├── cart.module.ts              # إعدادات الموديول
├── dto/                        # كائنات نقل البيانات
│   ├── add-to-cart.dto.ts
│   └── shein-cart.dto.ts
├── entities/                   # نماذج البيانات
│   ├── cart.entity.ts
│   └── shein-cart.entity.ts
└── services/                   # منطق الأعمال
    ├── cart.service.ts
    └── shein-cart.service.ts
```

---

## الكيانات (Entities)

### 1. Cart (عربة التسوق)

الكيان الرئيسي الذي يمثل سلة تسوق واحدة.

#### الحقول الأساسية

| الحقل | النوع | الوصف | مطلوب |
|------|------|-------|-------|
| `user` | ObjectId | مرجع للمستخدم (فريد) | ✓ |
| `items` | Array[CartItem] | قائمة المنتجات | ✓ |
| `total` | Number | الإجمالي (محسوب تلقائياً) | ✓ |
| `cartId` | String | معرف السلة (للمشاركة) | ✗ |
| `note` | String | ملاحظات على الطلب | ✗ |
| `deliveryAddress` | Object | عنوان التوصيل | ✗ |
| `lastModified` | Date | تاريخ آخر تعديل (تلقائي) | ✗ |

#### CartItem (عنصر السلة)

| الحقل | النوع | الوصف | مطلوب |
|------|------|-------|-------|
| `productType` | Enum | نوع المنتج (`merchantProduct`, `deliveryProduct`, `restaurantProduct`) | ✓ |
| `productId` | ObjectId | معرف المنتج | ✓ |
| `name` | String | اسم المنتج | ✓ |
| `price` | Number | السعر | ✓ |
| `quantity` | Number | الكمية (حد أدنى: 1) | ✓ |
| `store` | ObjectId | مرجع للمتجر | ✓ |
| `image` | String | رابط الصورة | ✗ |
| `options` | Object | خيارات المنتج (حجم، لون، إلخ) | ✗ |

#### أنواع المنتجات (ProductType)

- **`merchantProduct`**: منتج تجاري
- **`deliveryProduct`**: منتج توصيل
- **`restaurantProduct`**: منتج مطعم

---

### 2. SheinCart (سلة Shein)

كيان منفصل لسلة Shein (منتجات من Shein).

---

## العلاقات (Relationships)

### 1. علاقة مع المستخدم (User)

```typescript
user: Types.ObjectId // مرجع لجدول User (فريد)
```

- كل مستخدم لديه سلة واحدة فقط (One-to-One)
- العلاقة: **One-to-One** (سلة واحدة لكل مستخدم)

### 2. علاقة مع المتجر (Store)

```typescript
store: Types.ObjectId // مرجع لجدول Store (في كل عنصر)
```

- كل عنصر في السلة يرتبط بمتجر واحد
- العلاقة: **Many-to-One** (العديد من العناصر لمتجر واحد)

---

## نقاط النهاية (API Endpoints)

### نقاط نهاية السلة العادية

#### 1. الحصول على سلتي

```http
GET /delivery/cart
Authorization: Bearer <token>
```

**الوصف**: الحصول على سلة المستخدم الحالي (أو إنشاء واحدة جديدة إذا لم تكن موجودة).

---

#### 2. الحصول على سلة مستخدم

```http
GET /delivery/cart/user/:userId
Authorization: Bearer <token>
```

---

#### 3. الحصول على سلة بالمعرف

```http
GET /delivery/cart/:cartId
Authorization: Bearer <token>
```

---

#### 4. إضافة منتج للسلة

```http
POST /delivery/cart/items
Authorization: Bearer <token>
```

**Body**:
```json
{
  "productType": "deliveryProduct",
  "productId": "507f1f77bcf86cd799439011",
  "name": "منتج مثال",
  "price": 100,
  "quantity": 2,
  "store": "507f1f77bcf86cd799439012",
  "image": "https://example.com/image.jpg",
  "options": {
    "size": "large",
    "color": "red"
  }
}
```

---

#### 5. تحديث كمية منتج

```http
PATCH /delivery/cart/items/:productId
Authorization: Bearer <token>
```

**Body**:
```json
{
  "quantity": 3
}
```

---

#### 6. حذف منتج من السلة

```http
DELETE /delivery/cart/items/:productId
Authorization: Bearer <token>
```

---

#### 7. تفريغ السلة

```http
DELETE /delivery/cart
Authorization: Bearer <token>
```

---

#### 8. إضافة ملاحظة

```http
PATCH /delivery/cart/note
Authorization: Bearer <token>
```

**Body**:
```json
{
  "note": "ملاحظات على الطلب"
}
```

---

#### 9. تحديث عنوان التوصيل

```http
PATCH /delivery/cart/delivery-address
Authorization: Bearer <token>
```

**Body**:
```json
{
  "street": "شارع الزبيري",
  "city": "صنعاء",
  "building": "مبنى 1",
  "floor": "الطابق الثاني",
  "apartment": "شقة 5",
  "location": {
    "lat": 15.369445,
    "lng": 44.191006
  }
}
```

---

#### 10. عدد العناصر في السلة

```http
GET /delivery/cart/count
Authorization: Bearer <token>
```

---

#### 11. حساب الرسوم

```http
GET /delivery/cart/fee
Authorization: Bearer <token>
```

---

#### 12. دمج السلات

```http
POST /delivery/cart/merge
Authorization: Bearer <token>
```

---

### نقاط نهاية سلة Shein

#### 1. الحصول على سلة Shein

```http
GET /delivery/cart/shein
Authorization: Bearer <token>
```

---

#### 2. إضافة منتج لسلة Shein

```http
POST /delivery/cart/shein/items
Authorization: Bearer <token>
```

---

#### 3. تحديث منتج في سلة Shein

```http
PATCH /delivery/cart/shein/items/:sheinProductId
Authorization: Bearer <token>
```

---

#### 4. حذف منتج من سلة Shein

```http
DELETE /delivery/cart/shein/items/:sheinProductId
Authorization: Bearer <token>
```

---

#### 5. تفريغ سلة Shein

```http
DELETE /delivery/cart/shein
Authorization: Bearer <token>
```

---

#### 6. تحديث الشحن لسلة Shein

```http
PATCH /delivery/cart/shein/shipping
Authorization: Bearer <token>
```

---

#### 7. تحديث ملاحظة لسلة Shein

```http
PATCH /delivery/cart/shein/note
Authorization: Bearer <token>
```

---

### نقاط نهاية السلة المدمجة

#### 1. السلة المدمجة

```http
GET /delivery/cart/combined
Authorization: Bearer <token>
```

**الوصف**: الحصول على السلة العادية وسلة Shein معاً.

---

#### 2. تفريغ السلات المدمجة

```http
DELETE /delivery/cart/combined/clear-all
Authorization: Bearer <token>
```

---

### نقاط نهاية أخرى

#### 1. السلات المهجورة

```http
GET /delivery/cart/abandoned
Authorization: Bearer <token>
```

---

#### 2. إعادة استهداف

```http
POST /delivery/cart/:cartId/retarget/push
Authorization: Bearer <token>
```

---

## العمليات (Operations)

### 1. الحصول على السلة أو إنشاء واحدة جديدة

**الوصف**: إذا كانت السلة موجودة، يتم إرجاعها. وإلا، يتم إنشاء سلة جديدة.

**الخطوات**:
1. البحث عن سلة المستخدم
2. إذا لم توجد، إنشاء سلة جديدة
3. إرجاع السلة

---

### 2. إضافة منتج للسلة

**الوصف**: إضافة منتج جديد أو زيادة كمية منتج موجود.

**الخطوات**:
1. الحصول على السلة (أو إنشاء واحدة)
2. التحقق من وجود المنتج في السلة
3. إذا كان موجوداً: زيادة الكمية
4. إذا لم يكن موجوداً: إضافة المنتج
5. حفظ السلة (يتم حساب الإجمالي تلقائياً)

---

### 3. تحديث كمية منتج

**الخطوات**:
1. الحصول على السلة
2. البحث عن المنتج
3. تحديث الكمية
4. حفظ السلة

---

### 4. حذف منتج

**الخطوات**:
1. الحصول على السلة
2. إزالة المنتج من المصفوفة
3. حفظ السلة

---

### 5. تفريغ السلة

**الخطوات**:
1. الحصول على السلة
2. تفريغ المصفوفة
3. إعادة تعيين الإجمالي
4. حفظ السلة

---

## الفهارس (Indexes)

يحتوي Cart entity على الفهارس التالية:

1. **`user`**: فهرس فريد (Unique Index) - سلة واحدة لكل مستخدم
2. **`cartId`**: فهرس للمشاركة (Sparse Index)
3. **`lastModified`**: فهرس لترتيب حسب آخر تعديل

---

## Pre-save Middleware

يتم حساب الإجمالي تلقائياً عند الحفظ:

```typescript
total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
```

---

## المصادقة والصلاحيات (Authentication & Authorization)

### أنواع المصادقة

- **JWT Auth**: لجميع نقاط النهاية

### الصلاحيات (Roles)

- **المستخدمون**: لا يتطلبون صلاحية خاصة (افتراضي)

---

## DTOs (Data Transfer Objects)

### 1. AddToCartDto

استخدامه في إضافة منتج للسلة.

**الحقول**:
- `productType`: نوع المنتج (مطلوب)
- `productId`: معرف المنتج (مطلوب)
- `name`: اسم المنتج (مطلوب)
- `price`: السعر (مطلوب)
- `quantity`: الكمية (مطلوب، حد أدنى: 1)
- `store`: معرف المتجر (مطلوب)
- `image`: رابط الصورة (اختياري)
- `options`: خيارات المنتج (اختياري)

---

### 2. UpdateCartItemDto

استخدامه في تحديث كمية منتج.

**الحقول**:
- `quantity`: الكمية الجديدة (مطلوب، حد أدنى: 1)

---

### 3. AddNoteDto

استخدامه في إضافة ملاحظة.

**الحقول**:
- `note`: الملاحظة (مطلوب)

---

### 4. AddDeliveryAddressDto

استخدامه في تحديث عنوان التوصيل.

**الحقول**:
- `street`: الشارع (مطلوب)
- `city`: المدينة (مطلوب)
- `building`: المبنى (اختياري)
- `floor`: الطابق (اختياري)
- `apartment`: الشقة (اختياري)
- `location`: الموقع الجغرافي (`{lat: number, lng: number}`) (اختياري)

---

## الملاحظات التقنية

1. **One Cart Per User**:
   - كل مستخدم لديه سلة واحدة فقط (Unique Index على `user`)
   - يتم إنشاء السلة تلقائياً عند الحاجة

2. **Automatic Total Calculation**:
   - يتم حساب الإجمالي تلقائياً عند الحفظ (Pre-save middleware)
   - الإجمالي = مجموع (السعر × الكمية) لجميع العناصر

3. **Product Types**:
   - يدعم الموديول أنواع مختلفة من المنتجات
   - كل نوع له معالجة مختلفة حسب الحاجة

4. **Shein Cart**:
   - سلة Shein منفصلة عن السلة العادية
   - يمكن دمج السلات عند الطلب

5. **Cart Merging**:
   - يمكن دمج السلات من مصادر مختلفة
   - مفيد عند تسجيل الدخول من جهات مختلفة

---

## الأخطاء الشائعة

| الكود | الوصف |
|------|-------|
| 404 | المنتج غير موجود في السلة |
| 400 | بيانات غير صالحة (كمية < 1، سعر سالب، إلخ) |
| 401 | غير مصرح (مصادقة فاشلة) |

---

## التبعيات (Dependencies)

- `@nestjs/common`
- `@nestjs/mongoose`
- `@nestjs/swagger`
- `mongoose`
- `class-validator`
- `class-transformer`

---

## التوثيق الإضافي

- [Swagger Documentation](http://localhost:3000/api) (عند تشغيل الخادم)
- ملفات الكود: راجع الملفات في هذا الموديول لمزيد من التفاصيل
- Store Module: راجع `../store/README.md` لفهم المتاجر والمنتجات
