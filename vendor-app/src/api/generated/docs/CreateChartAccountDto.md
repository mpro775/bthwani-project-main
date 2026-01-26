# CreateChartAccountDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**accountCode** | **string** | رمز الحساب | [default to undefined]
**accountName** | **string** | اسم الحساب | [default to undefined]
**accountNameAr** | **string** | الاسم بالعربية | [optional] [default to undefined]
**accountType** | **string** | نوع الحساب | [default to undefined]
**normalBalance** | **string** | الطبيعة الطبيعية للحساب | [default to undefined]
**parent** | **string** | الحساب الأب | [optional] [default to undefined]
**description** | **string** | وصف الحساب | [optional] [default to undefined]

## Example

```typescript
import { CreateChartAccountDto } from './api';

const instance: CreateChartAccountDto = {
    accountCode,
    accountName,
    accountNameAr,
    accountType,
    normalBalance,
    parent,
    description,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
