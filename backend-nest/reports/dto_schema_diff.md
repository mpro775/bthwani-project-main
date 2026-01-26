# تقرير اتساق DTO vs Schema

**التاريخ**: الأربعاء، ١٥ أكتوبر ٢٠٢٥
**الوقت**: ١٢:٣٨:٣١ ص

---

## 📊 الملخص العام

- **إجمالي DTOs**: 49
- **إجمالي Entities**: 49
- **DTOs مع مطابقات**: 42
- **DTOs بدون مطابقات**: 7

### نسبة الاتساق الإجمالية: **37%**

**الاتساق**: [███████████░░░░░░░░░░░░░░░░░░░] 37%

### المشاكل المكتشفة

- **اختلافات في الأنواع**: 5
- **اختلافات في Optional/Required**: 3
- **حقول مفقودة**: 40

## 📦 حسب المودول

| المودول | DTOs | متوسط الاتساق | مشاكل |
|---------|------|---------------|--------|
| er | 5 | 26% | 5 |
| finance | 5 | 49% | 5 |
| merchant | 5 | 36% | 5 |
| auth | 4 | 9% | 4 |
| content | 3 | 74% | 3 |
| legal | 3 | 52% | 3 |
| cart | 2 | 0% | 2 |
| driver | 2 | 34% | 2 |
| notification | 2 | 47% | 2 |
| order | 2 | 50% | 1 |
| store | 2 | 79% | 1 |
| vendor | 2 | 0% | 2 |
| wallet | 2 | 44% | 2 |
| akhdimni | 1 | 0% | 1 |
| promotion | 1 | 81% | 1 |
| utility | 1 | 0% | 1 |

## 🏆 أعلى اتساق (Top 10)

| DTO | Entity | المودول | الاتساق |
|-----|--------|---------|----------|
| OrderItemDto | OrderItem | order | 100% |
| LocationDto | Location | store | 100% |
| CreateAttributeDto | Attribute | merchant | 91% |
| CreateEmployeeDto | Employee | er | 86% |
| CreateFinancialCouponDto | FinancialCoupon | finance | 84% |
| CreateSubscriptionPlanDto | SubscriptionPlan | content | 82% |
| CreatePromotionDto | Promotion | promotion | 81% |
| CreateTransactionDto | WalletTransaction | wallet | 80% |
| CreateCommissionDto | Commission | finance | 77% |
| CreateMerchantCategoryDto | MerchantCategory | merchant | 73% |

## ⚠️ المشاكل التي تحتاج إصلاح

تم العثور على **34** حالة تحتاج مراجعة:

### ErrandPointDto ↔ ErrandOrder (0%)

**المودول**: akhdimni

**حقول في DTO فقط** (6): label, street, city, contactName, phone, location

**حقول في Entity فقط** (19): orderNumber, user, errand, deliveryFee, totalPrice, paymentMethod, paid, walletUsed, cashDue, status, driver, assignedAt, pickedUpAt, deliveredAt, scheduledFor, cancellationReason, statusHistory, rating, notes

---

### FirebaseAuthDto ↔ UserConsent (0%)

**المودول**: auth

**حقول في DTO فقط** (1): idToken

**حقول في Entity فقط** (11): userId, consentType, granted, version, consentDate, ipAddress, userAgent, withdrawnAt, notes, createdAt, updatedAt

---

### RegisterWithConsentDto ↔ UserConsent (0%)

**المودول**: auth

**حقول في DTO فقط** (8): fullName, email, phone, profileImage, firebaseToken, consents, acceptedPrivacyPolicy, acceptedTermsOfService

**حقول في Entity فقط** (11): userId, consentType, granted, version, consentDate, ipAddress, userAgent, withdrawnAt, notes, createdAt, updatedAt

---

### RegisterDto ↔ UserConsent (0%)

**المودول**: auth

**حقول في DTO فقط** (6): fullName, aliasName, email, phone, profileImage, firebaseUID

**حقول في Entity فقط** (11): userId, consentType, granted, version, consentDate, ipAddress, userAgent, withdrawnAt, notes, createdAt, updatedAt

---

### AddToCartDto ↔ Cart (0%)

**المودول**: cart

**حقول في DTO فقط** (8): productType, productId, name, price, quantity, store, image, options

**حقول في Entity فقط** (7): user, items, total, cartId, note, deliveryAddress, lastModified

---

### AddToSheinCartDto ↔ Cart (0%)

**المودول**: cart

**حقول في DTO فقط** (11): sheinProductId, name, price, priceYER, quantity, image, size, color, attributes, shippingTime, shippingCost

**حقول في Entity فقط** (7): user, items, total, cartId, note, deliveryAddress, lastModified

---

### CreateDriverDto ↔ CurrentLocation (0%)

**المودول**: driver

**حقول في DTO فقط** (10): fullName, email, password, phone, role, vehicleType, vehicleClass, vehiclePower, driverType, isFemaleDriver

**حقول في Entity فقط** (3): lat, lng, updatedAt

---

### CreateChartAccountDto ↔ Attendance (0%)

**المودول**: er

**حقول في DTO فقط** (7): accountCode, accountName, accountNameAr, accountType, normalBalance, parent, description

**حقول في Entity فقط** (11): employee, date, checkIn, checkOut, status, workHours, overtimeHours, location, notes, approvedBy, isManualEntry

---

### JournalLineDto ↔ Attendance (0%)

**المودول**: er

**حقول في DTO فقط** (4): account, debit, credit, description

**حقول في Entity فقط** (11): employee, date, checkIn, checkOut, status, workHours, overtimeHours, location, notes, approvedBy, isManualEntry

---

### UpdateEmployeeDto ↔ Employee (0%)

**المودول**: er

**حقول في Entity فقط** (22): employeeId, firstName, lastName, email, phone, nationalId, position, department, employmentType, salary, hireDate, terminationDate, status, address, emergencyContact, emergencyPhone, manager, skills, bankDetails, annualLeaveDays, sickLeaveDays, metadata

---

### MerchantProductAttributeDto ↔ Attribute (0%)

**المودول**: merchant

**حقول في DTO فقط** (3): attribute, value, displayValue

**حقول في Entity فقط** (11): name, nameAr, type, options, unit, required, isActive, order, description, placeholder, validation

---

### AttributeValueDto ↔ Attribute (0%)

**المودول**: merchant

**حقول في DTO فقط** (3): attribute, value, displayValue

**حقول في Entity فقط** (11): name, nameAr, type, options, unit, required, isActive, order, description, placeholder, validation

---

### UpdateOrderStatusDto ↔ OrderItem (0%)

**المودول**: order

**حقول في DTO فقط** (3): status, reason, changedBy

**حقول في Entity فقط** (7): productType, productId, name, quantity, unitPrice, store, image

---

### GasConfigDto ↔ UtilityPricing (0%)

**المودول**: utility

**حقول في DTO فقط** (5): enabled, cylinderSizeLiters, pricePerCylinder, minQty, deliveryOverride

**حقول في Entity فقط** (5): city, isActive, origins, gas, water

---

### CreateVendorDto ↔ NotificationSettings (0%)

**المودول**: vendor

**حقول في DTO فقط** (7): fullName, phone, email, password, store, createdByMarketerUid, source

**حقول في Entity فقط** (5): enabled, orderAlerts, financialAlerts, marketingAlerts, systemUpdates

---

### UpdateVendorDto ↔ NotificationSettings (0%)

**المودول**: vendor

**حقول في DTO فقط** (3): isActive, expoPushToken, notificationSettings

**حقول في Entity فقط** (5): enabled, orderAlerts, financialAlerts, marketingAlerts, systemUpdates

---

### WalletBalanceDto ↔ WalletEvent (8%)

**المودول**: wallet

**حقول في DTO فقط** (1): userModel

**حقول في Entity فقط** (11): eventType, amount, timestamp, metadata, version, aggregateId, sequence, correlationId, causationId, isReplayed, replayedAt

---

### RecordConsentDto ↔ PrivacyPolicy (14%)

**المودول**: legal

**حقول في DTO فقط** (4): consentType, accepted, ipAddress, userAgent

**حقول في Entity فقط** (6): content, contentEn, effectiveDate, isActive, createdAt, updatedAt

---

### CreateMerchantDto ↔ MerchantCategory (18%)

**المودول**: merchant

**حقول في DTO فقط** (8): email, phone, logo, vendor, store, businessCategories, address, businessHours

**حقول في Entity فقط** (9): nameAr, image, parent, level, order, isActive, icon, tags, productsCount

---

### CreatePayoutBatchDto ↔ PayoutBatch (23%)

**المودول**: finance

**اختلافات في الأنواع**:
- `scheduledFor`: DTO=`string` vs Entity=`Date`

**حقول في Entity فقط** (10): batchNumber, totalAmount, itemsCount, status, createdBy, approvedBy, approvedAt, processedAt, bankReference, metadata

---

### CreateReconciliationDto ↔ Reconciliation (29%)

**المودول**: finance

**اختلافات في الأنواع**:
- `startDate`: DTO=`string` vs Entity=`Date`
- `endDate`: DTO=`string` vs Entity=`Date`

**حقول في Entity فقط** (10): reconciliationNumber, period, status, systemTotals, actualTotals, discrepancies, issues, performedBy, completedAt, metadata

---

### CreateSettlementDto ↔ Settlement (33%)

**المودول**: finance

**اختلافات في الأنواع**:
- `periodStart`: DTO=`string` vs Entity=`Date`
- `periodEnd`: DTO=`string` vs Entity=`Date`

**حقول في Entity فقط** (12): settlementNumber, totalRevenue, totalCommission, totalDeductions, netAmount, ordersCount, status, payoutBatch, approvedBy, approvedAt, paidAt, breakdown

---

### CreateSuppressionDto ↔ NotificationSuppression (33%)

**المودول**: notification

**حقول في Entity فقط** (8): userId, isActive, failureCount, lastFailureAt, suppressedBy, suppressedByAdmin, createdAt, updatedAt

---

### ConsentDto ↔ UserConsent (36%)

**المودول**: auth

**اختلافات في الأنواع**:
- `consentType`: DTO=`ConsentType` vs Entity=`string`

**حقول في Entity فقط** (7): userId, consentDate, ipAddress, userAgent, withdrawnAt, createdAt, updatedAt

---

### CreateLeaveRequestDto ↔ LeaveRequest (46%)

**المودول**: er

**اختلافات في الأنواع**:
- `leaveType`: DTO=`'annual' | 'sick' | 'unpaid' | 'maternity' | 'emergency'` vs Entity=`string`
- `startDate`: DTO=`string` vs Entity=`Date`
- `endDate`: DTO=`string` vs Entity=`Date`

**حقول في Entity فقط** (7): requestNumber, employee, days, status, approvedBy, approvedAt, rejectionReason

---

### CreateProductDto ↔ Product (57%)

**المودول**: store

**حقول في Entity فقط** (9): isActive, finalPrice, tags, rating, ratingsCount, salesCount, isFeatured, sku, barcode

---

### CreateNotificationDto ↔ Notification (60%)

**المودول**: notification

**اختلافات في Optional/Required**:
- `audience`: DTO=optional vs Entity=required

**حقول في Entity فقط** (4): status, tickets, receipts, error

---

### UpdateLocationDto ↔ CurrentLocation (67%)

**المودول**: driver

**حقول في Entity فقط** (1): updatedAt

---

### CreateStoreSectionDto ↔ StoreSection (70%)

**المودول**: content

**حقول في Entity فقط** (3): isActive, productsCount, metadata

---

### CreateBannerDto ↔ Banner (71%)

**المودول**: content

**حقول في Entity فقط** (4): isActive, clicksCount, viewsCount, createdBy

---

### CreatePrivacyPolicyDto ↔ PrivacyPolicy (71%)

**المودول**: legal

**اختلافات في Optional/Required**:
- `effectiveDate`: DTO=optional vs Entity=required
- `isActive`: DTO=optional vs Entity=required

**حقول في Entity فقط** (2): createdAt, updatedAt

---

### CreateTermsOfServiceDto ↔ TermsOfService (71%)

**المودول**: legal

**اختلافات في Optional/Required**:
- `effectiveDate`: DTO=optional vs Entity=required
- `isActive`: DTO=optional vs Entity=required

**حقول في Entity فقط** (2): createdAt, updatedAt

---

### CreateMerchantCategoryDto ↔ MerchantCategory (73%)

**المودول**: merchant

**حقول في Entity فقط** (3): level, isActive, productsCount

---

### CreateCommissionDto ↔ Commission (77%)

**المودول**: finance

**حقول في Entity فقط** (3): status, paidAt, payoutBatch

---

## 📋 جميع المقارنات

<details>
<summary>عرض التفاصيل الكاملة</summary>

| DTO | Entity | المودول | الاتساق | مشترك | DTO فقط | Entity فقط | اختلافات نوع |
|-----|--------|---------|---------|--------|----------|-------------|---------------|
| ErrandPointDto | ErrandOrder | akhdimni | 0% | 0 | 6 | 19 | 0 |
| ConsentDto | UserConsent | auth | 36% | 4 | 0 | 7 | 1 |
| FirebaseAuthDto | UserConsent | auth | 0% | 0 | 1 | 11 | 0 |
| RegisterWithConsentDto | UserConsent | auth | 0% | 0 | 8 | 11 | 0 |
| RegisterDto | UserConsent | auth | 0% | 0 | 6 | 11 | 0 |
| AddToCartDto | Cart | cart | 0% | 0 | 8 | 7 | 0 |
| AddToSheinCartDto | Cart | cart | 0% | 0 | 11 | 7 | 0 |
| CreateBannerDto | Banner | content | 71% | 10 | 0 | 4 | 0 |
| CreateStoreSectionDto | StoreSection | content | 70% | 7 | 0 | 3 | 0 |
| CreateSubscriptionPlanDto | SubscriptionPlan | content | 82% | 9 | 0 | 2 | 0 |
| CreateDriverDto | CurrentLocation | driver | 0% | 0 | 10 | 3 | 0 |
| UpdateLocationDto | CurrentLocation | driver | 67% | 2 | 0 | 1 | 0 |
| CreateChartAccountDto | Attendance | er | 0% | 0 | 7 | 11 | 0 |
| CreateEmployeeDto | Employee | er | 86% | 19 | 0 | 3 | 0 |
| JournalLineDto | Attendance | er | 0% | 0 | 4 | 11 | 0 |
| CreateLeaveRequestDto | LeaveRequest | er | 46% | 6 | 0 | 7 | 3 |
| UpdateEmployeeDto | Employee | er | 0% | 0 | 0 | 22 | 0 |
| CreateCommissionDto | Commission | finance | 77% | 10 | 0 | 3 | 0 |
| CreateFinancialCouponDto | FinancialCoupon | finance | 84% | 16 | 0 | 3 | 0 |
| CreatePayoutBatchDto | PayoutBatch | finance | 23% | 3 | 0 | 10 | 1 |
| CreateReconciliationDto | Reconciliation | finance | 29% | 4 | 0 | 10 | 2 |
| CreateSettlementDto | Settlement | finance | 33% | 6 | 0 | 12 | 2 |
| CreatePrivacyPolicyDto | PrivacyPolicy | legal | 71% | 5 | 0 | 2 | 0 |
| CreateTermsOfServiceDto | TermsOfService | legal | 71% | 5 | 0 | 2 | 0 |
| RecordConsentDto | PrivacyPolicy | legal | 14% | 1 | 4 | 6 | 0 |
| CreateAttributeDto | Attribute | merchant | 91% | 10 | 0 | 1 | 0 |
| CreateMerchantCategoryDto | MerchantCategory | merchant | 73% | 8 | 0 | 3 | 0 |
| MerchantProductAttributeDto | Attribute | merchant | 0% | 0 | 3 | 11 | 0 |
| CreateMerchantDto | MerchantCategory | merchant | 18% | 2 | 8 | 9 | 0 |
| AttributeValueDto | Attribute | merchant | 0% | 0 | 3 | 11 | 0 |
| CreateNotificationDto | Notification | notification | 60% | 6 | 0 | 4 | 0 |
| CreateSuppressionDto | NotificationSuppression | notification | 33% | 4 | 0 | 8 | 0 |
| OrderItemDto | OrderItem | order | 100% | 7 | 0 | 0 | 0 |
| UpdateOrderStatusDto | OrderItem | order | 0% | 0 | 3 | 7 | 0 |
| CreatePromotionDto | Promotion | promotion | 81% | 21 | 0 | 5 | 0 |
| CreateProductDto | Product | store | 57% | 12 | 0 | 9 | 0 |
| LocationDto | Location | store | 100% | 2 | 0 | 0 | 0 |
| GasConfigDto | UtilityPricing | utility | 0% | 0 | 5 | 5 | 0 |
| CreateVendorDto | NotificationSettings | vendor | 0% | 0 | 7 | 5 | 0 |
| UpdateVendorDto | NotificationSettings | vendor | 0% | 0 | 3 | 5 | 0 |
| CreateTransactionDto | WalletTransaction | wallet | 80% | 8 | 0 | 2 | 0 |
| WalletBalanceDto | WalletEvent | wallet | 8% | 1 | 1 | 11 | 0 |

</details>

## 💡 التوصيات

### 1. إصلاح اختلافات الأنواع

يجب مراجعة **5** حالة من اختلافات الأنواع:

- التأكد من تطابق أنواع البيانات بين DTO و Entity
- استخدام نفس التعريف للـ Enums
- مراجعة ObjectId vs string في الـ references

### 2. توحيد Optional/Required

يجب مراجعة **3** حالة من اختلافات Optional/Required:

- الحقول المطلوبة في Entity يجب أن تكون required في Create DTOs
- الحقول الاختيارية في Entity يمكن أن تكون optional في DTOs
- Update DTOs عادة تكون جميع الحقول optional

### 3. مزامنة الحقول

يجب مراجعة **40** حالة من الحقول المفقودة:

- إضافة حقول Entity المفقودة في DTOs (إذا لزم)
- حذف حقول DTO غير الموجودة في Entity (أو تفسير وجودها)
- توثيق الحقول computed/virtual المستثناة

### 4. أفضل الممارسات

- **Create DTOs**: يجب أن تحتوي على الحقول المطلوبة فقط
- **Update DTOs**: جميع الحقول optional باستثناء ID
- **Response DTOs**: يمكن أن تحتوي على حقول computed إضافية
- **Validation**: استخدام نفس القواعد في DTO validators و Schema validators
- **Types**: استخدام Enums مشتركة بين DTOs و Entities

## 📝 خطة العمل

- [ ] مراجعة 34 حالة ذات اتساق منخفض
- [ ] إصلاح 5 اختلاف في الأنواع
- [ ] توحيد 3 حالة optional/required
- [ ] توثيق الحقول computed/virtual المستثناة
- [ ] إضافة unit tests للتحقق من تطابق DTOs مع Entities
- [ ] إعداد CI check لهذا الفحص

---

_تم إنشاء هذا التقرير تلقائياً بواسطة `tools/audit/dto_schema_diff.ts`_
