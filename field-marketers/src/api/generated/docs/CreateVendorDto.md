# CreateVendorDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**fullName** | **string** | الاسم الكامل | [default to undefined]
**phone** | **string** | رقم الهاتف | [default to undefined]
**email** | **string** | البريد الإلكتروني | [optional] [default to undefined]
**password** | **string** | كلمة المرور | [default to undefined]
**store** | **string** | معرف المتجر | [default to undefined]
**createdByMarketerUid** | **string** | معرف المسوق | [optional] [default to undefined]
**source** | **string** | المصدر | [optional] [default to undefined]

## Example

```typescript
import { CreateVendorDto } from './api';

const instance: CreateVendorDto = {
    fullName,
    phone,
    email,
    password,
    store,
    createdByMarketerUid,
    source,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
