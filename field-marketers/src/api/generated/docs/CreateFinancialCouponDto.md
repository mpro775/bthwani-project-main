# CreateFinancialCouponDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**code** | **string** | كود الكوبون | [default to undefined]
**description** | **string** | الوصف | [default to undefined]
**discountType** | **string** | نوع الخصم | [default to undefined]
**discountValue** | **number** | قيمة الخصم | [default to undefined]
**maxDiscountAmount** | **number** | الحد الأقصى للخصم | [optional] [default to undefined]
**minOrderAmount** | **number** | الحد الأدنى لقيمة الطلب | [optional] [default to undefined]
**maxUsage** | **number** | الحد الأقصى للاستخدام | [default to undefined]
**maxUsagePerUser** | **number** | الحد الأقصى للاستخدام لكل مستخدم | [default to 1]
**startDate** | **string** | تاريخ البداية | [default to undefined]
**endDate** | **string** | تاريخ النهاية | [default to undefined]
**isActive** | **boolean** | حالة النشاط | [default to true]

## Example

```typescript
import { CreateFinancialCouponDto } from './api';

const instance: CreateFinancialCouponDto = {
    code,
    description,
    discountType,
    discountValue,
    maxDiscountAmount,
    minOrderAmount,
    maxUsage,
    maxUsagePerUser,
    startDate,
    endDate,
    isActive,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
