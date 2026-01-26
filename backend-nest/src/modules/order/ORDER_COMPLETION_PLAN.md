# خطة إكمال وحدة الطلبات (Order Module Completion Plan)

## 📋 نظرة عامة

هذا الملف يوثق خطة إكمال وحدة الطلبات (Order Module) وإصلاح جميع المشاكل والنواقص الموجودة في التكامل مع:
- ✅ **تطبيق المستخدم** - يعمل بشكل جيد
- ❌ **تطبيق السائق** - يحتاج إكمال
- ✅ **لوحة التحكم** - تعمل بشكل جيد
- ❌ **المحفظة (Wallet)** - يحتاج تكامل كامل

---

## 🔴 المشاكل الحرجة (Critical Issues)

### 1. **تكامل تطبيق السائق غير مكتمل**

**الموقع:** `backend-nest/src/modules/driver/driver.service.ts`

**المشكلة:**
```typescript
// ❌ جميع هذه العمليات غير مكتملة (TODO)
async getAvailableOrders(driverId: string) {
  // TODO: Find orders that need drivers (nearby, unassigned)
  return { data: [] };
}

async acceptOrder(orderId: string, driverId: string) {
  // TODO: Assign order to driver
  return { success: true, message: 'تم قبول الطلب' };
}

async startDelivery(orderId: string, driverId: string) {
  // TODO: Update order status
  return { success: true, message: 'بدأ التوصيل' };
}

async completeDelivery(orderId: string, driverId: string) {
  // TODO: Update order status to delivered
  return { success: true, message: 'تم إتمام التوصيل' };
}
```

**التأثير:**
- السائقون لا يستطيعون رؤية الطلبات المتاحة
- لا يمكن قبول أو رفض الطلبات
- لا يمكن بدء أو إتمام التوصيل
- تطبيق السائق غير وظيفي

---

### 2. **عدم ربط DriverModule مع OrderModule**

**الموقع:** `backend-nest/src/modules/driver/driver.module.ts`

**المشكلة:**
```typescript
@Module({
  imports: [
    // ❌ OrderModule غير مستورد!
    MongooseModule.forFeature([...]),
    WalletModule,
  ],
  // ...
})
export class DriverModule {}
```

**التأثير:**
- `DriverService` لا يمكنه استخدام `OrderService`
- لا يمكن تحديث حالة الطلبات من `DriverService`

---

### 3. **تكامل المحفظة غير مكتمل**

**الموقع:** `backend-nest/src/modules/order/order.service.ts`

**المشكلة:**
```typescript
// عند الإلغاء
async vendorCancelOrder(orderId: string, reason: string) {
  // ... كود الإلغاء ...
  
  // ❌ TODO: Release wallet hold, refund, update inventory
  return order;
}
```

**التأثير:**
- عند إلغاء الطلب، المبلغ المحجوز لا يُرجع للمستخدم
- عند إتمام الطلب، المبلغ المحجوز لا يُطلق
- مشاكل مالية محتملة

---

## 🟡 المشاكل المتوسطة (Medium Priority Issues)

### 4. **حقول مفقودة في Order Entity**

**الحقول المفقودة:**
- `estimatedDeliveryTime` - الوقت المتوقع للتوصيل
- `actualDeliveryTime` - الوقت الفعلي للتسليم
- `pickupLocation` - موقع الاستلام (للمتجر)
- `deliveryDistance` - مسافة التوصيل
- `deliveryDuration` - مدة التوصيل
- `tipAmount` - قيمة البقشيش
- `deliveryInstructions` - تعليمات التوصيل الخاصة

---

### 5. **نقص في التحقق من الصلاحيات**

**المشاكل:**
- لا يوجد تحقق من أن السائق هو المكلف بالطلب قبل `completeDelivery`
- لا يوجد تحقق من أن المستخدم هو صاحب الطلب قبل `cancelOrder`
- لا يوجد تحقق من أن التاجر هو صاحب المتجر قبل `vendorAcceptOrder`

---

### 6. **نقص في الإشعارات الفورية**

**المشكلة:**
- لا توجد إشعارات WebSocket عند تغيير حالة الطلب
- المستخدمون والسائقون لا يعرفون التحديثات فوراً

---

## 🟢 تحسينات مقترحة (Enhancements)

### 7. **نظام التقييم المتبادل**
- تقييم السائق من قبل العميل
- تقييم العميل من قبل السائق

### 8. **تحسينات الأداء**
- Cache للطلبات المتاحة للسائقين
- Batch operations لعمليات متعددة
- فهرسة إضافية للاستعلامات المعقدة

---

## 📝 خطة الإكمال التفصيلية

### **المرحلة 1: إصلاح التكامل مع تطبيق السائق** ⚡ (أولوية عالية)

#### **الخطوة 1.1: ربط DriverModule مع OrderModule**

**الملف:** `backend-nest/src/modules/driver/driver.module.ts`

```typescript
import { Module, forwardRef } from '@nestjs/common';
import { OrderModule } from '../order/order.module'; // ✅ إضافة

@Module({
  imports: [
    MongooseModule.forFeature([...]),
    forwardRef(() => WalletModule),
    forwardRef(() => OrderModule), // ✅ إضافة
  ],
  // ...
})
export class DriverModule {}
```

**التحقق:**
- [ ] استيراد `OrderModule` في `DriverModule`
- [ ] تصدير `OrderService` من `OrderModule` (موجود بالفعل)

---

#### **الخطوة 1.2: إكمال getAvailableOrders**

**الملف:** `backend-nest/src/modules/driver/driver.service.ts`

```typescript
async getAvailableOrders(driverId: string) {
  // 1. جلب موقع السائق
  const driver = await this.driverModel.findById(driverId);
  if (!driver || !driver.currentLocation) {
    return { data: [] };
  }

  // 2. جلب الطلبات الجاهزة بدون سائق
  const orders = await this.orderModel.find({
    status: OrderStatus.READY,
    driver: { $exists: false },
    'address.city': driver.currentLocation.city, // نفس المدينة
  })
  .populate('user', 'fullName phone')
  .populate('items.store', 'name')
  .sort({ createdAt: -1 })
  .limit(20)
  .lean();

  // 3. حساب المسافة وترتيب حسب القرب (اختياري)
  const ordersWithDistance = orders.map(order => ({
    ...order,
    distance: this.calculateDistance(
      driver.currentLocation,
      order.address.location
    ),
  }));

  return { data: ordersWithDistance };
}
```

**التحقق:**
- [ ] جلب موقع السائق
- [ ] فلترة الطلبات حسب الحالة والموقع
- [ ] حساب المسافة (اختياري)
- [ ] إرجاع البيانات بشكل صحيح

---

#### **الخطوة 1.3: إكمال acceptOrder**

**الملف:** `backend-nest/src/modules/driver/driver.service.ts`

```typescript
async acceptOrder(orderId: string, driverId: string) {
  // 1. التحقق من وجود الطلب
  const order = await this.orderService.findOne(orderId);
  if (!order) {
    throw new NotFoundException('الطلب غير موجود');
  }

  // 2. التحقق من حالة الطلب
  if (order.status !== OrderStatus.READY) {
    throw new BadRequestException('الطلب غير جاهز للاستلام');
  }

  // 3. التحقق من أن السائق متاح
  const driver = await this.driverModel.findById(driverId);
  if (!driver || !driver.isAvailable) {
    throw new BadRequestException('السائق غير متاح');
  }

  // 4. تعيين السائق للطلب
  await this.orderService.assignDriver(orderId, driverId);

  // 5. تحديث حالة السائق (اختياري - يمكن أن يكون لديه عدة طلبات)
  // await this.driverModel.findByIdAndUpdate(driverId, { isAvailable: false });

  return { 
    success: true, 
    message: 'تم قبول الطلب بنجاح',
    order: await this.orderService.findOne(orderId)
  };
}
```

**التحقق:**
- [ ] التحقق من وجود الطلب
- [ ] التحقق من حالة الطلب
- [ ] التحقق من توفر السائق
- [ ] تعيين السائق للطلب
- [ ] إرجاع النتيجة

---

#### **الخطوة 1.4: إكمال startDelivery**

**الملف:** `backend-nest/src/modules/driver/driver.service.ts`

```typescript
async startDelivery(orderId: string, driverId: string) {
  // 1. التحقق من أن السائق هو المكلف بالطلب
  const order = await this.orderService.findOne(orderId);
  if (!order) {
    throw new NotFoundException('الطلب غير موجود');
  }

  if (order.driver?.toString() !== driverId) {
    throw new ForbiddenException('هذا الطلب غير مكلف لك');
  }

  if (order.status !== OrderStatus.PICKED_UP) {
    throw new BadRequestException('يجب استلام الطلب أولاً');
  }

  // 2. تحديث حالة الطلب إلى ON_THE_WAY
  await this.orderService.updateStatus(orderId, {
    status: OrderStatus.ON_THE_WAY,
    changedBy: 'driver',
  });

  return { 
    success: true, 
    message: 'بدأ التوصيل',
    order: await this.orderService.findOne(orderId)
  };
}
```

**التحقق:**
- [ ] التحقق من أن السائق هو المكلف
- [ ] التحقق من حالة الطلب
- [ ] تحديث الحالة إلى `ON_THE_WAY`
- [ ] إرجاع النتيجة

---

#### **الخطوة 1.5: إكمال completeDelivery**

**الملف:** `backend-nest/src/modules/driver/driver.service.ts`

```typescript
async completeDelivery(orderId: string, driverId: string) {
  // 1. التحقق من أن السائق هو المكلف بالطلب
  const order = await this.orderService.findOne(orderId);
  if (!order) {
    throw new NotFoundException('الطلب غير موجود');
  }

  if (order.driver?.toString() !== driverId) {
    throw new ForbiddenException('هذا الطلب غير مكلف لك');
  }

  if (![OrderStatus.PICKED_UP, OrderStatus.ON_THE_WAY].includes(order.status as OrderStatus)) {
    throw new BadRequestException('حالة الطلب غير صحيحة');
  }

  // 2. تحديث حالة الطلب إلى DELIVERED
  await this.orderService.updateStatus(orderId, {
    status: OrderStatus.DELIVERED,
    changedBy: 'driver',
  });

  // 3. تحديث تاريخ التسليم
  await this.orderModel.findByIdAndUpdate(orderId, {
    deliveredAt: new Date(),
  });

  // 4. تحديث إحصائيات السائق
  await this.updateDriverStats(driverId, order.price + order.deliveryFee);

  // 5. إطلاق المبلغ المحجوز من المحفظة (إذا كان دفع بالمحفظة)
  if (order.paymentMethod === PaymentMethod.WALLET || order.paymentMethod === PaymentMethod.MIXED) {
    await this.walletService.releaseFunds(
      order.user.toString(),
      order.walletUsed,
      orderId
    );
  }

  return { 
    success: true, 
    message: 'تم إتمام التوصيل بنجاح',
    order: await this.orderService.findOne(orderId)
  };
}
```

**التحقق:**
- [ ] التحقق من أن السائق هو المكلف
- [ ] التحقق من حالة الطلب
- [ ] تحديث الحالة إلى `DELIVERED`
- [ ] تحديث تاريخ التسليم
- [ ] تحديث إحصائيات السائق
- [ ] إطلاق المبلغ المحجوز (إذا لزم)

---

#### **الخطوة 1.6: إكمال rejectOrder**

**الملف:** `backend-nest/src/modules/driver/driver.service.ts`

```typescript
async rejectOrder(orderId: string, driverId: string, reason: string) {
  // 1. التحقق من وجود الطلب
  const order = await this.orderService.findOne(orderId);
  if (!order) {
    throw new NotFoundException('الطلب غير موجود');
  }

  // 2. تسجيل سبب الرفض (يمكن إضافة حقل rejectionHistory في Order)
  // يمكن إضافة ملاحظة للطلب
  await this.orderService.addNote(
    orderId,
    `رفض السائق: ${reason}`,
    'internal',
    { role: 'driver', id: driverId }
  );

  return { 
    success: true, 
    message: 'تم رفض الطلب',
  };
}
```

**التحقق:**
- [ ] التحقق من وجود الطلب
- [ ] تسجيل سبب الرفض
- [ ] إرجاع النتيجة

---

#### **الخطوة 1.7: إكمال getOrdersHistory**

**الملف:** `backend-nest/src/modules/driver/driver.service.ts`

```typescript
async getOrdersHistory(driverId: string, pagination: CursorPaginationDto) {
  return this.orderService.findDriverOrders(driverId, pagination);
}
```

**التحقق:**
- [ ] استخدام `OrderService.findDriverOrders` الموجود بالفعل
- [ ] إرجاع البيانات مع pagination

---

### **المرحلة 2: إكمال التكامل مع المحفظة** 💰 (أولوية عالية)

#### **الخطوة 2.1: حجز المبلغ عند إنشاء الطلب**

**الملف:** `backend-nest/src/modules/order/commands/handlers/create-order.handler.ts`

```typescript
async execute(command: CreateOrderCommand): Promise<Order> {
  // ... الكود الحالي ...

  // ✅ إضافة: حجز المبلغ من المحفظة إذا كان الدفع بالمحفظة
  if (command.paymentMethod === PaymentMethod.WALLET || 
      command.paymentMethod === PaymentMethod.MIXED) {
    
    const totalAmount = command.price + command.deliveryFee;
    const walletAmount = command.walletUsed || totalAmount;

    // التحقق من الرصيد
    const userWallet = await this.walletService.getBalance(command.userId);
    if (userWallet.balance < walletAmount) {
      throw new BadRequestException({
        code: 'INSUFFICIENT_BALANCE',
        message: 'رصيد المحفظة غير كاف',
        userMessage: 'رصيد المحفظة غير كاف لإتمام الطلب',
      });
    }

    // حجز المبلغ
    await this.walletService.holdFunds(
      command.userId,
      walletAmount,
      String(order._id)
    );
  }

  return order;
}
```

**التحقق:**
- [ ] التحقق من الرصيد قبل الحجز
- [ ] حجز المبلغ من المحفظة
- [ ] معالجة الأخطاء بشكل صحيح

---

#### **الخطوة 2.2: إرجاع المبلغ عند الإلغاء**

**الملف:** `backend-nest/src/modules/order/order.service.ts`

```typescript
async cancelOrder(orderId: string, reason: string, userId: string) {
  // ... الكود الحالي ...

  // ✅ إضافة: إرجاع المبلغ المحجوز
  if (order.paymentMethod === PaymentMethod.WALLET || 
      order.paymentMethod === PaymentMethod.MIXED) {
    
    if (order.walletUsed > 0) {
      await this.walletService.refundHeldFunds(
        userId,
        order.walletUsed,
        orderId
      );
    }
  }

  return order;
}

async vendorCancelOrder(orderId: string, reason: string) {
  // ... الكود الحالي ...

  // ✅ إضافة: إرجاع المبلغ المحجوز
  if (order.paymentMethod === PaymentMethod.WALLET || 
      order.paymentMethod === PaymentMethod.MIXED) {
    
    if (order.walletUsed > 0) {
      await this.walletService.refundHeldFunds(
        order.user.toString(),
        order.walletUsed,
        orderId
      );
    }
  }

  return order;
}
```

**التحقق:**
- [ ] إرجاع المبلغ عند إلغاء العميل
- [ ] إرجاع المبلغ عند إلغاء التاجر
- [ ] معالجة الأخطاء

---

#### **الخطوة 2.3: إطلاق المبلغ عند الإتمام**

**الملف:** `backend-nest/src/modules/order/order.service.ts`

```typescript
// ✅ إضافة دالة جديدة أو تحديث updateStatus
async updateStatus(orderId: string, updateStatusDto: UpdateOrderStatusDto) {
  // ... الكود الحالي ...

  // ✅ إضافة: إطلاق المبلغ عند التسليم
  if (updateStatusDto.status === OrderStatus.DELIVERED) {
    const order = await this.orderModel.findById(orderId);
    
    if (order && (order.paymentMethod === PaymentMethod.WALLET || 
                  order.paymentMethod === PaymentMethod.MIXED)) {
      
      if (order.walletUsed > 0) {
        await this.walletService.releaseFunds(
          order.user.toString(),
          order.walletUsed,
          orderId
        );
      }
    }
  }

  return order;
}
```

**التحقق:**
- [ ] إطلاق المبلغ عند التسليم
- [ ] معالجة الأخطاء

---

### **المرحلة 3: إضافة حقول مفقودة** 📊 (أولوية متوسطة)

#### **الخطوة 3.1: تحديث Order Entity**

**الملف:** `backend-nest/src/modules/order/entities/order.entity.ts`

```typescript
@Schema({ timestamps: true, collection: 'deliveryorders' })
export class Order extends Document {
  // ... الحقول الحالية ...

  // ✅ إضافة الحقول المفقودة
  @Prop({ type: Date })
  estimatedDeliveryTime?: Date;

  @Prop({ type: Date })
  actualDeliveryTime?: Date;

  @Prop({ type: Address })
  pickupLocation?: Address;

  @Prop({ type: Number })
  deliveryDistance?: number; // بالكيلومتر

  @Prop({ type: Number })
  deliveryDuration?: number; // بالدقائق

  @Prop({ type: Number, default: 0 })
  tipAmount?: number;

  @Prop()
  deliveryInstructions?: string;

  @Prop({ type: Number, min: 1, max: 5 })
  driverRating?: number; // تقييم السائق من قبل العميل

  @Prop({ type: Number, min: 1, max: 5 })
  customerRating?: number; // تقييم العميل من قبل السائق
}
```

**التحقق:**
- [ ] إضافة جميع الحقول المطلوبة
- [ ] تحديث الـ Schema
- [ ] إضافة Indexes إذا لزم

---

#### **الخطوة 3.2: إضافة دوال حساب المسافة والوقت**

**الملف:** `backend-nest/src/modules/order/order.service.ts`

```typescript
// ✅ إضافة دوال مساعدة
private calculateDistance(
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number }
): number {
  // حساب المسافة باستخدام Haversine formula
  const R = 6371; // نصف قطر الأرض بالكيلومتر
  const dLat = this.toRad(point2.lat - point1.lat);
  const dLon = this.toRad(point2.lng - point1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(this.toRad(point1.lat)) *
      Math.cos(this.toRad(point2.lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

private toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

async calculateETA(orderId: string): Promise<Date> {
  const order = await this.findOne(orderId);
  if (!order || !order.driver) {
    return null;
  }

  // حساب الوقت المتوقع بناءً على المسافة والسرعة المتوسطة
  const driver = await this.driverModel.findById(order.driver);
  const distance = this.calculateDistance(
    driver.currentLocation,
    order.address.location
  );
  
  const averageSpeed = 30; // كم/ساعة
  const estimatedMinutes = (distance / averageSpeed) * 60;
  
  return new Date(Date.now() + estimatedMinutes * 60000);
}
```

**التحقق:**
- [ ] حساب المسافة بشكل صحيح
- [ ] حساب الوقت المتوقع
- [ ] تحديث `estimatedDeliveryTime` عند تعيين السائق

---

### **المرحلة 4: تحسين الأمان والصلاحيات** 🔒 (أولوية متوسطة)

#### **الخطوة 4.1: إضافة Guards للتحقق من الصلاحيات**

**الملف:** `backend-nest/src/modules/order/guards/order-owner.guard.ts` (جديد)

```typescript
@Injectable()
export class OrderOwnerGuard implements CanActivate {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const orderId = request.params.id;
    const userId = request.user?.id;

    if (!orderId || !userId) {
      return false;
    }

    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new NotFoundException('الطلب غير موجود');
    }

    // التحقق من أن المستخدم هو صاحب الطلب
    return order.user.toString() === userId;
  }
}
```

**التحقق:**
- [ ] إنشاء Guard للتحقق من ملكية الطلب
- [ ] استخدام Guard في الـ Controllers

---

#### **الخطوة 4.2: إضافة Guard للتحقق من السائق**

**الملف:** `backend-nest/src/modules/order/guards/order-driver.guard.ts` (جديد)

```typescript
@Injectable()
export class OrderDriverGuard implements CanActivate {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const orderId = request.params.id;
    const driverId = request.user?.id;

    if (!orderId || !driverId) {
      return false;
    }

    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new NotFoundException('الطلب غير موجود');
    }

    // التحقق من أن السائق هو المكلف بالطلب
    return order.driver?.toString() === driverId;
  }
}
```

**التحقق:**
- [ ] إنشاء Guard للتحقق من السائق
- [ ] استخدام Guard في الـ Controllers

---

### **المرحلة 5: إضافة الإشعارات الفورية** 🔔 (أولوية متوسطة)

#### **الخطوة 5.1: إضافة WebSocket Events**

**الملف:** `backend-nest/src/modules/order/order.service.ts`

```typescript
// ✅ إضافة في updateStatus
async updateStatus(orderId: string, updateStatusDto: UpdateOrderStatusDto) {
  // ... الكود الحالي ...

  // ✅ إضافة: إرسال إشعار WebSocket
  this.gatewayService.emit('order:status-changed', {
    orderId,
    status: updateStatusDto.status,
    changedBy: updateStatusDto.changedBy,
    timestamp: new Date(),
  });

  return order;
}
```

**التحقق:**
- [ ] إرسال إشعارات عند تغيير الحالة
- [ ] إرسال إشعارات عند تعيين السائق
- [ ] إرسال إشعارات عند بدء التوصيل

---

## 📊 جدول الأولويات

| المرحلة | الوصف | الأولوية | الوقت المتوقع | الحالة |
|---------|------|---------|---------------|--------|
| 1 | إصلاح التكامل مع تطبيق السائق | 🔴 عالية | 2-3 أيام | ⏳ قيد الانتظار |
| 2 | إكمال التكامل مع المحفظة | 🔴 عالية | 1-2 أيام | ⏳ قيد الانتظار |
| 3 | إضافة حقول مفقودة | 🟡 متوسطة | 1 يوم | ⏳ قيد الانتظار |
| 4 | تحسين الأمان والصلاحيات | 🟡 متوسطة | 1 يوم | ⏳ قيد الانتظار |
| 5 | إضافة الإشعارات الفورية | 🟡 متوسطة | 1-2 أيام | ⏳ قيد الانتظار |

---

## ✅ قائمة التحقق النهائية

### **التكامل مع تطبيق السائق**
- [ ] ربط `DriverModule` مع `OrderModule`
- [ ] إكمال `getAvailableOrders`
- [ ] إكمال `acceptOrder`
- [ ] إكمال `rejectOrder`
- [ ] إكمال `startDelivery`
- [ ] إكمال `completeDelivery`
- [ ] إكمال `getOrdersHistory`

### **التكامل مع المحفظة**
- [ ] حجز المبلغ عند إنشاء الطلب
- [ ] إرجاع المبلغ عند الإلغاء (من العميل)
- [ ] إرجاع المبلغ عند الإلغاء (من التاجر)
- [ ] إطلاق المبلغ عند التسليم

### **الحقول المفقودة**
- [ ] إضافة `estimatedDeliveryTime`
- [ ] إضافة `actualDeliveryTime`
- [ ] إضافة `pickupLocation`
- [ ] إضافة `deliveryDistance`
- [ ] إضافة `deliveryDuration`
- [ ] إضافة `tipAmount`
- [ ] إضافة `deliveryInstructions`
- [ ] إضافة `driverRating` و `customerRating`

### **الأمان والصلاحيات**
- [ ] إنشاء `OrderOwnerGuard`
- [ ] إنشاء `OrderDriverGuard`
- [ ] استخدام Guards في Controllers
- [ ] إضافة Audit Log

### **الإشعارات**
- [ ] إضافة WebSocket events
- [ ] إشعارات عند تغيير الحالة
- [ ] إشعارات عند تعيين السائق
- [ ] إشعارات عند بدء التوصيل

---

## 🧪 الاختبارات المطلوبة

### **اختبارات الوحدة (Unit Tests)**
- [ ] اختبار `getAvailableOrders`
- [ ] اختبار `acceptOrder`
- [ ] اختبار `startDelivery`
- [ ] اختبار `completeDelivery`
- [ ] اختبار حجز المبلغ
- [ ] اختبار إرجاع المبلغ
- [ ] اختبار إطلاق المبلغ

### **اختبارات التكامل (Integration Tests)**
- [ ] اختبار سيناريو كامل: إنشاء طلب → تعيين سائق → بدء التوصيل → إتمام التوصيل
- [ ] اختبار سيناريو الإلغاء: إنشاء طلب → إلغاء → إرجاع المبلغ
- [ ] اختبار التكامل مع المحفظة

### **اختبارات الأداء (Performance Tests)**
- [ ] اختبار جلب الطلبات المتاحة (مع فهرسة)
- [ ] اختبار Batch operations

---

## 📚 المراجع والملفات المرتبطة

### **الملفات الرئيسية**
- `backend-nest/src/modules/order/order.service.ts`
- `backend-nest/src/modules/order/order.controller.ts`
- `backend-nest/src/modules/driver/driver.service.ts`
- `backend-nest/src/modules/driver/driver.controller.ts`
- `backend-nest/src/modules/driver/driver.module.ts`
- `backend-nest/src/modules/wallet/wallet.service.ts`

### **الملفات المرتبطة**
- `backend-nest/src/modules/order/entities/order.entity.ts`
- `backend-nest/src/modules/order/enums/order-status.enum.ts`
- `backend-nest/src/modules/order/dto/create-order.dto.ts`

---

## 🚀 البدء في التنفيذ

### **الخطوات الأولى:**
1. ✅ قراءة هذا الملف بالكامل
2. ✅ فهم المشاكل الحالية
3. ✅ البدء بالمرحلة 1 (إصلاح التكامل مع تطبيق السائق)
4. ✅ اختبار كل خطوة قبل الانتقال للخطوة التالية

### **نصائح:**
- استخدم Git branches لكل مرحلة
- اكتب tests لكل دالة جديدة
- راجع الكود مع الفريق قبل الـ merge
- وثق التغييرات في commit messages

---

## 📝 ملاحظات إضافية

### **اعتبارات مهمة:**
1. **Circular Dependencies**: استخدم `forwardRef()` عند الحاجة
2. **Transactions**: استخدم MongoDB transactions للعمليات المالية
3. **Error Handling**: تأكد من معالجة جميع الأخطاء بشكل صحيح
4. **Logging**: سجل جميع العمليات المهمة
5. **Performance**: استخدم Indexes و Cache عند الحاجة

---

## 📞 الدعم والمساعدة

إذا واجهت أي مشاكل أثناء التنفيذ:
1. راجع هذا الملف
2. راجع ملفات الوحدات المرتبطة
3. استشر الفريق
4. ابحث في الوثائق

---

**آخر تحديث:** 2025-01-24
**الإصدار:** 1.0.0
**الحالة:** ⏳ قيد الانتظار
