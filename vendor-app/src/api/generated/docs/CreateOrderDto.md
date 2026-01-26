# CreateOrderDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**user** | **string** | معرف المستخدم | [default to undefined]
**items** | [**Array&lt;OrderItemDto&gt;**](OrderItemDto.md) | عناصر الطلب | [default to undefined]
**price** | **number** | إجمالي السعر | [default to undefined]
**deliveryFee** | **number** | رسوم التوصيل | [default to undefined]
**companyShare** | **number** | حصة الشركة | [default to undefined]
**platformShare** | **number** | حصة المنصة | [default to undefined]
**address** | [**AddressDto**](AddressDto.md) | العنوان | [default to undefined]
**paymentMethod** | **string** | طريقة الدفع | [default to undefined]
**orderType** | **string** | نوع الطلب | [default to undefined]
**walletUsed** | **number** | المبلغ المستخدم من المحفظة | [optional] [default to undefined]
**cashDue** | **number** | المبلغ المتبقي كاش | [optional] [default to undefined]

## Example

```typescript
import { CreateOrderDto } from './api';

const instance: CreateOrderDto = {
    user,
    items,
    price,
    deliveryFee,
    companyShare,
    platformShare,
    address,
    paymentMethod,
    orderType,
    walletUsed,
    cashDue,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
