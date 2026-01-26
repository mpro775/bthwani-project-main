# CreateCommissionDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**entityId** | **string** | معرف الكيان (طلب، بائع، سائق، مسوق) | [default to undefined]
**entityModel** | **string** | نوع الكيان | [default to undefined]
**beneficiary** | **string** | معرف المستفيد | [default to undefined]
**beneficiaryType** | **string** | نوع المستفيد | [default to undefined]
**amount** | **number** | مبلغ العمولة | [default to undefined]
**rate** | **number** | نسبة العمولة (مثلاً 10 &#x3D; 10%) | [default to undefined]
**baseAmount** | **number** | المبلغ الأساسي الذي حُسبت منه العمولة | [default to undefined]
**calculationType** | **string** | نوع الحساب | [default to undefined]
**metadata** | **object** | البيانات الإضافية | [optional] [default to undefined]
**notes** | **string** | الملاحظات | [optional] [default to undefined]

## Example

```typescript
import { CreateCommissionDto } from './api';

const instance: CreateCommissionDto = {
    entityId,
    entityModel,
    beneficiary,
    beneficiaryType,
    amount,
    rate,
    baseAmount,
    calculationType,
    metadata,
    notes,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
