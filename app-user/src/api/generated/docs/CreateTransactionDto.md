# CreateTransactionDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**userId** | **string** | معرف المستخدم | [default to undefined]
**userModel** | **string** | نوع النموذج | [default to undefined]
**amount** | **number** | المبلغ | [default to undefined]
**type** | **string** | نوع العملية | [default to undefined]
**method** | **string** | طريقة الدفع | [default to undefined]
**description** | **string** | الوصف | [optional] [default to undefined]
**bankRef** | **string** | رقم مرجعي بنكي | [optional] [default to undefined]
**meta** | **object** | بيانات إضافية | [optional] [default to undefined]

## Example

```typescript
import { CreateTransactionDto } from './api';

const instance: CreateTransactionDto = {
    userId,
    userModel,
    amount,
    type,
    method,
    description,
    bankRef,
    meta,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
